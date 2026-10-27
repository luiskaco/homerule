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
**Estado:** Sustituida por ADR-025

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
**Estado:** Implementada el 2026-09-13 (esquema de versión en ADR-014)

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

## ADR-014 — El plugin versiona por fecha (CalVer), no por semver

**Fecha:** 2026-09-13
**Estado:** Aceptada

**Contexto:** ADR-011 dejó el plugin nativo decidido pero bloqueado en un punto: el proyecto no versiona nada — el `CHANGELOG.md` agrupa por fecha y no hay tags. El campo `version` de `plugin.json` es opcional, pero sin él Claude Code no puede detectar que hay una actualización disponible, que es justamente lo que el plugin viene a resolver frente al ZIP congelado.

**Decisión:** `version` es CalVer `YYYY.M.D` — sin ceros a la izquierda, para que siga siendo parseable como semver (`2026.9.13` es válido; `2026.09.13` no lo es). Lo genera `scripts/build-plugin.mjs` con la fecha del día; `--version=` permite forzar otra.

El mismo script genera `.claude-plugin/marketplace.json`, así que el repo es a la vez marketplace y plugin: se instala con `/plugin marketplace add luiskaco/-makeRuleIA` y después `/plugin install ai-rules-hub@ai-rules-hub`.

**Alternativas consideradas:**

- **Semver `0.1.0` en adelante** — descartado: exige decidir en cada release si un cambio de rule es *major*, *minor* o *patch*, y en un kit de reglas esa distinción no tiene un significado claro. ¿Reescribir el checklist de `security.md` es breaking? No hay API que romper, y la pregunta no se contesta sola.
- **Dejar `version` afuera** (el doc dice que cae al tag de git o al marketplace) — descartado: obligaría a mantener tags que hoy no existen, y sin versión declarada el usuario no ve que hay algo nuevo.

**Consecuencias:**

- Dos releases el mismo día colisionan en la misma versión. Es aceptable: el kit no se publica varias veces por día, y si pasa se fuerza con `--version=`.
- La versión no comunica magnitud del cambio. El `CHANGELOG.md` ya cumple esa función y con más detalle del que daría un número.
- El plugin publica **solo contenido propio**: las 9 rules como skills nativas, los 7 comandos, los 8 subagentes y las 2 skills escritas acá (`domain-modeling`, `project-planning`). Las skills de terceros vendorizadas quedan afuera a propósito — se instalan desde su repo original con su propio comando, y redistribuirlas en el plugin sería apropiarse de trabajo ajeno. `scripts/build-plugin.mjs` las detecta por `skills-lock.json` y por el `install:` del frontmatter, y falla si alguna se cuela en la lista de propias.
- El array de rutas es explícito, como advertía ADR-011. El guard `--check` cubre el costo: falla si el manifest quedó atrás respecto de la fuente, o si una rule todavía no fue convertida a skill nativa.
- El plugin **no** puede instalar `CLAUDE.md` en el proyecto del usuario: los plugins aportan comandos, agentes y skills, no memoria de proyecto. Quien quiera el núcleo global sigue necesitando el ZIP. Es una razón más para no reemplazar un canal por el otro.

## ADR-015 — `AGENTS.md` en la raíz para lo propio del repo, importado desde `CLAUDE.md`

**Fecha:** 2026-10-12
**Estado:** Aceptada

**Contexto:** Las particularidades del repo (fuente vs. derivados, paridad CORE/GEMINI, `/docs`) vivían solo en `CLAUDE.md`, que Antigravity no lee. `AGENTS.md` es el estándar abierto de instrucciones por repo (Agentic AI Foundation, Linux Foundation) y lo leen Antigravity, Codex, Cursor, Copilot y Gemini CLI. Claude Code también lo lee de forma nativa, pero **solo si no hay `CLAUDE.md`**; con uno presente hay que importarlo con `@AGENTS.md`.

**Decisión:** `AGENTS.md` en la raíz con lo que es del repo y vale para cualquier tool (estructura, fuente/derivados, paridad, comandos, convenciones, `/docs`). `CLAUDE.md` importa `@core/CORE.md` y `@AGENTS.md`, y conserva solo lo exclusivo de Claude Code (jerarquía de skills de diseño). Las reglas globales **no** se copian a `AGENTS.md`: siguen en `core/CORE.md` y `.gemini/GEMINI.md`.

**Alternativas consideradas:**

- **Copiar también CORE § 0–§ 8 en `AGENTS.md`** — descartado: sería una tercera copia del núcleo en paridad manual, y Claude y Antigravity cargarían las reglas globales dos veces.
- **Sumar una plantilla `AGENTS.md` a los kits generados** — fuera de alcance por ahora: implica tocar el generador, los presets y el sitio. Puede reabrirse en un ADR propio.
- **Symlink `CLAUDE.md` → `AGENTS.md`** — descartado: en Windows requiere permisos de administrador o Developer Mode, y git lo saca como archivo de texto plano si `core.symlinks` está apagado.

**Consecuencias:**

- `AGENTS.md` es solo del repo: el generador no lo empaqueta (lee únicamente las carpetas de fuente), así que no llega a los ZIPs ni al plugin.
- Un cambio de convención del repo se edita en `AGENTS.md`, no en `CLAUDE.md`.

## ADR-016 — Los kits traen `AGENTS.md`: el proyecto puede continuarlo cualquier IA

**Fecha:** 2026-10-12
**Estado:** Aceptada — extiende ADR-015 (que lo dejaba fuera de alcance)

**Contexto:** Un proyecto armado con el kit puede terminar en manos de otra IA (Codex, Cursor, Copilot…). Con el kit de Antigravity eso dejaba al proyecto sin reglas globales: `GEMINI.md` se instala en `~/.gemini/`, fuera del repo. Con el de Claude Code, las reglas estaban en `CLAUDE.md`, que otras herramientas no leen. `AGENTS.md` es el estándar abierto que leen casi todas, y Codex además escanea `.agents/skills/` — la misma carpeta que ya usa el kit de Antigravity.

**Decisión:** Los dos kits emiten un `AGENTS.md` para la raíz del proyecto con tres partes:

1. **Reglas globales neutrales**, derivadas de `core/CORE.md` en el build: cambia el título, § 7 explica qué hacer si la herramienta no expone los comandos y la nota de subagentes de § 8 (que es de Claude) sale. En el kit de Antigravity, `00_PROJECT_START` pasa a `00_GEMINI_START`.
2. **Mapa del proyecto** (`core/agents-map.md`, con variables por tool): dónde están rules, skills, subagentes y workflows, y el flujo de `/docs` para retomar el trabajo (leer `06_TASKS` y `07_DECISIONS` antes de empezar).
3. **Sección "Proyecto"** a completar por el usuario: stack real, comandos y estructura.

En el kit de Claude Code, `CLAUDE.md` pasa a ser `@AGENTS.md` + lo exclusivo de Claude (comandos nativos, rules como skills, la nota de subagentes). Los dos archivos van en el mismo item para que el import nunca quede apuntando a un archivo que no se descargó. En Antigravity es un item aparte (`antigravity:agents-md`), preseleccionado en los 8 presets, que va a la raíz del proyecto y no a `global/`.

**Alternativas consideradas:**

