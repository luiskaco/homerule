---
trigger: model_decision
description: Activar al construir o revisar interfaces, componentes visuales, formularios, estados de carga/error, accesibilidad, i18n/traducciones, o meta tags/SEO de páginas
---

# UI/UX Rules

## Principios de Interfaz

- Mobile-first: diseñar desde 320px, escalar a 768px y 1280px.
- Feedback visual en menos de 100ms para toda interacción.
- Flujos frecuentes en máximo 3 pasos.
- Acciones destructivas siempre con confirmación o ventana de undo.
- Estado relevante (filtros, tabs, paginación) reflejado en URL.

### 5 Estados Obligatorios de UI

| Estado | Descripción |
|--------|-------------|
| `loading` | Spinner o skeleton mientras espera datos |
| `skeleton` | Estructura visual previa a los datos reales |
| `error` | Mensaje de error + acción de recuperación |
| `success` | Confirmación visual de acción completada |
| `empty` | Mensaje útil cuando no hay datos — nunca UI rota |

> Proyecto PWA: agregar `offline` como 6to estado obligatorio — ver [§ PWA](#pwa).

---

## Accesibilidad (WCAG 2.1 AA)

- Contraste texto/fondo: **4.5:1** normal, **3:1** texto grande.
- Todos los inputs con `<label>` o `aria-label`.
- Botones de solo icono con `aria-label` descriptivo.
- Iconos decorativos con `aria-hidden="true"`.
- Actualizaciones async (toasts, validaciones) con `aria-live="polite"`.
- HTML semántico antes de ARIA (`<button>`, `<a>`, `<label>`, `<table>`).
- Jerarquía `<h1>`–`<h6>` sin saltos.
- Nunca `outline: none` sin reemplazo — usar `focus-visible:ring-*`.
- Usar `:focus-visible` sobre `:focus`.
- `prefers-reduced-motion` respetado en todas las animaciones.

---

## Skeletons

- Representar la estructura real del contenido, no barras genéricas.
- CLS < 0.1 — imágenes con `width` y `height` explícitos siempre.
- Animar solo `opacity` y `transform` (compositor-friendly).

---

## Formularios

- `autocomplete` y `name` significativo en cada input.
- Tipo correcto: `email`, `tel`, `url`, `number` + `inputmode` apropiado.
- Nunca bloquear paste.
- Labels clickables (`htmlFor` o wrapping).
- `spellCheck={false}` en emails, códigos y usernames.
- Submit habilitado hasta que empieza el request — spinner durante request.
- Errores inline junto al campo; focus en primer error al hacer submit.
- Advertir antes de navegar con cambios sin guardar.

---

## Tipografía

- `…` no `...` | `"` `"` no `"` | `&nbsp;` en `10 MB`, `⌘ K`, nombres de marca.
- Estados de carga: `"Cargando…"`, `"Guardando…"`
- `font-variant-numeric: tabular-nums` en columnas numéricas.
- `text-wrap: balance` en títulos.
- No usar Inter para todo — elegir pares tipográficos según contexto.

---

## Dark Mode

- Tokens semánticos, nunca colores hardcodeados por tema:
  `--bg-primary`, `--bg-surface`, `--text-primary`, `--text-secondary`,
  `--border-default` — cada uno con valor light y dark, nunca `dark:bg-gray-900`
  disperso por todo el código.
- Contraste **4.5:1** normal / **3:1** texto grande en **ambos** temas — no
  asumir que dark mode "ya es accesible" por ser oscuro. Verificar cada par
  fondo/texto en los dos modos.
- Fuente de la preferencia, en orden:
  1. Selección explícita del usuario (persistida — cookie o `localStorage`,
     nunca solo en memoria).
  2. `prefers-color-scheme` del sistema si no hay selección explícita.
  3. Nunca forzar un tema sin dar opción de cambiarlo.
- Evitar negro puro (`#000`) sobre blanco puro (`#fff`) — usar grises con
  tinte (`#0a0a0a` / `#fafafa`) para reducir fatiga visual y halation.
- Imágenes/ilustraciones con fondo transparente o versión alternativa para
  dark — nunca un PNG con fondo blanco flotando sobre `--bg-primary` oscuro.
- Elevación (cards, modals, dropdowns) se comunica con **superficie más clara**
  en dark mode, no con `box-shadow` — las sombras casi no se perciben sobre
  fondos oscuros.
- Sin flash de tema incorrecto al cargar (FOUC): aplicar el tema antes del
  primer paint (script inline en `<head>` o SSR del tema desde cookie),
  nunca setear la clase de tema en un `useEffect` post-hidratación.
- `color-scheme: light dark` en `:root` para que scrollbars, inputs y
  controles nativos del navegador respeten el tema automáticamente.

---

## i18n

- Todo string visible al usuario vive en archivos de traducción
  (`messages/es.json`, `messages/pt.json`, `messages/en.json`…) — nunca texto
  hardcodeado en el componente, ni siquiera "temporalmente".
- Key namespacing por módulo, no un solo archivo plano:
  `checkout.errors.card_declined`, no `error_1` ni un `common.json` gigante.
- Pluralización con las reglas del formato (ICU MessageFormat o el sistema del
  framework — `next-intl`, `react-i18next`) — nunca `count === 1 ? "item" : "items"`
  a mano, no todos los idiomas pluralizan en 2 formas (ej. español "1 producto"
  / "2 productos" vs. otros idiomas con 3+ formas plurales).
- Fechas, números, moneda y unidades siempre con `Intl.*` parametrizado por
  locale — nunca formateo manual (`toLocaleDateString()` sin locale explícito
  hereda el del server, no el del usuario). Refuerza la regla ya existente en
  `§ Anti-patterns`.
- Ruteo de idioma explícito en la URL (`/es/`, `/pt/`) — nunca solo por
  cookie/header sin reflejarlo en la URL, rompe SEO multi-idioma y
  compartir enlaces.
- `hreflang` + `lang` en `<html>` correctos por página (ya cubierto en
  `§ SEO Técnico`) — cada versión de idioma con su propio `<link rel="alternate" hreflang="...">`.
- Layout a prueba de expansión de texto: alemán/español pueden ser 30-40% más
  largos que inglés — nunca `width` fijo en botones/labels que dependen de texto
  traducido, usar `min-width` + contenido flexible.
- Si el mercado lo requiere, `dir="rtl"` a nivel `<html>` y CSS lógico
  (`margin-inline-start` en vez de `margin-left`) en vez de overrides por idioma.
- Nunca concatenar strings traducidos para formar oraciones
  (`t("hello") + " " + name + t("welcome")`) — el orden gramatical cambia
  entre idiomas. Usar interpolación dentro de la key: `t("welcome", { name })`.

---

## Performance Frontend

- Lazy loading en imágenes below-fold (`loading="lazy"`).
- `fetchpriority="high"` en imágenes críticas above-fold.
- Code splitting en rutas y componentes pesados.
- Virtualizar listas > 50 items (`virtua` o `content-visibility: auto`).
- `<link rel="preload" as="font">` + `font-display: swap` en fuentes críticas.
- `<link rel="preconnect">` en dominios CDN/assets.
- Nunca `transition: all` — listar propiedades explícitamente.
- No leer layout en render (`getBoundingClientRect`, `offsetHeight`).

---

## PWA

Aplica solo si el proyecto es una PWA (manifest + service worker). Sigue
siendo web — todo lo demás de este archivo (5 estados, a11y, performance,
SEO) aplica igual, esto es una capa adicional.

### Manifest

- `manifest.json` con `name`, `short_name`, `icons` (mínimo 192×192 y 512×512,
  incluir `purpose: "maskable"`), `theme_color`, `background_color`.
- `display: "standalone"` (o `"fullscreen"` si el caso de uso lo justifica).
- `start_url` explícito — nunca depender del default del navegador.

### Service Worker

- Estrategia de cache por tipo de recurso, nunca una sola global:
  - `cache-first` para assets estáticos versionados (JS/CSS con hash, fonts).
  - `network-first` para HTML y datos que cambian frecuentemente.
  - `stale-while-revalidate` para imágenes y recursos semi-estáticos.
- Versionar el cache (`CACHE_NAME = "app-v${BUILD_ID}"`) — invalidar caches
  viejos en el evento `activate`.
- Nunca cachear responses de error (4xx/5xx) ni endpoints con datos sensibles/auth.

### Estado Offline

- `offline` es el 6to estado obligatorio de UI en proyectos PWA — ver
  [tabla de estados](#5-estados-obligatorios-de-ui). Nunca pantalla en blanco
  sin conexión: mostrar qué está disponible desde cache y qué requiere red.
- Indicador visual de estado de conexión si la app depende de datos en vivo.
- Acciones que requieren red (submits, mutaciones) deshabilitadas o encoladas
  con feedback claro — nunca fallar en silencio.

### Update Flow

- Detectar SW nuevo esperando (`waiting` state) y avisar al usuario —
  nunca actualizar de forma forzada sin aviso (pierde estado no guardado).
- Botón/banner "Nueva versión disponible" que dispara `skipWaiting()` +
  reload solo con acción explícita del usuario.

### Auditoría

- Lighthouse PWA score ≥ 90 antes de merge a `main` (mismo criterio que
  SEO/Performance en [§ SEO Técnico](#seo-técnico)).
- Verificar installability: HTTPS, manifest válido, SW registrado y activo.

---

## Comandos de Auditoría (impeccable)

| Comando | Cuándo usarlo |
|---------|--------------|
| `/impeccable audit` | Antes de PR — a11y, performance, responsive |
| `/impeccable critique` | Revisión de jerarquía visual y UX |
| `/impeccable polish` | Pase final antes de ship |
| `/impeccable harden` | Errores, i18n, overflow, edge cases |
| `/impeccable bolder` | Diseño genérico o aburrido |
| `/impeccable quieter` | Diseño sobrecargado visualmente |
| `/impeccable typeset` | Tipografía necesita corrección |
| `/impeccable animate` | Agregar motion con propósito |

---

## Anti-patterns — Nunca

- `user-scalable=no` / `maximum-scale=1`
- `onPaste` + `preventDefault`
- `transition: all`
- `outline: none` sin reemplazo de focus
- `<div onClick>` en lugar de `<button>`
- Imágenes sin `width`/`height`
- Arrays > 50 sin virtualizar
- Inputs sin label
- Botones icono sin `aria-label`
- Fechas/números hardcodeados (usar `Intl.*`)
- Texto gris sobre fondos de color
- Cards dentro de cards
- `bounce`/`elastic` easing
- Purple-to-blue gradients por defecto
- Colores de tema hardcodeados (`dark:bg-gray-900` disperso) en vez de tokens semánticos
- Aplicar tema en `useEffect` post-hidratación (causa flash de tema incorrecto)

---

## Skills de Diseño — Cuándo Usar Cada Una

| Skill | Momento | Qué hace |
|-------|---------|----------|
| `ui-ux-pro-max` | Al **iniciar** UI nueva **sin** sistema de diseño definido | Genera sistema de diseño: estilo, paleta, tipografía por industria |
| `frontend-design` | Al **iniciar** UI nueva **con** sistema de diseño ya definido (caso habitual en Orange Latam) | Dirección estética dentro de ese sistema — tipografía, jerarquía visual, evita defaults genéricos |
| `impeccable` | Al **revisar** UI existente — requiere que `frontend-design` ya haya corrido antes | Audita, pule y critica con 23 comandos |
| `web-design-guidelines` | Al **auditar** estándares | Verifica a11y, forms, performance técnica |

**Nunca activar más de 2-3 a la vez.** Elegir según el momento de la tarea.
`ui-ux-pro-max` y `frontend-design` son mutuamente excluyentes — el trigger es
si el proyecto ya tiene sistema de diseño o no, nunca se activan juntas.

### Jerarquía si hay conflicto

1. `web-design-guidelines` — estándares técnicos (a11y, WCAG, forms)
2. `ui-ux-pro-max` / `frontend-design` — sistema de diseño o dirección estética (mutuamente excluyentes, ver arriba)
3. `impeccable` — vocabulario y auditoría de diseño

### Instalación

```bash
npm install -g uipro-cli && uipro init --ai antigravity
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
# impeccable: ver instrucciones en impeccable.style
```

---

## SEO Técnico

> Esta sección es la fuente de verdad de SEO del proyecto. Skills externas de
> auditoría SEO (ej. `seo-audit` de `coreyhaines31/marketingskills`) sirven
> para **diagnóstico** — detectar qué está roto — pero los umbrales y specs
> concretos de acá (Lighthouse ≥90/≥80, OG 1200×630px, largo de title/description,
> etc.) mandan sobre cualquier sugerencia genérica que la skill proponga.

### Meta Tags Obligatorios (toda página)

- `<title>` único y descriptivo — 50–60 caracteres máximo.
- `<meta name="description">` — 120–160 caracteres, incluir keyword principal.
- `<link rel="canonical">` siempre presente, incluso en la página principal.
- `lang` en `<html>` con el idioma correcto (`es`, `en`, etc.).
- `<meta name="robots">` explícito en páginas que no deben indexarse (`noindex, nofollow`).

### Open Graph y Twitter Cards

```html
<!-- Open Graph -->
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="...1200x630.jpg" />
<meta property="og:url" content="https://..." />
<meta property="og:type" content="website" />
<meta property="og:locale" content="es_ES" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="...1200x630.jpg" />
```

- Imagen OG: mínimo 1200×630px, < 1MB, formato JPG o PNG.
- Nunca reutilizar el mismo `og:image` en todas las páginas.

### Estructura Semántica para SEO

- Un solo `<h1>` por página — describe el tema principal.
- Jerarquía `<h1>`–`<h6>` sin saltos (refuerza la regla de accesibilidad).
- `alt` descriptivo en todas las imágenes con contenido (no decorativas).
- URLs en kebab-case, descriptivas, sin parámetros innecesarios.
- `<a>` con texto descriptivo — nunca "click aquí" o "ver más" sin contexto.

### Structured Data (Schema.org)

- Agregar JSON-LD en páginas que lo justifican:
  - Artículos: `Article` o `BlogPosting`
  - Productos: `Product` con `offers`
  - Organización: `Organization` en la home
  - Breadcrumbs: `BreadcrumbList` en rutas anidadas

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "datePublished": "2026-01-01",
  "author": { "@type": "Person", "name": "..." }
}
</script>
```

### Core Web Vitals como Ranking Factor

Los mismos targets de performance ya definidos aplican directamente al SEO:

- **LCP** < 2.5s (Largest Contentful Paint)
- **CLS** < 0.1 (Cumulative Layout Shift) — ya cubierto por reglas de skeletons
- **INP** < 200ms (Interaction to Next Paint)

### Auditoría en CI

- Lighthouse SEO score ≥ 90 antes de merge a `main`.
- Lighthouse Performance score ≥ 80.
- Herramienta recomendada: `@lhci/cli` (Lighthouse CI).

```bash
# Instalar y correr en CI
npm install -g @lhci/cli
lhci autorun
```

### Anti-patterns SEO — Nunca

- Mismo `<title>` o `<meta description>` en múltiples páginas.
- Páginas importantes con `noindex` accidentalmente.
- Imágenes sin `alt` con contenido relevante.
- Texto importante dentro de imágenes (no indexable).
- `<h1>` ausente o múltiples `<h1>` en la misma página.
- URLs con parámetros dinámicos sin canonical (`?page=1`, `?sort=asc`).
- Contenido detrás de JavaScript sin SSR/SSG (no indexable por crawlers).
