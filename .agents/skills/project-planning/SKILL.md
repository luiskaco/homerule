---
name: project-planning
description: >
  Usar antes de codificar un proyecto nuevo o una iniciativa grande (afecta
  más de 3 archivos, tiene más de una arquitectura válida, o incluye una
  decisión irreversible). Convierte una idea ya validada en los documentos
  de planificación de `/docs` que define este kit (`01_PRD.md` …
  `03_DECISIONS.md` + `TESTING.md`), en orden, antes de escribir código.
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
  lugar (solo toca `02_TASKS.md` y, si corresponde, `03_DECISIONS.md`).

## Antes de empezar

1. Revisar la sección **Proyecto** de `AGENTS.md` en la raíz del proyecto:
   si define otro stack, otras rutas de documentación o excepciones a las
   reglas, tiene prioridad sobre la tabla de abajo.
2. Revisar si ya hay una idea validada con el usuario — por ejemplo un spec
   escrito por el skill `brainstorming`, o otra conversación previa. Si
   existe, es el insumo del paso 1 del proceso: su contenido se vuelca en
   `01_PRD.md`, que pasa a ser la fuente de verdad a partir de ahí
   (el spec original queda como borrador histórico, no se sigue actualizando
   en paralelo). No repreguntar desde cero lo que ya se acordó.
3. Si todavía no hay una idea validada, invocar primero `brainstorming`.
   `project-planning` empieza donde `brainstorming` termina.

## Proceso (en orden, un documento a la vez)

1. **`01_PRD.md`** — Problema, usuarios, criterios de éxito, fuera de
   alcance. Cada requisito con ID (`RF-01`, `RNF-01`), prioridad (M/S/C) y
   criterios de aceptación en formato EARS ("CUANDO \<evento\>, EL SISTEMA
   DEBE \<comportamiento\>") en vez de frases vagas tipo "debería andar bien"
   — reduce la ambigüedad que después se paga en retrabajo, y cada criterio
   pasa a ser un test. Presentar y esperar aprobación antes de seguir.
2. **`ARCHITECTURE.md`** — Visión general, componentes, flujo de datos, APIs,
   integraciones y riesgos, indicando qué `RF-xx` implementa cada parte. Si
   hay más de un enfoque válido, invocar al subagente `planner` para comparar
   trade-offs antes de fijarlo.
3. **`DATA_MODEL.md`** — Solo si el proyecto guarda datos propios: entidades
   y campos.
4. **`TESTING.md`** — Cómo se va a verificar cada requisito: niveles de
   test, herramienta y tabla de trazabilidad `RF-xx` → test (los tests
   todavía no existen — la tabla arranca en "pendiente").
5. **`02_TASKS.md`** — Desglosar el plan en tareas concretas bajo
   `## Abiertas` (como mucho 10, en 2–3 líneas cada una), con ID (`T-01`), el requisito que cubren y su criterio de
   "hecho cuando". Cada tarea tiene que poder ejecutarse sin releer los documentos
   anteriores. Completar también "Dónde quedó" con el primer paso.
6. **`03_DECISIONS.md`** — Loguear como ADR cualquier decisión con
   trade-offs relevantes tomada en el camino (no solo arquitectura — también
   producto o datos, si no era obvia), con su línea en el índice.

Presentar cada documento y esperar aprobación del usuario antes de pasar al
siguiente. No escribir código hasta que `02_TASKS.md` tenga al menos la
primera tarea aprobada.

## Auto-revisión antes de dar por cerrada cada fase

- **Placeholders:** ¿queda algún "TBD", sección vacía o requisito vago?
- **Consistencia:** ¿contradice algo ya escrito en un documento anterior?
- **Alcance:** ¿este documento sigue resolviendo lo que dice
  `01_PRD.md`, o se infló? Si se infló, marcarlo y proponer partirlo
  antes de seguir.

Corregir inline y seguir — no hace falta una segunda pasada de revisión.

## Qué NO hacer

- No inventar archivos ni carpetas nuevas (nada de `spec.md`, `plan.md` o
  `tasks.md` sueltos) — este kit ya tiene su propia convención de `/docs`.
- No escribir `RUNBOOK.md` durante la planificación: se completa a más
  tardar en el primer deploy, cuando hay algo real que operar.
- No saltar directo a `02_TASKS.md` sin pasar por los documentos anteriores en proyectos o
  iniciativas grandes — para cambios chicos ya está `/new-feature`.
- No resolver solo una decisión arquitectónica ambigua: delegar al subagente
  `planner` y esperar la respuesta del usuario antes de fijarla en
  `ARCHITECTURE.md`.
