# Requisitos (PRD)

## Problema

Cada proyecto nuevo obliga a elegir de nuevo el stack, y se decide con información
vieja o de memoria: se mezclan versiones, se juntan piezas que no son compatibles
entre sí y la IA que ayuda termina inventando APIs. El resultado es retrabajo y un
stack distinto en cada proyecto sin una razón detrás.

## Objetivos

- Que elegir el stack de un proyecto tome minutos y deje el motivo por escrito.
- Que nunca se recomiende una combinación rota (una pieza que necesita algo que no está).
- Que quede claro qué se verificó contra documentación vigente y qué no.
- Que la decisión llegue al repo del proyecto sin copiar a mano.

## Alcance

### Incluido

- Armador libre: elegir a mano la tecnología de cada capa, combinando lo que se quiera, con avisos en lugar de bloqueos.
- Recomendación capa por capa para 10 tipos de proyecto y 16 capas, como punto de partida ("Sugerime uno").
- Explicación de cada elección, alternativas compatibles y descartes con su motivo.
- Perfil del usuario (lo que domina y lo que ya paga).
- Exportación a un bloque de `AGENTS.md` y a un ADR.

### Fuera de alcance

- Cuentas de usuario, backend, analítica e IA dentro de la app.
- Generar el proyecto (scaffolding) o instalar nada.
- Comparar precios en vivo o versiones en vivo: el catálogo se verifica a mano, por tandas.

## Usuarios y casos de uso

Un solo perfil: quien arranca proyectos y trabaja con IA (hoy, Luis).

1. Armar el stack de un proyecto nuevo a gusto, o pedir una sugerencia y ajustarla.
2. Fijar una pieza que ya está decidida y ver cómo se adapta el resto.
3. Llevar la decisión al `AGENTS.md` y a `03_DECISIONS.md` del proyecto.

## Requisitos funcionales

_Prioridad: **M** (Must) · **S** (Should) · **C** (Could)._

### RF-01 — Recomendar el stack por capas

**Prioridad:** M

**Criterios de aceptación:**

- CUANDO el usuario cambia una respuesta, EL SISTEMA DEBE recalcular el stack completo en la misma pantalla.
- EL SISTEMA DEBE mostrar solo las capas que aplican al tipo de proyecto y a lo que este necesita.
- EL SISTEMA DEBE dar el mismo resultado para las mismas respuestas.

### RF-02 — Evitar combinaciones rotas

**Prioridad:** M

**Criterios de aceptación:**

- SI una tecnología necesita una capacidad que nada de lo elegido aporta, EL SISTEMA DEBE descartarla y decir cuál falta.
- SI una tecnología choca con algo ya elegido, EL SISTEMA DEBE descartarla y nombrar con qué choca.
- SI el presupuesto es cero, EL SISTEMA NO DEBE recomendar una tecnología de pago.

### RF-03 — Explicar cada elección

**Prioridad:** M

**Criterios de aceptación:**

- EL SISTEMA DEBE mostrar, por capa, por qué se eligió esa tecnología.
- EL SISTEMA DEBE listar las otras opciones compatibles.
- EL SISTEMA DEBE listar lo descartado con el motivo de cada descarte.
- SI una capa no tiene ninguna opción compatible, EL SISTEMA DEBE decirlo y explicar por qué.

### RF-04 — Fijar una pieza

**Prioridad:** S

**Criterios de aceptación:**

- CUANDO el usuario elige "Usar X" en una capa, EL SISTEMA DEBE fijarla y adaptar las capas siguientes.
- SI la pieza fijada es incompatible con lo anterior, EL SISTEMA DEBE decir por qué en vez de elegir otra en silencio.
- CUANDO cambia el tipo de proyecto, EL SISTEMA DEBE quitar las piezas fijadas.

### RF-05 — Perfil del usuario

**Prioridad:** S

**Criterios de aceptación:**