- **Solo mapa + sección de proyecto, sin reglas** — descartado: otra IA no recibiría la Regla de Oro ni las convenciones, que es justamente lo que da continuidad.
- **`CLAUDE.md` completo + `AGENTS.md` aparte** — descartado: dos archivos con reglas casi idénticas en el mismo proyecto que el usuario tendría que mantener a mano.
- **Una tercera fuente escrita a mano para el núcleo neutral** — descartado: sumaría otra paridad manual a la de CORE/GEMINI. Se deriva por código, con reemplazos que fallan si el ancla en `CORE.md` desaparece.

**Consecuencias:**

- En Antigravity las reglas globales entran dos veces al contexto (`GEMINI.md` global + `AGENTS.md`, unos 2k tokens), con el mismo contenido. Se acepta: es el costo de que el repo sea autosuficiente.
- Los workflows de Antigravity siguen viviendo en `~/.gemini/`, fuera del repo: otra IA no los tiene, y el mapa lo dice. La tabla de § 7 resume cuándo usar cada uno.
- Editar § 7 o la nota de § 8 de `CORE.md` puede romper el build a propósito: hay que ajustar `buildAgentsMd()` en `generate-manifest.mjs`.
- De paso, el generador quita el bloque `codebase-memory-mcp` que el MCP inyecta en los núcleos de este repo: viajaba dentro del `GEMINI.md` y el `CLAUDE.md` de los kits.
- El plugin no cambia: no puede instalar memoria de proyecto (ADR-014).

## ADR-017 — SDD con trazabilidad, traspaso, testing y runbook

**Fecha:** 2026-10-12
**Estado:** Aceptada

**Contexto:** ADR-016 hizo que cualquier IA pueda continuar un proyecto, pero las plantillas de `/docs` no le daban con qué hacerlo bien. Los requisitos eran una lista suelta sin criterio de "hecho", las tareas no apuntaban a nada, ningún documento decía cómo correr los tests ni cómo desplegar, y no había un lugar donde quedara "dónde quedé y qué sigue".

**Decisión:**

- **`01_PROJECT_PRD`**: requisitos con ID (`RF-xx` / `RNF-xx`) que no se reutilizan, prioridad M/S/C y criterios de aceptación en formato EARS ("CUANDO…, EL SISTEMA DEBE…"). Cada criterio es un test en potencia.
- **`06_TASKS`**: sección **Estado de traspaso** al principio (dónde quedó, próximo paso, bloqueos, qué no tocar), que se reescribe en cada cierre. Tareas con ID (`T-xx`), requisito que cubren, ADR que las afecta y criterio "hecho cuando".
- **Plantillas nuevas**: `09_TESTING.md` (cómo correr los tests, estrategia por nivel, tabla de trazabilidad `RF-xx` → test, datos de prueba, CI) y `10_RUNBOOK.md` (entornos, deploy, rollback, monitoreo, incidentes, backups, accesos, sin secretos).
- La convención pasa de 01–08 a 01–10 en `CORE.md` y `GEMINI.md` § 5 (con paridad), y la siguen `/new-feature`, `/session-close`, `/deploy-checklist`, `docs-writer`, `project-planning` y el mapa del `AGENTS.md`.

**Alternativas consideradas:**

- **Testing y runbook como secciones de `03_SYSTEM_SPEC` y `05_ARCHITECTURE`** — descartado: son los documentos que más se consultan durante el trabajo diario y quedaban enterrados. Con número propio, el mapa del `AGENTS.md` puede apuntar directo a ellos.
- **Adoptar los archivos de Spec Kit o Kiro** (`spec.md`, `plan.md`, `tasks.md`) — descartado: cambiaría la convención que ya usan los proyectos existentes. Se toma lo que aportan (EARS, trazabilidad) sin cambiar nombres.
- **Historial de sesiones en el traspaso** — descartado: crecería sin fin y ya existe `08_CHANGELOG.md`. El traspaso es una foto del estado actual y se reescribe.

**Consecuencias:**

- `10_RUNBOOK.md` no se escribe en la planificación (`project-planning` lo excluye): se completa a más tardar en el primer deploy.
- Los proyectos que ya usan el kit siguen funcionando sin `09`/`10`; los workflows piden actualizarlos solo cuando existen o aplican.
- Este repo no adopta `09`/`10` en su propio `docs/`: no tiene tests automatizados ni un deploy más allá de Vercel. Si los gana, aplica la convención.

## ADR-018 — Se elimina `00_GEMINI_START`: los desvíos del proyecto van en `AGENTS.md`

**Fecha:** 2026-10-12
**Estado:** Aceptada

**Contexto:** `00_GEMINI_START.md` era la plantilla con la que un proyecto Antigravity declaraba lo que se desviaba de la convención global: stack real, otra estructura de `/docs` o reglas que no aplican. `CORE.md` tenía el equivalente `00_PROJECT_START`, que ningún kit traía. Desde ADR-016 los dos kits dejan un `AGENTS.md` con una sección **Proyecto** que cubre lo mismo y que lee cualquier IA, no solo Gemini.

**Decisión:** Se borra la plantilla y la excepción de § 5 en los dos núcleos. Ahora § 5 dice que el desvío (de la tabla de docs, del stack de § 3 o de una regla) se documenta en la sección **Proyecto** de `AGENTS.md`, que tiene prioridad. Esa sección suma los campos "Documentación" y "Excepciones a las reglas". Las plantillas pasan a ser las mismas para los dos tools: desaparece el caso "solo Antigravity" del generador y del sitio.

**Alternativas consideradas:**

- **Mantener compatibilidad con un `00_GEMINI_START.md` heredado** — descartado: mantendría vivo en el núcleo Always On un concepto que ya no se distribuye. Los proyectos existentes migran a mano (nota en el README).
- **Mantener `00_PROJECT_START` en `CORE.md`** — descartado: ningún kit lo traía, así que era una regla sin archivo.

**Consecuencias:**

- § 5 queda idéntico en `CORE.md` y `GEMINI.md`, y el guard de paridad ya no normaliza esa sección.
- Un proyecto con un `00_GEMINI_START.md` viejo deja de aplicarlo: `GEMINI.md` ya no lo menciona. El README explica la migración.
- `/plantillas` pasa de 12 a 11 archivos, todos para los dos tools.

## ADR-019 — Cierre de tarea digerible: resultado primero y revisión en una línea

**Fecha:** 2026-10-12
**Estado:** Aceptada

**Contexto:** El reporte de § 8 (🎨 Frontend / ⚙️ Backend / 🔍 Inspector) se pedía en un bloque de código con "[1 línea]" por pasada. En la práctica, tanto Gemini como Claude lo convertían en párrafos con colores hex y rutas, lo ponían antes del resultado, lo forzaban en tareas donde no aplicaba (⚙️ Backend en un video) y después repetían todo en un resumen de 40 líneas. Lo primero que leía el usuario era la revisión interna, no qué había quedado hecho.

**Decisión:**

