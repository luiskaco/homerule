# 07 — Decisions (ADRs)

## ADR-001 — Nav del sitio organizado por modo de uso, no por herramienta

**Fecha:** 2026-07-29
**Estado:** ⚠️ Sustituida por ADR-006 (2026-07-31) — el modo "Antigravity + Claude" se eliminó.

**Contexto:** El nav agrupaba por herramienta ("Antigravity (Gemini)", "Claude Code"), lo que no reflejaba cómo se usa realmente el kit: hay proyectos con Antigravity solo, proyectos con Claude solo, y proyectos donde Claude complementa a Antigravity.

**Decisión:** Tres secciones por modo de uso — **Antigravity solo**, **Antigravity + Claude**, **Claude solo** — más **Skills & Prompts** como ventana independiente (el catálogo de skills es transversal a los tres modos, no pertenece a ninguno).

**Alternativas consideradas:** Mantener el agrupamiento por herramienta y aclarar la diferencia en la copy de cada página — se descartó porque el nav es el primer punto de contacto y ahí es donde se decide el camino.

**Consecuencias:** "Antigravity + Claude" hoy no tiene un ZIP combinado propio; apunta solo a los subagentes. Si más adelante se quiere un preset híbrido descargable, esa sección es el lugar donde va.

## ADR-002 — Labels descriptivos en el nav, sin "Inicio" repetido

**Fecha:** 2026-07-29
**Estado:** Aceptada

**Contexto:** Con las tres secciones, cada dropdown abría con un ítem "Inicio" — tres "Inicio" distintos que apuntaban a `/`, `/subagentes` y `/agents`. Un label que no dice a dónde lleva.

**Decisión:** Labels paralelos y descriptivos ("Presets por stack", "Rules y skills por stack", "Armar a medida"). Un grupo con un solo ítem se renderiza como link directo en vez de dropdown.

**Consecuencias:** El label se repite entre secciones (ej. "Presets por stack" en Antigravity y en Claude), pero el título del grupo desambigua. Es repetición paralela, no ambigüedad.

## ADR-003 — Separar las plantillas específicas de Antigravity de las compartidas

**Fecha:** 2026-07-29
**Estado:** Vigente en el criterio, desactualizada en el mecanismo — ADR-006 eliminó `SHARED_TEMPLATE_ITEM_IDS`: ya no hay plantillas compartidas, cada tool emite las suyas. `00_GEMINI_START.md` sigue siendo exclusiva de Antigravity.

**Contexto:** `00_GEMINI_START.md` — un archivo que define el override de stack por proyecto y referencia `GEMINI.md § 3 / § 5` — se incluía en cualquier ZIP, incluidos los de Claude Code, que no usa ese archivo. Lo mismo pasaba con referencias sueltas a `GEMINI.md` en plantillas y workflows compartidos.

**Decisión:** En `site/src/lib/presets.ts`, separar `SHARED_TEMPLATE_ITEM_IDS` de `ANTIGRAVITY_ONLY_TEMPLATE_ITEM_IDS`. Las referencias en archivos compartidos se generalizan a `GEMINI.md / CORE.md`.

**Consecuencias:** Al agregar una plantilla nueva hay que decidir explícitamente si es compartida o específica de una herramienta. Es un paso extra, pero evita que vuelva a filtrarse contenido cruzado.

## ADR-005 — i18n con next-intl, español como default y solo la interfaz traducida

**Fecha:** 2026-07-29
**Estado:** Aceptada

**Contexto:** Se pidió una versión en inglés del sitio. Todo el texto estaba hardcodeado en español en el JSX, y las rules del propio proyecto (`ui-ux.md § i18n`, `seo.md § SEO Multi-idioma`) exigen strings en archivos de traducción, ruteo de idioma explícito en la URL, `hreflang` y pluralización con ICU.

