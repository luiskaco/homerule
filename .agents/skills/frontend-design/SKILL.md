---
name: frontend-design
description: >
  Dirección estética intencional al construir UI nueva o rediseñar una existente.
  Ayuda con tipografía, dirección visual y decisiones que evitan que la interfaz
  se vea como un default genérico de framework ("AI slop").
  Usar al iniciar cualquier UI nueva en un proyecto que ya tiene sistema de
  diseño definido (brief de marca, paleta, tipografía) — caso habitual en
  Orange Latam.
  Instalar con: npx skills add https://github.com/anthropics/skills --skill frontend-design
---

# Frontend Design (Anthropic)

Skill oficial de Anthropic — parte del repo [anthropics/skills](https://github.com/anthropics/skills),
categoría "Example Skills".

## Cuándo activarla

Al **iniciar** una UI nueva en un proyecto que ya tiene sistema de diseño
definido. Si el proyecto **no** tiene sistema de diseño todavía, usar
`ui-ux-pro-max` primero para generarlo (ver nota de seguridad en su
[SKILL.md](../ui-ux-pro-max/SKILL.md)) — `frontend-design` no genera un
sistema de diseño desde cero, refina decisiones estéticas dentro de uno
ya existente o semi-definido.

Combina con [`impeccable`](../impeccable/SKILL.md) para el pase de pulido
antes de PR: `frontend-design` primero (dirección estética), `impeccable`
después (auditoría técnica + polish).

## Instalación

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
```

Instala a nivel de proyecto (usa `-g` para instalarla a nivel de usuario y
que quede disponible en todos los proyectos). En Claude Code/Claude.ai
puede estar disponible sin este paso según el entorno — verificar con
`npx skills list` antes de reinstalar.

## Flujo de uso

1. Definir o confirmar el sistema de diseño del proyecto (marca, paleta,
   tipografía) — si no existe, generarlo con `ui-ux-pro-max` antes.
2. Invocar la skill al construir la UI nueva: guía decisiones de
   tipografía, jerarquía visual y dirección estética dentro de ese sistema.
3. Antes de PR, pasar por `impeccable` (`polish`, `harden`) para el
   pulido final y auditoría de edge cases.
