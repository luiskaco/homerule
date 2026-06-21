---
name: ui-ux-pro-max
description: >
  Motor de diseño por industria. Genera sistema de diseño completo:
  estilo visual, paleta de colores, tipografía, patrones de layout y anti-patterns
  específicos para el tipo de producto. Usar al iniciar cualquier tarea de UI nueva.
  Soporta 15 stacks: React, Next.js, Vue, Nuxt, Svelte, Astro, Angular, Laravel,
  SwiftUI, Jetpack Compose, React Native, Flutter, HTML+Tailwind, shadcn/ui, Nuxt UI.
activation: auto — se activa cuando se construye UI nueva
tags: [ui, design-system, styles, colors, typography, landing-page, dashboard]
---

# UI UX Pro Max

Motor de razonamiento de diseño con:
- **67 estilos visuales** (Glassmorphism, Brutalism, Bento Grid, AI-Native, etc.)
- **161 reglas por industria** (SaaS, Healthcare, E-commerce, Fintech, etc.)
- **161 paletas de color** alineadas por tipo de producto
- **57 combinaciones tipográficas** con Google Fonts
- **99 UX Guidelines** + anti-patterns

## Cuándo activarla

Al iniciar cualquier tarea de UI nueva — antes de escribir una línea de código.
El agente debe generar el sistema de diseño primero, luego implementar.

## Flujo de uso

1. Identificar el tipo de producto (ej: "SaaS de analytics", "landing de spa")
2. La skill genera: Pattern + Style + Colors + Typography + Anti-patterns
3. Implementar con ese sistema de diseño como base

## Instalación

```bash
npm install -g uipro-cli
uipro init --ai antigravity
```

## Comando directo (design system generator)

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness" --design-system -p "Nombre del Proyecto"
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech banking" --design-system -f markdown
```

## Persistir sistema de diseño entre sesiones

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "SaaS dashboard" --design-system --persist -p "MyApp"
```

Genera `design-system/MASTER.md` + `design-system/pages/` para consistencia entre sesiones.
