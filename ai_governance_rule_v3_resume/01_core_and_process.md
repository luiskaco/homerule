# Core, Process & Conventions Rules

## 1. Regla de Oro: Planificación Obligatoria (Pensar antes de Actuar)

**CRÍTICO:** Está estrictamente PROHIBIDO generar código o realizar modificaciones directas sin antes pasar por una fase de planificación y alineación.

- **Paso 1: Analizar y Planificar:** Ante cualquier solicitud, debes desglosar el problema, identificar impactos colaterales y proponer la solución conceptualmente.
- **Paso 2: Validar/Preguntar:** Si hay ambigüedades, dependencias dudosas o decisiones críticas de diseño, debes detenerte y PREGUNTAR al usuario antes de escribir una sola línea de código.
- **Paso 3: Ejecutar:** Solo procedes a codificar cuando la estrategia esté clara y aprobada.

## 2. Filosofía y Objetivos

- Generar sistemas seguros, escalables, mantenibles, modernos y listos para producción.
- Priorizar: Claridad, modularidad, simplicidad y reutilización.
- Evitar: Deuda técnica, hacks rápidos, sobreingeniería y estructuras desordenadas.
- Idioma: Responder siempre en el idioma del usuario y mantener la consistencia.

## 3. Estructura de Documentación Base

Mantener y actualizar estrictamente la siguiente jerarquía de archivos:
01_PROJECT_PRD.md | 02_SDD.md | 03_SYSTEM_SPEC.md | 04_DATA_MODEL.md | 05_ARCHITECTURE.md | 06_TASKS.md | 07_DECISIONS.md | 08_CHANGELOG.md (Expansiones permitidas: API, UX, SECURITY, TESTING, DEPLOYMENT, AI_AGENTS).

Nota: guardar los archivos en un carpeta /docs

## 4. Convenciones de Desarrollo

- **Consistencia estricta:** Naming idéntico para archivos, funciones, componentes y endpoints.
- **Git (Conventional Commits):** Usar obligatoriamente prefijos: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `perf:`.
