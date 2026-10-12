---

## Mapa del proyecto

Este proyecto se armó con el kit de **{{TOOL_LABEL}}** de AI Rules Hub, pero
cualquier agente puede continuarlo: todo lo que necesita está en el repo, en
archivos markdown planos.

| Qué | Dónde |
|---|---|
| Rules técnicas (§ 6, punto 2) | `{{RULES_PATH}}` — leer la que aplique antes de tocar esa área |
| Skills | `{{SKILLS_PATH}}` — una carpeta por skill, con su `SKILL.md` |
| Subagentes | `{{AGENTS_PATH}}` |
| Comandos / workflows (§ 7) | {{WORKFLOWS_PATH}} |
| Estado del proyecto | `docs/` — ver "Continuar el trabajo" |

### Continuar el trabajo

1. **Antes de empezar:** leer en `docs/06_TASKS.md` la sección **Estado de
   traspaso** (dónde quedó, próximo paso, bloqueos) y después
   `docs/07_DECISIONS.md` (lo ya decidido — no re-decidirlo). Si este
   proyecto se desvía de alguna regla, está en la sección **Proyecto** de abajo.
2. **Para verificar tu trabajo:** `docs/09_TESTING.md` dice cómo correr los
   tests y qué requisito (`RF-xx` de `docs/01_PROJECT_PRD.md`) cubre cada uno.
   Para desplegar u operar: `docs/10_RUNBOOK.md`.
3. **Comandos de § 7:** si tu herramienta no los expone, leé el archivo del
   workflow y seguí sus pasos a mano.
4. **Al cerrar una tarea:** actualizar `docs/06_TASKS.md` — incluido el Estado
   de traspaso — y el documento que corresponda según § 5.

---

## Proyecto

> Completar al iniciar el proyecto — es lo primero que lee un agente nuevo.
> Lo que se anote acá tiene prioridad sobre las reglas de arriba (§ 5).

- **Qué es:**
- **Stack real** (si difiere de § 3):
- **Comandos:** instalar · dev · test · build
- **Estructura:** carpetas principales y qué va en cada una
- **Documentación** (si `/docs` usa otros nombres o rutas que los de § 5):
- **Excepciones a las reglas:** qué regla no aplica o se adapta en este proyecto, y por qué
