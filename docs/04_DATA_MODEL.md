# 04 — Data Model

No hay base de datos. Los "datos" del sistema son archivos markdown y tres
estructuras TypeScript/JSON.

## Entidades

### `ManifestItem` (`site/public/manifest.json`, generado)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Único, prefijado por tool/categoría (`claude-code:rule:security`) |
| `category` | string | `global` · `rule` · `skill` · `command` · `agent` · `template` · `database` |
| `tool` | string | `antigravity` o `claude-code` — nunca ambos (ADR-006) |
| `label` | string | Nombre visible |
| `description` | string | Del frontmatter del archivo fuente |
| `files[]` | `{destPath, content}` | Rutas finales dentro del ZIP (ADR-008) |
| `approxTokens` | number | chars/4 |

### `Preset` (`site/src/lib/presets.ts`, a mano)

Stack descargable: `id`, label, descripción, tool y la lista de `itemIds` que
preselecciona. 8 stacks hoy (Next.js ×2, React SPA, Vue, HTML plano,
WordPress, FastAPI, etc.).

### Catálogos del sitio (a mano, solo ES — pendiente i18n)

- `lib/skill-catalog.ts` — skills mostradas en el catálogo.
- `lib/external-skills.ts` — skills externas con instalación.
- `lib/prompt-templates.ts` — templates de prompt.

## Relaciones

```text
Preset ──(itemIds)──> ManifestItem ──(files)──> archivos fuente del repo
```

Un item puede pertenecer a varios presets; un preset solo referencia items de
su mismo `tool`.

## Migraciones

Sin schema versionado. Cambios de forma del manifest se hacen en el generador
y son retrocompatibles por construcción (el sitio y el manifest se despliegan
juntos).
