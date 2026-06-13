# Antigravity Rules — Proyecto

---

## 1. Regla de Oro: Planificar Antes de Actuar

**NUNCA generar código o modificar archivos sin pasar primero por estos 3 pasos:**

1. **Analizar:** Desglosa el problema, identifica impactos colaterales y propone la solución conceptualmente.
2. **Validar:** Detente y pregunta si hay ambigüedad en alguna de estas condiciones:
   - Hay más de una arquitectura válida con trade-offs distintos
   - La tarea afecta más de 3 archivos existentes
   - Hay decisiones irreversibles (migraciones, cambios de schema, eliminación de datos)
3. **Ejecutar:** Solo cuando la estrategia esté clara y aprobada.

---

## 2. Filosofía del Proyecto

- Generar sistemas **seguros, escalables, mantenibles y listos para producción**.
- Priorizar: claridad, modularidad, simplicidad y reutilización.
- Evitar: deuda técnica, hacks rápidos, sobreingeniería y estructuras desordenadas.
- **Idioma del código:** inglés (variables, funciones, clases, endpoints, comentarios técnicos).
- **Idioma de respuesta:** responder siempre en el idioma del usuario.

---

## 3. Convenciones de Desarrollo

### Naming
- Archivos y carpetas: `kebab-case`
- Variables y funciones: `camelCase`
- Clases y componentes: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Endpoints REST: `/kebab-case` en plural (`/api/v1/users`, `/api/v1/blog-posts`)
- Consistencia estricta: el mismo concepto usa el mismo nombre en toda la codebase.

### Git — Conventional Commits (obligatorio)
```
feat(scope): descripción en imperativo, minúsculas
fix(scope): descripción
refactor(scope): descripción
docs(scope): descripción
chore(scope): descripción
perf(scope): descripción
test(scope): descripción
```
Ejemplos:
```
feat(auth): add refresh token rotation
fix(ui): resolve skeleton layout shift on mobile
docs(api): update user endpoints reference
```

---

## 4. Estructura de Documentación del Proyecto

Mantener y actualizar en `/docs`:

| Archivo | Propósito |
|---------|-----------|
| `01_PROJECT_PRD.md` | Qué construimos y por qué — requisitos de producto |
| `02_SDD.md` | Cómo está diseñado el sistema (IEEE 1016) |
| `03_SYSTEM_SPEC.md` | Especificaciones técnicas detalladas |
| `04_DATA_MODEL.md` | Esquemas, entidades y relaciones |
| `05_ARCHITECTURE.md` | Diagramas y decisiones arquitectónicas |
| `06_TASKS.md` | Backlog y estado de tareas activas |
| `07_DECISIONS.md` | ADRs — Architecture Decision Records |
| `08_CHANGELOG.md` | Historial de cambios por versión (Keep a Changelog) |

Expansiones permitidas: `API.md`, `UX.md`, `SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, `AI_AGENTS.md`

**Regla:** actualizar el archivo correspondiente cada vez que se complete una tarea que afecte su contenido.

---

## 5. Regla Final de Compilación

**El código que compila NO es código terminado.**

Una tarea está completa solo cuando:
- [ ] La lógica del flujo completo fue probada (no solo que compile)
- [ ] Los edge cases fueron considerados
- [ ] La consola está limpia de errores y warnings
- [ ] Los imports son válidos y no hay dependencias rotas

---

## 6. Jerarquía de Reglas

En caso de conflicto entre archivos de reglas:

1. `GEMINI.md` — este archivo (máxima prioridad)
2. `AGENTS.md` — reglas cross-tool compartidas
3. `.agent/rules/` — reglas de workspace por contexto
4. Skills de diseño (ui-ux-pro-max → impeccable → web-design-guidelines)
5. Context7 MCP — documentación técnica de librerías

---

## 7. Cierre de Sesión Obligatorio

**AL TERMINAR CADA TAREA**, antes de dar la respuesta final, emitir este bloque:

```
## ✅ Cierre de Sesión

### Docs actualizados
- [ ] 01_PROJECT_PRD.md  — [motivo o "no aplica"]
- [ ] 02_SDD.md          — [motivo o "no aplica"]
- [ ] 03_SYSTEM_SPEC.md  — [motivo o "no aplica"]
- [ ] 04_DATA_MODEL.md   — [motivo o "no aplica"]
- [ ] 05_ARCHITECTURE.md — [motivo o "no aplica"]
- [ ] 06_TASKS.md        — [motivo o "no aplica"]
- [ ] 07_DECISIONS.md    — [motivo o "no aplica"]
- [ ] 08_CHANGELOG.md    — [motivo o "no aplica"]

### Verificación de código
- [ ] Flujo completo probado
- [ ] Consola limpia (sin errores ni warnings)
- [ ] Edge cases considerados

### Commit sugerido
`tipo(scope): descripción en imperativo`
```

**Reglas de aplicación:**
- Doc no modificado → `[ ] no aplica`
- Doc que debía modificarse y no se hizo → `⚠️ pendiente` + explicación
- Obligatorio incluso en tareas pequeñas
- Solo se omite en respuestas puramente informativas (sin cambios en código o docs)


---

## 8. Herramientas Disponibles

### Skills de Diseño (activar según momento)
- **Construyendo UI nueva** → `ui-ux-pro-max`
- **Revisando UI existente** → `impeccable` + `web-design-guidelines`

### Context7 MCP
Consultar docs de librerías antes de implementar:
```
use context7 to resolve <librería> — <query>
```

> Detalle completo en `.agent/rules/tools-reference.md`
