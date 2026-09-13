# 06 — Tasks (Backlog activo)

> Actualizar antes de codificar cuando el usuario mencione modificaciones,
> cambios o nuevas funcionalidades (ver `GEMINI.md § 4` / `CORE.md § 4`).

## En progreso

- [ ] Reorganización de la interfaz del sitio — cambios hechos pero todavía sin commitear.

## Pendiente

- [ ] Traducir el **contenido de datos** del sitio al inglés — hoy la interfaz está en ES/EN pero estos archivos siguen solo en español: `lib/skill-catalog.ts` (~295 líneas), `lib/external-skills.ts` (~187), `lib/prompt-templates.ts` (~193), las descripciones de `STACK_LABELS` en `lib/presets.ts`, las entradas de `RELEASES` en `/changelog`, y las descripciones que salen del frontmatter de las rules/skills vía `manifest.json`. Requiere decidir si se mueven a `messages/*.json` o si llevan un campo por locale.

- [ ] Decidir si `/mejores-skill` (catálogo plano) y `/skills-por-proyecto` (agrupado por tipo de trabajo) se mantienen separados o se fusionan en una página con dos vistas. Hoy muestran el mismo set de skills con distinto corte.
- [ ] Evaluar si `/changelog` debería estar en el nav principal además del footer.
- [ ] **Empaquetar el kit de Claude Code como plugin nativo.** La dirección ya está decidida en ADR-011 (se suma a los ZIPs, no los reemplaza). Falta: `.claude-plugin/plugin.json` con el array explícito de rutas de skills, decidir el esquema de versión — hoy el proyecto no versiona — y el paso de release que suba plugin y repo juntos.

## Completado

- [x] **`/subagentes` muestra los dos catálogos**: 4 de Antigravity + 8 de Claude Code, con el formato y la ruta de cada tool, badges de "escribe"/"solo lectura" y tier de modelo derivados del frontmatter real del agente (no de una lista a mano, para que no se desactualice). Sumada también al menú "Antigravity solo".
- [x] **Tema visual unificado**: `/mejores-skill`, `/skills-por-proyecto`, `/prompts`, `/subagentes` y `/plantillas` pasan a Vibrant Flat UI 3.0. Arrastraban el estilo viejo también `BuildClient`, `ItemPreviewModal` (el modal de preview se abría con fondo blanco sobre el sitio oscuro) y `DocTemplatesDownload`. Ya no queda ninguna clase `neutral-*` en `site/src`.
- [x] **Campo `model` por subagente** — verificado, ya estaba bien: `explorer` y `docs-writer` en haiku, `planner` y `security-auditor` en opus, el resto en sonnet. Del lado Antigravity, `security` en `pro` y el resto en `inherit`.
- [x] **4 subagentes de Antigravity** (ADR-013): `auditor`, `backend`, `frontend` y `security` en `.agents/agents/<nombre>/agent.md` — el path de descubrimiento nativo del workspace, así que la fuente del repo es también la instalación. Se suman al manifest como items `antigravity:agent:*` y quedan preseleccionados en los 8 presets. Corrige de paso el comentario de `generate-manifest.mjs` que daba por hecho que Antigravity no tenía subagentes declarables.

- [x] **Skill `domain-modeling` + plantilla `CONTEXT.md`** (ADR-012): glosario vivo del vocabulario del dominio, sin numerar a propósito (los 01-08 son documentos de fase). Preseleccionada en los 7 stacks reales. Hueco detectado comparando con `mattpocock/skills`.
- [x] **Workflow `/grill`**: interrogatorio de a una pregunta por turno que le da forma concreta a la Regla de Oro de `CORE.md § 1` — hasta ahora "detenete si hay ambigüedad" quedaba a criterio del modelo. Fuente única: se emite como workflow de Antigravity y comando de Claude Code.
- [x] **ADR-011** — dirección definida para empaquetar el kit como plugin nativo de Claude Code (se suma a los ZIPs, no los reemplaza). Implementación pendiente arriba.
- [x] Guard en `update-token-table.py`: una rule o workflow nuevo sin entrada en el script hacía que quedara fuera de la tabla en silencio; ahora falla con el nombre del archivo faltante.
- [x] **Trigger `glob` replicado en Claude Code**: hook `PostToolUse` en `.claude/settings.json` (`scripts/hooks/stack-conventions-reminder.mjs`) que recuerda aplicar `stack-conventions` al editar archivos de código — una vez por sesión. Verificado en vivo.
- [x] `.claude/settings.json` con allowlist de permisos para los scripts del repo y git de solo lectura.
- [x] Las 9 rules también se emiten como skills locales (`.claude/skills/<id>/SKILL.md`) vía `sync-claude-kit.mjs` — los subagentes que referencian esas rutas ya las encuentran en este repo, igual que en un ZIP instalado.
- [x] Guardián de paridad `scripts/check-core-parity.py`: falla si `CORE.md` y `GEMINI.md` divergen en secciones compartidas. En su primera corrida encontró una divergencia real en § 3 (fallback de documentación), registrada como intencional.
- [x] **Dogfooding del kit en el propio repo** (ADR-010): `CLAUDE.md` raíz con import de `core/CORE.md`, `claude-agents/` movido a `.claude/agents/` (fuente + instalación local), `.claude/commands/` generado por `scripts/sync-claude-kit.mjs`.
- [x] Set SDD completo en `/docs`: contenido real de makeRuleIA en `01`–`05`; `08` redirige al `CHANGELOG.md` de la raíz (ADR-004). `00_GEMINI_START.md` sigue solo en `docs-templates/` — específico de Antigravity.
- [x] Paridad `GEMINI.md` ↔ `CORE.md`: la tabla de stack de `GEMINI.md` recupera Vue y la fila de base de datos; la regla de paridad queda documentada en `CLAUDE.md`.
- [x] README: `database.md` agregado al árbol de estructura, al `cp` de instalación y a la tabla de triggers; wording del `skills-lock.json` corregido (solo cubre las skills de `npx skills`).
- [x] Tabla de tokens del README ahora se regenera con `scripts/update-token-table.py` (valores estaban desactualizados; máximo real ~11.9k).
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
