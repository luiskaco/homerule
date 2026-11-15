# Decisiones de arquitectura (ADR)

## Índice

| ADR | Decisión | Estado |
|---|---|---|
| 001 | Recomendador con reglas fijas y app estática | Aceptada |
| 002 | Capacidades `provides` y `needs` para evitar combinaciones rotas | Aceptada |
| 003 | La verificación desempata, no suma puntos | Aceptada |
| 004 | Un solo lenguaje en el stack suma puntos | Aceptada |
| 005 | Kit de Claude Code con `AGENTS.md` reducido | Aceptada |
| 006 | Armador libre con avisos, en lugar de solo recomendar | Aceptada |

## ADR-001 — Recomendador con reglas fijas y app estática

**Fecha:** 2026-11-08
**Estado:** Aceptada

**Contexto:** El prototipo inicial mostraba un solo stack, tomado de un video, y nunca preguntaba cómo era el proyecto. Los puntajes eran fijos y permitía combinaciones rotas.

**Decisión:** Un recomendador que pregunta por el proyecto y decide con reglas fijas sobre un catálogo que vive en el repo. Sin IA ni backend: es una app estática.

**Alternativas consideradas:**

- **Catálogo para explorar a mano:** descartada. Es referencia, pero no resuelve "elegir el mejor stack".
- **Recomendación generada por un modelo:** descartada. No es explicable ni determinista, y gasta tokens en cada consulta.

**Consecuencias:** El resultado es explicable y reproducible. A cambio, la calidad depende de la calidad del catálogo, que hay que curar a mano.

## ADR-002 — Capacidades `provides` y `needs` para evitar combinaciones rotas

**Fecha:** 2026-11-08
**Estado:** Aceptada

**Contexto:** Había que impedir recomendaciones como Drizzle con un backend en Python, o Auth.js sin un runtime de JavaScript.

**Decisión:** Cada ficha declara lo que aporta (`provides`) y lo que necesita (`needs`). Las capas se recorren en orden y una ficha solo es candidata si lo elegido antes cubre sus necesidades. Los choques se comprueban en los dos sentidos.

**Alternativas consideradas:**

- **Matriz de compatibilidad a mano entre pares de tecnologías:** descartada. Crece con el cuadrado del catálogo y se desactualiza.

**Consecuencias:** Agregar una ficha es declarar su forma, no tocar el motor. La elección es voraz (en orden, sin reconsiderar), así que una elección temprana puede dejar sin opciones a una capa posterior; los tests recorren más de mil combinaciones para detectarlo.

## ADR-003 — La verificación desempata, no suma puntos

**Fecha:** 2026-11-08
**Estado:** Aceptada

**Contexto:** Casi todo el catálogo se cargó de memoria. Se quería privilegiar lo verificado contra documentación vigente.

**Decisión:** La verificación solo desempata entre opciones con el mismo puntaje. Lo sin verificar se marca en pantalla y en lo exportado.

**Alternativas consideradas:**

- **Filtrar solo lo verificado:** descartada. Dejaba capas vacías.
- **Sumar 2 puntos a lo verificado:** probada y descartada. Stripe, verificado, le ganó a WooCommerce en un sitio WordPress: la verificación cambiaba qué tan bien encaja una tecnología.

**Consecuencias:** Lo verificado nunca desplaza a algo que encaja mejor. Para que pese en la práctica hay que seguir verificando el catálogo (T-01).

## ADR-004 — Un solo lenguaje en el stack suma puntos

**Fecha:** 2026-11-08
**Estado:** Aceptada

**Contexto:** Con 5 proyectos de ejemplo salieron stacks como Next.js más un FastAPI aparte y Prisma, que mantienen dos toolchains sin motivo.

**Decisión:** Una tecnología que comparte lenguaje con lo ya elegido suma 2 puntos; una que agrega otro lenguaje resta 2.

**Alternativas consideradas:**

- **Reglas de maridaje a mano (Next.js solo con Node):** descartada, por la misma razón que en ADR-002.

**Consecuencias:** Los stacks salen coherentes. FastAPI sigue siendo la mejor opción para APIs, apps con IA y scripts de datos, donde su puntaje de tipo de proyecto compensa el segundo lenguaje.

## ADR-005 — Kit de Claude Code con `AGENTS.md` reducido

**Fecha:** 2026-11-08
**Estado:** Aceptada

**Contexto:** El proyecto se trabaja solo con Claude Code y las reglas generales ya están en `~/.claude/CLAUDE.md`. El `AGENTS.md` del ZIP del kit trae una copia de esas reglas (unos 3.000 tokens) que se cargaría dos veces y se desactualizaría.

**Decisión:** Se aplicó el kit de Claude Code sin el kit híbrido. `AGENTS.md` lleva solo el mapa y la sección Proyecto, y `CLAUDE.md` lo importa. Se omiten `db-migration-reviewer` (no hay base de datos) y las rules `cms`, `pwa`, `seo`, `operations` y `database`.

**Alternativas consideradas:**

- **`AGENTS.md` completo del ZIP:** descartada. Carga doble y copia que envejece; el repo ya planea quitar esa copia de los proyectos.
- **Kit híbrido Claude + Gemini:** descartada. Este proyecto no usa Antigravity.

**Consecuencias:** Si otra máquina u otra IA toma el proyecto sin el archivo global, no tendrá las reglas generales; ahí hay que copiar `core/CORE.md` de AI Rules Hub o usar el ZIP completo.

## ADR-006 — Armador libre con avisos, en lugar de solo recomendar

**Fecha:** 2026-11-08
**Estado:** Aceptada

**Contexto:** La versión 0.1.0 solo recomendaba: filtraba lo incompatible y elegía por la persona. Al probarla no era lo buscado: quería combinar libremente (React con Python, Node o PHP; cualquier base; CSS puro o Bootstrap) y que la decisión fuera suya.

**Decisión:** La pantalla abre en "Armar el mío". Cada capa muestra todas las tecnologías del catálogo, sin filtrar. Un motor aparte (`src/engine/assemble.ts`) evalúa la selección y devuelve avisos con su motivo; nunca bloquea. `recommend` queda como botón "Sugerime uno" y respeta lo que la persona ya eligió. Los avisos distinguen `warning` (probable problema) de `info` (decisión válida, como mezclar lenguajes). Los requisitos se miran contra la selección completa, no por orden de capas.

**Alternativas consideradas:**

- **Mantener el recomendador y sumar un modo armador:** descartada. La persona pidió empezar por armar; el recomendador pasa a ser ayuda.
- **Bloquear las combinaciones rotas:** descartada. Contradice el pedido y esconde casos válidos (por ejemplo un ORM de JavaScript con un backend que se agregará después).

**Consecuencias:** El catálogo debe cubrir lo que la persona quiere combinar (se sumaron Laravel, Bootstrap y Pest). El deploy sigue siendo una sola capa: un stack con frontend y backend en distintos lenguajes puede quedar con un único hosting propuesto. Se borró `ResultView.tsx`, reemplazado por `LayerPicker`.
