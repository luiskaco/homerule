---
name: project-docs-scaffold
description: Estructura estándar de documentación de los proyectos de Luis — carpeta docs/ con 8 archivos numerados (PRD, SDD, SYSTEM_SPEC, DATA_MODEL, ARCHITECTURE, TASKS, DECISIONS, CHANGELOG). Úsala al iniciar un proyecto nuevo o montar su documentación, y durante el mantenimiento — ANTES de escribir código para una funcionalidad, modificación o cambio nuevo (actualizar 06_TASKS.md primero), al tomar una decisión técnica con alternativas evaluadas (ADR en 07_DECISIONS.md), al agregar o cambiar un endpoint, integración o variable de entorno (03_SYSTEM_SPEC.md), al cambiar entidades o relaciones de datos (04_DATA_MODEL.md), y al cerrar una tarea o entregar algo (08_CHANGELOG.md). Aplica a proyectos de la agencia Orange Latam y proyectos propios.
---

# Project Docs Scaffold

Todos los proyectos usan la misma carpeta `docs/` con los mismos 8 archivos, en
el mismo orden, para que Claude, Claude Code y Gemini se orienten igual en
cualquier repo.

## Los 8 archivos

| Archivo | Para qué sirve | Cuándo se toca |
|---|---|---|
| `01_PROJECT_PRD.md` | El "por qué": problema, objetivos, alcance, usuarios, requisitos | Al iniciar; rara vez después |
| `02_SDD.md` | El "cómo" a alto nivel: visión general, componentes, flujo de datos | Al iniciar; cuando cambia el diseño general |
| `03_SYSTEM_SPEC.md` | Detalle técnico exacto: endpoints, contratos request/response, integraciones, variables de entorno | Cada vez que se agrega o cambia un endpoint o integración |
| `04_DATA_MODEL.md` | Entidades, campos y relaciones de la base de datos | Cada vez que cambia el schema |
| `05_ARCHITECTURE.md` | Estructura de carpetas, convenciones de capas, infraestructura | Cuando cambia la arquitectura o el stack |
| `06_TASKS.md` | Backlog activo: en progreso / pendiente / completado | Antes de codificar, y ante cualquier modificación o funcionalidad nueva |
| `07_DECISIONS.md` | ADRs: decisiones importantes, alternativas evaluadas, trade-offs | Cada vez que se toma una decisión técnica relevante |
| `08_CHANGELOG.md` | Historial en formato Keep a Changelog | Cada vez que se agrega, cambia o corrige algo entregable |

## 1. Crear la estructura en un proyecto nuevo

Verifica si el proyecto ya tiene `docs/` con estos 8 archivos.

- **Si no existe** — copia los 8 archivos de `templates/` (dentro de esta skill)
  a `docs/` del proyecto, respetando el nombre y el orden numérico exacto.
- **Si ya existe** — no la sobreescribas. Avisa que ya existe y pregunta si
  quiere revisarla, completarla o regenerarla desde cero.

## 2. Completar el contenido

**Luis prefiere control manual sobre lo automático. No inventes ni rellenes las
secciones por tu cuenta.**

Copia las plantillas en blanco. Solo cuando el usuario dé la información o pida
explícitamente que redactes una sección ("redáctame el PRD con esto...", "arma
el ADR de esta decisión"), completa esa sección puntual con lo que él indique.

No inventes alcance, requisitos, métricas ni decisiones que no haya mencionado.
Si falta un dato para completar una sección, deja el placeholder y dilo.

## 3. Mantenimiento continuo (proyectos ya iniciados)

- **Antes de escribir código** para una modificación, cambio o funcionalidad
  nueva que el usuario mencione: actualiza `06_TASKS.md` (agrega o mueve el ítem
  a Pendiente o En progreso) **antes de tocar el código**.
- Si se toma una decisión técnica con alternativas evaluadas: documenta un nuevo
  `ADR-00X` en `07_DECISIONS.md`.
- Si se agrega o cambia un endpoint, integración o variable de entorno:
  actualiza `03_SYSTEM_SPEC.md`.
- Si cambia una entidad o relación de datos: actualiza `04_DATA_MODEL.md`.
- Al cerrar una tarea o entregar algo: agrega la línea en `08_CHANGELOG.md` bajo
  `[Unreleased]` (Added / Changed / Fixed) y mueve el ítem de `06_TASKS.md` a
  Completado.

Estas actualizaciones son parte de la tarea, no un extra opcional. Si el usuario
pide explícitamente saltarse la documentación, respétalo.

## Recursos

`templates/` — los 8 archivos base en blanco, listos para copiar tal cual a la
carpeta `docs/` de cualquier proyecto nuevo.
