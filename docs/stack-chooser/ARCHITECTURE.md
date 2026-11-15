# Arquitectura

## Diseño del sistema


### Visión general

Una app web estática. Las respuestas del usuario entran a un motor de funciones
puras que recorre las capas en orden, descarta lo incompatible y ordena lo que
queda. El catálogo de tecnologías es un conjunto de registros en el repo. La
interfaz solo muestra el resultado y manda de vuelta las respuestas.

### Componentes principales

| Componente | Responsabilidad |
|---|---|
| `src/domain/` | Tipos del dominio, tipos de proyecto y las 16 capas con su orden |
| `src/catalog/` | Las tecnologías (93), un registro por tecnología, agrupadas por capas |
| `src/engine/recommend.ts` | Descarta, puntúa y elige capa por capa. Sin efectos secundarios |
| `src/engine/export.ts` | Convierte una recomendación en el bloque de `AGENTS.md` y en el ADR |
| `src/ui/` | Formulario, resultado, perfil, exportación y guardado local |
| `src/App.tsx` | Estado de la pantalla y unión de las piezas |

### Flujo de datos

1. El usuario cambia una respuesta, fija una pieza o edita su perfil.
2. `App` llama a `recommend(respuestas, { perfil, fijadas })`.
3. El motor toma las capas activas, y para cada una descarta, puntúa y elige.
   Lo que cada elección aporta (`provides`) queda disponible para las capas siguientes.
4. La interfaz pinta el resultado. `export.ts` arma los textos a partir de ese mismo resultado.
5. Respuestas y perfil se guardan en `localStorage`, con validación al leerlos.

### Decisiones de diseño clave

- Reglas fijas y app estática, sin IA ni backend (ADR-001).
- Capacidades `provides`/`needs` en vez de listas de compatibilidad a mano (ADR-002).
- La verificación desempata y no suma puntos (ADR-003).
- Un solo lenguaje en el stack suma puntos (ADR-004).

### Riesgos y mitigaciones

- **El catálogo envejece.** Cada ficha lleva fecha y fuente de verificación; las no verificadas se marcan en pantalla y en lo exportado.
- **Los puntos parecen una verdad.** Se quitó el "índice de consistencia"; el texto de la app dice que son reglas fijas y que lo sin verificar hay que confirmarlo.
- **Una ficha con un dato mal rompe una recomendación.** Pasó con Prisma y MongoDB; la verificación contra documentación lo detectó. Los tests recorren más de mil combinaciones para atrapar combinaciones rotas.
- **Greedy por capas.** El motor elige en orden y no reconsidera: una elección temprana puede dejar sin opciones a una capa posterior. El test de combinaciones lo detecta y la interfaz lo explica.

## Especificaciones técnicas


### APIs / Endpoints

Ninguno: no hay servidor. Las interfaces son funciones del propio código.

| Función | Archivo | Descripción |
|---|---|---|
| `recommend(answers, options?)` | `src/engine/recommend.ts` | Devuelve la `Recommendation` capa por capa. `options`: `catalog`, `profile`, `pinned` |
| `normalizeAnswers(answers)` | `src/engine/recommend.ts` | Aplica implicaciones: una app con IA siempre necesita IA |
| `activeLayers(answers)` | `src/engine/recommend.ts` | Capas que aplican al tipo y a lo que pide el proyecto |
| `buildAgentsBlock(rec, date)` | `src/engine/export.ts` | Texto para la sección Proyecto de `AGENTS.md` |
| `buildDecisionRecord(rec, date)` | `src/engine/export.ts` | ADR con alternativas y descartes |
| `unverifiedNames(rec)` | `src/engine/export.ts` | Nombres de lo elegido que no está verificado |

### Contratos de request/response

`recommend` es determinista. Puntos que suma cada regla (los pesos viven en `scoreTech`):

| Regla | Puntos |
|---|---|
| Primera opción para el tipo de proyecto | +3 |
| SEO crítico y la tecnología es amigable con SEO | +3 (útil: +1) |
| Tiempo real | +3 |
| Hosting sin servidor propio / servidor propio | +2 |
| Presupuesto cero: gratis / plan gratuito o por uso | +2 / +1 |
| Presupuesto bajo: gratis, plan gratuito o por uso / de pago | +1 / −1 |
| Prototipo: arranque rápido / liviana | +2 / +1 |
| Producción: madura / tipos estáticos | +2 / +1 |
| La IA la conoce bien | +1 |
| Mismo lenguaje que el resto del stack / agrega un segundo | +2 / −2 |
| Perfil: la domina / la conoce / prefiere no usarla | +3 / +1 / −1 |
| Ya la paga | +2 |

Desempate: primero la verificada, después el orden del catálogo.

Se descarta, antes de puntuar, lo que: no aplica al tipo, cumple una condición `excludeWhen`,
es de pago con presupuesto cero, necesita una capacidad ausente o choca con algo elegido.

### Integraciones externas

Ninguna en tiempo de ejecución. Al curar el catálogo se consulta documentación vigente
con Context7 y los registros de npm y PyPI; solo se guarda la fecha y la fuente.

### Configuración y variables de entorno

| Variable | Propósito | Requerida |
|----------|-----------|-----------|
| _ninguna_ | | |

Claves de `localStorage`: `stack-chooser:answers:v1` y `stack-chooser:profile:v1`.

### Versiones (consultadas el 2026-11-08)

Node 24+ · Vite 8.3 · React 19.3 · TypeScript 7.0 · Tailwind CSS 4.3 · Vitest 5.1 · `@vitejs/plugin-react` 6.2.

## Decisiones de estructura


### Estructura de carpetas

```
src/
  domain/    tipos, tipos de proyecto y capas (sin dependencias)
  catalog/   fichas de tecnologías, por grupos de capas + define.ts
  engine/    recommend.ts y export.ts (funciones puras)
  ui/        componentes y guardado local
  App.tsx    estado de la pantalla
docs/        documentación del proyecto (SDD)
.claude/     kit de Claude Code: skills, comandos, subagentes y hooks
```

### Convenciones de capas

Dependencias permitidas, en una sola dirección:

`ui` → `engine` → `catalog` → `domain`

- `engine` y `catalog` no importan nada de `ui` ni de React.
- `catalog` solo importa `domain` y su propio `define.ts`.
- Los tests viven junto a lo que prueban y corren en `node`.

Excepciones a las rules del kit (ver `AGENTS.md`):

- La regla "frontend ligero, sin lógica de negocio" no aplica: este producto *es* lógica
  que corre en el navegador, y no decide permisos, precios ni accesos de nadie.
- La modularidad vertical por dominio no aplica: hay un solo dominio, así que se separa por capa técnica.

### Infraestructura

- **Hosting:** ninguno todavía. Es una app estática (`npm run build` genera `dist/`) que cabe en cualquier hosting estático.
- **CI/CD:** ninguno todavía.
- **Entornos:** solo local (`npm run dev`).

`RUNBOOK.md` se escribe a más tardar en el primer deploy.
