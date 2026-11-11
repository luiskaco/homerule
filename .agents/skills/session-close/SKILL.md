---
name: session-close
description: "Al terminar el día o una tarea — verifica docs, código y genera commit sugerido"
metadata:
  kind: workflow
---

# Workflow: Cierre de Sesión

# Invocar con: /session-close

Al ejecutar este workflow seguir estos pasos EN ORDEN:

**PASO 1 — ACTUALIZAR DOCS (antes de mostrar el checklist)**
Revisar qué cambió en la sesión y actualizar físicamente cada doc relevante en `/docs`.
NO limitarse a reportar — escribir los cambios en el archivo correspondiente.
Si un doc tiene cambios pendientes marcados como `⚠️ pendiente`, resolverlos ahora.

**PASO 2 — EMITIR EL BLOQUE DE CIERRE**

---

## ✅ Cierre de Sesión

### Docs actualizados

> `02_TASKS.md` es **obligatorio**: la tarea cerrada se borra de ahí y deja una
> línea en `04_CHANGELOG.md`. Cada dato va en un solo lugar: el avance y el
> detalle técnico, en el commit.

- [ ] 02_TASKS.md      — **reescribir "Dónde quedó"** (estado, próximo paso, bloqueos) y **borrar las tareas cerradas**
- [ ] 04_CHANGELOG.md  — una línea arriba por cada tarea cerrada, o "no aplica"
- [ ] 03_DECISIONS.md  — ADR nuevo y su línea en el índice, o "no aplica"
- [ ] 01_PRD.md        — [motivo o "no aplica"]
- [ ] Opcionales que existan (`ARCHITECTURE`, `DATA_MODEL`, `TESTING`, `RUNBOOK`, `CONTEXT`) — cuál cambió, o "no aplica". Si hace falta uno que no existe, crearlo desde la plantilla.

### Verificación de código

Ejecutar activamente antes de marcar como completado:

- [ ] Correr el build — `npm run build` / `python -m pytest` / equivalente
- [ ] Flujo completo probado manualmente — no solo que compile
- [ ] Consola limpia — cero errores ni warnings
- [ ] Edge cases del flujo considerados y probados
- [ ] Imports válidos, sin dependencias rotas

### Commit sugerido

`tipo(scope): descripción en imperativo`

---

**Reglas:**

- Doc actualizado en esta sesión → `[x] motivo`
- Doc no relevante para esta sesión → `[ ] no aplica`
- Doc que debía actualizarse y NO se pudo por falta de información → `⚠️ pendiente` + explicación de qué falta
- **PROHIBIDO** marcar como `⚠️ pendiente` si la información necesaria ya existe en la sesión — en ese caso actualizar el doc directamente
- Omitir el bloque solo en respuestas puramente informativas (sin cambios en código o docs)
