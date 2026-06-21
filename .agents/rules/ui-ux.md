---
trigger: model_decision
description: Activar al construir o revisar interfaces, componentes visuales, formularios, estados de carga/error, accesibilidad, o meta tags/SEO de páginas
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

---

## Skills de Diseño — Cuándo Usar Cada Una

| Skill | Momento | Qué hace |
|-------|---------|----------|
| `ui-ux-pro-max` | Al **iniciar** una UI nueva | Genera sistema de diseño: estilo, paleta, tipografía por industria |
| `impeccable` | Al **revisar** UI existente | Audita, pule y critica con 23 comandos |
| `web-design-guidelines` | Al **auditar** estándares | Verifica a11y, forms, performance técnica |

**Nunca activar las 3 a la vez.** Elegir según el momento de la tarea.

### Jerarquía si hay conflicto

1. `web-design-guidelines` — estándares técnicos (a11y, WCAG, forms)
2. `ui-ux-pro-max` — sistema de diseño por industria
3. `impeccable` — vocabulario y auditoría de diseño

### Instalación

```bash
npm install -g uipro-cli && uipro init --ai antigravity
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
# impeccable: ver instrucciones en impeccable.style
```

---

## SEO Técnico

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
