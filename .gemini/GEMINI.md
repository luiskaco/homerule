# Antigravity Rules — Global

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
| Frontend | React / Next.js / Vanilla JS |
| Backend | Node.js / Python (FastAPI) |
| CMS | WordPress |
| Estilos | Tailwind CSS / CSS puro |
| Runtime | Node.js 20+ / Python 3.11+ |

---

## 4. Naming & Git

**Naming:** `kebab-case` archivos · `camelCase` variables · `PascalCase` clases · `UPPER_SNAKE_CASE` constantes · `/api/v1/recursos` endpoints

**Commits:** Conventional Commits — `feat` / `fix` / `refactor` / `docs` / `chore` / `perf`

**Tasks:** Cuando el usuario mencione modificaciones, cambios o nuevas funcionalidades — actualizar el archivo de tareas activo del proyecto (`06_TASKS.md` o equivalente) antes de codificar.

---

## 5. Documentación del Proyecto `/docs`

8 archivos numerados (`01_PROJECT_PRD.md` → `08_CHANGELOG.md`: PRD, diseño de
sistema, specs técnicas, modelo de datos, arquitectura, tasks, ADRs, changelog).
Actualizar el archivo correspondiente al completar cada tarea.

**⚠️ Excepción:** Si existe un archivo `00_GEMINI_START*.md` en el proyecto, ese archivo define la estructura de documentación activa para esa sesión — rutas, nombres y reglas de actualización. Tiene prioridad sobre esta lista.

---

## 6. Jerarquía de Reglas

1. Este archivo `GEMINI.md` — máxima prioridad
2. `.agents/rules/` (`security.md`, `architecture.md`, `ui-ux.md`, `operations.md`, `cms.md`, `stack-conventions.md`) — workspace, override local
3. Workflows (`/new-feature`, `/bug-fix`, `/security-audit`, `/deploy-checklist`, `/session-close`, `/tools-reference`) — checklists operativos que se ejecutan en un momento puntual; cuando un workflow resume una regla que también vive en `.agents/rules/`, el archivo de `.agents/rules/` es la fuente de verdad si hay discrepancia
4. Skills según contexto del proyecto

---

## 7. Workflows Disponibles

`/new-feature` `/bug-fix` `/session-close` `/security-audit` `/deploy-checklist` `/tools-reference` — detalle de cuándo usar cada uno en `tools-reference.md` o el README del sistema.

`/caveman none|lite|full|ultra` — cambiar nivel de compresión de respuestas (ver § 0).

---

## 8. Subagentes Internos

Aplicar solo en tareas que generen, modifiquen o revisen código — omitir en consultas informativas.

**⚠️ Si el usuario adjunta o menciona un informe de auditoría externo (Claude, revisión manual, etc.) — el Inspector no ejecuta. La auditoría ya fue realizada. Solo implementar las correcciones indicadas.**

Antes de entregar cualquier código, procesar internamente con 3 subagentes:

- **🎨 Frontend:** presentación — mobile-first, 5 estados de UI, accesibilidad, estética
- **⚙️ Backend:** lógica, endpoints, datos — seguridad, modularidad, validación
- **🔍 Inspector:** audita contra `security.md`, `ui-ux.md` y `architecture.md` — si detecta problema crítico, bloquea entrega y corrige primero

**Reporte al usuario:**
```
🎨 Frontend: [1 línea]
⚙️ Backend: [1 línea]
🔍 Inspector: ✅  — o descripción del issue corregido
```

Inspector solo reporta si encontró algo. Si todo correcto: solo `✅`.
