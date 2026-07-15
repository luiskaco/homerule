# Core Rules — Global

---

## 0. Modo de Comunicación por Defecto

Caveman lite activo siempre. Drop filler, hedging, pleasantries. Mantener gramática y precisión técnica.

**Niveles disponibles:** `/caveman none|lite|full|ultra`

| Nivel | Comportamiento |
|-------|---------------|
| `none` | Modo normal — sin compresión. Respuestas completas y fluidas |
| `lite` | **Default.** Drop filler y hedging. Gramática intacta |
| `full` | Fragmentos OK, sinónimos cortos, sin artículos |
| `ultra` | Máxima compresión — abreviaciones, flechas de causalidad |

**Auto-detección:** Si la conversación es planificación, arquitectura, revisión de decisiones o análisis — sugerir `/caveman none` una vez. No cambiar automáticamente.

---

## 1. Regla de Oro: Planificar Antes de Actuar

**NUNCA generar código o modificar archivos sin pasar primero por estos 3 pasos:**

1. **Analizar:** Desglosa el problema, identifica impactos colaterales, propone solución conceptualmente.
2. **Validar:** Detente y pregunta si hay ambigüedad en alguna de estas condiciones:
   - Más de una arquitectura válida con trade-offs distintos
   - La tarea afecta más de 3 archivos existentes
   - Hay decisiones irreversibles (migraciones, cambios de schema, eliminación de datos)
3. **Ejecutar:** Solo cuando la estrategia esté clara y aprobada.

---

## 2. Principios

- Sistemas seguros, escalables, mantenibles y listos para producción.
- Priorizar: claridad, modularidad, simplicidad, reutilización.
- Evitar: deuda técnica, hacks rápidos, sobreingeniería.
- Código siempre en inglés. Respuestas en el idioma del usuario.

---

## 3. Stack Base

| Capa | Tecnología |
|------|-----------|
| Frontend | React / Next.js / Vue / Vanilla JS |
| Backend | Node.js / Python (FastAPI) |
| CMS | WordPress |
| Base de datos | PostgreSQL / MySQL / MongoDB / Supabase |
| Estilos | Tailwind CSS / CSS puro |
| Runtime | Node.js 20+ / Python 3.11+ |

---

## 4. Naming & Git

**Naming:** `kebab-case` archivos · `camelCase` variables · `PascalCase` clases · `UPPER_SNAKE_CASE` constantes · `/api/v1/recursos` endpoints

**Commits:** Conventional Commits — `feat` / `fix` / `refactor` / `docs` / `chore` / `perf`

**Tasks:** Cuando el usuario mencione modificaciones, cambios o nuevas funcionalidades — actualizar el archivo de tareas activo del proyecto (`06_TASKS.md` o equivalente) antes de codificar.

---

## 5. Documentación del Proyecto `/docs`

| Archivo | Propósito |
|---------|-----------|
| `01_PROJECT_PRD.md` | Requisitos de producto |
| `02_SDD.md` | Diseño del sistema |
| `03_SYSTEM_SPEC.md` | Especificaciones técnicas |
| `04_DATA_MODEL.md` | Esquemas y entidades |
| `05_ARCHITECTURE.md` | Decisiones arquitectónicas |
| `06_TASKS.md` | Backlog activo |
| `07_DECISIONS.md` | ADRs |
| `08_CHANGELOG.md` | Historial de versiones |

Actualizar el archivo correspondiente al completar cada tarea.

**⚠️ Excepción:** Si existe un archivo `00_PROJECT_START*.md` en el proyecto, ese archivo define la estructura de documentación activa para esa sesión — rutas, nombres y reglas de actualización. Tiene prioridad sobre esta tabla.

---

## 6. Jerarquía de Reglas

1. Este archivo de memoria del proyecto — máxima prioridad
2. Skills/rules de convenciones (`security`, `architecture`, `ui-ux`, `seo`, `pwa`, `operations`, `cms`, `database`, `stack-conventions`) — workspace, override local
3. Comandos/workflows (`/new-feature`, `/bug-fix`, `/security-audit`, `/deploy-checklist`, `/session-close`, `/tools-reference`) — checklists operativos que se ejecutan en un momento puntual; cuando un comando resume una convención que también vive en una skill/rule, esa skill/rule es la fuente de verdad si hay discrepancia
4. Resto de skills según contexto del proyecto

---

## 7. Comandos Disponibles

Invocar con `/` en el chat:

| Comando | Cuándo |
|---------|--------|
| `/new-feature` | Antes de iniciar cualquier tarea nueva |
| `/bug-fix` | Cuando algo está roto — identifica causa raíz antes de codificar |
| `/session-close` | Al terminar el día o una tarea — actualiza docs y genera commit |
| `/security-audit` | Antes de subir features con auth, APIs o datos sensibles |
| `/deploy-checklist` | Antes de merge a main o deploy a producción |
| `/tools-reference` | Setup inicial o cuando necesites ver skills y herramientas disponibles |
| `/caveman none\|lite\|full\|ultra` | Cambiar nivel de compresión de respuestas |

---

## 8. Auto-revisión Interna

Aplicar solo en tareas que generen, modifiquen o revisen código — omitir en consultas informativas.

**⚠️ Si el usuario adjunta o menciona un informe de auditoría externo (revisión manual, otro agente, etc.) — el Inspector no ejecuta. La auditoría ya fue realizada. Solo implementar las correcciones indicadas.**

Antes de entregar cualquier código, revisar internamente con 3 pasadas:

- **🎨 Frontend:** presentación — mobile-first, 5 estados de UI, accesibilidad, estética
- **⚙️ Backend:** lógica, endpoints, datos — seguridad, modularidad, validación
- **🔍 Inspector:** audita contra las skills/rules de seguridad, ui-ux y arquitectura — si detecta problema crítico, bloquea entrega y corrige primero

**Reporte al usuario:**

```
🎨 Frontend: [1 línea]
⚙️ Backend: [1 línea]
🔍 Inspector: ✅  — o descripción del issue corregido
```

Inspector solo reporta si encontró algo. Si todo correcto: solo `✅`.

> Esto es una **auto-revisión inline** en el mismo turno, no delegación. Para
> revisión **delegada** en contexto aislado, invocá los subagentes reales de
> `.claude/agents/` (`code-reviewer`, `security-auditor`) — corren en su propia
> ventana y no consumen el contexto principal.

<!-- codebase-memory-mcp:start -->
# Codebase Knowledge Graph (codebase-memory-mcp)

This project uses codebase-memory-mcp to maintain a knowledge graph of the codebase.
ALWAYS prefer MCP graph tools over grep/glob/file-search for code discovery.

## Priority Order
1. `search_graph` — find functions, classes, routes, variables by pattern
2. `trace_path` — trace who calls a function or what it calls
3. `get_code_snippet` — read specific function/class source code
4. `query_graph` — run Cypher queries for complex patterns
5. `get_architecture` — high-level project summary

## When to fall back to grep/glob
- Searching for string literals, error messages, config values
- Searching non-code files (Dockerfiles, shell scripts, configs)
- When MCP tools return insufficient results

## Examples
- Find a handler: `search_graph(name_pattern=".*OrderHandler.*")`
- Who calls it: `trace_path(function_name="OrderHandler", direction="inbound")`
- Read source: `get_code_snippet(qualified_name="pkg/orders.OrderHandler")`
<!-- codebase-memory-mcp:end -->
