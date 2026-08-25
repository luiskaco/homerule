import { getItemsByCategory } from "@/lib/manifest";

/**
 * Descripciones de las plantillas SDD — tomadas de la tabla de
 * core/CORE.md § 5. Es el único dato que no se puede derivar del manifest:
 * los .md fuente en docs-templates/ no traen frontmatter con descripción.
 * La lista de archivos y a qué tool pertenece cada uno sí viene del
 * manifest (generate-manifest.mjs los lee de docs-templates/ en disco), así
 * que no se duplica acá.
 */
const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  "00_GEMINI_START.md":
    "Punto de entrada de la sesión — si existe, define la estructura de docs activa y tiene prioridad sobre esta tabla.",
  "01_PROJECT_PRD.md": "Requisitos de producto.",
  "02_SDD.md": "Diseño del sistema.",
  "03_SYSTEM_SPEC.md": "Especificaciones técnicas.",
  "04_DATA_MODEL.md": "Esquemas y entidades.",
  "05_ARCHITECTURE.md": "Decisiones arquitectónicas.",
  "06_TASKS.md": "Backlog activo.",
  "07_DECISIONS.md": "ADRs — decisiones con alternativas evaluadas y trade-offs.",
  "08_CHANGELOG.md": "Historial de versiones.",
  "CONTEXT.md": "Glosario del dominio — vivo, no de fase (opcional, desde 3 términos).",
};

export interface DocTemplate {
  file: string;
  description: string;
  tools: ("antigravity" | "claude-code")[];
}

export function getDocTemplates(): DocTemplate[] {
  const byFile = new Map<string, DocTemplate>();

  for (const item of getItemsByCategory("template")) {
    const existing = byFile.get(item.label);
    if (existing) {
      existing.tools.push(item.tool);
      continue;
    }
    byFile.set(item.label, {
      file: item.label,
      description: TEMPLATE_DESCRIPTIONS[item.label] ?? "",
      tools: [item.tool],
    });
  }

  return [...byFile.values()].sort((a, b) => a.file.localeCompare(b.file));
}
