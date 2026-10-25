import type { ManifestItem } from "@/lib/manifest";

/**
 * Los dos tools emiten el mismo texto con ids distintos
 * (`rule:security` y `claude-code:rule:security`), así que la traducción se
 * guarda una sola vez bajo la clave sin prefijo de tool. next-intl no admite
 * `.` en las claves (lo usa para anidar), así que `global:GEMINI.md` se guarda
 * como `global:GEMINI_md`.
 */
export function itemDescriptionKey(id: string): string {
  return id.replace(/^(antigravity|claude-code):/, "").replace(/\./g, "_");
}

/**
 * Descripción de un item del manifest en el idioma del usuario.
 *
 * A diferencia del resto del contenido, el español no vive en `messages`: sale
 * del frontmatter de la rule/skill que se empaqueta en el kit, y ahí tiene que
 * seguir en español (ADR-009). `messages/en.json` guarda solo la traducción, y
 * cuando no hay entrada se cae al texto del manifest.
 */
export function resolveItemDescription(
  item: ManifestItem,
  t: { has: (key: string) => boolean; (key: string): string }
): string {
  const key = itemDescriptionKey(item.id);
  return t.has(key) ? t(key) : item.description;
}
