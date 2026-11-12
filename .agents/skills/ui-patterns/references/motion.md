# Animaciones y efectos

Una animación tiene que explicar algo: de dónde viene un elemento, qué cambió o
que la acción se registró. Si solo decora, sobra.

## Reglas comunes

- **Duración:** 150–250 ms para elementos chicos (botones, menús), 250–400 ms
  para paneles y páginas. Más de 500 ms se siente lento.
- **Curva:** al entrar, `ease-out` (arranca rápido y frena). Al salir,
  `ease-in` y más corta que la entrada. Nunca `linear` en movimiento de
  interfaz, salvo barras de progreso.
- **Qué animar:** solo `transform` y `opacity`. Animar `width`, `height`, `top`
  o `margin` hace recalcular el layout en cada cuadro y se traba.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce`, reemplazar
  desplazamientos y zooms por un fundido corto o por nada. No es opcional.
- **Interrumpible:** si el usuario vuelve a hacer clic a mitad de camino, la
  animación sigue desde donde está, no salta al inicio.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Catálogo

| Patrón | Qué es | Cuándo | Cuándo no |
|---|---|---|---|
| **Fade** (fundido) | Aparece o desaparece cambiando la opacidad | Toasts, tooltips, contenido que reemplaza a otro | Si el elemento cambia de lugar: ahí va un desplazamiento |
| **Slide** (deslizar) | Entra desde un borde | Cajones, menús móviles, paneles laterales | Elementos en medio de la página |
| **Scale / pop** | Crece desde un poco más chico (0.95 → 1) | Modales, popovers, menús desplegables | Arrancar desde 0: se ve como un salto |
| **Stagger** (escalonado) | Elementos de una lista entran uno detrás de otro | Primera carga de una lista o un grid corto | Listas largas: el último tarda demasiado |
| **Skeleton shimmer** | Brillo que recorre un esqueleto de carga | Carga de más de ~300 ms | Cargas instantáneas: produce parpadeo |
| **Scroll reveal** | El contenido aparece al entrar en pantalla | Landings y páginas de marketing | Apps de trabajo y contenido que se busca rápido |
| **Parallax** | Capas que se mueven a distinta velocidad al hacer scroll | Una sola sección de impacto | Texto que hay que leer; y con movimiento reducido, nunca |
| **Shared element** (transición compartida) | Un elemento viaja de una vista a otra | Abrir el detalle de una tarjeta o de una foto | Cambios de vista sin relación visual |
| **Microinteracción** | Respuesta chica a una acción: un check, un corazón que late | Confirmar un clic, un toggle o un "me gusta" | Repetirla en cada elemento de la página |
| **Skeleton → contenido** | El esqueleto se funde en el contenido real | Siempre que haya skeleton | — |

## Herramientas de la plataforma

- **Transiciones y `@keyframes` de CSS:** alcanzan para casi todo.
- **View Transitions (misma página):** Baseline desde 2025. Sirve para shared
  element y cambios de vista sin librería. Entre páginas distintas todavía no
  tiene soporte en todos los navegadores: usarla como mejora progresiva.
- **Animaciones guiadas por scroll** (`animation-timeline: view()`): reemplazan
  al JavaScript de scroll reveal y parallax, pero siguen en proceso de llegar a
  todos los navegadores. Mejora progresiva: sin soporte, el contenido se ve
  igual, sin animar.

## En vez de

| Pidieron | Mejor |
|---|---|
| Parallax en una página de lectura | Una imagen fija de impacto arriba |
| Rebote o elástico (`bounce`) | `ease-out` simple: el rebote cansa y se ve anticuado |
| Animar todo al cargar | Animar solo lo que cambia o lo que el usuario tocó |
| Carrusel automático | Grid o carrusel manual: el automático se ignora y molesta a lectores de pantalla |
