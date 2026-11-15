import { CATALOG } from '../catalog';
import { LAYERS } from '../domain/layers';
import { PROJECT_TYPES } from '../domain/project-types';
import type {
  Condition,
  LayerDef,
  LayerId,
  Need,
  ProjectAnswers,
  ProjectTypeId,
  Technology,
  UserProfile,
} from '../domain/types';

export interface Candidate {
  tech: Technology;
  score: number;
  /** Por qué sube en el orden, en lenguaje simple. */
  reasons: string[];
}

export interface Discarded {
  tech: Technology;
  why: string;
}

export interface LayerResult {
  layer: LayerDef;
  chosen: Candidate | null;
  /** Las siguientes mejores opciones que también son compatibles. */
  alternatives: Candidate[];
  discarded: Discarded[];
  /** Se llena cuando no hay elegida: explica por qué. */
  note?: string;
}

export interface Recommendation {
  answers: ProjectAnswers;
  layers: LayerResult[];
}

export interface RecommendOptions {
  catalog?: Technology[];
  profile?: UserProfile;
  /** Tecnología que el usuario ya decidió usar en una capa; el resto se adapta. */
  pinned?: Partial<Record<LayerId, string>>;
}

const ALTERNATIVES_SHOWN = 3;

const PROJECT_LABEL = new Map<ProjectTypeId, string>(PROJECT_TYPES.map((p) => [p.id, p.label]));

/** Aplica las implicaciones entre respuestas (una app con IA siempre usa un modelo). */
export function normalizeAnswers(answers: ProjectAnswers): ProjectAnswers {
  return answers.type === 'ai-app' ? { ...answers, needsAI: true } : answers;
}

export function activeLayers(answers: ProjectAnswers): LayerDef[] {
  return LAYERS.filter(
    (layer) =>
      (layer.appliesTo === 'all' || layer.appliesTo.includes(answers.type)) && (layer.active?.(answers) ?? true),
  );
}

export function appliesToType(tech: Technology, type: ProjectTypeId): boolean {
  return tech.types === 'all' || tech.types.includes(type);
}

export function isSatisfied(need: Need, provided: ReadonlySet<string>): boolean {
  return Array.isArray(need) ? need.some((n) => provided.has(n)) : provided.has(need);
}

export function describeNeed(need: Need): string {
  return Array.isArray(need) ? need.join(' o ') : need;
}

export function conditionText(condition: Condition): string {
  switch (condition.key) {
    case 'seo':
      return 'el SEO es crítico';
    case 'hosting':
      return condition.is === 'serverless' ? 'preferís hosting sin servidor propio' : 'preferís un servidor propio';
    case 'budget':
      return 'el presupuesto es cero';
    case 'scale':
      return condition.is === 'prototype' ? 'es un prototipo' : 'es un producto en producción';
    case 'realtime':
      return condition.is ? 'necesitás tiempo real' : 'no necesitás tiempo real';
  }
}

/** Devuelve el motivo del descarte, o null si la tecnología es compatible. */
function discardReason(
  tech: Technology,
  answers: ProjectAnswers,
  provided: ReadonlySet<string>,
  chosen: readonly Technology[],
): string | null {
  const excluded = tech.excludeWhen.find((c) => answers[c.key] === c.is);
  if (excluded) return `No encaja: ${conditionText(excluded)}.`;

  if (answers.budget === 'free' && tech.cost === 'paid') return 'Es de pago y el presupuesto es cero.';

  const missing = tech.needs.find((need) => !isSatisfied(need, provided));
  if (missing !== undefined) return `Necesita ${describeNeed(missing)} y nada de lo elegido hasta ahora lo aporta.`;

  const clash = chosen.find((c) => tech.conflicts.includes(c.id) || c.conflicts.includes(tech.id));
  if (clash) return `Choca con ${clash.name}.`;

  return null;
}

/** Capacidades que indican en qué lenguaje corre una tecnología. */
const LANGUAGE_OF: Readonly<Record<string, string>> = {
  'js-tooling': 'javascript',
  python: 'python',
  php: 'php',
};

export function languagesOf(capabilities: Iterable<string>): Set<string> {
  const languages = new Set<string>();
  for (const capability of capabilities) {
    const language = LANGUAGE_OF[capability];
    if (language) languages.add(language);
  }
  return languages;
}

