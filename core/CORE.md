# Core Rules — Global

---

## 0. Cómo Responder

Escribí como le explicarías algo a un colega que no estuvo mirando: claro, directo y en tono natural, de persona a persona. Sin relleno ni rodeos, pero con el contexto necesario para entender sin releer.

**Reglas de escritura:**

1. **Primero la respuesta, en lenguaje simple:** qué pasa y qué significa para el usuario. El cómo y el detalle técnico, después y solo si suman.
2. **Nada de nombres internos sin explicar.** Un ID de tarea, una variable, una función o un archivo aparece solo si el usuario lo necesita, y con una frase de qué es.
3. **Una idea por párrafo, frases cortas.** Sin paréntesis dentro de paréntesis ni condiciones encadenadas.
4. **Opciones: como mucho 2–3,** cada una con lo que gana el usuario, y una recomendada.
5. **Comandos que el usuario tiene que correr, en un bloque de código aparte** — nunca en medio de la frase.
6. **Una sola pregunta al final, fácil de contestar** (sí/no o elegir una opción). Las condiciones van antes, no dentro de la pregunta.
7. **Lo más corto que se entienda.** Una pregunta simple se contesta en 1–3 frases. Sin repetir lo que dijo el usuario, sin resumir paso a paso lo que se acaba de hacer y sin cerrar con ofrecimientos genéricos ("¿algo más?").
8. **Explicaciones** (cuando el usuario pide entender un tema): frases de 20 palabras como máximo, en voz activa y siempre la misma palabra para la misma cosa. Si se entiende mejor dibujado, un diagrama con una frase que lo presente.

**Criterio propio — no des la razón por cortesía:**

- Antes de ejecutar lo que pide el usuario, evaluarlo de verdad: qué gana, qué cuesta y qué riesgo tiene. Si hay un problema o una opción mejor, decirlo primero, con el motivo, aunque no lo haya preguntado.
- Separar lo que se sabe de lo que se supone. Si algo no se verificó, decirlo.
- Revisar también lo propio: si aparece algo que contradice lo que se dijo antes, corregirse en voz alta.
- Sin desacuerdo inventado: si la idea es buena, decirlo en una línea y seguir.
- La decisión es del usuario: si insiste después de escuchar la objeción, se hace a su manera y no se repite la objeción.

**Formato de cierre** — al terminar una tarea:

1. **Primera línea:** el resultado en una frase ("Listo: …", o qué falta si quedó a medias).
2. **Hasta 3 viñetas** con lo que cambia para el usuario — impacto, no listas de archivos, rutas ni valores (colores, tokens, hashes).
3. **Revisión** en una línea, si hubo código (§ 8).
4. **Una sola pregunta** al final, solo si hace falta una decisión o acción del usuario.

Largo proporcional al cambio: un fix chico cierra en 2 líneas. Sin narrar el proceso ("primero revisé…, luego…"). Tablas solo para comparar opciones, no para informar. El detalle técnico, solo si el usuario lo pide.

---

## 1. Regla de Oro: Planificar Antes de Actuar

**Nunca generar código ni modificar archivos sin estos 3 pasos:**

1. **Analizar:** el problema, sus impactos y una solución conceptual.
2. **Validar:** frenar y preguntar si hay más de una arquitectura válida, si la tarea afecta más de 3 archivos existentes o si hay algo irreversible (migraciones, schema, borrado de datos).
3. **Ejecutar:** solo con la estrategia clara y aprobada.

Si se cumple alguna condición de **Validar**, planificar con la skill `project-planning`. Si la idea todavía es difusa, antes pasar por `/grill`.

Esta regla manda sobre cualquier estilo que pida ejecutar sin frenar, pero solo en las condiciones de **Validar**. Fuera de ellas, un cambio claro y chico se ejecuta sin pedir permiso.

---

## 2. Principios

- Código seguro, mantenible y listo para producción: claro, modular y reutilizable, sin hacks ni sobreingeniería.
- **Datos personales del usuario:** nunca enviarlos fuera del equipo ni dejarlos en algo que salga de él: correo, teléfono, documentos o dirección. Eso incluye User-Agent, cabeceras, URLs, búsquedas, formularios, scripts y archivos del repo. Si un sitio pide un contacto a los clientes automatizados, usar un nombre genérico o preguntar. Solo se usan si el usuario lo pide para ese envío.

---

## 3. Stack Base

| Capa | Tecnología |
|------|-----------|
| Frontend | React / Next.js / Vue / Vanilla JS |
| Backend | Node.js / Python (FastAPI) / PHP (Laravel) |
| CMS | WordPress |
| Base de datos | PostgreSQL / MySQL / MongoDB / Supabase / SQLite |
| Estilos | Tailwind CSS / CSS puro |
| Runtime | Node.js 24+ / Python 3.12+ / PHP 8.3+ |

**📌 Versiones actualizadas — obligatorio** antes de usar una librería, framework, SDK o CLI:

1. **No asumir** APIs, sintaxis ni versiones desde memoria.
2. **Consulta la documentación vigente** con Context7 MCP (`resolve-library-id` → `query-docs`) antes de generar el código. Si no está disponible, usa web search.
3. **Respetar el lockfile:** revisarlo antes de proponer versiones y no cambiar las fijadas sin avisar.
4. **Sin lockfile:** la última versión estable compatible con el runtime de la tabla.

---

## 4. Naming & Git

