import { CATALOG } from '../catalog';
import { LAYERS } from '../domain/layers';
import type { LayerDef, LayerId, ManualSelection, ProjectAnswers, Technology } from '../domain/types';
import {
  activeLayers,
  appliesToType,
  conditionText,
  describeNeed,
  isSatisfied,
  languagesOf,
  normalizeAnswers,
} from './recommend';

/**
 * Armador libre: evalúa un stack elegido a mano.
 *
 * A diferencia de `recommend`, no filtra ni elige por el usuario. Toda combinación
 * es válida: cada problema sale como un aviso con su motivo y la decisión sigue
 * siendo de quien arma. Los requisitos se miran contra la selección completa, sin
 * depender del orden de las capas.
 */

export type WarningKind =
  | 'project-type'
  | 'excluded'
  | 'budget'
  | 'missing-need'
  | 'conflict'
  | 'second-language';

export interface SelectionWarning {
  kind: WarningKind;
  /** `warning` = probable problema; `info` = decisión válida que conviene tener presente. */
  severity: 'warning' | 'info';
  message: string;
}

export interface SelectionOptions {
  catalog?: Technology[];
  /** Respuestas del proyecto; sin ellas solo se avisa de requisitos, choques y lenguajes. */
  answers?: ProjectAnswers;
  /** Evalúa todas las capas aunque las respuestas digan que el proyecto no las necesita. */
  allLayers?: boolean;
}

export type SelectionStatus = 'chosen' | 'none' | 'unset' | 'unknown';

export interface SelectionLayer {
  layer: LayerDef;
  status: SelectionStatus;
  tech: Technology | null;
  warnings: SelectionWarning[];
}

export interface SelectionEvaluation {
  layers: SelectionLayer[];
  /** Todos los avisos juntos, en el orden de las capas. */
  warnings: Array<SelectionWarning & { layer: LayerId; techId: string }>;
}

export interface OptionState {
  tech: Technology;
  warnings: SelectionWarning[];
}

/** Avisos de una tecnología frente al resto de lo elegido. */
export function techWarnings(
  tech: Technology,
  others: readonly Technology[],
  answers?: ProjectAnswers,
): SelectionWarning[] {
  const warnings: SelectionWarning[] = [];
  const warn = (kind: WarningKind, message: string) => warnings.push({ kind, severity: 'warning', message });

  if (answers) {
    if (!appliesToType(tech, answers.type)) warn('project-type', 'No suele usarse en este tipo de proyecto.');

    const excluded = tech.excludeWhen.find((c) => answers[c.key] === c.is);
    if (excluded) warn('excluded', `No encaja: ${conditionText(excluded)}.`);

    if (answers.budget === 'free' && tech.cost === 'paid') warn('budget', 'Es de pago y el presupuesto es cero.');
  }

  const provided = new Set(others.flatMap((o) => o.provides));
  for (const need of tech.needs) {
    if (!isSatisfied(need, provided)) {
      warn('missing-need', `Necesita ${describeNeed(need)} y nada de lo que elegiste lo aporta.`);
    }
  }

  for (const other of others) {
    if (tech.conflicts.includes(other.id) || other.conflicts.includes(tech.id)) {
      warn('conflict', `Choca con ${other.name}.`);
    }
  }

  const own = languagesOf(tech.provides);
  const present = languagesOf(provided);
  if (own.size > 0 && present.size > 0 && ![...own].some((l) => present.has(l))) {
    warnings.push({
      kind: 'second-language',
      severity: 'info',
      message: 'Suma un segundo lenguaje al stack: hay que mantener dos entornos.',
    });
  }

  return warnings;
}

/** Resuelve la tecnología elegida en una capa. `unknown` = el id no está en esa capa. */
function resolve(
  layer: LayerId,
  value: string | null | undefined,
  catalog: readonly Technology[],
): { status: SelectionStatus; tech: Technology | null } {
  if (value === undefined) return { status: 'unset', tech: null };
  if (value === null) return { status: 'none', tech: null };
  const tech = catalog.find((t) => t.id === value && t.layer === layer) ?? null;
  return tech ? { status: 'chosen', tech } : { status: 'unknown', tech: null };
}

/** Evalúa el stack armado: la tecnología de cada capa y los avisos que le tocan. */
export function evaluateSelection(selection: ManualSelection, options: SelectionOptions = {}): SelectionEvaluation {
  const catalog = options.catalog ?? CATALOG;
  const answers = options.answers ? normalizeAnswers(options.answers) : undefined;
  const layerDefs = answers && !options.allLayers ? activeLayers(answers) : LAYERS;

  const resolved = layerDefs.map((layer) => ({ layer, ...resolve(layer.id, selection[layer.id], catalog) }));
  const chosen = resolved.flatMap((r) => (r.tech ? [r.tech] : []));

  const layers: SelectionLayer[] = resolved.map((r) => {
    const warnings: SelectionWarning[] = [];
    if (r.status === 'unknown') {
      warnings.push({
        kind: 'project-type',
        severity: 'warning',
        message: `"${String(selection[r.layer.id])}" no existe en esta capa del catálogo.`,
      });
    }
    if (r.tech) warnings.push(...techWarnings(r.tech, chosen.filter((t) => t !== r.tech), answers));
    return { layer: r.layer, status: r.status, tech: r.tech, warnings };
  });

  return {
    layers,
    warnings: layers.flatMap((l) => l.warnings.map((w) => ({ ...w, layer: l.layer.id, techId: l.tech?.id ?? '' }))),
  };
}

/**
 * Todas las opciones de una capa, sin filtrar, cada una con los avisos que tendría
 * si se eligiera ahora (frente al resto de la selección, sin contar esta capa).
 */
export function layerOptions(layerId: LayerId, selection: ManualSelection, options: SelectionOptions = {}): OptionState[] {
  const catalog = options.catalog ?? CATALOG;
  const answers = options.answers ? normalizeAnswers(options.answers) : undefined;

  const others = LAYERS.filter((l) => l.id !== layerId).flatMap((l) => {
    const { tech } = resolve(l.id, selection[l.id], catalog);
    return tech ? [tech] : [];
  });

  return catalog
    .filter((t) => t.layer === layerId)
    .map((tech) => ({ tech, warnings: techWarnings(tech, others, answers) }));
}
