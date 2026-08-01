# Bitácora de cambios

Registro de cambios relevantes del proyecto **AI Rules Hub / makeRuleIA**, tanto en las reglas/skills como en el sitio (`site/`). Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), adaptado a un proyecto sin versionado semántico: los cambios se agrupan por fecha.

## [Sin publicar]

### Cambios

- **Regla de idioma corregida para que refleje la realidad** (ADR-009): § 2 de `CORE.md` y `GEMINI.md` decía "Código siempre en inglés", pero el repo tenía 67 comentarios en español contra 15 en inglés. La regla pasa a ser "identificadores y nombres de archivo en inglés; comentarios y documentación en español; respuestas en el idioma del usuario". Se evaluó traducir todo a inglés y se descartó: 4 de las 14 skills empaquetadas son de terceros y están en inglés (habría que forkearlas), el español mide solo 3,8% más que el inglés en texto técnico, y la rule más grande usa el 78% del límite de 12.000 chars de Antigravity — o sea, ninguno de los argumentos a favor de traducir se sostiene.
- **Antigravity y Claude Code pasan a ser kits totalmente independientes** (ADR-006): se elimina el modo de uso híbrido "Antigravity + Claude". Ningún item del manifest pertenece a los dos tools — las plantillas de `/docs`, las skills externas y el add-on de base de datos se emiten una vez por tool, con su propio `id`. Cada ZIP es autocontenido y no menciona ni asume al otro agente. La fuente en disco sigue siendo única: `.agents/rules/` se edita una sola vez y el generador emite los dos formatos.
- El home pasa de 3 modos de uso a 2 y el nav pierde la entrada "Antigravity + Claude"; `/subagentes` se mueve dentro del menú "Claude solo".
- `BuildClient` filtra los items por `tool` a secas — se elimina el caso especial `|| i.category === "template"`, que era el último punto donde los dos catálogos se mezclaban.
- `GEMINI.md` § 8 deja de nombrar a Claude en la regla de auditoría externa: la regla se generaliza a "revisión manual, herramienta de análisis, etc." en vez de eliminarse.
- El `description` de `code-reviewer` ya no promete revisar UI/UX (su cuerpo nunca lo hizo); ahora deriva explícitamente a `ui-reviewer`.
- `explorer` y `planner` explicitan en su `description` qué los diferencia de los agentes `Explore` y `Plan` que Claude Code trae de fábrica: conocen la convención `/docs` 01-08 y las reglas instaladas en `.claude/skills/`.
- Reorganización de la interfaz del sitio: layout, nav, home y tarjetas de skills ajustados.
- Se agrega esta bitácora de cambios (`CHANGELOG.md` + página `/changelog`).
- Nav reorganizado en 3 secciones claras: **Antigravity solo**, **Antigravity + Claude** y **Claude solo**; el catálogo de skills se mantiene como ventana independiente.
- Se fusionan `/stacks` y `/stacks-app` (mostraban la misma info de rules/skills por preset en dos diseños distintos) en una única página `/stacks` con el tema visual actual del sitio.
- Labels del nav normalizados: se reemplazan los tres "Inicio" genéricos por labels descriptivos ("Presets por stack", "Rules y skills por stack", "Armar a medida"); un grupo de un solo ítem ahora se renderiza como link directo en vez de dropdown.
- El proyecto pasa a usar su propia convención `/docs`: se agregan `docs/06_TASKS.md` (backlog activo) y `docs/07_DECISIONS.md` (ADRs) para seguimiento del trabajo.
- `/` pasa a ser el índice del hub (presenta los 3 modos de uso, el catálogo de skills y la bitácora); los presets por stack de Antigravity se mudan a su propia página `/antigravity`. Antes home y presets eran la misma página.

### Agregado

- **Dos subagentes nuevos, de 6 a 8** (ADR-007): `ui-reviewer` (accesibilidad, los 5 estados de UI, responsive, SEO on-page y consistencia con el sistema de diseño) y `test-writer` (detecta el framework de test del proyecto en vez de asumirlo, y nunca modifica el código bajo prueba). Cubren los dos huecos del kit: 6 de los 8 stacks entregan interfaz y ninguno tenía revisión de UI, y ningún agente escribía tests.
- Versión en inglés del sitio: i18n con `next-intl`, ruteo `/es` y `/en` (la raíz redirige a `/es`), mensajes en `messages/es.json` y `messages/en.json`, `hreflang` por idioma, `lang` correcto en `<html>` y selector de idioma en el header. Alcance: interfaz del sitio — el contenido empaquetado en los ZIPs sigue en español.

### Quitado

