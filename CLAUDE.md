# makeRuleIA — Memoria del proyecto

Este repo es el **AI Rules Hub**: la fuente desde la que se generan los kits de
reglas para Antigravity y Claude Code. Acá se aplica el mismo kit que se
distribuye (dogfooding) — las reglas globales se importan del archivo fuente:

@core/CORE.md

---

## Particularidades de este repo (no aplican a proyectos consumidores)

- **Fuente vs. producto.** `.agents/rules/`, `.agents/skills/`,
  `.gemini/antigravity/global_workflows/`, `core/CORE.md`, `.claude/agents/` y
  `docs-templates/` son **fuente**: lo que el generador
  (`site/scripts/generate-manifest.mjs`) empaqueta en los ZIPs. Editar siempre
  la fuente, nunca un derivado.
- **Derivados que se regeneran, no se editan a mano:**
  - `.claude/commands/` y `.claude/skills/<regla>/SKILL.md` (las 9 rules
    convertidas) ← `node scripts/sync-claude-kit.mjs` después de editar
    cualquier workflow o rule.
  - `site/public/manifest.json` ← lo regenera `prebuild`/`predev` del sitio.
  - La tabla de tokens del `README.md` ← `python scripts/update-token-table.py`.
- **Paridad CORE/GEMINI.** `core/CORE.md` y `.gemini/GEMINI.md` se mantienen a
  mano en paralelo. Si se edita una sección compartida (§ 0–§ 8) en uno,
  replicar el cambio en el otro en el mismo commit y verificar con
  `python scripts/check-core-parity.py`. Difieren a propósito solo en: título,
  § 3 punto 2 (fallback de documentación por tool), § 5 (excepción
  `00_PROJECT_START` vs `00_GEMINI_START`), § 6 (nombres de la jerarquía) y la
  nota de subagentes de § 8.
- **Las rules se editan en `.agents/rules/`** (fuente única). Sus copias en
  `.claude/skills/<regla>/SKILL.md` son derivadas — mismo formato que traen
  los ZIPs del kit, regeneradas por `sync-claude-kit.mjs`.
- **Skills de diseño vendorizadas** (`.claude/skills/`): son de terceros, no
  editarlas — se actualizan reinstalando (ver `skills-lock.json` y README
  § Skills de diseño de terceros).

## Jerarquía de skills de diseño (para no dispararlas en cadena)

Para trabajo de UI en `site/`, usar **una** skill por tarea, elegida así:

| Tarea | Skill |
|---|---|
| Página o sección nueva / redesign | `hallmark` |
| Polish de UI existente, microinteracciones | `emil-design-eng` |
| Componentes shadcn/Tailwind concretos | `ui-styling` |
| Consulta de paletas/tipografías/charts | `ui-ux-pro-max` |
| Animaciones (revisar / mejorar / proponer) | `review-animations` / `improve-animations` / `find-animation-opportunities` |

El resto de skills de diseño disponibles en la sesión (globales del usuario) no
se invocan solas para este repo salvo pedido explícito.
