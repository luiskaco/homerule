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

**Fin anticipado (2026-11-13):** el autor decidió cambiar la forma de trabajar sin esperar al 19: el kit pasa a instalarse en la carpeta personal (ADR-038). Lo que sigue pendiente de la revisión está abajo.

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
- ~~Elegir qué manda: Proactive o la Regla de Oro~~: hecho el 2026-11-11, adelantado. Mixta: la Regla de Oro frena solo en sus condiciones de Validar; fuera de ellas se ejecuta sin pedir permiso (§ 1).
- Medir cuánto gasta cada subagente, como quedó anotado en ADR-030.
- ~~Revisar `debugger`~~: hecho el 2026-11-11, adelantado: descripción y prompt aclaran que corre tests pero no escribe; si necesita escribir, se lo pide al agente principal. Sin hook nuevo.
- Evaluar un subagente de rendimiento: ningún agente del kit revisa velocidad, carga, bundle ni consultas lentas. Decidirlo junto con la medición de gasto de los subagentes, para no sumar uno que no se use.
- ~~Quitar de los `AGENTS.md` de los proyectos la copia de las reglas generales~~: pasa a la migración de cada proyecto con `docs/migrate-docs.md` (ADR-036), en la misma pasada que sus documentos.
- ~~Sumar a `security-auditor` cuatro ideas~~: hecho el 2026-11-11, adelantado: estados confirmado / a verificar / descartado, escala de gravedad con ejemplos, refuerzos sin severidad, y un Critical se valida con una instancia nueva en `/security-audit`. También en el agente `security` de Antigravity.
- ~~Sumar a la rule `architecture` la "escalera"~~: hecho el 2026-11-11, adelantado: sección "Antes de escribir código nuevo". `claude-mem` sigue descartado (ADR-034).

Lo demás pendiente está en `02_TASKS.md`.

## Novedades para llevar a la PC del trabajo

Lo que cambió en los archivos globales desde la última vez que se actualizaron allá.
Al llegar, hacer los pasos 1 y 2 de la sección siguiente y borrar la línea de acá.

- **2026-11-13 — Freno de secretos y menos sugerencias repetidas** (ADR-041): además de los pasos 1 y 2, el paso 6.

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

2. Instalar o actualizar el kit global (ADR-038): núcleo, rules, skills, comandos y
   subagentes de Claude y de Antigravity, con respaldo. Sin `--write` solo compara:

   ```bash
   node scripts/install-global.mjs --write
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

6. Activar el freno de secretos al commitear (ADR-041), desde la carpeta del repo:

   ```bash
   git config --global core.hooksPath "$(pwd)/git-hooks"
   ```