- Modo de uso "Antigravity + Claude": la entrada del nav y la tarjeta del home. Los subagentes no desaparecen — pasan a vivir dentro de "Claude solo", que es a quien pertenecen.
- Páginas placeholder vacías y sin link en el nav: `/proximamente` y `/mejores-repos-utilidades`.

### Arreglado

- **Los `.claude/commands/` no se descargaban.** Los 6 comandos existían en el manifest y se mostraban en `/build`, pero ningún preset de Claude Code los preseleccionaba, así que el ZIP salía sin ellos (`site/src/lib/presets.ts`). La rama de Antigravity sí incluía sus workflows equivalentes.
- **`code-reviewer` apuntaba a rutas inexistentes.** Referenciaba `.agents/rules/security.md` y `.agents/rules/architecture.md`, que no existen en un ZIP de Claude Code — el generador convierte esas rules a `.claude/skills/<id>/SKILL.md`. Solo funcionaba si además se había bajado el ZIP de Antigravity.
- **Segmentos duplicados en todos los ZIPs** (ADR-008): `destFolder()` agregaba un prefijo encima de `destPath`, que ya era la ruta final, generando `docs/docs/01_PROJECT_PRD.md` y `.agents/.agents/rules/architecture.md`. Además no coincidían con los `cp -r` del `INSTALL.md` incluido.
- Contenido específico de Antigravity que se filtraba a los ZIPs de Claude Code: `00_GEMINI_START.md` ya no se incluye en presets de `claude-code` (`site/src/lib/presets.ts`); se generalizaron referencias a `GEMINI.md` en `docs-templates/06_TASKS.md` y en el workflow `new-feature.md` para que también apliquen a `CORE.md` (Claude Code).

## 2026-07-29

### Agregado

- Skill `project-planning` para cerrar el gap entre brainstorming y ejecución.

## 2026-07-28

### Agregado

- Rediseño del sitio a "Vibrant Flat UI 3.0".
- Nueva pestaña `/stacks-app`.
- Nuevos templates de prompt.
- Skill `api-security-best-practices` sumada al catálogo.

## 2026-07-25

### Agregado

- Skills de diseño de terceros versionadas en `.claude/skills/`.
- Catálogo unificado con la estructura de tarjetas del glosario.
- Skills externas sumadas al catálogo + página de glosario con detalle.
- Menú hamburguesa para navegación responsive.
- Reorganización del nav en menús agrupados + catálogo de skills y templates de prompt.

### Quitado

- Skills de diseño gráfico removidas del bundle de `uipro`.

## 2026-07-22

### Cambios

- Se remueve la skill `ui-ux-pro-max`, consolidando su rol en `frontend-design`.

## 2026-07-20

### Agregado

- Pestañas placeholder: "Mejores SKILL", "Próximamente" y "Mejores repos de utilidades".

### Cambios

- Se exige el uso de versiones actualizadas y se corrige la lista de rules.

## 2026-07-15

### Cambios

- El proyecto se enfoca en el workflow Gemini + Claude; se agregan subagentes y se corrige el límite de rules.

## 2026-07-05

### Agregado

- Sitio "Rules Hub" descargable con soporte multi-agente y de base de datos.

### Arreglado

- Responsividad mobile del nav, footer y páginas de build.

## 2026-07-02

### Agregado

- Secciones de PWA, dark mode, i18n y privacidad en las rules.
- Documentación de las skills `frontend-design` y `seo-audit`.

## 2026-06-21

### Cambios

- Reorganización de la estructura del repo a la raíz del proyecto; README actualizado.

## 2026-06-13

### Cambios

- Reorganización de reglas de `antigravity-v2`, eliminación de reglas obsoletas.
- Actualización de las opciones de workflow y la lógica de subagentes en `GEMINI.md`.

### Agregado

- Rules de Antigravity y actualización de instrucciones de agente.

## 2026-06-11

### Agregado

- Documentación de los procesos internos de subagentes para tareas de código.

## 2026-06-07

### Documentación

- Corrección de typo en el workflow de bug-fix.
- Actualización de workflows y README de Antigravity.

## 2026-06-01

### Documentación

- Revisión de README para instalación de Antigravity Rules v2.
- Actualización de `session-close.md`, `new-feature.md` y `GEMINI.md`.

## 2026-05-31

### Agregado

- README raíz del proyecto (`091947e`).
- Actualización de workflows de agentes, skills y documentación.

## 2026-05-24 — 2026-05-30

### Agregado

- Primeras versiones de las rules de gobernanza de IA (`ia_antigravity-rules`, README global, reglas v3/v4).
- Commit inicial: "Reglas para la IA".
