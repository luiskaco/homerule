// Verifica que todo lo que el manifest lista tenga su texto de interfaz en
// cada idioma. Las páginas lo leen de messages/*.json sin fallback, así que una
// entrada faltante no la detecta TypeScript: rompe el prerender en el build
// (pasó con `prelaunch-compliance-audit`, que se sumó sin `SkillData`).
//
// Corre en `predev` y `prebuild`, después de generar el manifest.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const SITE_DIR = fileURLToPath(new URL("..", import.meta.url));
const LOCALES = ["es", "en"];

const { items } = JSON.parse(readFileSync(join(SITE_DIR, "public", "manifest.json"), "utf8"));
const hubSkillIds = items.filter((i) => i.category === "skill" && i.tool === "antigravity").map((i) => i.id);
const templateKeys = [...new Set(items.filter((i) => i.category === "template").map((i) => i.label.replace(/\.md$/, "")))];

const missing = [];
for (const locale of LOCALES) {
  const messages = JSON.parse(readFileSync(join(SITE_DIR, "messages", `${locale}.json`), "utf8"));

  // /mejores-skill muestra cada skill del kit con la prosa de SkillData.<id>.
  for (const id of hubSkillIds) {
    const entry = messages.SkillData?.[id];
    if (!entry) {
      missing.push(`${locale}.json → SkillData["${id}"]`);
      continue;
    }
    for (const field of ["whenToUse", "usage", "install"]) {
      if (!Array.isArray(entry[field])) missing.push(`${locale}.json → SkillData["${id}"].${field} (debe ser un array)`);
    }
  }

  // /plantillas muestra cada plantilla con DocTemplates.descriptions.<archivo>.
  for (const key of templateKeys) {
    if (!messages.DocTemplates?.descriptions?.[key]) missing.push(`${locale}.json → DocTemplates.descriptions["${key}"]`);
  }
}

if (missing.length) {
  console.error(`Faltan textos de interfaz para items del manifest:\n${missing.map((m) => `  - ${m}`).join("\n")}`);
  process.exit(1);
}
console.log(`messages OK — ${hubSkillIds.length} skills y ${templateKeys.length} plantillas con texto en ${LOCALES.join("/")}.`);