**Decisión:** `next-intl` con `localePrefix: "always"`, `defaultLocale: "es"` (la raíz redirige a `/es`), mensajes en `messages/es.json` y `messages/en.json` con namespacing por módulo. El alcance se limita a la **interfaz** del sitio: el contenido que se empaqueta en los ZIPs (rules, skills, workflows, plantillas `/docs`) queda en español.

**Alternativas consideradas:** Diccionarios planos sin dependencia — se descartó porque la pluralización quedaría a mano, justo lo que las rules prohíben (y el índice tiene contadores: "7 stacks", "1 stack"). Traducir también el contenido empaquetado — se descartó por ahora: es un proyecto de contenido aparte.

**Consecuencias:** En `/en` la interfaz está en inglés pero los textos que vienen de archivos de datos (`skill-catalog.ts`, `prompt-templates.ts`, descripciones de presets, entradas del changelog, descripciones del `manifest.json`) siguen en español. Es una mezcla visible y está anotada como pendiente en `06_TASKS.md`. Al agregar UI nueva hay que sumar la clave en los dos archivos de mensajes.

## ADR-004 — Bitácora de cambios duplicada a propósito

**Fecha:** 2026-07-29
**Estado:** Aceptada

**Contexto:** Hacía falta registrar los cambios del proyecto, con dos audiencias distintas: quien trabaja en el repo y quien visita el sitio.

**Decisión:** `CHANGELOG.md` en la raíz (formato Keep a Changelog, para el repo) y página `/changelog` en el sitio (timeline visual, para visitantes).

**Alternativas consideradas:** Que la página parsee `CHANGELOG.md` en build time — se descartó por ahora para no sumar dependencia de parseo de markdown por un contenido que cambia poco.

**Consecuencias:** Hay que actualizar los dos a mano. Si empiezan a divergir, conviene rever la alternativa del parseo.

## ADR-006 — Antigravity y Claude Code como catálogos estancos (fin del modo híbrido)

**Fecha:** 2026-07-31
**Estado:** Aceptada — sustituye a ADR-001

**Contexto:** El hub ofrecía tres modos de uso, uno de los cuales ("Antigravity + Claude") presentaba a Claude como complemento de un proyecto Antigravity. Ese modo nunca tuvo un ZIP propio (ADR-001 ya lo anotaba como consecuencia) y el acoplamiento generaba errores concretos: el subagente `code-reviewer` referenciaba `.agents/rules/security.md` y `.agents/rules/architecture.md`, rutas que **no existen** en un ZIP de Claude Code, porque el generador convierte esas rules a `.claude/skills/<id>/SKILL.md`. El agente solo funcionaba si además se había bajado el ZIP de Antigravity.

**Decisión:** Los dos tools son productos independientes. Ningún item del manifest pertenece a los dos: lo que aplica a ambos (plantillas de `/docs`, skills externas, add-on de base de datos) se emite **una vez por tool**, con su propio `id` prefijado. Cada ZIP es autocontenido y no menciona ni asume al otro agente.

La **fuente en disco sigue siendo única** (`.agents/rules/` se sigue editando una sola vez y el generador emite los dos formatos). La separación es del catálogo y del producto, no del mantenimiento.

**Alternativas consideradas:** Separar también la fuente en dos árboles editables por separado — se descartó por el costo de mantenimiento permanente (cada cambio de regla habría que hacerlo dos veces) sin beneficio real, ya que el contenido de las reglas no necesita divergir entre tools.

**Consecuencias:**
- El home pasa de 3 modos a 2 y el nav pierde la entrada "Antigravity + Claude"; `/subagentes` se mueve dentro de "Claude solo", que es a quien pertenece.
- `BuildClient` filtra por `tool` a secas: desaparece el caso especial `|| i.category === "template"` que era el híbrido a nivel de datos.
- `GEMINI.md` deja de nombrar a Claude en la regla de auditoría externa (§ 8); la regla se vuelve agnóstica en vez de eliminarse.
- Al agregar contenido nuevo que aplique a los dos tools, hay que emitir un item por tool. Un item sin `tool` o compartido entre ambos es un bug.

