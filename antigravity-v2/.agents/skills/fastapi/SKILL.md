---
name: fastapi
description: >
  Mejores prácticas oficiales de FastAPI — se activa automáticamente al trabajar
  con archivos .py que usen FastAPI o Pydantic. Siempre actualizada con las
  últimas versiones y features del framework.
activation: auto
glob: "**/*.py"
tags: [fastapi, python, pydantic, async, api, backend]
source: fastapi/fastapi
---

# FastAPI — Skill Oficial

Skill del repositorio oficial de FastAPI. Se mantiene actualizada con cada nueva versión del framework.

## Instalación

```bash
npx skills add fastapi/fastapi --skill fastapi
```

## Qué cubre

- Estructura de proyecto recomendada por el equipo de FastAPI
- Pydantic v2 — modelos, validación y serialización
- Async/await patterns — cuándo usar y cuándo no
- Dependency injection — el patrón central de FastAPI
- Router organization — separación por dominio
- Error handling — HTTPException, custom handlers
- Middleware — CORS, auth, logging
- Testing — TestClient, pytest fixtures
- Entrypoint via `pyproject.toml`

## Cuándo activarla manualmente

```
/fastapi  ← aplica mejores prácticas al código actual
"Review this FastAPI endpoint"
"Scaffold a new FastAPI router"
```

## Complementa con

- `nodejs` → si el proyecto mezcla Node.js y Python
- `stack-conventions` → convenciones del proyecto
- `security` rule → validación OWASP en endpoints
