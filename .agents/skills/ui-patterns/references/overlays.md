# Modales, cajones, popovers, tooltips y toasts

Todos aparecen encima del contenido. Se diferencian en cuánto interrumpen y en
si el usuario puede seguir trabajando debajo.

## Cómo elegir

| Necesidad | Patrón | ¿Bloquea lo de abajo? |
|---|---|---|
| Decisión que hay que tomar ya (confirmar un borrado) | Modal de alerta | Sí |
| Tarea corta que no merece otra página (editar un dato) | Modal | Sí |
| Detalle o formulario largo sin perder el contexto | Cajón lateral (drawer / sheet) | Sí, o no si es lateral fijo |
| Opciones o datos ligados a un elemento | Popover | No |
| Aclarar qué hace un control | Tooltip | No |
| Avisar el resultado de una acción | Toast | No |
| Elegir una acción de una lista | Menú desplegable (dropdown) | No |

## Catálogo

**Modal.** Usar `<dialog>` con `showModal()`: trae el foco atrapado, Escape para
cerrar y el fondo inerte sin código extra. Lleva título, y el foco vuelve al
botón que lo abrió. Un modal no abre otro modal.

**Modal de alerta.** Para lo destructivo o irreversible. El botón de la acción
dice qué hace ("Eliminar proyecto"), no "Aceptar". Si la acción se puede
deshacer, mejor un toast con "Deshacer" que un modal.

**Cajón lateral (drawer / sheet).** Panel que entra desde un borde. En móvil, el
sheet inferior reemplaza al modal. Mismas reglas de foco que el modal.

**Popover.** Panel chico anclado a un elemento: filtros, selector de fecha,
mini perfil. El atributo `popover` de HTML trae el cierre al hacer clic afuera
y con Escape. Para ubicarlo junto al elemento, el anchor positioning de CSS es
Baseline desde 2026; en navegadores viejos, un respaldo con JavaScript.

**Tooltip.** Texto corto que aparece con hover **y** con foco. Solo aclara: nunca
lleva información que no esté en otro lado, ni enlaces o botones adentro, porque
en táctil casi no se ve. Un botón de solo ícono necesita `aria-label` aunque
tenga tooltip.

**Toast.** Mensaje breve en una esquina que se va solo. Anunciado con
`aria-live="polite"`; un error urgente usa `role="alert"`. Si tiene una acción
("Deshacer"), dura lo suficiente para usarla, se pausa con hover o foco y se
puede cerrar.

**Menú desplegable (dropdown).** Lista de acciones bajo un botón. Patrón ARIA de
menú: flechas para recorrer, Enter para elegir, Escape para cerrar. Si son
opciones de un formulario, es un `<select>`, no un menú.

## En vez de

| Pidieron | Mejor |
|---|---|
| Modal para un formulario largo | Página propia o cajón lateral |
| Modal de "¿Seguro?" en cada acción | Toast con "Deshacer" |
| Tooltip con información importante | Texto visible o ayuda debajo del campo |
| Toast para un error de formulario | Error junto al campo |
| Popup que aparece al entrar al sitio | Banner no bloqueante, o nada |