## ADR-007 — El kit de subagentes cubre revisión de UI y tests

**Fecha:** 2026-07-31
**Estado:** Aceptada

**Contexto:** El kit tenía 6 subagentes. Contra los 8 stacks del hub quedaban dos huecos: **6 de los 8 stacks entregan interfaz** (Next.js ×2, React SPA, Vue, HTML plano, WordPress) y ningún agente la revisaba — aunque el `description` de `code-reviewer` prometía cubrir "UI/UX", su cuerpo no tenía ninguna sección de UI. Y ningún agente escribía tests, en un kit que incluye `fastapi-python` como stack backend.

**Decisión:** Se agregan `ui-reviewer` (accesibilidad, 5 estados de UI, responsive, SEO on-page, consistencia con el sistema de diseño) y `test-writer` (detecta el framework del proyecto en vez de asumirlo; nunca modifica el código bajo prueba). Se saca "UI/UX" del `description` de `code-reviewer`, que ahora deriva explícitamente a `ui-reviewer`.

**Alternativas consideradas:** Extender `code-reviewer` con una sección de UI en vez de crear un agente aparte — se descartó porque el review de interfaz necesita leer otras reglas (`ui-ux`, `seo`, `pwa`) y un contexto aislado rinde más que un solo agente con el doble de checklist.

**Consecuencias:** El kit pasa de 6 a 8 subagentes y todos vienen preseleccionados en los presets de Claude Code. `test-writer` es el único del kit que escribe archivos de código (solo tests) — el resto es de solo lectura o toca únicamente `/docs`.

## ADR-008 — Los `destPath` del manifest son la ruta final, sin prefijo de carpeta

**Fecha:** 2026-07-31
**Estado:** Aceptada

**Contexto:** `buildZip` agregaba un prefijo de carpeta calculado por categoría/tool encima del `destPath` del manifest, pero esos `destPath` ya eran rutas completas relativas a la raíz del proyecto. El resultado eran segmentos duplicados en todos los ZIPs generados: `docs/docs/01_PROJECT_PRD.md` y `.agents/.agents/rules/architecture.md`, que además no coincidían con los comandos `cp -r` del `INSTALL.md`.

**Decisión:** El `destPath` del manifest es la ruta final dentro del ZIP. `destFolder()` devuelve `""` salvo una excepción justificada: el global de Antigravity (`GEMINI.md` y los workflows) se aísla en `global/` porque se instala en `~/.gemini/`, no en la raíz del proyecto, y sin ese aislamiento un `cp -r ./*` a la raíz se lo llevaría por error.

**Consecuencias:** Al sumar una categoría nueva al manifest, el `destPath` debe escribirse ya como la ruta final en el proyecto destino. No hay que tocar `destFolder()`.

## ADR-009 — Identificadores en inglés, comentarios y documentación en español

**Fecha:** 2026-07-31
**Estado:** Aceptada

**Contexto:** El § 2 de `CORE.md` y `GEMINI.md` decía "Código siempre en inglés", pero la realidad del repo era 67 comentarios en español contra 15 en inglés — concentrados en `skill-catalog.ts` (15), `generate-manifest.mjs` (9), `external-skills.ts` (8), `presets.ts` (7) y `zip.ts` (7). Una regla que el propio proyecto incumple sistemáticamente, y que además se distribuye a todos los proyectos que bajan el kit, enseña a ignorar las reglas.

Se evaluó traducir todo a inglés en vez de cambiar la regla. Tres mediciones lo descartaron:

