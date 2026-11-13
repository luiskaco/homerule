# Migrar los documentos de un proyecto (ADR-035)

Guía para pasar la carpeta `docs/` de un proyecto existente a la estructura
nueva. Está pensada para que la siga una IA, de a un proyecto por vez.

Pedido para la IA: "seguí `makeRuleIA/docs/migrate-docs.md` en este proyecto".

## Antes de empezar

1. Traer lo último de makeRuleIA y del proyecto (`git pull` en los dos).
2. Crear una rama en el proyecto: `docs/migrate-docs`.
3. Mostrarle al usuario qué archivos tiene hoy `docs/` y esperar su OK.

## Pasos

| Hoy | Pasa a | Qué hacer |
|---|---|---|
| `01_PROJECT_PRD.md` | `01_PRD.md` | Renombrar (`git mv`) y cambiar el título. |
| `06_TASKS.md` | `02_TASKS.md` | Reescribir: ver "Tareas" abajo. |
| `07_DECISIONS.md` | `03_DECISIONS.md` | Renombrar y agregar el índice: ver "Decisiones" abajo. |
| `08_CHANGELOG.md` | `04_CHANGELOG.md` | Renombrar. Lo viejo queda como está; lo nuevo, una línea por cambio arriba. |
| `02_SDD.md` + `03_SYSTEM_SPEC.md` + `05_ARCHITECTURE.md` | `ARCHITECTURE.md` | Unir en un solo archivo, una sección por cada uno. Sacar lo que se repita. Si los tres están vacíos o con la plantilla, borrarlos y no crear `ARCHITECTURE.md`. |
| `04_DATA_MODEL.md` | `DATA_MODEL.md` | Renombrar. Si está vacío, borrarlo. |
| `09_TESTING.md` | `TESTING.md` | Renombrar. Si está vacío, borrarlo. |
| `10_RUNBOOK.md` | `RUNBOOK.md` | Renombrar. Si está vacío, borrarlo. |
| `CONTEXT.md` | `CONTEXT.md` | Queda igual. |

"Vacío" quiere decir que solo tiene el texto de la plantilla.

### Tareas

1. Dejar solo las tareas abiertas, como mucho 10, cada una en 2–3 líneas: qué es y "Hecho cuando".
2. Las cerradas se borran. Si una no figura en el changelog, dejarle una línea ahí antes de borrarla.
3. El historial de avance de cada tarea ("Estado", "Avance", "Hecho") se borra: está en git.
4. Reescribir "Dónde quedó" con la estructura de `docs-templates/02_TASKS.md`.
5. Si quedan más de 10 abiertas, mostrárselas al usuario para que elija cuáles cerrar o descartar.

### Decisiones

Agregar al principio una tabla con una línea por ADR: número, título y estado.
El contenido de cada ADR no cambia.

## `AGENTS.md` (ADR-036)

1. Reescribir el `AGENTS.md` del proyecto con la plantilla
   `makeRuleIA/core/agents-map.md`: qué es, stack y comandos, estructura, lo no
   negociable y cómo continuar.
2. Pasar ahí lo que el proyecto tenía propio: su sección **Proyecto**, sus
   excepciones a las reglas y las notas del proyecto. Lo que ya no aplique se
   descarta.
3. Borrar la copia de las reglas generales: secciones 0 a 8 y el mapa del kit.
4. Si el `CLAUDE.md` del proyecto solo importa `AGENTS.md`, dejarlo así: las
   reglas generales se cargan desde los archivos globales.
5. Mantenerlo corto: lo que alguien nuevo necesita para no romper nada.

## Referencias

1. Buscar en el proyecto los nombres viejos: `AGENTS.md`, `CLAUDE.md`,
   `GEMINI.md`, `.claude/`, `.agents/` y el README.
2. Si el proyecto tiene el kit instalado, actualizar comandos, reglas y agentes
   con el kit nuevo desde el sitio, sin pisar lo que el proyecto personalizó.

## Cierre

1. Mostrar el diff al usuario.
2. Con su OK, commit `docs: migrar docs/ a la estructura de ADR-035` y PR.
3. Anotar el proyecto como migrado en `docs/kit-pause.md`, sección
   "Novedades para llevar a la PC del trabajo".
