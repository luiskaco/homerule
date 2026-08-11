---
name: pwa
description: "Activar solo si el proyecto es una PWA — manifest, service worker, estrategias de cache, estado offline, update flow o installability"
---

# PWA

Aplica **solo si el proyecto es una PWA** (manifest + service worker). Sigue
siendo web — todo lo de `ui-ux.md` (5 estados, a11y, performance) y `seo.md`
aplica igual; esto es una capa adicional, no un reemplazo.

## Manifest

- `manifest.json` con `name`, `short_name`, `icons` (mínimo 192×192 y 512×512,
  incluir `purpose: "maskable"`), `theme_color`, `background_color`.
- `display: "standalone"` (o `"fullscreen"` si el caso de uso lo justifica).
- `start_url` explícito — nunca depender del default del navegador.

## Service Worker

- Estrategia de cache por tipo de recurso, nunca una sola global:
  - `cache-first` para assets estáticos versionados (JS/CSS con hash, fonts).
  - `network-first` para HTML y datos que cambian frecuentemente.
  - `stale-while-revalidate` para imágenes y recursos semi-estáticos.
- Versionar el cache (`CACHE_NAME = "app-v${BUILD_ID}"`) — invalidar caches
  viejos en el evento `activate`.
- Nunca cachear responses de error (4xx/5xx) ni endpoints con datos sensibles/auth.

## Estado Offline

- `offline` es el **6to estado obligatorio de UI** en proyectos PWA — se suma a
  los 5 de `ui-ux.md § 5 Estados Obligatorios de UI`. Nunca pantalla en blanco
  sin conexión: mostrar qué está disponible desde cache y qué requiere red.
- Indicador visual de estado de conexión si la app depende de datos en vivo.
- Acciones que requieren red (submits, mutaciones) deshabilitadas o encoladas
  con feedback claro — nunca fallar en silencio.

## Update Flow

- Detectar SW nuevo esperando (`waiting` state) y avisar al usuario —
  nunca actualizar de forma forzada sin aviso (pierde estado no guardado).
- Botón/banner "Nueva versión disponible" que dispara `skipWaiting()` +
  reload solo con acción explícita del usuario.

## Auditoría

- Lighthouse PWA score ≥ 90 antes de merge a `main` (mismo criterio que
  SEO/Performance en `seo.md § Auditoría en CI`).
- Verificar installability: HTTPS, manifest válido, SW registrado y activo.
