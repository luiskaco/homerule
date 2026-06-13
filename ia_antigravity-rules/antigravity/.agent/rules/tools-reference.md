---
description: >
  Referencia de skills de diseño y MCP Context7.
  Activar cuando se necesite instalar herramientas, consultar qué skill usar,
  o configurar Context7 en un proyecto nuevo.
activation: manual
tags: [skills, context7, tools, setup]
---

# Tools Reference

---

## 8. Herramientas Disponibles

### Skills de Diseño UI/UX

Activar según el momento de la tarea — no todas a la vez:

| Skill | Cuándo activarla |
|-------|-----------------|
| `ui-ux-pro-max` | Al **iniciar** cualquier tarea de UI nueva — genera sistema de diseño completo |
| `impeccable` | Al **revisar** UI existente o antes de hacer PR |
| `web-design-guidelines` | Al **auditar** estándares técnicos (a11y, forms, performance) |

**Regla para el agente:** nunca activar las 3 a la vez. Elegir según el momento.
- Construyendo algo nuevo → `ui-ux-pro-max` primero
- Revisando algo existente → `impeccable` + `web-design-guidelines`

Instalación:
```bash
npm install -g uipro-cli && uipro init --ai antigravity  # ui-ux-pro-max
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
# impeccable: ver instrucciones en impeccable.style
```

---

### MCP: Context7

Context7 está instalado como MCP. Provee documentación actualizada de librerías en tiempo real.

**Usar siempre antes de implementar con cualquier librería** — evita usar APIs desactualizadas.

Cuándo usarlo:
- Al trabajar con métodos o APIs que pueden haber cambiado entre versiones
- Al implementar patrones complejos (auth, SSR, server actions, migrations, etc.)
- Ante cualquier duda sobre la API correcta de una librería

Formato:
```
use context7 to resolve <librería> — <query específica>
```

Ejemplos:
```
use context7 to resolve next.js — server actions with form validation
use context7 to resolve prisma — upsert with nested relations
use context7 to resolve tailwindcss — responsive grid v4
use context7 to resolve react-query — optimistic updates
```

> Plan gratuito: 1,000 llamadas/mes. Usar con criterio — solo cuando la documentación
> es necesaria, no en cada línea de código.