- **No es alcanzable.** De las 14 skills que se empaquetan, 4 son de terceros y están en inglés (`vercel-react-best-practices`, `api-security-best-practices`, `error-handling-patterns`, `brainstorming`). Traducirlas obliga a forkearlas y perder las actualizaciones upstream. Cualquier kit instalado va a ser mixto igual.
- **El argumento de compacidad no aplica.** Medido sobre los 58 pares de strings equivalentes de `messages/es.json` y `messages/en.json`, el español es apenas **3,8%** más largo. El texto técnico está lleno de identificadores y rutas que no se traducen.
- **El límite de 12.000 chars de Antigravity no aprieta.** La rule más grande (`ui-ux.md`) usa el 78% del presupuesto; traducirla ahorraría ~355 chars, 3 puntos porcentuales.

**Decisión:** La línea va entre **código y prosa**, no entre idiomas. Identificadores y nombres de archivo en inglés (variables, funciones, tipos, clases, rutas) — convención universal que ya se cumplía. Comentarios y documentación en español. Respuestas en el idioma del usuario. Las skills de terceros quedan en su idioma original.

Es coherente con ADR-005, que ya había decidido que el contenido empaquetado en los ZIPs queda en español aunque la interfaz del sitio esté en ES/EN.

**Alternativas consideradas:** Traducir los 67 comentarios a inglés — se descartó por lo de arriba: costo real, beneficio cosmético, y el resultado seguiría siendo mixto por las skills de terceros. Dejar la regla como estaba y "tratar de cumplirla" — se descartó porque llevaba meses sin cumplirse.

**Consecuencias:**
- 67 comentarios pasan de estar en infracción a estar bien, sin tocar una línea de código.
- La regla ahora es auditable de verdad: un identificador en español es un hallazgo objetivo; un comentario en español ya no.
- Si el hub se hiciera público para audiencia internacional, esta decisión hay que revisarla junto con ADR-005 — traducir el contenido empaquetado es un proyecto aparte, ya anotado en `06_TASKS.md`.

## ADR-010 — El repo consume su propio kit (dogfooding)

**Fecha:** 2026-08-10
**Estado:** Aceptada

**Contexto:** El hub distribuía `CLAUDE.md`, `.claude/commands/` y
`.claude/agents/` a los proyectos consumidores, pero él mismo no tenía ninguno
de los tres: no había `CLAUDE.md` en la raíz (con lo que `core/CORE.md` nunca
se cargaba en una sesión de Claude Code acá), los subagentes vivían en
`claude-agents/` donde Claude Code no los levanta, y los comandos no existían
localmente. Los tres bugs corregidos en el ciclo anterior (comandos ausentes
del ZIP, `code-reviewer` con rutas inexistentes, segmentos duplicados) eran
exactamente la clase de error que usar el propio kit habría detectado al
primer uso.

**Decisión:**

- `claude-agents/` se mueve a `.claude/agents/` — pasa a ser fuente del
  manifest **y** instalación local a la vez (un solo cambio de ruta en el
  generador).
- `.claude/commands/` se genera desde los workflows con
  `scripts/sync-claude-kit.mjs`, con la misma conversión de frontmatter
  que usa el generador del sitio. Es un derivado: no se edita a mano.
- `CLAUDE.md` en la raíz importa `core/CORE.md` vía `@core/CORE.md` (no se
  copia — evita una tercera copia que divergiría) y agrega las
  particularidades del repo: mapa fuente/derivado, regla de paridad
  CORE↔GEMINI y jerarquía de skills de diseño.

**Alternativas consideradas:** Copiar `CORE.md` como `CLAUDE.md` — descartado
por crear una tercera copia a sincronizar a mano. Dejar los agentes en
`claude-agents/` y copiarlos a `.claude/agents/` — descartado por el mismo
motivo (dos copias).

**Consecuencias:**

- Toda sesión de Claude Code en este repo carga las reglas del kit y tiene
  los 8 subagentes y los 6 comandos disponibles — los errores de rutas o
  formato se detectan usándolos.
- Tras editar un workflow hay que correr `sync-claude-kit.mjs` (anotado
  en `CLAUDE.md`).
- Los agentes referencian `.claude/skills/<regla>/SKILL.md`, que en este repo
  no existe (las rules viven en `.agents/rules/`) — degradan con aviso, y
  `CLAUDE.md` documenta la equivalencia.