- **§ 0 suma "Formato de cierre"**: primera línea con el resultado, hasta 3 viñetas sobre el impacto (sin archivos, rutas ni valores), la revisión en una línea y una sola pregunta al final si hace falta. Largo proporcional al cambio, sin narrar el proceso, tablas solo para comparar opciones.
- **§ 8 pasa a una línea en texto normal** (nunca en bloque de código), omitiendo las pasadas que no aplican y explicando solo la que encontró o corrigió algo.
- **Tres pasadas nuevas**: 🧪 Verificado (qué se ejecutó de verdad: el ✅ ya no puede significar "debería andar"), 📝 Docs (`06_TASKS` con el traspaso, `08_CHANGELOG`, ADR) y ⚠️ Riesgo (solo si hubo algo irreversible).

**Alternativas consideradas:**

- **Mantener el bloque de 3 líneas y solo pedir brevedad** — descartado: "[1 línea]" ya pedía brevedad y no se respetaba. El problema era el formato (bloque, orden, obligatoriedad), no la falta de una instrucción.
- **Sumar también seguridad, accesibilidad y performance como pasadas propias** — descartado: ya las cubren 🔍 (que audita contra `security` y `ui-ux`) y 🎨. Cada pasada más alarga justo lo que se quiere acortar.
- **Output style de Claude Code** — descartado como mecanismo principal: no existe en Antigravity ni en otras herramientas. La regla en el núcleo llega a los dos kits y al `AGENTS.md` neutral.

**Consecuencias:**

- Cada núcleo suma unos 300 tokens Always On.
- § 0 queda idéntico en `CORE.md` y `GEMINI.md`; § 8 conserva sus diferencias por tool (línea del Inspector y nota de subagentes).
- Las copias globales del usuario (`~/.claude/CLAUDE.md`, `~/.gemini/GEMINI.md`) no se actualizan solas: hay que reinstalarlas desde el kit.

## ADR-020 — Los workflows de Antigravity pasan a skills

**Fecha:** 2026-10-18
**Estado:** Aceptada

**Contexto:** La doc oficial de Antigravity anuncia que los workflows legacy (`.agents/workflows/` y `~/.gemini/.../workflows`) "dejan de funcionar el 19 de octubre de 2026": sus directorios ya no se indexan ni se ejecutan por slash command. El reemplazo son las skills (estándar abierto `SKILL.md`), que también se invocan con `/<nombre>`. El kit emitía los 7 workflows (`/grill`, `/new-feature`, …) a `~/.gemini/antigravity/global_workflows/`, y esa misma carpeta era la fuente de `.claude/commands/`.

**Decisión:**

- **La fuente pasa a `.agents/skills/<nombre>/SKILL.md`** con `name` + `description` y un marcador `metadata: kind: workflow`. El estándar de skills rechaza claves top-level desconocidas, por eso va dentro de `metadata`.
- **Claude Code sigue recibiendo `.claude/commands/<nombre>.md`**, derivado de la misma fuente con frontmatter solo de `description` (igual que hoy). Las skills marcadas se saltean en los loops de skills normales de ambos tools para no duplicarlas.
- **Antigravity las recibe como skills de workspace** (`.agents/skills/…`, categoría `command` en el manifest): viajan con el proyecto en vez de instalarse en `~/.gemini/`. El paso global del `INSTALL.md` queda solo con `GEMINI.md`.
- **Se borra `.gemini/antigravity/global_workflows/`.**

**Alternativas consideradas:**

- **Dejar los workflows como fuente y emitir skills al empaquetar** — descartado: mantiene como origen un formato que Antigravity retira, y el repo dejaría de funcionar con Antigravity abierto en él (dogfooding).
- **Una carpeta de fuente aparte (`.agents/commands/`)** — descartado: Antigravity no la descubre, así que la fuente dejaría de ser también la instalación local.
- **Ruta global (`~/.gemini/config/skills/`)** — descartado como default: los comandos del kit asumen el repo (`docs/`, `06_TASKS.md`), no tienen sentido fuera de un proyecto.

**Consecuencias:**

- Las skills se activan solas por su `description`; los workflows eran solo manuales. Las 7 descripciones ya dicen "cuándo usar", así que se dejan, pero puede haber activaciones espontáneas. Antigravity no documenta un campo manual-only.
- Cambian los ids del manifest (`global:<archivo>.md` → `antigravity:workflow:<id>`): hay que actualizar los presets.
- Quien ya instaló los workflows en `~/.gemini/antigravity/global_workflows/` los pierde el 19/10: reinstalar desde el ZIP nuevo.
- El límite de 12.000 caracteres ahora aplica solo a workflows legacy; las rules tienen 24.000 bytes por archivo y 20.000 tokens agregados Always On.

## ADR-021 — Subagents de Claude Code: solo lectura impuesto por hook y `security-auditor` ampliado

**Fecha:** 2026-10-23
**Estado:** Aceptada

**Contexto:** Cinco subagents de Claude Code (`code-reviewer`, `explorer`, `planner`, `security-auditor`, `ui-reviewer`) se declaran de solo lectura, pero tienen `Bash` para poder correr `git diff`, y nada les impedía escribir, borrar o hacer push. Los de Antigravity lo imponen desde la plataforma con `commandExecutionPolicy: sandbox`. Además, `code-reviewer` no revisaba datos ni `security-auditor` leía las skills de seguridad, mientras que sus pares de Antigravity sí.

**Decisión:**

- **Hook `PreToolUse` en el frontmatter de los 5 revisores**, que corre `.claude/hooks/readonly-bash.mjs`. Deja pasar solo una allowlist de comandos de lectura (`git status/diff/log/show/blame…`, `ls`, `cat`, `grep`, `npm audit` sin `fix`, etc.); bloquea redirecciones de escritura, sustitución de comandos y cualquier otro comando, con exit 2 y el motivo en stderr. El script viaja en el ZIP junto a cada agente que lo usa.
- **`debugger` queda sin hook**: necesita correr tests para reproducir el bug. No tiene `Edit` ni `Write`.
- **`effort: high`** solo en los agentes en opus (`planner`, `security-auditor`): los niveles disponibles dependen del modelo y haiku no se arriesga. `maxTurns` en `explorer` para cortar búsquedas sin fin; `color` en todos.
- **Alcance: solo Claude Code.** Los 4 subagents de Antigravity no cambian en esta tanda.

**Alternativas consideradas:**

- **Quitar `Bash`** — descartado: los revisores necesitan `git diff` y `npm audit`.
- **`disallowedTools: Bash(...)`** — descartado: según la doc, una entrada con especificador quita la tool entera.
- **Solo reforzar la instrucción en el prompt** — descartado: el modelo puede saltársela, que es justamente el problema.

**Consecuencias:**

- Los hooks de frontmatter **se ignoran en subagents de plugin**: quien instala el kit como plugin no tiene el bloqueo, solo la instrucción. Protege en este repo y en las instalaciones por ZIP.
- El hook necesita Node en la máquina. **Actualizado 2026-10-24:** el comando del frontmatter termina en `|| exit 2`, así que si el hook no arranca (sin Node, `$CLAUDE_PROJECT_DIR` vacío, archivo faltante) bloquea en vez de dejar pasar. Antes fallaba abierto: un código distinto de 2 es error no bloqueante para Claude Code. La contra es que en un proyecto sin Node los revisores se quedan sin `Bash`.
- Los hooks de frontmatter de un agente de proyecto solo corren si la carpeta tiene aceptada la confianza del workspace; si no, Claude Code los saltea sin avisar. La prueba en vivo del 2026-10-24 falló por eso: la carpeta estaba confiada con otra grafía de ruta (`D:` vs. `d:`).
- La allowlist da falsos positivos: si un revisor necesita un comando de lectura que no está, se bloquea y hay que sumarlo al script.
- **Actualizado 2026-10-26:** `db-migration-reviewer` y `deploy-checker` (tanda 2) llevan el mismo hook; son 7 los agentes con `readonly-bash`. `deploy-checker` queda de solo lectura a propósito: build y tests escriben artefactos y ejecutan código del proyecto, así que los lista para el agente principal en vez de correrlos.

