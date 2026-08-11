---
name: domain-modeling
description: >
  Usar mientras se trabaja, no como paso aparte: al aparecer un término del
  dominio nuevo o ambiguo, al detectar que dos personas (o el código y la
  conversación) le dan sentidos distintos a la misma palabra, o al nombrar
  entidades, tablas, tipos y endpoints. Mantiene vivo el glosario del
  proyecto en `docs/CONTEXT.md`.
---

# Domain Modeling

Construir y afilar el vocabulario compartido del proyecto. Es una disciplina
activa: se cuestionan los términos, se prueban con escenarios concretos y se
documentan las definiciones cuando quedan firmes — no es leer un archivo y
seguir.

Un vocabulario preciso es lo que hace que "el usuario cancela la reserva"
signifique una sola cosa para vos, para el agente y para el código. Cuando
no lo es, aparece el mismo concepto con tres nombres distintos en tres capas.

## Dónde vive

- **`docs/CONTEXT.md`** — el glosario. Un término por entrada: qué es, qué
  **no** es, y cómo se llama en el código.
- **`docs/04_DATA_MODEL.md`** — entidades y campos técnicos. `CONTEXT.md` es
  el lenguaje del negocio; `04` es el esquema. Un término del glosario puede
  no tener tabla, y una tabla puede no ser un término del dominio.
- **`docs/07_DECISIONS.md`** — si la definición de un término implicó
  descartar alternativas con trade-offs reales, eso es un ADR, no una entrada
  de glosario.

Crear `CONTEXT.md` recién cuando haya al menos 3 términos que lo justifiquen
(plantilla en `docs-templates/CONTEXT.md`). Un proyecto chico no lo necesita.

## Qué hacer, mientras trabajás

- **Validar contra lo escrito.** Si el usuario usa un término con un sentido
  distinto al que ya está en `CONTEXT.md`, señalarlo en el momento — no
  asumir cuál de los dos gana ni "adaptarse" en silencio.
- **Atacar la vaguedad.** Ante un término sobrecargado ("item", "registro",
  "proceso", "estado"), proponer un nombre canónico más preciso y usarlo de
  ahí en adelante.
- **Probar con escenarios.** Antes de dar por buena una definición, probarla
  con un caso concreto y con un caso borde: "¿una reserva cancelada por el
  sistema por falta de pago sigue siendo una *cancelación*, o es otra cosa?".
  Los bordes son donde se descubre que faltaba un término.
- **Verificar contra el código.** Si el glosario dice una cosa y los
  identificadores dicen otra, reportar la discrepancia. La convención es
  identificadores en inglés (`CORE.md § 2`), así que cada entrada lleva su
  equivalente en código.
- **Documentar inline.** Actualizar `CONTEXT.md` en cuanto un término queda
  firme, no al final de la sesión.

## Qué NO hacer

- No convertir `CONTEXT.md` en especificación: nada de endpoints, schemas ni
  detalles de implementación — eso es `03_SYSTEM_SPEC.md` y `04_DATA_MODEL.md`.
- No documentar un término "por si acaso". Si no apareció en una conversación
  ni en el código, no va.
- No crear un ADR por cada definición. Un ADR necesita las tres cosas:
  decisión costosa de revertir, no obvia sin contexto, y con alternativas
  reales evaluadas. Si falta una, es una entrada de glosario y nada más.
