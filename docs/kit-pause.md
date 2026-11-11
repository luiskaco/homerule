# Pausa del kit — recordatorio

Para retomar este tema desde cualquier máquina o conversación, sin el historial
donde se decidió. Empezá pidiendo: "leé `docs/kit-pause.md` y seguimos desde ahí".

## La decisión

**Desde el 2026-11-05 hasta el 2026-11-19, el kit queda congelado.** Durante esas
dos semanas se trabaja solo en los proyectos reales. Si algo del kit molesta, se
anota abajo y no se arregla en el momento. Al terminar, se corrige solo lo que se
repitió.

**Por qué:** en una revisión honesta de la forma de trabajar salió que hay mucho
orden y buen control de calidad, pero también mucho tiempo puesto en ajustar el
propio sistema:

- 16 PRs del kit en unos 11 días.
- Decisiones que se hicieron y se deshicieron: `deploy-checker` se creó y se
  eliminó al día siguiente, `planner` pasó a Sonnet y volvió a Opus, y el modo
  híbrido salió y volvió.
- Decisiones tomadas por sensación, sin datos: por ejemplo, el gasto de tokens.

La revisión se basó en una sola conversación y sin métricas, así que el trabajo
de producto no entró en ella.

**Qué se puede hacer igual:** arreglar algo roto que frene el trabajo, y actualizar
documentación. Mejoras y funciones nuevas del kit esperan al 2026-11-19.

**Excepción (2026-11-06):** el autor pidió alinear el kit a 2026 (errores, datos
desactualizados y seguridad de dependencias) y crear la skill de seguridad por
temas, y llevarlo a sus proyectos. El resto sigue esperando.

**Excepción (2026-11-08):** el autor pidió la regla de explicaciones en § 0 (regla de
escritura 8, estilo ASD-STE100).

## Fricciones

Una línea por cada vez que el kit estorbe: fecha, proyecto, herramienta y qué pasó.

| Fecha | Proyecto | IA | Qué pasó |
|---|---|---|---|
| | | | |

## Cómo quedó todo

- **Kit híbrido "Claude + Gemini":** publicado en
  [la web](https://make-rule-ia.vercel.app/es/kits/hybrid) (PR #21, ADR-031).
- **pluginWordpress:** migrado al híbrido y subido.
- **makeNewMonitorLatam:** usa las dos IA, pero sigue con el kit armado a mano y
  tiene cambios del kit sin commitear. Se migra cuando se termine de trabajar ahí.
- **PorUnPeruSinCancerIA y observatorioIIA2026:** solo los trabaja Gemini. Claude
  deja los archivos y Gemini se encarga de commitear y subir.

## Decidido no hacer por ahora

- **Avisar entre IA:** ninguna se entera de que otra trabaja en el mismo proyecto,
  así que el usuario les avisa. Se habló de reglas comunes en `AGENTS.md` y de un
  archivo de trabajo compartido, y se decidió seguir como está.
- **Abrir el híbrido a cualquier agente:** `AGENTS.md` y `.agents/` no dependen de
  ninguna herramienta, pero el nombre, algunos textos y los punteros de `.claude/`
  sí nombran a Claude o a Gemini. Con otra herramienta no se probó.

## Para revisar el 2026-11-19

- Leer la tabla de fricciones y corregir lo que se repitió.
- Elegir qué manda: el estilo "Proactive" de Claude, que pide ejecutar sin frenar,
  o la Regla de Oro, que pide analizar y validar antes de tocar nada. Hoy se
  contradicen.
- Medir cuánto gasta cada subagente, como quedó anotado en ADR-030.
- Revisar `debugger`: no tiene el hook de solo lectura porque necesita correr tests (ADR-021), pero su descripción dice "No edita código" y la terminal le queda libre. Decidir si alcanza con aclarar la descripción o si conviene otro control. Un hook que solo deje pasar tests no protege de verdad, porque un test puede ejecutar cualquier código.
- Evaluar un subagente de rendimiento: ningún agente del kit revisa velocidad, carga, bundle ni consultas lentas. Decidirlo junto con la medición de gasto de los subagentes, para no sumar uno que no se use.
- ~~Quitar de los `AGENTS.md` de los proyectos la copia de las reglas generales~~: pasa a la migración de cada proyecto con `docs/migrate-docs.md` (ADR-036), en la misma pasada que sus documentos.
- Sumar a `security-auditor` cuatro ideas de la skill [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) (MIT, citar la fuente): tres resultados posibles (confirmado, falta validar, descartado), que quien valida un hallazgo no sea el agente que lo encontró, una escala de gravedad con ejemplos, y que la falta de una capa de refuerzo no cuente como vulnerabilidad si otra capa ya frena el ataque. La skill completa no se vendoriza: es de 6 fases con muchos subagentes, pide una sandbox que acá no hay y choca de nombre con `/security-audit`.
- Sumar a la rule `architecture` la "escalera" de [ponytail](https://github.com/dietrichgebert/ponytail) (MIT, citar la fuente): antes de escribir código, preguntar si hace falta, si ya existe en el repo, si lo resuelve la librería estándar o una dependencia ya instalada, y recién ahí escribir lo mínimo; no sumar una dependencia por pocas líneas, sin recortar validación, seguridad ni accesibilidad. El plugin completo no se instala: se mete en cada sesión con un estilo de respuesta propio que choca con § 0 y la Regla de Oro. Su barra de costo por tarea sirve de referencia para medir el gasto de los subagentes. `claude-mem` se descartó: envía lo que hacen las herramientas a un modelo externo y trae analítica activada (ADR-034).

Lo demás pendiente está en `02_TASKS.md`.

## Novedades para llevar a la PC del trabajo

Lo que cambió en los archivos globales desde la última vez que se actualizaron allá.
Al llegar, hacer los pasos 1 y 2 de la sección siguiente y borrar la línea de acá.

- **2026-11-10 — Documentos simplificados** (ADR-035): los globales cambian en
  § 4, § 5 y § 8. Además, migrar los `docs/` de cada proyecto con
  `docs/migrate-docs.md` y anotar acá cada uno que quede hecho.
  - Migrados: _ninguno todavía_.

## En otra máquina

Esta conversación y la memoria de Claude no viajan: quedan en la máquina donde se
crearon. Lo que viaja es este repo.

1. Traer lo último del repo:

   ```bash
   git pull
   ```

2. Poner al día los archivos globales, porque el kit híbrido depende de ellos.
   El script los genera desde `core/CORE.md` y `.gemini/GEMINI.md`, con copia de
   respaldo. Sin `--write` solo dice si están desactualizados:

   ```bash
   node scripts/sync-globals.mjs --write
   ```
3. Para seguir con un proyecto, también hay que tenerlo clonado en esa máquina.
4. Poner la identidad de git con tu correo privado de GitHub, igual que en esta máquina:

   ```bash
   git config --global user.name "Luis Gomez"
   ```

   ```bash
   git config --global user.email "19978113+luiskaco@users.noreply.github.com"
   ```

5. Instalar el bloqueo de datos personales (ADR-034): copiar
   `.claude/hooks/personal-data-guard.mjs` a `~/.claude/hooks/`, crear
   `~/.claude/personal-data.txt` con tus datos, uno por línea, y agregar el hook a
   `~/.claude/settings.json`, como explica la cabecera del archivo.
