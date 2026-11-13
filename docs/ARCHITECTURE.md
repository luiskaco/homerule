# Arquitectura

> Cómo está armado el repo y el sitio hoy. El porqué de cada elección está en `03_DECISIONS.md`.

## Diseño del sistema

### Visión general

El sistema tiene dos mitades: el **contenido fuente** (reglas, workflows,
skills, plantillas, agentes — archivos markdown en la raíz del repo) y el
**sitio empaquetador** (`site/`, Next.js estático) que convierte esa fuente en
ZIPs descargables por stack y por tool. La fuente se edita una sola vez; el
generador emite el formato nativo de cada tool.

### Componentes principales

| Componente | Responsabilidad |
|---|---|
| `.agents/rules/` | 9 rules técnicas con trigger (`model_decision`/`glob`) — fuente única para ambos tools |
| `.gemini/GEMINI.md` + `core/CORE.md` | Núcleo Always On por tool — se mantienen en paridad manual (ver `AGENTS.md` raíz) |
| `.agents/skills/` (workflows) | 7 workflows como skills con `metadata: kind: workflow` (ADR-020) — fuente de los comandos de Claude Code |
| `.claude/agents/` | 9 subagentes de Claude Code (fuente y a la vez instalación local del repo) |
| `.agents/skills/` + `.claude/skills/` | Skills externas: las primeras se empaquetan, las segundas son vendorizadas para uso local |
| `docs-templates/` | Plantillas `/docs`: 4 fijas y 5 opcionales |
| `site/scripts/generate-manifest.mjs` | Recorre la fuente y arma `manifest.json` con un item por archivo/tool |
| `site/src/lib/presets.ts` | Define los stacks y qué items preselecciona cada uno |
| `BuildClient` + `zip.ts` | Filtra por tool, arma el ZIP en el navegador (jszip) |
| `scripts/sync-claude-kit.mjs` | Regenera los derivados locales de Claude Code: `.claude/commands/` y las rules como `.claude/skills/<id>/` |
| `scripts/check-core-parity.py` | Verifica que `CORE.md` y `GEMINI.md` no divergieron en las secciones compartidas |
| `scripts/update-token-table.py` | Regenera la tabla de tokens del README |
| `scripts/hooks/stack-conventions-reminder.mjs` | Hook PostToolUse — replica en Claude Code el trigger `glob` de `stack-conventions.md` |

### Flujo de datos

```
fuente (markdown en raíz)
  → generate-manifest.mjs (prebuild/predev)
  → site/public/manifest.json
  → /build (selección por stack/tool)
  → ZIP en el navegador → proyecto destino
```

### Decisiones de diseño clave

- Catálogos estancos por tool, fuente única en disco (ADR-006).
- `destPath` del manifest = ruta final en el proyecto destino (ADR-008).
- El repo consume su propio kit — dogfooding (ADR-010).
- Detalle completo en `03_DECISIONS.md`.

### Riesgos y mitigaciones

- **Deriva CORE/GEMINI** (dos archivos casi idénticos a mano) → regla de
  paridad en `AGENTS.md` raíz: replicar en el mismo commit.
- **Deriva de derivados** (`.claude/commands/`, tabla de tokens) → scripts de
  regeneración, nunca edición manual.
- **Skills de terceros desactualizadas** → `skills-lock.json` (las de
  `npx skills`) + git como referencia para las de `uipro`.

## Especificaciones técnicas

### APIs / Endpoints

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

### Contratos de request/response

Contrato interno relevante: los items de `manifest.json`
(`{ id, category, tool, label, description, files[{destPath, content}], approxTokens }`).
Invariantes: todo item tiene exactamente un `tool`; `destPath` es la ruta final
en el proyecto destino (ADR-008).

### Integraciones externas

- **Vercel** — hosting del sitio (root directory `site/`, sin env vars).
- **Context7 MCP** — referenciado por las rules; se configura por proyecto
  consumidor (`npx ctx7 setup`), no por este repo.
- **`npx skills` / `uipro` CLI** — instalación/actualización de skills
  vendorizadas (ver README § Skills).

### Configuración y variables de entorno

| Variable | Propósito | Requerida |
|---|---|---|
| — | El sitio no usa variables de entorno | — |

### Scripts del repo

| Script | Cuándo correrlo |
|---|---|
| `node scripts/sync-claude-kit.mjs` | Tras editar un workflow o rule — regenera `.claude/commands/` y las rules-skills de `.claude/skills/` |
| `python scripts/check-core-parity.py` | Tras editar `CORE.md` o `GEMINI.md` — falla si las secciones compartidas divergen |
| `python scripts/update-token-table.py` | Tras editar rules/workflows — regenera la tabla del README |
| `python scripts/make-desktop-zips.py` | Para subir skills a Claude Desktop — regenera `skills-desktop/` |
| `npm run generate-manifest` (en `site/`) | Automático en `predev`/`prebuild`; manual si el dev server ya corre |

## Estructura e infraestructura

### Estructura de carpetas

| Carpeta | Rol |
|---|---|
| `.agents/rules/`, `.agents/skills/` | Fuente Antigravity (rules también alimentan los kits de Claude) |
| `.gemini/` | Núcleo global + workflows de Antigravity (fuente) |
| `core/CORE.md` | Fuente del `AGENTS.md` neutral de ambos kits y del `CLAUDE.md` de Claude Code (que lo importa) |
| `core/agents-map.md` | Mapa del proyecto que se suma al `AGENTS.md` de los kits (ADR-016) |
| `.claude/agents/` | Subagentes de Claude Code — fuente del manifest e instalación local a la vez |
| `.claude/commands/` | **Derivado** — regenerar con `scripts/sync-claude-kit.mjs` |
| `.claude/skills/` | Mixto: skills de diseño de terceros vendorizadas (no se empaquetan) + las 9 rules convertidas (**derivado** de `.agents/rules/`, vía `sync-claude-kit.mjs`) |
| `.claude/settings.json` | Permisos del repo + hook que replica el trigger `glob` de stack-conventions |
| `docs-templates/` | Plantillas `/docs` que se distribuyen |
| `docs/` | La documentación real de este proyecto (esta carpeta) |
| `site/` | Sitio Next.js empaquetador |
| `scripts/` | Utilidades de mantenimiento del repo |

### Convenciones de capas

- **Fuente → derivado, nunca al revés:** editar siempre la fuente; los
  derivados (`.claude/commands/`, `manifest.json`, tabla de tokens del README,
  `skills-desktop/`) se regeneran por script.
- El sitio sigue las rules del propio kit (App Router, Server Components,
  next-intl, Tailwind) — la excepción App Router de `architecture.md` aplica.
- Paridad manual `core/CORE.md` ↔ `.gemini/GEMINI.md` (ver `AGENTS.md` raíz).

### Infraestructura

- **Hosting:** Vercel, root directory `site/`, sin variables de entorno ni DB.
- **Build:** `prebuild` corre el generador de manifest; el ZIP se arma
  client-side con jszip.
- **Entornos:** solo producción + dev local. Sin staging — el contenido es
  markdown versionado en git.

### ADRs

El detalle de cada decisión vive en `03_DECISIONS.md` (ADR-001 … ADR-010).
