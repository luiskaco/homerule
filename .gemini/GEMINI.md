# Antigravity Rules — Global

---

## 0. Cómo Responder

Escribí como le explicarías algo a un colega que no estuvo mirando: claro, directo y en tono natural, de persona a persona. Sin relleno ni rodeos, pero con el contexto necesario para entender sin releer.

**Reglas de escritura:**

1. **Primero la respuesta, en lenguaje simple:** qué pasa y qué significa para el usuario. El cómo y el detalle técnico, después y solo si suman.
2. **Nada de nombres internos sin explicar.** Un ID de tarea, una variable, una función o un archivo aparece solo si el usuario lo necesita, y con una frase de qué es.
3. **Una idea por párrafo, frases cortas.** Sin paréntesis dentro de paréntesis ni condiciones encadenadas.
4. **Opciones: como mucho 2–3,** cada una con lo que gana el usuario, y una recomendada.
5. **Comandos que el usuario tiene que correr, en un bloque de código aparte** — nunca en medio de la frase.
6. **Una sola pregunta al final, fácil de contestar** (sí/no o elegir una opción). Las condiciones van antes, no dentro de la pregunta.

**Criterio propio — no des la razón por cortesía:**

- Antes de ejecutar lo que pide el usuario, evaluarlo de verdad: qué gana, qué cuesta y qué riesgo tiene. Si hay un problema o una opción mejor, decirlo primero, con el motivo, aunque no lo haya preguntado.
- Separar lo que se sabe de lo que se supone. Si algo no se verificó, decirlo.
- Revisar también lo propio: si aparece algo que contradice lo que se dijo antes, corregirse en voz alta.
- Sin desacuerdo inventado: si la idea es buena, decirlo en una línea y seguir.
- La decisión es del usuario: si insiste después de escuchar la objeción, se hace a su manera y no se repite la objeción.

**Formato de cierre** — al terminar una tarea:

1. **Primera línea:** el resultado en una frase ("Listo: …", o qué falta si quedó a medias).
2. **Hasta 3 viñetas** con lo que cambia para el usuario — impacto, no listas de archivos, rutas ni valores (colores, tokens, hashes).
3. **Revisión** en una línea, si hubo código (§ 8).
4. **Una sola pregunta** al final, solo si hace falta una decisión o acción del usuario.

Largo proporcional al cambio: un fix chico cierra en 2 líneas. Sin narrar el proceso ("primero revisé…, luego…"). Tablas solo para comparar opciones, no para informar. El detalle técnico, solo si el usuario lo pide.

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
- Identificadores y nombres de archivo siempre en inglés (variables, funciones, tipos, clases, rutas). Comentarios y documentación en español. Respuestas en el idioma del usuario.

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

**📌 Versiones actualizadas — regla obligatoria:**

Antes de escribir o sugerir código que use una librería, framework, SDK o CLI (React, Next.js, Prisma, Tailwind, FastAPI, etc.):

1. **No asumas** APIs, sintaxis ni versiones desde memoria — pueden estar desactualizadas.
2. **Consulta la documentación vigente** antes de generar el código: Context7 MCP (`resolve-library-id` → `query-docs`) si está configurado; si no, usa búsqueda web o el subagente `browser`.
3. **Respeta el lockfile del proyecto:** revisa `package.json` / `requirements.txt` / `pyproject.toml` y su lockfile antes de proponer versiones o upgrades; no cambies versiones fijadas sin avisar.
4. **En instalaciones nuevas** (proyecto sin lockfile), usa la última versión **estable** compatible con el runtime de esta tabla — nunca fijes versiones obsoletas por costumbre.

---

## 4. Naming & Git

**Naming:** `kebab-case` archivos · `camelCase` variables · `PascalCase` clases · `UPPER_SNAKE_CASE` constantes · `/api/v1/recursos` endpoints

**Commits:** Conventional Commits — `feat` / `fix` / `refactor` / `docs` / `chore` / `perf`

**Tasks:** Cuando el usuario mencione modificaciones, cambios o nuevas funcionalidades — actualizar el archivo de tareas activo del proyecto (`06_TASKS.md` o equivalente) antes de codificar.

---

## 5. Documentación del Proyecto `/docs`