## ADR-022 — Subagent `web-researcher`: investigación web aislada y con salida revisada

**Fecha:** 2026-10-24
**Estado:** Aceptada

**Contexto:** Cuando el agente principal investiga en internet, se expone a dos riesgos. El primero es la **filtración**: la consulta o la URL puede llevar datos del usuario o del proyecto (emails, keys, rutas, clientes). El segundo es la **prompt injection**: una página puede traer instrucciones que el modelo obedece, como visitar una URL que exfiltra datos en la query o ejecutar un comando. El agente principal tiene el contexto completo y todas las tools, así que una inyección exitosa ahí es lo peor que puede pasar.

**Decisión:**

- **Subagent `web-researcher` en los dos tools**, con el mismo cuerpo adaptado a cada uno. Lo delega el agente principal, que le pasa la pregunta ya formulada en términos genéricos.
- **Solo tools web**: `WebSearch` y `WebFetch` en Claude Code, `search_web` y `read_url_content` en Antigravity. Sin `Read`: si no ve datos del proyecto, no los puede filtrar. Sin `Bash` ni escritura: una inyección no encuentra nada que ejecutar.
- **Hook `PreToolUse` en Claude Code** (`.claude/hooks/web-guard.mjs`, matcher `WebSearch|WebFetch`). Bloquea con exit 2:
  - en la consulta, el path o la query de la URL: secretos (formatos de key conocidos, JWT, claves privadas, `CLAVE=valor`, credenciales en URL), emails, rutas locales con usuario, números de tarjeta (Luhn) y términos de `.claude/web-guard-terms.txt`;
  - en la URL: valores opacos de 80+ caracteres en la query, `usuario:clave@`, esquemas que no son http(s) y hosts privados (`localhost`, `.local`/`.internal`/`.lan`, hosts sin punto, IPs privadas o reservadas, IPv6 local y mapeada) — también si el dominio **resuelve** a una IP privada (`127.0.0.1.nip.io`).
- **Prompt:** lo que trae la web es dato, no instrucción. Las inyecciones se reportan y no se obedecen. Contraste con 2+ fuentes independientes, prioridad a fuentes primarias, nada se descarga ni se ejecuta y la salida tiene formato fijo con una sección de **Alertas**.
- **Modelo `sonnet`** en Claude Code: haiku resiste peor la inyección y el trabajo no justifica opus. `maxTurns: 25`.

**Alternativas consideradas:**

- **Allowlist de dominios**: descartada. Es lo más seguro, pero corta la investigación a una lista que hay que mantener, y la mayoría de las respuestas útiles (issues, foros, blogs técnicos) quedan afuera.
- **Solo prompt, sin hook**: descartada por el mismo motivo que en ADR-021. Una inyección exitosa es justamente el caso en el que el modelo ignora su prompt.
- **Darle `Read` para contrastar con el código**: descartada. Suma superficie de filtración; el agente principal ya tiene el contexto y puede hacer esa comparación.

**Consecuencias:**

- **Antigravity no tiene hooks:** ahí el chequeo de cada consulta y cada URL queda en el prompt, como paso obligatorio antes de cada llamada. Es más débil que en Claude Code.
- **Plugin de Claude Code:** como en ADR-021, los hooks de subagents de plugin se ignoran, así que quien lo instala como plugin tiene solo la protección del prompt.
- El hook necesita Node. Con el `|| exit 2` del comando falla cerrado: sin Node, `web-researcher` se queda sin web en vez de quedar sin protección. Igual que en ADR-021, solo corre si la carpeta tiene aceptada la confianza del workspace.
- Hay falsos positivos asumidos: una búsqueda con un email público o un `API_KEY=tu-clave` de ejemplo se bloquea, y el agente tiene que reformularla.
- La revisión de DNS es un chequeo previo: un DNS rebinding con TTL corto puede resolver distinto en el fetch real. Si el DNS falla, el hook deja pasar la llamada, porque el fetch también va a fallar.
- Los nombres `search_web`/`read_url_content` de Antigravity salen del prompt de sistema publicado, no de la doc oficial, que pide verificarlos. Si el agente aparece sin tools en el panel `/agents`, revisar esos nombres.

## ADR-023 — Stack del sitio: Next.js 16, React 19 y Tailwind 4

**Fecha:** 2026-10-24
**Estado:** Aceptada

**Contexto:** El sitio estaba en Next.js 14.2, React 18 y Tailwind 3.4, dos versiones mayores atrás. El rediseño de la navegación por kit se iba a escribir sobre esa base, así que convenía migrar primero para no escribirlo dos veces (Tailwind 4 cambia la configuración y algunas clases).

**Decisión:**

- **Next.js 16.4, React 19.3, next-intl 4.14, Tailwind 4.3, TypeScript 7.0**, más los menores (jszip, postcss, `@types/node` 24, en línea con el Node 24 del entorno).
- Migración con los codemods oficiales (`@next/codemod upgrade`, `@tailwindcss/upgrade`), revisando su diff:
  - `params`/`searchParams` asíncronos en todas las páginas.
  - `middleware.ts` → `proxy.ts`, con el mismo contenido (next-intl lo documenta así para Next 16).
  - `tailwind.config.ts` pasa a `@theme` en `globals.css`; `autoprefixer` sale porque Tailwind 4 ya prefija.
- **Se quitaron los `export const instant = false`** que agregó el codemod en 12 archivos: solo tienen efecto con `cacheComponents`, que no se activa en esta migración.
- **Se quitó el script `lint`:** `next lint` no existe en Next 16 y el proyecto nunca tuvo ESLint configurado.
- Verificación:
  - build limpio, sin warnings;
  - capturas de las 11 páginas a 1280 px y 375 px, comparadas píxel a píxel con el stack anterior;
  - descarga del ZIP en los dos tools;
  - `next dev` con Turbopack.

**Alternativas consideradas:**

- **Quedarse en Next 14 / Tailwind 3**: descartado. El rediseño iba a nacer sobre una base que igual había que migrar.
- **TypeScript 6 en vez de 7**: la doc de Next 16 soporta TS 7 vía el CLI `tsc`, y el build pasó. Si diera problemas, bajar a 6 es un cambio de una línea.
- **Activar `cacheComponents`**: fuera de alcance. Cambia el modelo de renderizado y no aporta a un sitio casi estático.

**Consecuencias:**

