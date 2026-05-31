---
name: nodejs
description: >
  Mejores prácticas de Node.js — se activa automáticamente al trabajar con
  archivos .js o .ts en el backend. Cubre event loop, async error handling,
  streams y patrones modernos. Del core team de Node.js.
activation: auto
glob: "**/*.{js,ts}"
tags: [nodejs, javascript, typescript, async, streams, event-loop, backend]
source: mcollina/skills
---

# Node.js Best Practices

Skill de Matteo Collina — miembro del core team de Node.js y autor de Fastify.

## Instalación

```bash
npx skills add mcollina/skills --skill nodejs
```

## Qué cubre

- **Event loop patterns** — no bloquear el event loop, cuándo usar `setImmediate` vs `process.nextTick`
- **Async error handling** — `try/catch` con async/await, unhandled rejections, error propagation
- **Stream processing** — cuándo usar streams vs buffers, backpressure
- **Node.js test runner** — tests nativos sin dependencias externas
- **Common pitfalls** — memory leaks, callback hell patterns a evitar
- **Modern patterns** — ES Modules, top-level await, patterns de Node.js 20+

## Cuándo activarla manualmente

```
/nodejs  ← aplica mejores prácticas al código actual
"Review this Node.js service for event loop issues"
"Check this async code for common pitfalls"
```

## Complementa con

- `fastify` → si usas Fastify como framework HTTP
- `stack-conventions` → convenciones del proyecto
- `security` rule → validación OWASP en APIs Node.js
