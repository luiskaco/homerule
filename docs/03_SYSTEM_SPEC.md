# 03 — System Spec

## APIs / Endpoints

No hay API de backend. El sitio es estático: todo se resuelve en build time y
el ZIP se arma en el navegador. Rutas principales del sitio:

| Ruta | Descripción |
|---|---|
| `/{locale}` | Índice del hub — modos de uso, catálogo, bitácora (`es` default, `en`) |
| `/{locale}/kits/{tool}` | Presets por stack del tool (`antigravity` o `claude-code`) — ADR-024 |
| `/{locale}/kits/{tool}/stacks` | Rules y skills por stack, con la ruta de instalación del tool |
| `/{locale}/kits/{tool}/subagentes` | Los subagentes del tool (5 de Antigravity, 9 de Claude Code) |
| `/{locale}/build?tool=&preset=` | Armado a medida del ZIP (filtra el manifest por tool); única ruta dinámica |
| `/{locale}/antigravity`, `/agents`, `/stacks`, `/subagentes`, `/kits` | Redirigen (308) a las rutas de kit (`next.config.mjs`) |

## Contratos de request/response

Contrato interno relevante: los items de `manifest.json`
(`{ id, category, tool, label, description, files[{destPath, content}], approxTokens }`).
Invariantes: todo item tiene exactamente un `tool`; `destPath` es la ruta final
en el proyecto destino (ADR-008).

## Integraciones externas

- **Vercel** — hosting del sitio (root directory `site/`, sin env vars).
- **Context7 MCP** — referenciado por las rules; se configura por proyecto
  consumidor (`npx ctx7 setup`), no por este repo.
- **`npx skills` / `uipro` CLI** — instalación/actualización de skills
  vendorizadas (ver README § Skills).

## Configuración y variables de entorno

| Variable | Propósito | Requerida |
|---|---|---|
| — | El sitio no usa variables de entorno | — |

## Scripts del repo

| Script | Cuándo correrlo |
|---|---|
| `node scripts/sync-claude-kit.mjs` | Tras editar un workflow o rule — regenera `.claude/commands/` y las rules-skills de `.claude/skills/` |
| `python scripts/check-core-parity.py` | Tras editar `CORE.md` o `GEMINI.md` — falla si las secciones compartidas divergen |
| `python scripts/update-token-table.py` | Tras editar rules/workflows — regenera la tabla del README |
| `python scripts/make-desktop-zips.py` | Para subir skills a Claude Desktop — regenera `skills-desktop/` |
| `npm run generate-manifest` (en `site/`) | Automático en `predev`/`prebuild`; manual si el dev server ya corre |
