---
name: wordpress-block-theming
description: >
  Desarrollo de themes de WordPress con Full Site Editing (FSE) — bloques,
  `theme.json`, block templates y block patterns.
  Usar al construir o modificar un theme de WordPress moderno (basado en
  bloques, no en PHP templates clásicos), o al configurar `theme.json`
  (paleta, tipografía, spacing).
source: automattic/wordpress-agent-skills
install: "npx skills add automattic/wordpress-agent-skills --skill wordpress-block-theming"
---

# WordPress Block Theming

Skill oficial de Automattic (la empresa detrás de WordPress.com y
WooCommerce) — pocas instalaciones en skills.sh todavía, pero es la fuente
más directa posible para convenciones de theming con bloques.

## Cuándo activarla

Al trabajar en un theme de WordPress basado en bloques (Full Site Editing):
`theme.json`, `templates/*.html`, `parts/*.html`, block patterns o bloques
custom — no aplica a themes clásicos basados solo en PHP (`index.php`,
`header.php`, etc.).

Complementa a `seo-audit` cuando el proyecto WordPress también necesita
diagnóstico de SEO — son capas distintas (theming vs. SEO), no se pisan.

## Instalación

```bash
npx skills add automattic/wordpress-agent-skills --skill wordpress-block-theming
```

## Flujo de uso

1. Configurar `theme.json` (paleta, tipografía, spacing, layout) antes de
   escribir templates — es la fuente de verdad de estilos en FSE.
2. Construir templates y template parts combinando bloques nativos y, si
   hace falta, bloques custom.
3. Verificar que el theme funcione tanto en el editor de sitio como en el
   frontend real antes de dar por terminado un cambio visual.
