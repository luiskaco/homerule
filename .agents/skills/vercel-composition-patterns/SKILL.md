---
name: vercel-composition-patterns
description: >
  Patrones de composición de componentes React/Next.js — refactorizar
  componentes con muchos props booleanos, diseñar APIs de componentes
  reutilizables al estilo shadcn/ui (slots, compound components, render
  props en vez de flags).
  Usar cuando se necesite refactorizar un componente que acumuló muchos
  props `is*`/`show*`, o al diseñar la API pública de un componente
  reutilizable.
source: vercel-labs/agent-skills
install: "npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns"
---

# Vercel Composition Patterns

Skill oficial de Vercel Engineering — mismo repo que `vercel-react-best-practices`
y `web-design-guidelines`, pero enfocada en **diseño de API de componentes**
en vez de performance.

## Cuándo activarla

Al notar que un componente acumula muchos props booleanos (`isOpen`,
`showFooter`, `variant`, `size`, ...) que empiezan a combinarse de formas
inválidas, o al diseñar desde cero la API pública de un componente
reutilizable (pensado para usarse en más de un lugar del proyecto).

Complementa a `frontend-design` (dirección estética) y
`vercel-react-best-practices` (performance) — esta se enfoca en la forma de
la API del componente, no en cómo se ve ni en qué tan rápido renderiza.

## Instalación

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns
```

## Flujo de uso

1. Identificar el componente con exceso de props booleanos o combinaciones
   inválidas entre props.
2. Aplicar el patrón de composición sugerido (compound components, slots vía
   `children`, render props) en vez de agregar un flag más.
3. Verificar que la nueva API sea imposible de usar de forma inválida en
   TypeScript (estados mutuamente excluyentes tipados, no solo documentados).