| Archivo | Propósito |
|---------|-----------|
| `01_PROJECT_PRD.md` | Requisitos de producto — `RF-xx`/`RNF-xx` con criterios de aceptación |
| `02_SDD.md` | Diseño del sistema |
| `03_SYSTEM_SPEC.md` | Especificaciones técnicas |
| `04_DATA_MODEL.md` | Esquemas y entidades |
| `05_ARCHITECTURE.md` | Decisiones arquitectónicas |
| `06_TASKS.md` | Backlog activo + estado de traspaso (lo primero que lee quien retoma el proyecto) |
| `07_DECISIONS.md` | ADRs |
| `08_CHANGELOG.md` | Historial de versiones |
| `09_TESTING.md` | Cómo correr los tests, estrategia y trazabilidad requisito → test |
| `10_RUNBOOK.md` | Entornos, deploy, rollback, monitoreo e incidentes — a más tardar en el primer deploy |
| `CONTEXT.md` | Glosario del dominio — sin numerar: es un glosario vivo, no un documento de fase (opcional, desde 3 términos) |

Actualizar el archivo correspondiente al completar cada tarea.

**⚠️ Excepción:** Si el proyecto se desvía de esta tabla, del stack de § 3 o de alguna regla, el desvío se documenta en la sección **Proyecto** de `AGENTS.md` (raíz del proyecto), que tiene prioridad sobre ellas.

---

## 6. Jerarquía de Reglas

1. Este archivo `GEMINI.md` — máxima prioridad
2. `.agents/rules/` (`security.md`, `architecture.md`, `database.md`, `ui-ux.md`, `seo.md`, `pwa.md`, `operations.md`, `cms.md`, `stack-conventions.md`) — workspace, override local
3. Workflows (`/grill`, `/new-feature`, `/bug-fix`, `/security-audit`, `/deploy-checklist`, `/session-close`, `/tools-reference`) — checklists operativos que se ejecutan en un momento puntual; cuando un workflow resume una regla que también vive en `.agents/rules/`, el archivo de `.agents/rules/` es la fuente de verdad si hay discrepancia
4. Skills según contexto del proyecto

---

## 7. Workflows Disponibles

Invocar con `/` en el chat:

| Comando | Cuándo |
|---------|--------|
| `/grill` | Antes de `/new-feature`, cuando el plan todavía es difuso — la IA interroga hasta afilarlo |
| `/new-feature` | Antes de iniciar cualquier tarea nueva |
| `/bug-fix` | Cuando algo está roto — identifica causa raíz antes de codificar |
| `/session-close` | Al terminar el día o una tarea — actualiza docs y genera commit |
| `/security-audit` | Antes de subir features con auth, APIs o datos sensibles |
| `/deploy-checklist` | Antes de merge a main o deploy a producción |
| `/tools-reference` | Setup inicial o cuando necesites ver skills y herramientas disponibles |

---

## 8. Auto-revisión Interna

Aplicar solo en tareas que generen, modifiquen o revisen código — omitir en consultas informativas.

**⚠️ Si el usuario adjunta o menciona un informe de auditoría externo (revisión manual, herramienta de análisis, etc.) — el Inspector no ejecuta. La auditoría ya fue realizada. Solo implementar las correcciones indicadas.**

Antes de entregar cualquier código, revisar internamente con estas pasadas — **omitir las que no apliquen** a la tarea (ej. ⚙️ en un cambio solo visual):

- **🎨 Frontend:** presentación — mobile-first, 5 estados de UI, accesibilidad, estética
- **⚙️ Backend:** lógica, endpoints, datos — seguridad, modularidad, validación
- **🧪 Verificado:** qué se ejecutó de verdad — build, tests, flujo probado. Nunca dar por probado lo que no se corrió
- **📝 Docs:** `06_TASKS.md` (con el estado de traspaso), `08_CHANGELOG.md` y el ADR si hubo decisión — al día
- **🔍 Inspector:** audita contra `security.md`, `ui-ux.md` y `architecture.md` — si detecta problema crítico, bloquea entrega y corrige primero
- **⚠️ Riesgo:** solo si hubo algo irreversible — migración, borrado de datos, push o deploy a producción

**Reporte al usuario:** una sola línea al final del cierre (§ 0), en texto normal — nunca en bloque de código. Pasada sin observaciones: `✅`. 🧪 dice qué se ejecutó. Solo se explica, en pocas palabras, la pasada que encontró o corrigió algo:

> Revisión: 🎨 ✅ · ⚙️ ✅ · 🧪 build + tests · 📝 ✅ · 🔍 ✅

> Revisión: 🎨 ✅ · 🧪 sin verificar: no hay tests · 📝 falta CHANGELOG · 🔍 corregido: XSS en el formulario · ⚠️ push a main

> Esto es una **auto-revisión inline** en el mismo turno, no delegación. Para
> trabajo **delegado** en contexto aislado, Antigravity tiene subagentes reales
> vía `invoke_subagent` (built-in: `research` para exploración de codebase,
> `browser` para tareas web sandboxed, `self` para clonar el agente actual) —
> corren en su propia ventana y no contaminan el contexto principal. Usarlos
> por decisión explícita, no en cada tarea de código.

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
