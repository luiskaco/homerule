# 05 — Architecture Decisions

## Estructura de carpetas

| Carpeta | Rol |
|---|---|
| `.agents/rules/`, `.agents/skills/` | Fuente Antigravity (rules también alimentan los kits de Claude) |
| `.gemini/` | Núcleo global + workflows de Antigravity (fuente) |
| `core/CORE.md` | Fuente del `CLAUDE.md` que reciben los kits de Claude Code |
| `.claude/agents/` | Subagentes de Claude Code — fuente del manifest e instalación local a la vez |
| `.claude/commands/` | **Derivado** — regenerar con `scripts/sync-claude-kit.mjs` |
| `.claude/skills/` | Mixto: skills de diseño de terceros vendorizadas (no se empaquetan) + las 9 rules convertidas (**derivado** de `.agents/rules/`, vía `sync-claude-kit.mjs`) |
| `.claude/settings.json` | Permisos del repo + hook que replica el trigger `glob` de stack-conventions |
| `docs-templates/` | Plantillas `/docs` que se distribuyen |
| `docs/` | La documentación real de este proyecto (esta carpeta) |
| `site/` | Sitio Next.js empaquetador |
| `scripts/` | Utilidades de mantenimiento del repo |

## Convenciones de capas

- **Fuente → derivado, nunca al revés:** editar siempre la fuente; los
  derivados (`.claude/commands/`, `manifest.json`, tabla de tokens del README,
  `skills-desktop/`) se regeneran por script.
- El sitio sigue las rules del propio kit (App Router, Server Components,
  next-intl, Tailwind) — la excepción App Router de `architecture.md` aplica.
- Paridad manual `core/CORE.md` ↔ `.gemini/GEMINI.md` (ver `CLAUDE.md` raíz).

## Infraestructura

- **Hosting:** Vercel, root directory `site/`, sin variables de entorno ni DB.
- **Build:** `prebuild` corre el generador de manifest; el ZIP se arma
  client-side con jszip.
- **Entornos:** solo producción + dev local. Sin staging — el contenido es
  markdown versionado en git.

## ADRs

El detalle de cada decisión vive en `07_DECISIONS.md` (ADR-001 … ADR-010).