## ADR-011 — El kit de Claude Code se empaquetará como plugin nativo, sin abandonar los ZIPs

**Fecha:** 2026-08-10
**Estado:** Aceptada en la dirección, pendiente de implementación (ver `06_TASKS.md`)

**Contexto:** Los kits se distribuyen como ZIP: el usuario descarga, descomprime y copia. El ZIP es una **copia congelada** — un proyecto instalado en marzo no recibe ninguna corrección posterior de las rules, y no hay forma de saber qué versión tiene instalada. Los tres bugs corregidos en julio (comandos ausentes, rutas rotas en `code-reviewer`, segmentos duplicados) siguen presentes en cualquier kit descargado antes de esos fixes.

Claude Code tiene un sistema de plugins nativo que agrupa comandos + agentes + skills + hooks en una unidad instalable y **actualizable desde git**. `mattpocock/skills` lo usa en producción: `.claude-plugin/plugin.json` declara un array de rutas explícitas de skills, lo que permite publicar un subconjunto curado sin exponer carpetas internas (deprecated, en progreso).

**Decisión:** Agregar el empaquetado como plugin nativo de Claude Code **además** de los ZIPs, no en reemplazo. El ZIP sigue siendo la ruta para quien quiere archivos editables y para Antigravity, que no tiene sistema de plugins equivalente.

La fuente en disco no cambia: el plugin se arma desde las mismas carpetas que hoy alimentan el manifest. El sitio pasa a ser escaparate y generador de ZIPs; el plugin es el canal de actualización continua.

**Alternativas consideradas:**

- **Reemplazar los ZIPs por el plugin** — descartado: dejaría a Antigravity sin canal (no tiene plugins declarables) y quita la opción de archivos editables, que es justamente lo que permite adaptar una rule por proyecto.
- **Symlinks para curar el subconjunto publicado** — descartado por lo documentado en el ADR-0002 de `mattpocock/skills`: los instaladores copian el árbol resolviendo symlinks y las skills quedan vacías.

**Consecuencias:**

- Hay que mantener un array explícito de rutas en el manifest del plugin: una skill nueva que no se agregue ahí no se publica. Es el mismo costo que ya tiene `presets.ts`.
- La versión del plugin y la del repo tienen que subir juntas en cada release — hoy el proyecto no versiona (los cambios se agrupan por fecha en el `CHANGELOG.md`), así que habrá que decidir un esquema de versión antes de publicar.
- Antigravity queda con un canal menos moderno. Es asimetría real, no descuido: la limitación es del tool, no del kit.

## ADR-012 — `CONTEXT.md` es un glosario vivo, sin número de fase

**Fecha:** 2026-08-10
**Estado:** Aceptada

**Contexto:** El kit define 8 documentos numerados (`01_PROJECT_PRD.md` … `08_CHANGELOG.md`) y ninguno cubre el **vocabulario del dominio**: qué significa exactamente cada término del negocio en este proyecto. `04_DATA_MODEL.md` describe entidades y campos técnicos, que es otra cosa — un término del dominio puede no tener tabla, y una tabla puede no ser un término del dominio. Sin ese glosario, el mismo concepto aparece con tres nombres distintos en tres capas, y el agente "se adapta" en silencio al término que use el usuario en cada mensaje.

**Decisión:** Se agrega `CONTEXT.md` a las plantillas de `/docs`, **sin numerar**, más la skill `domain-modeling` que lo mantiene vivo.

La falta de número es la decisión, no un olvido: los 01–08 son documentos de fase — se escriben en orden, en un momento del proyecto, y se actualizan al completar tareas. `CONTEXT.md` es un glosario que se toca continuamente, cada vez que aparece un término nuevo o ambiguo. Numerarlo `09_` lo haría parecer "el paso que va después del changelog", que es exactamente lo contrario de cómo se usa.

**Alternativas consideradas:**

