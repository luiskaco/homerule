import { PROJECT_TYPES } from '../domain/project-types';
import type { Budget, HostingPreference, ProjectAnswers, Scale, SeoLevel } from '../domain/types';
import type { SelectionEvaluation, SelectionLayer } from './assemble';
import type { LayerResult, Recommendation } from './recommend';

const SEO_LABEL: Record<SeoLevel, string> = { none: 'no importa', useful: 'útil', critical: 'crítico' };
const HOSTING_LABEL: Record<HostingPreference, string> = {
  serverless: 'sin servidor propio',
  'own-server': 'servidor propio',
  any: 'indistinto',
};
const BUDGET_LABEL: Record<Budget, string> = { free: 'cero', low: 'bajo', flexible: 'flexible' };
const SCALE_LABEL: Record<Scale, string> = { prototype: 'prototipo', product: 'producto en producción' };

const FEATURES: ReadonlyArray<readonly [keyof ProjectAnswers, string]> = [
  ['realtime', 'tiempo real'],
  ['needsUsers', 'cuentas de usuario'],
  ['needsPayments', 'pagos'],
  ['needsFiles', 'archivos'],
  ['needsEmail', 'email'],
  ['needsAI', 'IA'],
];

function describeAnswers(answers: ProjectAnswers): string[] {
  const typeLabel = PROJECT_TYPES.find((p) => p.id === answers.type)?.label ?? answers.type;
  const features = FEATURES.filter(([key]) => answers[key] === true).map(([, label]) => label);
  return [
    `- Tipo: ${typeLabel}`,
    `- Etapa: ${SCALE_LABEL[answers.scale]}`,
    `- SEO: ${SEO_LABEL[answers.seo]}`,
    `- Hosting: ${HOSTING_LABEL[answers.hosting]}`,
    `- Presupuesto: ${BUDGET_LABEL[answers.budget]}`,
    `- Necesita: ${features.length > 0 ? features.join(', ') : 'nada de lo anterior'}`,
  ];
}

const escapeCell = (text: string) => text.replaceAll('|', '\\|').replaceAll('\n', ' ');

function chosenOf(recommendation: Recommendation): LayerResult[] {
  return recommendation.layers.filter((l) => l.chosen !== null);
}

/** Tecnologías elegidas que todavía no se verificaron contra documentación vigente. */
export function unverifiedNames(recommendation: Recommendation): string[] {
  return chosenOf(recommendation)
    .filter((l) => l.chosen && !l.chosen.tech.verifiedAt)
    .map((l) => l.chosen?.tech.name ?? '');
}

/**
 * Bloque para la sección "Proyecto" del AGENTS.md del proyecto.
 * Es lo que reemplaza a las reglas de stack que traería una IA por defecto.
 */
export function buildAgentsBlock(recommendation: Recommendation, date: string): string {
  const rows = chosenOf(recommendation).map((l) => {
    const t = l.chosen?.tech;
    if (!t) return '';
    const mark = t.verifiedAt ? '' : ' (sin verificar)';
    return `| ${l.layer.label} | ${escapeCell(t.name)}${mark} | ${escapeCell(t.solves)} |`;
  });

  const installable = chosenOf(recommendation).filter((l) => l.chosen && !l.chosen.tech.isNone);
  const unverified = unverifiedNames(recommendation);

  const lines = [
    '## Proyecto — Stack',
    '',
    `Elegido el ${date} con Stack Chooser a partir de estas condiciones:`,
    '',
    ...describeAnswers(recommendation.answers),
    '',
    '| Capa | Tecnología | Para qué |',
    '|---|---|---|',
    ...rows,
    '',
    '### Reglas para la IA',
    '',
    '- Usá solo este stack. No instales una alternativa a ninguna de estas piezas sin avisar y justificarlo.',
    '- Antes de escribir código con una librería, consultá su documentación vigente y respetá el lockfile.',
    `- Piezas a instalar: ${installable.length}. Las filas que no se instalan (rutas del framework, ORM integrado) ya vienen con otra pieza.`,
  ];

  if (unverified.length > 0) {
    lines.push(
      '',
      `> Sin verificar contra documentación vigente: ${unverified.join(', ')}. Confirmar versión y API antes de implementar.`,
    );
  }

  return lines.join('\n') + '\n';
}

