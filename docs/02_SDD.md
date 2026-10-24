# 02 — System Design Document

## Visión general

El sistema tiene dos mitades: el **contenido fuente** (reglas, workflows,
skills, plantillas, agentes — archivos markdown en la raíz del repo) y el
**sitio empaquetador** (`site/`, Next.js estático) que convierte esa fuente en
ZIPs descargables por stack y por tool. La fuente se edita una sola vez; el
generador emite el formato nativo de cada tool.

## Componentes principales

| Componente | Responsabilidad |
|---|---|
| `.agents/rules/` | 9 rules técnicas con trigger (`model_decision`/`glob`) — fuente única para ambos tools |
| `.gemini/GEMINI.md` + `core/CORE.md` | Núcleo Always On por tool — se mantienen en paridad manual (ver `AGENTS.md` raíz) |
| `.agents/skills/` (workflows) | 7 workflows como skills con `metadata: kind: workflow` (ADR-020) — fuente de los comandos de Claude Code |
| `.claude/agents/` | 9 subagentes de Claude Code (fuente y a la vez instalación local del repo) |
| `.agents/skills/` + `.claude/skills/` | Skills externas: las primeras se empaquetan, las segundas son vendorizadas para uso local |
| `docs-templates/` | Plantillas `/docs` 01–08 |
| `site/scripts/generate-manifest.mjs` | Recorre la fuente y arma `manifest.json` con un item por archivo/tool |
| `site/src/lib/presets.ts` | Define los stacks y qué items preselecciona cada uno |
| `BuildClient` + `zip.ts` | Filtra por tool, arma el ZIP en el navegador (jszip) |
| `scripts/sync-claude-kit.mjs` | Regenera los derivados locales de Claude Code: `.claude/commands/` y las rules como `.claude/skills/<id>/` |
| `scripts/check-core-parity.py` | Verifica que `CORE.md` y `GEMINI.md` no divergieron en las secciones compartidas |
| `scripts/update-token-table.py` | Regenera la tabla de tokens del README |
| `scripts/hooks/stack-conventions-reminder.mjs` | Hook PostToolUse — replica en Claude Code el trigger `glob` de `stack-conventions.md` |

## Flujo de datos

```
fuente (markdown en raíz)
  → generate-manifest.mjs (prebuild/predev)
  → site/public/manifest.json
  → /build (selección por stack/tool)
  → ZIP en el navegador → proyecto destino
```

## Decisiones de diseño clave

- Catálogos estancos por tool, fuente única en disco (ADR-006).
- `destPath` del manifest = ruta final en el proyecto destino (ADR-008).
- El repo consume su propio kit — dogfooding (ADR-010).
- Detalle completo en `07_DECISIONS.md`.

## Riesgos y mitigaciones

- **Deriva CORE/GEMINI** (dos archivos casi idénticos a mano) → regla de
  paridad en `AGENTS.md` raíz: replicar en el mismo commit.
- **Deriva de derivados** (`.claude/commands/`, tabla de tokens) → scripts de
  regeneración, nunca edición manual.
- **Skills de terceros desactualizadas** → `skills-lock.json` (las de
  `npx skills`) + git como referencia para las de `uipro`.
