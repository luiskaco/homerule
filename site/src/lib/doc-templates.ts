import { getItemsByCategory } from "@/lib/manifest";

/**
 * La lista de plantillas viene del manifest (generate-manifest.mjs las lee de
 * docs-templates/ en disco). Las mismas plantillas van a los dos tools, así que
 * cada archivo aparece una vez por tool y acá se deduplica por nombre. La
 * descripción de cada una es texto de interfaz y vive traducida en
 * `messages/*.json`, bajo `DocTemplates.<archivo>` — los .md fuente no traen
 * frontmatter con descripción, así que no hay de dónde derivarla.
 */

export interface DocTemplate {
  /** Nombre del archivo, y a la vez clave de `DocTemplates.<file>` en messages. */
  file: string;
}

export function getDocTemplates(): DocTemplate[] {
  const files = new Set(getItemsByCategory("template").map((item) => item.label));
  return [...files].sort((a, b) => a.localeCompare(b)).map((file) => ({ file }));
}
