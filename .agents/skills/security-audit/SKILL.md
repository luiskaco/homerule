---
name: security-audit
description: "Usar antes de subir cualquier feature con auth, APIs o datos sensibles"
metadata:
  kind: workflow
---

# Workflow: Auditoría de Seguridad

# Invocar con: /security-audit

# Usar antes de subir cualquier feature con auth, APIs o datos sensibles

Este comando organiza la auditoría; no repite el checklist. El criterio vive en
la rule `security`, y el detalle de cada tema, en la skill `security-mitigations`.

## Cómo se hace

1. **Delegar** en el subagente de seguridad (`security-auditor` en Claude Code,
   `security` en Antigravity), pasándole el diff o la feature. Aplica la rule
   `security` y los temas de `security-mitigations` que toque el cambio, y
   devuelve cada caso como confirmado, a verificar o descartado.
2. **Sin ese subagente**, auditar acá: abrir el índice de `security-mitigations`,
   leer solo los temas que toque el cambio y reportar con los mismos estados.
3. **Validar los Critical:** si hay un Critical confirmado, antes de bloquear el
   deploy pedirle a una instancia nueva del subagente que intente refutarlo,
   pasándole solo ese hallazgo. Quien valida no es quien lo encontró.

## Resultado

- 🔴 **Critical confirmado** — bloquea el deploy; corregir antes de subir.
- 🟠 **High** — corregir en el próximo commit.
- 🟡 **Medium** — tarea en `02_TASKS.md`.
- **A verificar** — anotar qué hay que mirar y dónde (config de producción, base, hosting).

**Si todo está limpio:** seguir con `/deploy-checklist`.
