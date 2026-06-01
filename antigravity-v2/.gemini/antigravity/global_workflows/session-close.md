# Workflow: Cierre de Sesión
# Invocar con: /session-close

Al ejecutar este workflow, emitir el siguiente bloque de cierre antes de la respuesta final:

---

## ✅ Cierre de Sesión

### Docs actualizados

> Si se usó /new-feature en esta sesión: `06_TASKS.md` es **obligatorio** —
> marcar la tarea como `completed` o actualizar su estado.

- [ ] 01_PROJECT_PRD.md  — [motivo o "no aplica"]
- [ ] 02_SDD.md          — [motivo o "no aplica"]
- [ ] 03_SYSTEM_SPEC.md  — [motivo o "no aplica"]
- [ ] 04_DATA_MODEL.md   — [motivo o "no aplica"]
- [ ] 05_ARCHITECTURE.md — [motivo o "no aplica"]
- [ ] 06_TASKS.md        — **verificar estado de tarea activa** (in-progress / completed)
- [ ] 07_DECISIONS.md    — [motivo o "no aplica"]
- [ ] 08_CHANGELOG.md    — [motivo o "no aplica"]

### Verificación de código
- [ ] Flujo completo probado (no solo que compile)
- [ ] Consola limpia (sin errores ni warnings)
- [ ] Edge cases considerados
- [ ] Imports válidos, sin dependencias rotas

### Commit sugerido
`tipo(scope): descripción en imperativo`

---

**Reglas:**
- Doc no modificado → `[ ] no aplica`
- Doc que debía modificarse y no se hizo → `⚠️ pendiente` + explicación
- Omitir solo en respuestas puramente informativas (sin cambios en código o docs)
