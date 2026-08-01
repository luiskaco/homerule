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
