# Antigravity Rules — Global

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

## 2. Filosofía

- Sistemas **seguros, escalables, mantenibles y listos para producción**.
- Priorizar: claridad, modularidad, simplicidad y reutilización.
- Evitar: deuda técnica, hacks rápidos, sobreingeniería.
- **Código:** siempre en inglés.
- **Respuestas:** siempre en el idioma del usuario.

---

## 3. Stack Base

```
Frontend:      React / Next.js / Vanilla JS
Backend:       Node.js / Python (FastAPI)
CMS:           WordPress (tradicional)
Estilos:       Tailwind CSS / CSS puro
Runtime:       Node.js 20+ / Python 3.11+
```

> Actualizar en cada proyecto: Nombre, Base de datos, y Frontend/Estilos si difieren del base.

---

## 4. Naming & Git

**Naming:** `kebab-case` archivos · `camelCase` variables · `PascalCase` clases · `UPPER_SNAKE_CASE` constantes · `/api/v1/recursos` endpoints

**Conventional Commits:**
```
feat(scope): descripción   fix(scope): descripción   refactor(scope): descripción
docs(scope): descripción   chore(scope): descripción  perf(scope): descripción
```

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

---

## 6. Principios No Negociables

- Nunca confiar en el frontend para seguridad o lógica de negocio.
- Todo secret en variables de entorno — nunca hardcodeado.
- Mobile-first desde 320px.
- Los 5 estados de UI son obligatorios: loading, skeleton, error, success, empty.
- El código que compila **no** es código terminado — probar el flujo completo.

---

## 7. Skills de Diseño

| Skill | Cuándo |
|-------|--------|
| `ui-ux-pro-max` | Construyendo UI nueva |
| `impeccable` | Revisando UI existente |
| `web-design-guidelines` | Auditando estándares técnicos |

Nunca las 3 a la vez.

---

## 8. Context7 MCP

Consultar docs antes de implementar con cualquier librería:
```
use context7 to resolve <librería> — <query>
```

---

## 9. Jerarquía de Reglas

1. Este archivo `GEMINI.md` — máxima prioridad
2. `.agents/rules/` — workspace (override local)
3. Skills (ui-ux-pro-max → impeccable → web-design-guidelines)

---

## 10. Workflows Disponibles

Invocar con `/` en el chat:

| Comando | Descripción |
|---------|-------------|
| `/session-close` | Cierre de sesión — docs, verificación y commit |
| `/deploy-checklist` | Checklist completo pre-deploy |
