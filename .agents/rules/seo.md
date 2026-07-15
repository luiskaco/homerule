---
trigger: model_decision
description: Activar al trabajar meta tags, Open Graph, structured data, canonical, sitemap, o al diagnosticar indexación, ranking y Core Web Vitals como factor SEO
---

# SEO Técnico

> Este archivo es la fuente de verdad de SEO del proyecto. Skills externas de
> auditoría SEO (ej. `seo-audit` de `coreyhaines31/marketingskills`) sirven
> para **diagnóstico** — detectar qué está roto — pero los umbrales y specs
> concretos de acá (Lighthouse ≥90/≥80, OG 1200×630px, largo de title/description,
> etc.) mandan sobre cualquier sugerencia genérica que la skill proponga.

Complementa a `ui-ux.md` — accesibilidad, performance frontend y skeletons viven
ahí y varias de sus reglas tienen impacto SEO directo (ver referencias abajo).

## Meta Tags Obligatorios (toda página)

- `<title>` único y descriptivo — 50–60 caracteres máximo.
- `<meta name="description">` — 120–160 caracteres, incluir keyword principal.
- `<link rel="canonical">` siempre presente, incluso en la página principal.
- `lang` en `<html>` con el idioma correcto (`es`, `en`, etc.).
- `<meta name="robots">` explícito en páginas que no deben indexarse (`noindex, nofollow`).

## Open Graph y Twitter Cards

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

## Estructura Semántica para SEO

- Un solo `<h1>` por página — describe el tema principal.
- Jerarquía `<h1>`–`<h6>` sin saltos — refuerza la regla de accesibilidad de
  `ui-ux.md § Accesibilidad`.
- `alt` descriptivo en todas las imágenes con contenido (no decorativas).
- URLs en kebab-case, descriptivas, sin parámetros innecesarios.
- `<a>` con texto descriptivo — nunca "click aquí" o "ver más" sin contexto.

## SEO Multi-idioma

- Ruteo de idioma explícito en la URL (`/es/`, `/pt/`) — nunca solo por
  cookie/header sin reflejarlo en la URL.
- Cada versión de idioma con su propio `<link rel="alternate" hreflang="...">`
  y el `lang` correcto en `<html>`.
- El resto de las reglas de traducción vive en `ui-ux.md § i18n`.

## Structured Data (Schema.org)

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

## Core Web Vitals como Ranking Factor

Los targets de performance de `ui-ux.md § Performance Frontend` aplican
directamente al SEO:

- **LCP** < 2.5s (Largest Contentful Paint)
- **CLS** < 0.1 (Cumulative Layout Shift) — ya cubierto por `ui-ux.md § Skeletons`
- **INP** < 200ms (Interaction to Next Paint)

## Auditoría en CI

- Lighthouse SEO score ≥ 90 antes de merge a `main`.
- Lighthouse Performance score ≥ 80.
- Herramienta recomendada: `@lhci/cli` (Lighthouse CI).

```bash
# Instalar y correr en CI
npm install -g @lhci/cli
lhci autorun
```

## Anti-patterns SEO — Nunca

- Mismo `<title>` o `<meta description>` en múltiples páginas.
- Páginas importantes con `noindex` accidentalmente.
- Imágenes sin `alt` con contenido relevante.
- Texto importante dentro de imágenes (no indexable).
- `<h1>` ausente o múltiples `<h1>` en la misma página.
- URLs con parámetros dinámicos sin canonical (`?page=1`, `?sort=asc`).
- Contenido detrás de JavaScript sin SSR/SSG (no indexable por crawlers).
