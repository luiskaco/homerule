---
description: >
  Reglas de UI/UX, diseño, accesibilidad y performance frontend.
  Activar cuando se trabaje en componentes, vistas, layouts, formularios,
  animaciones, diseño responsive o auditoría visual.
activation: manual
tags: [ui, ux, design, frontend, accessibility, forms, animation]
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

## Skills de Diseño Disponibles

```bash
# Instalar una vez por proyecto
npx skills add https://github.com/Leonxlnx/taste-skill
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
```

Jerarquía si hay conflicto: Vercel Guidelines > impeccable > taste-skill