/** Registro de la decisión, con lo que se descartó y por qué, listo para pegar como ADR. */
export function buildDecisionRecord(recommendation: Recommendation, date: string): string {
  const lines = [
    '## ADR — Stack del proyecto',
    '',
    `**Fecha:** ${date}`,
    '',
    '**Contexto:**',
    '',
    ...describeAnswers(recommendation.answers),
    '',
    '**Decisión:**',
    '',
  ];

  for (const layer of recommendation.layers) {
    if (layer.chosen) {
      lines.push(`- **${layer.layer.label}:** ${layer.chosen.tech.name}`);
    } else {
      lines.push(`- **${layer.layer.label}:** sin opción compatible. ${layer.note ?? ''}`.trimEnd());
    }
  }

  lines.push('', '**Alternativas consideradas:**', '');
  for (const layer of recommendation.layers) {
    const considered = layer.alternatives.map((a) => a.tech.name);
    if (considered.length > 0) lines.push(`- ${layer.layer.label}: ${considered.join(', ')}`);
  }

  lines.push('', '**Descartadas por incompatibilidad:**', '');
  let anyDiscarded = false;
  for (const layer of recommendation.layers) {
    for (const d of layer.discarded) {
      anyDiscarded = true;
      lines.push(`- ${layer.layer.label} · ${d.tech.name}: ${d.why}`);
    }
  }
  if (!anyDiscarded) lines.push('- Ninguna.');

  const unverified = unverifiedNames(recommendation);
  lines.push('', '**Consecuencias:**', '');
  lines.push(
    unverified.length > 0
      ? `- Sin verificar contra documentación vigente: ${unverified.join(', ')}.`
      : '- Todo lo elegido está verificado contra documentación vigente.',
  );

  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Stack armado a mano (armador libre)
// ---------------------------------------------------------------------------

const chosenLayers = (evaluation: SelectionEvaluation): SelectionLayer[] =>
  evaluation.layers.filter((l) => l.tech !== null);

/** Tecnologías elegidas a mano que todavía no se verificaron contra documentación vigente. */
export function unverifiedManualNames(evaluation: SelectionEvaluation): string[] {
  return chosenLayers(evaluation)
    .filter((l) => l.tech && !l.tech.verifiedAt)
    .map((l) => l.tech?.name ?? '');
}

/** Avisos que quedaron sin resolver, uno por línea, con capa y tecnología. */
function warningLines(evaluation: SelectionEvaluation): string[] {
  const byLayer = new Map(evaluation.layers.map((l) => [l.layer.id, l]));
  return evaluation.warnings.map((w) => {
    const layer = byLayer.get(w.layer);
    const label = layer?.layer.label ?? w.layer;
    const name = layer?.tech?.name;
    const tag = w.severity === 'info' ? ' (informativo)' : '';
    return `- ${label}${name ? ` · ${name}` : ''}${tag}: ${w.message}`;
  });
}

/** Bloque para el AGENTS.md de un stack que armó la persona; incluye los avisos sin resolver. */
export function buildManualAgentsBlock(evaluation: SelectionEvaluation, date: string, answers?: ProjectAnswers): string {
  const layers = chosenLayers(evaluation);
  const rows = layers.map((l) => {
    const t = l.tech;
    if (!t) return '';
    const mark = t.verifiedAt ? '' : ' (sin verificar)';
    return `| ${l.layer.label} | ${escapeCell(t.name)}${mark} | ${escapeCell(t.solves)} |`;
  });
  const installable = layers.filter((l) => l.tech && !l.tech.isNone);
  const unverified = unverifiedManualNames(evaluation);
  const warnings = warningLines(evaluation);

  const lines = [
    '## Proyecto — Stack',
    '',
    `Armado a mano el ${date} con Stack Chooser. La persona eligió cada pieza: no es una recomendación automática.`,
  ];
  if (answers) lines.push('', 'Condiciones del proyecto:', '', ...describeAnswers(answers));
  lines.push(
    '',
    '| Capa | Tecnología | Para qué |',
    '|---|---|---|',
    ...rows,
    '',
    '### Reglas para la IA',
    '',
    '- Usá solo este stack. Fue una decisión de la persona: no cambies una pieza por otra sin avisar y justificarlo.',
    '- Antes de escribir código con una librería, consultá su documentación vigente y respetá el lockfile.',
    `- Piezas a instalar: ${installable.length}. Las filas que no se instalan (rutas del framework, ORM integrado) ya vienen con otra pieza.`,
  );

  if (warnings.length > 0) {
    lines.push(
      '',
      '### Avisos sin resolver',
      '',
      'La persona decidió seguir con esta combinación. Tenelos presentes al implementar:',
      '',
      ...warnings,
    );
  }

  if (unverified.length > 0) {
    lines.push(
      '',
      `> Sin verificar contra documentación vigente: ${unverified.join(', ')}. Confirmar versión y API antes de implementar.`,
    );
  }

  return lines.join('\n') + '\n';
}

/** Registro de la decisión de un stack armado a mano, con los avisos que se aceptaron. */
export function buildManualDecisionRecord(
  evaluation: SelectionEvaluation,
  date: string,
  answers?: ProjectAnswers,
): string {
  const lines = ['## ADR — Stack del proyecto', '', `**Fecha:** ${date}`, '', '**Contexto:**', ''];
  lines.push(
    'Stack armado a mano por la persona, no recomendado automáticamente.',
    ...(answers ? ['', ...describeAnswers(answers)] : []),
    '',
    '**Decisión:**',
    '',
  );

  for (const l of evaluation.layers) {
    if (l.status === 'unset') continue;
    if (l.tech) lines.push(`- **${l.layer.label}:** ${l.tech.name}`);
    else if (l.status === 'none') lines.push(`- **${l.layer.label}:** no se usa nada.`);
    else lines.push(`- **${l.layer.label}:** elección no reconocida en el catálogo.`);
  }

  const warnings = warningLines(evaluation);
  lines.push('', '**Avisos aceptados:**', '');
  lines.push(...(warnings.length > 0 ? warnings : ['- Ninguno.']));

  const unverified = unverifiedManualNames(evaluation);
  lines.push('', '**Consecuencias:**', '');
  lines.push(
    unverified.length > 0
      ? `- Sin verificar contra documentación vigente: ${unverified.join(', ')}.`
      : '- Todo lo elegido está verificado contra documentación vigente.',
  );

  return lines.join('\n') + '\n';
}