- `/build` pasa a renderizarse por pedido (`ƒ`), porque lee `searchParams`; antes figuraba como estática. El resto sigue SSG: 20 páginas.
- En Tailwind 4, `leading-*` le gana a la altura de línea de `text-*` aunque esta venga en un breakpoint. Los párrafos con `leading-relaxed sm:text-lg` quedan alrededor de 1 px más altos por línea en escritorio. Es el comportamiento documentado de v4 y se aceptó.
- Al pasar por la validación de next-intl apareció un error previo: 7 claves `global:<workflow>.md` muertas (restos de ADR-020) y la de `global:GEMINI.md`, con un punto que next-intl no admite. Se borraron las muertas y la descripción de `GEMINI.md` pasó a `global:GEMINI_md` (`itemDescriptionKey` cambia `.` por `_`).

## ADR-024 — Navegación por kit: un menú "Kits" con selector de tool

**Fecha:** 2026-10-24
**Estado:** Aceptada

**Contexto:** El nav tenía dos desplegables casi iguales, "Antigravity solo" y "Claude solo", con las mismas opciones apuntando a páginas distintas o a la misma. "Presets por stack" eran dos páginas con diseños diferentes; la de Claude ni siquiera mostraba los stacks. "Rules y skills por stack" existía solo para Antigravity, y `/subagentes` mezclaba los dos tools. ADR-002 ya había dejado "Presets por stack" repetido en dos grupos.

**Decisión:**

- **Un link "Kits" en el nav**, sin desplegable. Lleva al tool de la página actual o, si no hay, al último elegido (`localStorage`, leído en un efecto para no romper la hidratación). La primera vez lleva a Antigravity.
- **Cabecera común (`KitHeader`)** en las cuatro secciones del kit:
  - selector `[Antigravity | Claude Code]`, que conserva la sección (y el preset en `/build`);
  - pestañas Presets por stack · Rules y skills · Subagentes · Armar a medida.
  - Todo son links: se rastrean y funcionan sin JS.
- **Rutas estáticas por segmento:** `/kits/[tool]`, `/kits/[tool]/stacks`, `/kits/[tool]/subagentes`, con `generateStaticParams` y `dynamicParams = false`. `/build?tool=` queda igual, porque ya era interactivo.
- **Contenido estanco por tool (ADR-006 no cambia):** Claude Code gana presets y rules/skills por stack. Sus rules viajan como skills (`claude-code:rule:<id>`, `category: "skill"`), así que se clasifican por id y no por categoría. La pestaña Subagentes muestra solo los del tool elegido.
- **Un color fijo por tool:** esmeralda Antigravity, violeta Claude (`TOOL_THEME` en `site/src/lib/kit.ts`). Las clases van literales para que Tailwind las detecte.
- **Rutas viejas:** `/antigravity`, `/agents`, `/stacks`, `/subagentes` y `/kits` redirigen con 308 desde `next.config.mjs`, y sus páginas se borraron.
- **De paso, hreflang por página:** el layout raíz declaraba `alternates` hacia `/{locale}` en todas las páginas, así que cada una decía que su alternativa era la home. Ahora cada página lo declara con `localeAlternates()` (`site/src/lib/seo.ts`), con canonical y `x-default`.
- Diseño con la skill `hallmark` (genre modern-minimal, conservando el tema oscuro y el acento del sitio). Plan de `planner` y revisión de `ui-reviewer` y `code-reviewer`.

**Alternativas consideradas:**

- **`?tool=` en la URL**: descartada. Vuelve dinámicas las páginas, no indexa cada tool por separado y el tool se perdía al cambiar de idioma.
- **Mantener las dos páginas de presets y que el selector salte entre ellas**: descartada. El cambio de diseño se notaba al cambiar de tool.
- **"Kits" como desplegable con las 4 secciones**: descartada. Duplica las pestañas de la cabecera.

**Consecuencias:**

- Las URLs del kit cambian; los links viejos siguen funcionando por la redirección.
- La versión sin idioma (`/antigravity`) hace dos saltos: proxy de next-intl → `/es/antigravity` → destino.
- Deja sin efecto la consecuencia de ADR-002 ("Presets por stack" repetido en dos grupos del nav).

## ADR-025 — El historial de cambios vive solo en el repo

**Fecha:** 2026-10-24
**Estado:** Aceptada — sustituye a ADR-004

**Contexto:** ADR-004 llevaba el historial en dos lugares: `CHANGELOG.md` en la raíz y la página `/changelog` del sitio, con su texto copiado a mano en `messages/es.json` y `en.json` (`ChangelogData`). Cada cambio se escribía tres veces (CHANGELOG, ES, EN), y ADR-004 ya anotaba el riesgo de que divergieran. El sitio pasó a ser un panel para bajar el kit: el historial no es algo que su visitante busque.

**Decisión:**

- `CHANGELOG.md` de la raíz es la única fuente del historial.
- Se borran la página `/changelog`, su ítem del menú, la tarjeta de la home y los namespaces `Changelog` y `ChangelogData` de `messages/*.json`.
- El sitio no enlaza al historial: el repo es privado y el historial es para el autor. `/{locale}/changelog` da 404.

**Alternativas consideradas:**

- **Que la página parsee `CHANGELOG.md` en build** (la que dejaba abierta ADR-004): descartada. Mantiene una página que nadie pidió y suma un parser de markdown; además el CHANGELOG está en español y la página en inglés quedaría sin traducir.
- **Link en el footer y redirección de `/changelog` a `CHANGELOG.md` en GitHub**: se implementó primero y se descartó. El repo es privado, así que cualquier visitante sin sesión veía un 404 de GitHub.
- **Hacer público el repo**: descartada por el autor.

**Consecuencias:**

- Un cambio se registra una sola vez, en `CHANGELOG.md`.
- El historial queda solo en español y solo visible para quien tenga acceso al repo.
- Los links viejos a `/changelog` dan 404. El sitio no tiene tráfico externo que dependa de esa página.

## ADR-026 — Subagents de servidores: `server-inspector` y `server-operator` por alias SSH

**Fecha:** 2026-10-26
**Estado:** Aceptada para Claude Code (2026-10-26), con las 5 pruebas en vivo en verde. La parte de Antigravity sigue en Propuesta: sus pruebas no se pudieron medir (ver el final)

**Contexto:** Ningún agente del kit trabaja contra servidores. Se pidieron dos: uno que diagnostique (logs, estado de servicios, disco) sin poder romper nada y otro que aplique cambios con la aprobación de cada uno. `ssh` rompe el modelo de ADR-021 por tres motivos:

- `readonly-bash` ve un solo comando local, `ssh`; lo que corre en el servidor viaja en un string que nadie revisa.
- `ssh` tiene opciones que ejecutan comandos locales (`-o ProxyCommand`, `LocalCommand`), abren túneles (`-L/-R/-D`), saltan a otros hosts (`-J`) o reenvían las claves (`-A`). Y un `ssh` a un host arbitrario es un canal de exfiltración.
- Lo que devuelve el servidor también lo escribe un tercero: un log de nginx trae los user agents y paths que manda cualquiera. Es superficie de prompt injection, como la web en ADR-022.

Lo que dice la doc oficial (revisada el 2026-10-26):

