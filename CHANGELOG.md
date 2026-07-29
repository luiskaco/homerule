# Bitácora de cambios

Registro de cambios relevantes del proyecto **AI Rules Hub / makeRuleIA**, tanto en las reglas/skills como en el sitio (`site/`). Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), adaptado a un proyecto sin versionado semántico: los cambios se agrupan por fecha.

## [Sin publicar]

### Cambios

- Reorganización de la interfaz del sitio: layout, nav, home y tarjetas de skills ajustados.
- Se agrega esta bitácora de cambios (`CHANGELOG.md` + página `/changelog`).
- Nav reorganizado en 3 secciones claras: **Antigravity solo**, **Antigravity + Claude** y **Claude solo**; el catálogo de skills se mantiene como ventana independiente.
- Se fusionan `/stacks` y `/stacks-app` (mostraban la misma info de rules/skills por preset en dos diseños distintos) en una única página `/stacks` con el tema visual actual del sitio.
- Labels del nav normalizados: se reemplazan los tres "Inicio" genéricos por labels descriptivos ("Presets por stack", "Rules y skills por stack", "Armar a medida"); un grupo de un solo ítem ahora se renderiza como link directo en vez de dropdown.
- El proyecto pasa a usar su propia convención `/docs`: se agregan `docs/06_TASKS.md` (backlog activo) y `docs/07_DECISIONS.md` (ADRs) para seguimiento del trabajo.
- `/` pasa a ser el índice del hub (presenta los 3 modos de uso, el catálogo de skills y la bitácora); los presets por stack de Antigravity se mudan a su propia página `/antigravity`. Antes home y presets eran la misma página.

### Agregado

- Versión en inglés del sitio: i18n con `next-intl`, ruteo `/es` y `/en` (la raíz redirige a `/es`), mensajes en `messages/es.json` y `messages/en.json`, `hreflang` por idioma, `lang` correcto en `<html>` y selector de idioma en el header. Alcance: interfaz del sitio — el contenido empaquetado en los ZIPs sigue en español.

### Quitado

- Páginas placeholder vacías y sin link en el nav: `/proximamente` y `/mejores-repos-utilidades`.

### Arreglado

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