- CUANDO el usuario marca que domina, conoce o prefiere no usar una tecnología, o que ya la paga, EL SISTEMA DEBE reflejarlo en el orden.
- EL SISTEMA NO DEBE dejar que el perfil por sí solo cambie la mejor opción para el tipo de proyecto.

### RF-06 — Mostrar qué está verificado

**Prioridad:** M

**Criterios de aceptación:**

- EL SISTEMA DEBE mostrar, en cada elección, "Verificada" con la fecha o "Sin verificar".
- EL SISTEMA DEBE usar la verificación solo para desempatar, sin sumar puntos.
- EL SISTEMA DEBE exigir fecha y fuente en toda tecnología marcada como verificada.

### RF-07 — Exportar la decisión

**Prioridad:** M

**Criterios de aceptación:**

- EL SISTEMA DEBE ofrecer un bloque para la sección Proyecto de `AGENTS.md` y un ADR, ambos para copiar y para descargar.
- SI hay tecnologías sin verificar entre las elegidas, EL SISTEMA DEBE avisarlo dentro del texto exportado.
- CUANDO el stack se armó a mano, EL SISTEMA DEBE decirlo en el texto exportado e incluir los avisos que quedaron sin resolver.

### RF-08 — Recordar las respuestas

**Prioridad:** C

**Criterios de aceptación:**

- CUANDO el usuario vuelve a abrir la app, EL SISTEMA DEBE recuperar sus respuestas, su perfil y el stack armado de ese navegador.
- SI el navegador no permite guardar datos, EL SISTEMA DEBE funcionar igual, sin recordar.

### RF-09 — Armar el stack a mano

**Prioridad:** M

**Criterios de aceptación:**

- EL SISTEMA DEBE abrir en el armador, con todas las capas visibles y todas las tecnologías del catálogo de cada capa, sin filtrar por compatibilidad.
- EL SISTEMA DEBE permitir elegir una tecnología, "No uso nada" o dejar la capa sin elegir.
- EL SISTEMA NO DEBE bloquear ninguna combinación.
- EL SISTEMA DEBE distinguir lo elegido por la persona de lo sugerido.

### RF-10 — Avisar de problemas sin decidir por la persona

**Prioridad:** M

**Criterios de aceptación:**

- SI una tecnología elegida necesita una capacidad que nada de lo elegido aporta, EL SISTEMA DEBE avisarlo y decir cuál falta, sin importar el orden de las capas.
- SI dos tecnologías elegidas chocan, EL SISTEMA DEBE avisarlo en ambas.
- SI se mezclan lenguajes, EL SISTEMA DEBE avisarlo como información, no como problema.
- CUANDO hay respuestas del proyecto, EL SISTEMA DEBE avisar además de presupuesto, tipo de proyecto y condiciones que no se cumplen.
- EL SISTEMA DEBE mostrar los avisos en la ficha de cada opción y en el resumen del stack.

### RF-11 — Sugerir un punto de partida

**Prioridad:** S

**Criterios de aceptación:**

- CUANDO la persona pide una sugerencia, EL SISTEMA DEBE rellenar solo las capas que no eligió ella.
- EL SISTEMA DEBE usar lo que la persona eligió a mano para adaptar el resto.

## Requisitos no funcionales

### RNF-01 — Determinismo

**Prioridad:** M

- EL SISTEMA DEBE dar el mismo resultado para las mismas respuestas y el mismo catálogo.

### RNF-02 — Privacidad

**Prioridad:** M

- EL SISTEMA NO DEBE enviar ningún dato fuera del navegador: sin cuentas, sin backend, sin analítica.

### RNF-03 — Accesibilidad y uso en pantallas chicas

**Prioridad:** M

- EL SISTEMA DEBE poder usarse solo con teclado, con etiquetas en cada control.
- EL SISTEMA DEBE verse bien en modo claro y oscuro y en un teléfono, sin scroll horizontal.

### RNF-04 — Catálogo fácil de ampliar

**Prioridad:** M

- Agregar una tecnología DEBE requerir solo un registro nuevo, y `npm test` DEBE rechazar un registro inválido.