- **Claude Code, subagents:** en segundo plano, cada pedido de permiso del subagent aparece en la sesión principal con el nombre del agente; en primer plano pasan directo. Si la sesión principal está en `bypassPermissions`, `acceptEdits` o auto, el subagent hereda ese modo e ignora su `permissionMode`. Los subagents de plugin ignoran `hooks` y `permissionMode`.
- **Claude Code, hooks:** `PreToolUse` puede devolver `permissionDecision` `allow`, `deny`, `ask` o `defer`; entre varios hooks gana `deny` > `defer` > `ask` > `allow`. `"ask"` fuerza el prompt en modo auto: el clasificador puede negar, pero no aprobar en silencio. Un exit 2 equivale a `"deny"`. El input trae `permission_mode` (`default`, `plan`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`). No está documentado qué hace `"ask"` en `bypassPermissions`/`dontAsk` ni frente a una regla allow, ni si el exit 2 bloquea en `bypassPermissions`.
- **Antigravity, subagents:** `commandExecutionPolicy` acepta `off`, `auto`, `eager` y `sandbox` (default), sin definir cada uno. Los pedidos de aprobación suben a la UI principal. El subagent hereda los prefijos de comandos permitidos del padre: con `ssh` en la allow list, correría sin preguntar. Fuentes no oficiales: `off` no ejecuta nada solo salvo la allow list; en `sandbox`, los comandos con red piden aprobación.

**Decisión:**

*Común a los dos tools*

- **Dos agentes, no uno con modos.** `server-inspector` es de solo lectura y es el que el agente principal usa por defecto. `server-operator` aplica cambios y se invoca cuando ya se sabe qué cambiar: el inspector diagnostica, el operator aplica el cambio puntual.
- **Solo alias de `~/.ssh/config`.** El host tiene que ser un `Host` declarado sin comodines (`*`, `?`, `!`); se sigue `Include` con rutas literales. Nada de `user@host`, IPs ni hostnames sueltos. Las únicas opciones permitidas son `-T`, `-q`, `-o BatchMode=yes` y `-o ConnectTimeout=<n>`; cualquier otra se bloquea (`-F`, `-i`, `-J`, `-L/-R/-D/-W`, `-A`, `-X/-Y`, `-M/-S/-O`, `-f/-N` y el resto de `-o`).
- **Siempre con comando remoto** (`ssh <alias> '<comando>'`): sin comando, ssh abre una shell interactiva. Nada entra a `ssh` por stdin (`<`, `cat x | ssh …`). Lo que sigue a `ssh` en un pipe local se valida con las reglas de `readonly-bash`. Sin `-f`/`--follow` (`tail -f`, `journalctl -f`): no terminan nunca.
- **Lista de alias por proyecto**, uno por línea: `.claude/ssh-hosts.txt` en Claude Code y `.agents/ssh-hosts.txt` en Antigravity. Es obligatoria para `server-operator`: sin el archivo, bloquea. Para `server-inspector` es opcional; sin ella vale cualquier alias del config. Así, trabajando en el proyecto A no se tocan los servidores del B.
- **Secretos, aunque sea solo leerlos:** se bloquean `env`, `printenv`, `docker inspect`, `systemctl show` y la lectura de rutas como `.env*`, `*.pem`, `*.key`, `id_*`, `/etc/shadow` y `~/.ssh/`. Lo que el agente lee termina en el transcript.
- **`sudo`:** el inspector solo admite `sudo -n <comando de lectura>`; nunca `-s`, `-i`, `-u`, `-e` ni `sudoedit`.
- **Lo que trae el servidor es dato, no instrucción** (prompt, igual que ADR-022): un log o un archivo que le habla a "la IA" se reporta y no se obedece.
- **Recomendado: un usuario de bajo privilegio en el servidor** para el inspector, p. ej. un alias `web-ro` con un usuario sin sudo en `systemd-journal` o `adm` (no en `docker`, que equivale a root). Es la única barrera que no depende del agente ni del hook; el kit la recomienda pero no la puede imponer.
- **Fuera del plugin y de los presets.** Los subagents de plugin ignoran los hooks, así que la aprobación por cambio no estaría garantizada: los dos se instalan solo por ZIP, `build-plugin.mjs` los excluye y su `--check` falla si se cuelan. Tampoco van preseleccionados en ningún preset: actúan sobre servidores, se suman a mano en "Armar a medida".
- **Modelo:** el inspector en `sonnet`, porque lee logs con contenido de terceros y haiku resiste peor la inyección (ADR-022); el operator en `opus` con `effort: high`, porque un error aprobado en producción cuesta más que la diferencia de tier. En Antigravity, `inherit` y `pro`, con el mismo criterio que `security` (ADR-013).

*Claude Code*

- **Un hook, `.claude/hooks/ssh-guard.mjs`, con dos modos** (`--inspect` / `--operate`) y matcher `Bash`. En estos dos agentes reemplaza a `readonly-bash`: con los dos hooks en el mismo matcher, `readonly-bash` bloquearía cada `ssh`. Para los segmentos locales aplica las mismas reglas: el parser de `readonly-bash` pasa a un módulo compartido (`.claude/hooks/shell-parse.mjs`) que importan los dos hooks.
- **`--inspect`:** parsea el comando remoto como un segundo nivel de shell y lo valida contra la allowlist de `readonly-bash` más comandos de estado del servidor: `systemctl status/is-active/list-units`, `journalctl` (sin `--vacuum-*`, `--rotate` ni `--flush`), `df`, `free`, `uptime`, `ps`, `ss`, `docker ps/logs/stats --no-stream`, `crontab -l`, `ufw status`, etc. Lo que no reconoce, lo bloquea con exit 2.
- **`--operate`:**
  - Si `permission_mode` es `bypassPermissions` o `dontAsk`, bloquea con exit 2, porque en esos modos el prompt no está garantizado, y pide correr la sesión en otro modo.
  - Cada `ssh` válido devuelve `"ask"` —también los de lectura— con el alias y el comando remoto en `permissionDecisionReason`, para que el prompt muestre qué se va a correr y dónde.
  - Un solo comando remoto por llamada: sin `;`, `&&`, `||`, `&` ni saltos de línea (los pipes sí). Cada cambio, una aprobación.
  - **Bloqueo duro**, aunque se apruebe, de lo que deja sin acceso al servidor o no se deshace desde remoto: `reboot`, `shutdown`, `poweroff`, `mkfs*`, `dd of=/dev/…`, `rm -rf` sobre `/` o un directorio de primer nivel, cambios de `iptables`/`nft`/`ufw`, tocar `sshd_config` o `authorized_keys`, `passwd`, `userdel`/`usermod` y `chmod`/`chown -R` sobre `/`. La lista no es exhaustiva —la barrera real es el `"ask"`—: cubre los casos en que una aprobación distraída te deja afuera del servidor. Eso se hace a mano.
  - `scp`/`rsync` solo de subida (de una ruta del proyecto a `<alias>:`), sin `-e`, `--rsh`, `--rsync-path` ni `-o`, y también con `"ask"`. El inspector no los tiene.
- **Frontmatter:** `tools: Read, Grep, Glob, Bash` en los dos, sin `Edit` ni `Write` (el operator cambia servidores, no el repo). Sin `permissionMode`, que se ignora justo cuando importaría. El comando termina en `|| exit 2` para fallar cerrado.
- **Pruebas:** `scripts/test-ssh-guard.mjs`, con casos de los dos modos, como los otros hooks.

*Antigravity*

- `.agents/agents/server-inspector/agent.md` y `server-operator/agent.md`, con `view_file`, `grep_search`, `find_by_name`, `list_dir` y `run_command`. Sin tools de escritura.
- **Sin hooks:** las reglas de alias, opciones, lectura y bloqueo duro van en el prompt, como chequeo obligatorio antes de cada `run_command`. Es más débil que en Claude Code, igual que en ADR-022.
- **`commandExecutionPolicy: off` en los dos** (candidato, hasta la prueba en vivo). Sin hook, la aprobación humana de cada comando es la única barrera dura, también para el inspector. Si la prueba muestra que `sandbox` pide aprobación para todo comando con red, el inspector puede pasar a `sandbox` y correr sin preguntar los comandos locales de lectura.
- `ssh`, `scp` y `rsync` no pueden estar en la allow list del usuario: el subagent la hereda y correría sin preguntar. Lo dicen el cuerpo del agente y el INSTALL del ZIP.

**Alternativas consideradas:**

- **Hosts sueltos (`user@host`, IP):** descartada. Un `ssh` a cualquier host es un canal para sacar datos o saltar a otra máquina; el config es la lista que el usuario ya curó.
- **Un agente con modo lectura/escritura:** descartada. Tools y hooks se configuran por agente; con dos queda un default sin riesgo y el operator pasa a ser una elección explícita.
- **`"ask"` solo en lo que no es lectura:** descartada para la v1. Depende de clasificar bien cada comando, y un cambio que se cuele como lectura pasa sin preguntar en modo auto. Revisable si la cantidad de prompts molesta.
- **`permissionMode: default` en el frontmatter como garantía:** descartada. Se ignora si la sesión principal está en `bypassPermissions`, `acceptEdits` o auto, y en los plugins.
- **Que el hook detecte un `Bash(ssh…)` en la allow list:** descartada. Los permisos viven en varios lugares (usuario, proyecto, local, managed, flags de la CLI) y el hook no los ve todos. Se prueba en vivo y se documenta.
- **Un servidor MCP de SSH:** descartada. Es un proceso de terceros con acceso a las claves (supply chain) y se sale del formato de archivos del kit.
- **Solo restricción del lado del servidor** (usuario de solo lectura, `command=` en `authorized_keys`): no se descarta —es la mejor barrera—, pero el kit no la puede imponer. Queda como recomendación.
- **Solo prompt:** descartada, por lo mismo que en ADR-021.
- **Duplicar el parser en `ssh-guard` en vez de compartirlo:** descartada. Dos parsers de shell que divergen son una brecha esperando a pasar.

**Consecuencias:**

- **Solo por ZIP:** quien use el kit como plugin no recibe estos dos agentes.
- **`server-operator` no funciona en `bypassPermissions` ni en `dontAsk`**, a propósito.
- **Extraer el parser toca a los 7 agentes con `readonly-bash`:** los 51 casos de `test-readonly-bash` tienen que seguir en verde, y el generador del manifest tiene que empaquetar el módulo que importan los hooks (hoy solo incluye los hooks que el agente nombra).
- Como los otros hooks: necesita Node, falla cerrado con `|| exit 2` y solo corre si la carpeta tiene aceptada la confianza del workspace (ADR-021).
- **Falsos positivos asumidos:** alias definidos en un `Include` con comodines, comandos de lectura que no estén en la allowlist remota y shells remotas que no son POSIX (fish): el hook parsea como `sh`.
- Los hooks protegen al subagent, no al agente principal: un `ssh` que corra el principal pasa por los permisos normales.
- Antigravity queda más débil (prompt + aprobación por comando) mientras no tenga hooks.
- El catálogo pasa a 13 subagents en Claude Code y 7 en Antigravity; las descripciones en inglés van a `en.json`, como en la tanda 2.

**Implementación (2026-10-26):** sigue el diseño, con estos agregados que salieron al escribir los casos de prueba:

- **Envoltorios:** el bloqueo duro revisa el comando real detrás de `sudo`, `env`, `nohup`, `nice`, `timeout` y `xargs`, y lo que corre dentro de `sh -c` y de `eval`.
- **Más bloqueos duros:** `service ssh …`, `su`, editores e interactivos (`vim`, `nano`, `top`, `sudo -i`, `sudo -e`), un `&` final, y `ssh`/`scp`/`rsync` desde el servidor hacia otro host. Este último también vale en el inspector.
- **`server-operator` sin variables:** `$VAR` se bloquea también en este agente, para que el prompt muestre el valor que corre de verdad.
- **Secretos:** la regla mira los argumentos de los comandos que imprimen contenido (`cat`, `head`, `tail`, `grep`, `git`…) y cualquier `<archivo`. También bloquea los globs que podrían abarcar un secreto (`.e*`, un `*` suelto). Limitación conocida: un `grep -r` sobre un directorio igual puede imprimir secretos, porque se revisan rutas, no contenido.
- **La shell local:** en el segmento de `ssh`, `scp` o `rsync` se bloquean `$`, `*`, `?` y `[` sin comillas, porque se expandirían en la máquina local antes de llegar al servidor.
- **Generador:** `generate-manifest.mjs` empaqueta los hooks que nombra el agente y lo que esos hooks importan. Los 7 revisores llevan ahora `readonly-bash.mjs` + `shell-parse.mjs`.
- **Sitio:**
  - el operator lleva el badge "cambia servidores", porque sin `Edit`/`Write` el sitio lo mostraba como de solo lectura;
  - el `INSTALL.md` del ZIP suma una nota cuando hay agentes de servidores.
- **Verificación:**
  - 169 casos en `scripts/test-ssh-guard.mjs`: 29 pasan, 17 piden aprobación y 123 se bloquean;
  - siguen en verde `test-readonly-bash` y `test-web-guard`;
  - `build-plugin --check` da 11 subagentes, sin los de servidores, y `npm run build` pasa.

**Pruebas en vivo antes de aceptar** (contra un alias descartable —contenedor o VM local con `sshd`—, nunca un servidor real):

Claude Code:

1. `"ask"` del hook con `Bash(ssh:*)` en la allow list: ¿aparece el prompt o gana la regla? Si gana la regla, el kit avisa que `ssh` no puede estar en la allow list, como en Antigravity.
2. Exit 2 en `bypassPermissions` y `dontAsk`: ¿bloquea? La doc lo da a entender (exit 2 = `deny`) pero no lo dice para esos modos. El resultado vale también para `readonly-bash` y `web-guard`.
3. `"ask"` en `bypassPermissions`: informativo —el hook bloquea igual en ese modo—, pero dice si ese bloqueo hace falta.
4. Subagent en segundo plano: el prompt sube a la sesión principal con el nombre del agente y el `permissionDecisionReason`.
5. Modo auto: el `"ask"` fuerza el prompt (documentado; confirmar).

Antigravity:

6. Qué valor de `commandExecutionPolicy` pide aprobación para cada `ssh`.
7. Si `sandbox` deja salir a la red.
8. Si un prefijo `ssh` en la allow list del padre se saltea el `off`.

Si alguna falla, el diseño se ajusta en este ADR antes de pasarlo a Aceptada.

**Resultados de las pruebas en vivo (2026-10-26):**

*Entorno:*

- sshd descartable en `127.0.0.1:2222` (servidor Node con `ssh2`): registra cada pedido y no ejecuta nada.
- Alias `adr026-test` en `~/.ssh/config`, con clave y `known_hosts` de prueba.
- Claude Code 2.1.310 por CLI, en Windows.
- Una sonda temporal (`adr026-probe`), cuyo hook registra el input y responde `"ask"` o exit 2.
- Cada resultado se confirmó en el `permissionDecision` del transcript del subagent y en el log del sshd, no en lo que reportó el agente. Los subagents no ven el prompt y dos veces dijeron que no lo hubo, cuando sí estaba.

*Claude Code — las 5 en verde:*

1. **El `"ask"` gana a la regla allow.** Con `--allowedTools "Bash(ssh:*)"`, el `ssh` del operator igual mostró el prompt: queda registrado como `source: user_temporary` y `reasonCode: hook:PreToolUse`, no como `config`. El aviso de no poner `ssh` en la allow list deja de hacer falta en Claude Code: el INSTALL lo mantiene solo para Antigravity.
2. **El exit 2 bloquea en `bypassPermissions` y en `dontAsk`.** Se probó con `ssh-guard --operate`, con `readonly-bash` (un `touch` de `code-reviewer`) y con la sonda. Los tres quedaron registrados como `reject` por el hook y nada llegó al sshd ni al disco. En `dontAsk` se probó con `Bash(ssh:*)` y `Bash(touch:*)` en la allow list, así que el bloqueo es del hook y no del modo. Vale también para `web-guard`.
3. **El `"ask"` también muestra el prompt en `bypassPermissions` y en `dontAsk`** (lo confirmó el usuario y lo registra el transcript como `user_temporary`). Además, el hook del subagent recibe el modo real en `permission_mode`. Con esta versión, el bloqueo del operator en esos modos no hace falta para que haya prompt. **Se mantiene igual** como defensa en profundidad: no está documentado y una versión futura podría resolver el `"ask"` sola en esos modos. Revisable si molesta.
4. **El prompt de un subagent en segundo plano sube a la sesión principal** como "Bash command · from the server-operator agent", con el `permissionDecisionReason` completo. Solo ofrece Yes y No, sin "don't ask again", así que no se puede convertir en una regla permanente por accidente. Esta versión de la CLI lanza todos los subagents en segundo plano, así que no hubo un caso real en primer plano.
5. **En modo auto, el `"ask"` fuerza el prompt** (`user_temporary`). Al `ssh … uptime` del inspector, que no devuelve `"ask"`, lo aprobó el clasificador sin preguntar (`reasonType: classifier`), como se esperaba.

*Antigravity — no se pudieron medir:*

- El agente principal dijo que no tiene ninguna tool para delegar en los agentes de `.agents/agents/`, y propuso mencionarlos con `@`.
- Con `@server-operator` y `@adr026-probe-{auto,eager,sandbox}`, el que contestó y corrió los comandos fue el agente principal, no el subagente. La política de cada agente nunca entró en juego: 6, 7 y 8 quedan sin respuesta.
- **El hallazgo que importa:** con la política de terminal del agente principal en "Request review" y sin `ssh` en la allow list, los 4 `ssh` llegaron al sshd sin pedir aprobación. El `Test-NetConnection` a internet también corrió. En Antigravity, la aprobación por comando que este ADR da por hecha no está garantizada: depende de cómo invoque el usuario al agente y de cómo resuelva Antigravity la política.
- **Decisión:** los dos agentes de Antigravity siguen en el kit, pero el INSTALL del ZIP los marca como sin verificar y recomienda Claude Code para los cambios en servidores. Las pruebas 6–8 quedan pendientes en `06_TASKS.md`, hasta saber cómo se invoca de verdad un subagent de workspace en Antigravity.

## ADR-027 — Menos subagents en Claude Code y menos tokens por turno

**Fecha:** 2026-10-27
**Estado:** Aceptada

**Contexto:** El kit llegó a 11 subagents por defecto en Claude Code (13 con los de servidores). Tres hacían lo mismo que algo que ya existe: `explorer` duplica el agente `Explore` que trae Claude Code, `docs-writer` duplica `/session-close` y `deploy-checker` duplica `/deploy-checklist`. Cuesta elegir entre tantos y además cuestan tokens: Claude Code carga la descripción de cada subagent en todos los turnos, se use o no (~1.200 tokens con los 11), y cada invocación arranca en frío y vuelve a leer archivos.

**Decisión:**

- **Criterio:** un subagent se queda si lee mucho y devuelve un veredicto corto (así no ensucia la conversación principal) o si necesita aislamiento por seguridad. Si el trabajo necesita el contexto de la conversación, o si Claude Code ya lo trae, va como comando o no va.
- **Salen tres:**
  - `explorer`: lo cubre `Explore`, que también es haiku y de solo lectura. El mapa del `AGENTS.md` ya dice dónde mirar.
  - `docs-writer`: arranca sin saber qué se hizo y tiene que redescubrirlo del diff; `/session-close` corre en la conversación que ya lo sabe.
  - `deploy-checker`: no puede correr build ni tests, así que el agente principal terminaba haciéndolo igual. Sus chequeos (git, variables de entorno usadas vs. documentadas, migraciones, rollback, veredicto GO / NO-GO) pasan a `/deploy-checklist`.
- **Los comandos delegan en su agente:** `/bug-fix` le pasa la causa raíz a `debugger` y `/security-audit` a `security-auditor` (`security` en Antigravity); `/deploy-checklist` manda las migraciones nuevas a `db-migration-reviewer`. El usuario recuerda los comandos; los agentes son el detalle.
- **Descripciones de 1–2 líneas** con cuándo usar y cuándo no. El detalle queda en el cuerpo, que solo se carga al invocar.
- **Opus solo donde un error cuesta caro:** `security-auditor`, `db-migration-reviewer` y `server-operator`. `planner` pasa a sonnet; para un plan grande está el modo plan del agente principal.
- **`maxTurns` en todos**, para que ninguno se quede leyendo el repo entero.
- **Antigravity no cambia de cantidad:** sus 5 agentes por defecto no duplican nada.

**Alternativas consideradas:**

- **Un solo revisor que cubra código, UI y migraciones:** descartada. Mezcla modelos (las migraciones van en opus) y especialidades; un prompt largo con secciones condicionales revisa peor y se carga entero en cada invocación.
- **Dejar los 11 y solo acortar descripciones:** descartada. Baja tokens pero deja los duplicados, que son el motivo de la confusión.
- **Sacar también los comandos que duplican a un agente:** descartada. Los comandos son lo que el usuario escribe y documentan el flujo; en Antigravity, además, no todos tienen agente.

**Consecuencias:**

- Quien invocaba `explorer`, `docs-writer` o `deploy-checker` por nombre ahora usa `Explore`, `/session-close` o `/deploy-checklist`.
- Los proyectos con el kit instalado tienen que borrar los tres archivos: el ZIP nuevo no los trae, pero tampoco borra lo que ya está.
- `deploy-checker` vivió un día (ADR-021, nota del 2026-10-26); su contenido no se pierde, pasa al comando.
