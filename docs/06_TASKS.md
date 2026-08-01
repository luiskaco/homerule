# 06 — Tasks (Backlog activo)

> Actualizar antes de codificar cuando el usuario mencione modificaciones,
> cambios o nuevas funcionalidades (ver `GEMINI.md § 4` / `CORE.md § 4`).

## En progreso

- [ ] Reorganización de la interfaz del sitio — cambios hechos pero todavía sin commitear.

## Pendiente

- [ ] Traducir el **contenido de datos** del sitio al inglés — hoy la interfaz está en ES/EN pero estos archivos siguen solo en español: `lib/skill-catalog.ts` (~295 líneas), `lib/external-skills.ts` (~187), `lib/prompt-templates.ts` (~193), las descripciones de `STACK_LABELS` en `lib/presets.ts`, las entradas de `RELEASES` en `/changelog`, y las descripciones que salen del frontmatter de las rules/skills vía `manifest.json`. Requiere decidir si se mueven a `messages/*.json` o si llevan un campo por locale.

- [ ] Unificar el tema visual en las páginas que quedaron con el estilo viejo (`neutral-*`, light/dark): `/mejores-skill`, `/skills-por-proyecto`, `/prompts`, `/subagentes`. El resto ya usa Vibrant Flat UI 3.0.
- [ ] Decidir si `/mejores-skill` (catálogo plano) y `/skills-por-proyecto` (agrupado por tipo de trabajo) se mantienen separados o se fusionan en una página con dos vistas. Hoy muestran el mismo set de skills con distinto corte.
- [ ] Evaluar si `/changelog` debería estar en el nav principal además del footer.
- [ ] Completar el resto de los documentos de `/docs` si se quiere el set SDD completo (hoy solo están `06_TASKS.md` y `07_DECISIONS.md`; las plantillas están en `docs-templates/`).

## Completado

- [x] **Regla de idioma alineada con la realidad del repo** (ADR-009): identificadores en inglés, comentarios y documentación en español. Se descartó traducir los 67 comentarios porque 4 de las 14 skills empaquetadas son de terceros en inglés y el ahorro de caracteres es del 3,8%.
- [x] **Separación definitiva de Antigravity y Claude Code** (ADR-006): fin del modo híbrido. Ningún item del manifest pertenece a los dos tools; cada ZIP es autocontenido. Home de 3 modos a 2, `/subagentes` movido dentro de "Claude solo".
- [x] **Kit de subagentes de 6 a 8** (ADR-007): se agregan `ui-reviewer` y `test-writer`; `explorer` y `planner` diferenciados de los agentes `Explore`/`Plan` que Claude Code trae de fábrica.
- [x] Fix: los `.claude/commands/` existían en el manifest pero ningún preset de Claude Code los preseleccionaba — el ZIP se bajaba sin ellos.
- [x] Fix: `code-reviewer` referenciaba `.agents/rules/*`, rutas inexistentes en un ZIP de Claude Code.
- [x] Fix: segmentos duplicados en todos los ZIPs (`docs/docs/`, `.agents/.agents/`) por el prefijo de `destFolder()` (ADR-008).
- [x] Bitácora de cambios: `CHANGELOG.md` en la raíz + página pública `/changelog`.
- [x] Nav reorganizado en 3 secciones: Antigravity solo, Antigravity + Claude, Claude solo — con el catálogo de skills como ventana independiente.
- [x] Etiquetas del nav normalizadas: se eliminaron los tres "Inicio" genéricos por labels descriptivos; el grupo de un solo ítem pasó a ser link directo.
- [x] Fusión de `/stacks` y `/stacks-app` en una sola página `/stacks`.
- [x] Baja de las páginas placeholder vacías y sin link: `/proximamente`, `/mejores-repos-utilidades`.
- [x] Separación de índice y presets: `/` pasa a ser el índice del hub (los 3 modos de uso) y los presets de Antigravity se mudan a `/antigravity`.
- [x] Versión en inglés del sitio: i18n con `next-intl`, ruteo `/es` y `/en`, mensajes en `messages/*.json`, `hreflang`, `lang` por página y selector de idioma en el header. Alcance: interfaz del sitio (el contenido empaquetado en los ZIPs sigue en español, por decisión).
- [x] Fix: contenido específico de Antigravity que se filtraba a los ZIPs de Claude Code (`00_GEMINI_START.md` y referencias sueltas a `GEMINI.md`).
