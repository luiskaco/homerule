---
trigger: manual
description: Setup inicial o consulta de skills/herramientas disponibles y cuándo usar cada una
---

# Tools Reference

---

## 8. Herramientas Disponibles

### Skills de Diseño UI/UX

Activar según el momento de la tarea — no todas a la vez:

| Skill | Cuándo activarla |
|-------|-----------------|
| `frontend-design` | Al **iniciar** UI nueva, con o sin sistema de diseño ya definido (caso habitual en Orange Latam) |
| `impeccable` (polish) | Al **revisar** UI existente o antes de hacer PR — requiere que `frontend-design` ya haya corrido antes |
| `web-design-guidelines` | Al **auditar** estándares técnicos (a11y, forms, performance) contra Web Interface Guidelines de Vercel |
| `vercel-react-best-practices` | Al **escribir o revisar** componentes React/Next.js — 70 reglas de performance (waterfalls, memoización, bundle) |
| `vercel-composition-patterns` | Al **refactorizar** componentes con muchos props booleanos o al diseñar APIs de componentes reutilizables (shadcn/ui) |

**Regla para el agente:** nunca activar más de 2-3 a la vez. Elegir según el momento.

- Construyendo UI nueva (con o sin sistema de diseño definido) → `frontend-design`
- Revisando algo existente → `impeccable` + `web-design-guidelines`
- Escribiendo/revisando componentes React → `vercel-react-best-practices`
- Componente con muchos props booleanos o que se repite en varios proyectos → `vercel-composition-patterns`

Instalación:

```bash
# frontend-design (Anthropic)
npx skills add https://github.com/anthropics/skills --skill frontend-design

# web-design-guidelines
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines

# vercel-react-best-practices
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices

# vercel-composition-patterns
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns

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