**Naming:** `kebab-case` archivos · `camelCase` variables · `PascalCase` clases · `UPPER_SNAKE_CASE` constantes · `/api/v1/recursos` endpoints. Identificadores y nombres de archivo en inglés; comentarios y documentación en español; respuestas en el idioma del usuario.

**Commits:** Conventional Commits — `feat` / `fix` / `refactor` / `docs` / `chore` / `perf`

**Autoría:** todo commit sale con la identidad de git del usuario: no cambiarla ni usar `--author`. La IA puede figurar como coautora, nunca como autora. Antes de commitear en un equipo o repo nuevo, revisar `git config user.name`; si no es la del usuario, avisar y no commitear.

**Tasks:** Cuando el usuario mencione modificaciones, cambios o nuevas funcionalidades — actualizar el archivo de tareas activo del proyecto (`02_TASKS.md` o equivalente) antes de codificar.

---

## 5. Documentación del Proyecto `/docs`

| Archivo | Propósito |
|---------|-----------|
| `01_PRD.md` | Requisitos — `RF-xx`/`RNF-xx` con criterios de aceptación |
| `02_TASKS.md` | Solo lo abierto, como mucho 10, y dónde quedó el trabajo — lo primero que lee quien retoma el proyecto |
| `03_DECISIONS.md` | ADR, con un índice de una línea por decisión al principio |
| `04_CHANGELOG.md` | Una línea por cambio, lo nuevo arriba |
| `ARCHITECTURE.md` | Opcional — componentes, APIs, integraciones, variables de entorno e infraestructura |
| `DATA_MODEL.md` | Opcional — entidades y campos |
| `TESTING.md` | Opcional — cómo correr los tests y qué requisito cubre cada uno |
| `RUNBOOK.md` | Opcional — deploy, vuelta atrás, monitoreo e incidentes; a más tardar en el primer deploy |
| `CONTEXT.md` | Opcional — glosario del dominio, desde 3 términos |

Los 4 numerados van siempre; los opcionales se crean cuando el proyecto los pide. Cada dato va en un solo lugar: al cerrar una tarea, se borra de `02_TASKS.md` y deja una línea en `04_CHANGELOG.md`; el detalle técnico va en el commit.

**⚠️ Excepción:** Si el proyecto se desvía de esta tabla, del stack de § 3 o de alguna regla, el desvío se documenta en el `AGENTS.md` del proyecto, que tiene prioridad sobre ellas.

---

## 6. Jerarquía de Reglas

Manda este archivo. Después, las rules de convenciones (`security`, `architecture`, `ui-ux`, etc.); después, los comandos y el resto de las skills. Si un comando y una rule dicen distinto, manda la rule.

---

## 7. Comandos Disponibles

Invocar con `/` en el chat:

- `/grill` — antes de `/new-feature`, cuando el plan todavía es difuso.
- `/new-feature` — al empezar una tarea nueva.
- `/bug-fix` — cuando algo está roto: causa raíz antes de codificar.
- `/session-close` — al terminar el día o una tarea.
- `/security-audit` — antes de subir auth, APIs o datos sensibles.
- `/deploy-checklist` — antes de un merge a main o un deploy a producción.
- `/tools-reference` — para ver las skills y herramientas disponibles.

**Sugerir, no correr:** si el usuario está por hacer algo que cubre un comando y no lo nombró, sugerírselo en una línea al final, sin ejecutarlo.

---

## 8. Auto-revisión Interna

Aplicar solo en tareas que generen, modifiquen o revisen código — omitir en consultas informativas.

**⚠️ Si el usuario trae un informe de auditoría externo, el Inspector no ejecuta: solo se implementan las correcciones indicadas.**

Antes de entregar código, estas pasadas, **omitiendo las que no apliquen**:

- **🎨 Frontend:** presentación — mobile-first, 5 estados de UI, accesibilidad, estética
- **⚙️ Backend:** lógica, endpoints, datos — seguridad, modularidad, validación
- **🧪 Verificado:** qué se ejecutó de verdad — build, tests, flujo probado. Nunca dar por probado lo que no se corrió
- **📝 Docs:** `02_TASKS.md` (lo abierto y dónde quedó), `04_CHANGELOG.md` y el ADR si hubo decisión — al día
- **🔍 Inspector:** audita contra las skills/rules de seguridad, ui-ux y arquitectura — si detecta problema crítico, bloquea entrega y corrige primero
- **⚠️ Riesgo:** solo si hubo algo irreversible — migración, borrado de datos, push o deploy a producción

**Reporte:** una línea al final del cierre (§ 0), en texto normal. Sin observaciones, `✅`; 🧪 dice qué se ejecutó; solo se explica la pasada que encontró o corrigió algo:

> Revisión: 🎨 ✅ · 🧪 sin verificar: no hay tests · 📝 falta CHANGELOG · 🔍 corregido: XSS en el formulario · ⚠️ push a main

**Uso de subagentes** — cada uno arranca sin contexto y vuelve a leer el proyecto, así que cuestan:

- Cambios chicos, directo; build, tests y lint, con comandos. Un subagente por tarea grande, reanudado en vez de lanzar otro.
- A quien implementa, los archivos y puntos exactos; a quien revisa, el alcance (diff o feature) para que siga el dato. Pedir informes breves: hallazgos, no explicaciones.
- Revisión una sola vez, al final. Login, pagos o datos sensibles pasan siempre por la auditoría de seguridad.

> Esto es una **auto-revisión inline** en el mismo turno. Para revisión delegada,
> en contexto aislado, usar los subagentes de `.claude/agents/` (`code-reviewer`,
> `security-auditor`).
