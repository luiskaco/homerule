# 07 — Decisions (ADRs)

## ADR-001 — Nav del sitio organizado por modo de uso, no por herramienta

**Fecha:** 2026-07-29
**Estado:** Aceptada

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
**Estado:** Aceptada

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