- **`09_CONTEXT.md`** — descartado por lo anterior, y porque tocaba la convención "8 archivos" repetida en `CORE.md § 5`, `GEMINI.md § 5`, el README, la skill `project-planning` y la skill global `project-docs-scaffold`. Blast radius alto para empeorar la semántica.
- **Meterlo dentro de `04_DATA_MODEL.md`** — descartado: mezcla lenguaje de negocio con esquema técnico, que es justamente la confusión que el glosario viene a resolver.

**Consecuencias:**

- La convención pasa a ser "8 documentos de fase + 1 glosario". Al describir el kit hay que decirlo así, no "9 archivos".
- `CONTEXT.md` se crea recién cuando hay al menos 3 términos que lo justifiquen — un proyecto chico no lo necesita, y un glosario vacío es peor que ninguno.
- La skill `domain-modeling` queda preseleccionada en los 7 stacks reales (todos tienen vocabulario); `manual` no preselecciona nada por definición.

## ADR-013 — Antigravity también lleva subagentes declarables en archivo

**Fecha:** 2026-09-13
**Estado:** Aceptada

**Contexto:** El generador del kit asumía que los subagentes eran una función exclusiva de Claude Code: `generate-manifest.mjs` decía textualmente que `.claude/agents/*.md` "no tiene equivalente declarable en Antigravity (allá los subagentes se crean en runtime vía `invoke_subagent`, no hay archivo que empaquetar)". La documentación actual de Antigravity lo desmiente: los subagentes se declaran en `.agents/agents/<nombre>/agent.md` (workspace) o `~/.gemini/config/agents/` (global), con frontmatter YAML propio — `tools`, `model`, `subagent`, `mainAgent`, `commandExecutionPolicy`. El lado Antigravity del kit quedaba sin delegación mientras el lado Claude tenía 8 subagentes.

**Decisión:** Se agregan 4 subagentes de Antigravity como fuente del repo, en el mismo path que Antigravity usa para descubrirlos — así el repo los dogfoodea sin derivado que sincronizar:

- `auditor` y `security` — solo lectura, sin tools de escritura.
- `backend` y `frontend` — implementan, con `run_command` en `sandbox` para verificar su propio trabajo (tests, typecheck, build) antes de devolver.

`security` corre en tier `pro` (mismo criterio que `security-auditor` en opus del lado Claude); el resto usa `model: inherit`.

**Alternativas consideradas:**

- **Convertir los 8 subagentes de Claude al formato de Antigravity.** Descartado por ADR-006 (catálogos estancos) y porque el reparto no es equivalente: en Antigravity conviene que `backend` y `frontend` *implementen*, mientras que en Claude esos dos roles son pasadas de auto-revisión inline (`CORE.md § 8`), no agentes.
- **Dejar `auditor` y `security` sin `run_command`.** Descartado en la práctica: sin shell no pueden leer el diff (`git diff`) ni correr `npm audit`, que es justamente su insumo. "Solo lectura" se garantiza por la ausencia de tools de escritura, no por sacarles el shell — es el mismo diseño que el ejemplo `code-auditor` de la documentación de Antigravity.
- **Los 4 en tier `inherit`.** Descartado para `security`: una auditoría que se pierde un bypass de autorización cuesta más que la diferencia de tier.

**Consecuencias:**

- El manifest suma la categoría `agent` para el tool `antigravity` (items `antigravity:agent:*`); el sitio ya tenía la sección y no necesitó cambios.
- Los 4 vienen preseleccionados en los 8 presets de Antigravity, igual que los 8 de Claude Code en los suyos.
- Quedan sin cubrir del lado Antigravity los roles `debugger`, `docs-writer`, `explorer`, `planner` y `test-writer`. Es deliberado: se suman si el uso real los pide, no por simetría con el catálogo de Claude.
- La página `/subagentes` del sitio sigue filtrando solo `claude-code` — pendiente decidir si pasa a mostrar los dos catálogos.