function scoreTech(
  tech: Technology,
  answers: ProjectAnswers,
  profile: UserProfile | undefined,
  provided: ReadonlySet<string>,
): Candidate {
  let score = 0;
  const reasons: string[] = [];
  const has = (trait: Technology['traits'][number]) => tech.traits.includes(trait);
  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(reason);
  };

  if (tech.bestFor.includes(answers.type)) {
    add(3, `Suele ser la primera opción para ${PROJECT_LABEL.get(answers.type) ?? answers.type}.`);
  }

  if (answers.seo === 'critical' && has('seo-friendly')) add(3, 'Buen SEO: entrega el contenido ya armado.');
  if (answers.seo === 'useful' && has('seo-friendly')) add(1, 'Ayuda al SEO.');
  if (answers.realtime && has('realtime')) add(3, 'Soporta tiempo real.');

  if (answers.hosting === 'serverless' && has('serverless-friendly')) add(2, 'Funciona bien sin servidor propio.');
  if (answers.hosting === 'own-server' && has('self-hostable')) add(2, 'Se puede alojar en tu propio servidor.');

  if (answers.budget === 'free') {
    if (tech.cost === 'free') add(2, 'Gratis.');
    else if (tech.cost === 'freemium' || tech.cost === 'usage') add(1, 'Tiene plan gratuito o se paga por uso.');
  } else if (answers.budget === 'low') {
    if (tech.cost === 'free' || tech.cost === 'freemium' || tech.cost === 'usage') add(1, 'Costo bajo o nulo al empezar.');
    else score -= 1;
  }

  if (answers.scale === 'prototype') {
    if (has('quick-start')) add(2, 'Rápida de arrancar.');
    if (has('lightweight')) add(1, 'Liviana.');
  } else {
    if (has('mature')) add(2, 'Madura: probada en producción.');
    if (has('type-safe')) add(1, 'Los tipos detectan errores antes de producción.');
  }

  if (has('ai-friendly')) add(1, 'La IA la conoce bien y genera buen código con ella.');

  // Cohesión: un solo lenguaje en el stack evita mantener dos toolchains.
  const own = languagesOf(tech.provides);
  const present = languagesOf(provided);
  if (own.size > 0 && present.size > 0) {
    if ([...own].every((l) => present.has(l))) add(2, 'Mismo lenguaje que el resto del stack.');
    else if (![...own].some((l) => present.has(l))) add(-2, 'Suma un segundo lenguaje al stack.');
  }

  const level = profile?.skills[tech.id];
  if (level === 'master') add(3, 'La dominás.');
  else if (level === 'know') add(1, 'Ya la conocés.');
  else if (level === 'never') score -= 1;
  if (profile?.alreadyPaying.includes(tech.id)) add(2, 'Ya la pagás.');

  return { tech, score, reasons };
}

/**
 * Recomienda un stack capa por capa.
 *
 * Primero descarta lo incompatible (tipo de proyecto, requisitos, capacidades que
 * faltan, choques) y después ordena lo que queda. Cada capa solo puede apoyarse en
 * lo que aportaron las anteriores. Es determinista: a igual puntaje gana la
 * verificada y, si siguen empatadas, la que aparece primero en el catálogo.
 */
export function recommend(rawAnswers: ProjectAnswers, options: RecommendOptions = {}): Recommendation {
  const answers = normalizeAnswers(rawAnswers);
  const catalog = options.catalog ?? CATALOG;
  const order = new Map(catalog.map((t, i) => [t.id, i]));

  const provided = new Set<string>();
  const chosenTechs: Technology[] = [];
  const results: LayerResult[] = [];

  for (const layer of activeLayers(answers)) {
    const inLayer = catalog.filter((t) => t.layer === layer.id && appliesToType(t, answers.type));
    const discarded: Discarded[] = [];
    const candidates: Candidate[] = [];

    for (const tech of inLayer) {
      const why = discardReason(tech, answers, provided, chosenTechs);
      if (why) discarded.push({ tech, why });
      else candidates.push(scoreTech(tech, answers, options.profile, provided));
    }

    // La verificación no cambia qué tan bien encaja una tecnología: solo desempata.
    candidates.sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.tech.verifiedAt !== null) - Number(a.tech.verifiedAt !== null) ||
        (order.get(a.tech.id) ?? 0) - (order.get(b.tech.id) ?? 0),
    );

    const pinnedId = options.pinned?.[layer.id];
    let chosen: Candidate | null = candidates[0] ?? null;
    let note: string | undefined;

    if (pinnedId !== undefined) {
      const pinned = candidates.find((c) => c.tech.id === pinnedId);
      if (pinned) {
        chosen = pinned;
      } else {
        chosen = null;
        const blocked = discarded.find((d) => d.tech.id === pinnedId);
        note = blocked
          ? `${blocked.tech.name} no es compatible con lo elegido: ${blocked.why}`
          : `${pinnedId} no existe en esta capa o no aplica a este tipo de proyecto.`;
      }
    } else if (!chosen) {
      note = 'Ninguna opción del catálogo es compatible con lo elegido en las capas anteriores.';
    }

    if (chosen) {
      chosenTechs.push(chosen.tech);
      for (const capability of chosen.tech.provides) provided.add(capability);
    }

    results.push({
      layer,
      chosen,
      alternatives: candidates.filter((c) => c !== chosen).slice(0, ALTERNATIVES_SHOWN),
      discarded,
      ...(note !== undefined ? { note } : {}),
    });
  }

  return { answers, layers: results };
}
