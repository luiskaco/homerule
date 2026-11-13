# Menús y navegación

La navegación responde dos preguntas: dónde estoy y a dónde puedo ir. El patrón
depende de cuántos destinos hay y de si el usuario navega o busca.

## Cómo elegir

| Situación | Patrón |
|---|---|
| Hasta 5–7 secciones, sitio o app chica | Barra horizontal arriba |
| Muchas secciones agrupadas por tema (tienda, portal) | Mega menú |
| App de trabajo con muchas secciones que se usan a diario | Menú lateral (sidebar) |
| App móvil con 3–5 destinos principales | Barra de pestañas abajo (tab bar) |
| Contenido en niveles (categoría → subcategoría → ficha) | Migas de pan, además del menú |
| Usuarios expertos que saben lo que buscan | Paleta de comandos, además del menú |
| Vistas del mismo objeto (datos, actividad, ajustes) | Pestañas (tabs) |

## Catálogo

**Barra superior (top nav).** Los destinos a la vista. En móvil se colapsa en un
menú hamburguesa o pasa a tab bar. Marcar la página actual con
`aria-current="page"`, no solo con color.

**Hamburguesa.** Esconde el menú detrás de un botón. Ahorra espacio, pero lo
escondido se usa menos: no meter ahí la acción principal. El botón lleva
`aria-expanded` y `aria-controls`, y una etiqueta ("Menú"), no solo el ícono.

**Mega menú.** Panel ancho con destinos agrupados en columnas. Se abre con clic
o con foco, no solo con hover: con hover se abre por accidente y no funciona en
pantallas táctiles. Se cierra con Escape y al sacar el foco.

**Menú lateral (sidebar).** Lista vertical fija a un costado. Admite grupos y
se puede colapsar a íconos, con tooltip en cada uno. En móvil pasa a cajón
(ver `overlays.md`).

**Tab bar inferior.** 3 a 5 destinos con ícono y texto, al alcance del pulgar.
Más de 5 no entran. Cada pestaña conserva su estado al volver.

**Pestañas (tabs).** Cambian la vista dentro de la misma página. Usar el patrón
ARIA de tabs: flechas para moverse entre pestañas y `aria-selected`. Si cada
pestaña tiene su URL, son enlaces de navegación, no tabs.

**Migas de pan (breadcrumbs).** Muestran el camino hasta la página actual. Van
en un `<nav aria-label="Migas de pan">`, el último elemento no es enlace y
lleva `aria-current="page"`.

**Paleta de comandos.** Buscador de acciones y destinos que se abre con un atajo
(Ctrl/Cmd + K). Complementa el menú, nunca lo reemplaza: quien no conoce el
atajo no la encuentra.

**Menú de acciones (kebab ⋮ / meatballs ⋯).** Agrupa acciones secundarias de un
elemento. La acción principal va a la vista, nunca adentro.

**Paginación vs. scroll infinito vs. "Cargar más".** Paginación cuando el
usuario busca algo concreto y necesita volver al mismo lugar. Scroll infinito
para feeds sin fin, nunca con un pie de página que haya que alcanzar. "Cargar
más" es el término medio y el más seguro.

## Reglas comunes

- La navegación principal va en `<nav>`, y si hay más de una, cada una con
  `aria-label`.
- Todo menú se abre y se recorre con teclado, y Escape lo cierra devolviendo el
  foco al botón que lo abrió.
- Los textos dicen a dónde llevan ("Precios"), no qué son ("Haz clic aquí").
- El estado de la vista (pestaña, filtro, página) va en la URL, para poder
  compartirla y volver con el botón Atrás.
