---
name: ui-patterns
description: Catálogo de patrones de interfaz por tema (animaciones y efectos, menús y navegación, modales, cajones, popovers, tooltips, toasts, skeletons, barras de progreso y estados vacíos). Usar al elegir o nombrar un patrón, al pedir un efecto o un tipo de menú, o al revisar si el elegido es el correcto. Lo obligatorio de toda interfaz está en la regla ui-ux.
---

# UI Patterns

Vocabulario común para la persona y la IA: qué es cada patrón, cuándo conviene,
cuándo no y cómo se hace sin romper la accesibilidad. Se abre solo el tema que
toca; leerlos todos no mejora la elección.

## Cómo usarla

1. Si el pedido nombra un patrón ("un mega menú", "un efecto parallax"),
   abrí su tema y confirmá que encaja con el caso antes de construirlo.
2. Si el pedido describe un problema ("muchas secciones", "avisar que se
   guardó"), abrí el tema y proponé el patrón que corresponda, con el motivo.
3. Si el patrón pedido no conviene, decilo y ofrecé la alternativa de la
   tabla "En vez de".
4. Usá primero lo que trae la plataforma (`<dialog>`, `popover`, `<details>`,
   transiciones CSS) y los componentes que el proyecto ya tiene. Una librería
   nueva por un solo patrón no se justifica.

## Qué tema abrir

| Si el pedido toca… | Abrir |
|---|---|
| Animaciones, transiciones, efectos al hacer scroll, microinteracciones | `references/motion.md` |
| Menús, navegación principal, pestañas, migas de pan, búsqueda de comandos | `references/navigation.md` |
| Modales, cajones laterales, popovers, tooltips, toasts, menús desplegables | `references/overlays.md` |
| Carga, progreso, estados vacíos, confirmaciones y errores | `references/feedback.md` |

## Qué no hace

- **No repite lo obligatorio:** contraste, foco, 5 estados y movimiento
  reducido están en la regla `ui-ux`. Si esta skill y la regla difieren, manda
  la regla y hay que corregir esta.
- **No define la estética:** colores, tipografía y estilo son de
  `frontend-design` o del sistema de diseño del proyecto.
- **No trae código de librerías:** los ejemplos usan HTML y CSS de la
  plataforma. Para una librería, consultar su documentación vigente.
