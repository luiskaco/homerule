---
name: react-best-practices
description: >
  Guía de performance y mejores prácticas para React y Next.js.
  Se activa automáticamente al trabajar con archivos .tsx, .jsx o componentes React.
  Cubre 40+ reglas priorizadas por impacto: waterfalls → bundle size → re-renders.
activation: auto
glob: "**/*.{tsx,jsx}"
tags: [react, nextjs, performance, hooks, server-components, bundle]
source: vercel-labs/agent-skills
---

# React Best Practices

Skill oficial de Vercel Engineering. 40+ reglas en 8 categorías priorizadas por impacto real en Core Web Vitals.

## Instalación

```bash
npx skills add vercel-labs/agent-skills --skill react-best-practices
```

## Prioridad de reglas (orden de impacto)

1. 🔴 **Eliminar async waterfalls** — cada `await` secuencial agrega latencia completa de red
2. 🔴 **Reducir bundle size** — lazy loading, code splitting, tree shaking
3. 🟠 **Server-side performance** — Server Components, SSR, SSG correctamente
4. 🟠 **Client-side data fetching** — evitar fetch en useEffect, usar SWR/React Query
5. 🟡 **Re-render optimization** — `memo`, `useMemo`, `useCallback` donde realmente importa
6. 🟡 **Rendering performance** — virtualización, `Suspense`, streaming
7. ⚪ **Advanced patterns** — composición, compound components
8. ⚪ **JS micro-optimizations** — últimas en prioridad

## Cuándo activarla manualmente

```
/react-best-practices  ← audita el componente actual
"Review my React performance"  ← trigger en lenguaje natural
"Audit this component for waterfalls"
```

## Complementa con

- `ui-ux-pro-max` → sistema de diseño visual
- `web-design-guidelines` → estándares de accesibilidad
- `stack-conventions` → convenciones del proyecto
