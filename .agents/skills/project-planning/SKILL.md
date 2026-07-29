---
name: project-planning
description: >
  Usar antes de codificar un proyecto nuevo o una iniciativa grande (afecta
  más de 3 archivos, tiene más de una arquitectura válida, o incluye una
  decisión irreversible). Convierte una idea ya validada en los 8 documentos
  de `/docs` que define este kit (`01_PROJECT_PRD.md` … `08_CHANGELOG.md`),
  en orden, antes de escribir código.
---

# Project Planning

Lleva una idea aprobada hasta un plan de implementación completo, escribiendo
en los documentos de `/docs` que ya define `GEMINI.md § 5` / `CORE.md § 5` —
no crea archivos, carpetas ni convenciones propias.

## Cuándo usar

- Proyecto nuevo, o feature/iniciativa grande: más de 3 archivos afectados,
  más de una arquitectura válida, o una decisión irreversible (migración,
  cambio de schema, borrado de datos) — mismo umbral que el subagente
  `planner`.
- Para cambios chicos o incrementales, usar el workflow `/new-feature` en su
  lugar (solo toca `06_TASKS.md` y, si corresponde, `07_DECISIONS.md`).

## Antes de empezar

1. En proyectos Antigravity, revisar si existe `00_GEMINI_START.md` en la
   raíz del proyecto. Si existe, define rutas y nombres de documentación
   distintos a la tabla de abajo y tiene prioridad sobre ella. (No aplica a
   Claude Code, que no usa ese archivo.)
2. Revisar si ya hay una idea validada con el usuario — por ejemplo un spec
   escrito por el skill `brainstorming`, o otra conversación previa. Si
   existe, es el insumo del paso 1 del proceso: su contenido se vuelca en
   `01_PROJECT_PRD.md`, que pasa a ser la fuente de verdad a partir de ahí
   (el spec original queda como borrador histórico, no se sigue actualizando
   en paralelo). No repreguntar desde cero lo que ya se acordó.
3. Si todavía no hay una idea validada, invocar primero `brainstorming`.
   `project-planning` empieza donde `brainstorming` termina.

## Proceso (en orden, un documento a la vez)

1. **`01_PROJECT_PRD.md`** — Problema, usuarios, criterios de éxito, fuera de
   alcance. Presentar y esperar aprobación antes de seguir.
2. **`02_SDD.md`** — Visión general, componentes principales, flujo de
   datos, riesgos. Debe resolver explícitamente el problema descrito en 01.
3. **`03_SYSTEM_SPEC.md` + `04_DATA_MODEL.md`** — Especificaciones técnicas
   y esquema de datos. Redactar cada requisito en formato EARS ("Cuando
   \<evento\>, el sistema debe \<comportamiento\>") en vez de frases vagas
   tipo "debería andar bien" — reduce la ambigüedad que después se paga en
   retrabajo.
4. **`05_ARCHITECTURE.md`** — Decisiones arquitectónicas. Si hay más de un
   enfoque válido, invocar al subagente `planner` para comparar trade-offs
   antes de fijar la decisión acá.
5. **`06_TASKS.md`** — Desglosar el plan en tareas concretas bajo
   `## Pendiente`, una por línea. Cada tarea tiene que poder ejecutarse sin
   releer 01-05 completos.
6. **`07_DECISIONS.md`** — Loguear como ADR cualquier decisión con
   trade-offs relevantes tomada en el camino (no solo arquitectura — también
   producto o datos, si no era obvia).

Presentar cada documento y esperar aprobación del usuario antes de pasar al
siguiente. No escribir código hasta que `06_TASKS.md` tenga al menos la
primera tarea aprobada.

## Auto-revisión antes de dar por cerrada cada fase

- **Placeholders:** ¿queda algún "TBD", sección vacía o requisito vago?
- **Consistencia:** ¿contradice algo ya escrito en un documento anterior?
- **Alcance:** ¿este documento sigue resolviendo lo que dice
  `01_PROJECT_PRD.md`, o se infló? Si se infló, marcarlo y proponer partirlo
  antes de seguir.

Corregir inline y seguir — no hace falta una segunda pasada de revisión.

## Qué NO hacer

- No inventar archivos ni carpetas nuevas (nada de `spec.md`, `plan.md` o
  `tasks.md` sueltos) — este kit ya tiene su propia convención de 8 archivos.
- No saltar directo a `06_TASKS.md` sin pasar por 01-05 en proyectos o
  iniciativas grandes — para cambios chicos ya está `/new-feature`.
- No resolver solo una decisión arquitectónica ambigua: delegar al subagente
  `planner` y esperar la respuesta del usuario antes de fijarla en
  `05_ARCHITECTURE.md`.
