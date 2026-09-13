import { getItemsByCategory } from "@/lib/manifest";

/**
 * La lista de plantillas y a qué tool pertenece cada una viene del manifest
 * (generate-manifest.mjs las lee de docs-templates/ en disco). La descripción
 * de cada una es texto de interfaz y vive traducida en `messages/*.json`, bajo
 * `DocTemplates.<archivo>` — los .md fuente no traen frontmatter con
 * descripción, así que no hay de dónde derivarla.
 */

export interface DocTemplate {
  /** Nombre del archivo, y a la vez clave de `DocTemplates.<file>` en messages. */
  file: string;
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
    byFile.set(item.label, { file: item.label, tools: [item.tool] });
  }

  return [...byFile.values()].sort((a, b) => a.file.localeCompare(b.file));
}
