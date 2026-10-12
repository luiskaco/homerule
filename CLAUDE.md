# makeRuleIA — Memoria del proyecto

Este repo es el **AI Rules Hub**: la fuente desde la que se generan los kits de
reglas para Antigravity y Claude Code. Acá se aplica el mismo kit que se
distribuye (dogfooding) — las reglas globales se importan del archivo fuente:

@core/CORE.md

---

Las particularidades del repo (fuente vs. derivados, paridad CORE/GEMINI,
comandos, convenciones, `/docs`) viven en `AGENTS.md`, compartido con
cualquier otro agente de código. Se importa acá porque, con un `CLAUDE.md`
presente, Claude Code no lo lee solo (ADR-015):

@AGENTS.md

---

## Solo para Claude Code

- Las rules se editan en `.agents/rules/`. Sus copias en
  `.claude/skills/<regla>/SKILL.md` son derivadas — mismo formato que traen
  los ZIPs del kit, regeneradas por `sync-claude-kit.mjs`.

### Jerarquía de skills de diseño (para no dispararlas en cadena)

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
