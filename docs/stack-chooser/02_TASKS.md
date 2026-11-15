# Tareas

> Solo lo abierto. Al cerrar una tarea, se borra de acá y deja una línea en
> `04_CHANGELOG.md`. El avance va en los commits, no acá.
> Como mucho 10 abiertas: si hay más, cerrar o descartar antes de sumar otra.

## Dónde quedó

- **Última actualización:** 2026-11-14
- **Dónde quedó:** el recomendador y el armador libre funcionan y están commiteados en `main` (último: `6a131d9`). La pantalla abre en "Armar el mío"; "Sugerime uno" la rellena según las respuestas. Catálogo de 97 tecnologías, 26 verificadas contra documentación vigente. Rama `docs/migrate-docs`: migración de `docs/` a la estructura nueva. El repo no tiene remoto en GitHub todavía.
- **Próximo paso:** revisar la pantalla en 375 px y con teclado (T-03), y seguir con la verificación de la tanda 3 del catálogo (T-01).
- **Bloqueos:** ninguno.
- **No tocar:** los pesos de `scoreTech` hasta probar la recomendación con 3 proyectos reales (T-02); cambiarlos a ciegas rompe los casos que hoy andan.
- **Contexto del armador libre:** el detalle del cambio de rumbo está en `PROPUESTA_ARMADOR.md`.

## Abiertas

- [ ] **T-01 — Verificar la tanda 3 del catálogo** · `RF-06`
  Hecho cuando: las 12 fichas tienen `verifiedAt` y `source`, las que tenían datos mal están corregidas y `npm test` pasa.
- [ ] **T-02 — Probar con 3 proyectos reales y ajustar pesos** · `RF-01`
  Hecho cuando: para 3 proyectos de verdad, la recomendación coincide con lo que se elegiría a mano o la diferencia está explicada, y cada ajuste de pesos tiene un test.
- [ ] **T-03 — Revisar accesibilidad y pantallas chicas** · `RNF-03`
  Hecho cuando: se recorre el formulario solo con teclado, se ve en 375 px sin scroll horizontal y se revisa el modo oscuro con captura (hasta hoy solo se verificó por texto y estructura).
- [ ] **T-04 — Decidir qué hacer con el prototipo `ai_stack_architect_dashboard.tsx`**
  Hecho cuando: se borra o se mueve; hoy está en la raíz sin usarse (sirve de referencia del origen del proyecto).
- [ ] **T-05 — Testing por runtime** · `RF-02`
  Hecho cuando: un stack con frontend en TypeScript y backend en Python recibe herramienta de test para ambos (hoy la capa elige una sola).
- [ ] **T-06 — Capas que faltan** · `RF-01`
  Hecho cuando: existen las capas de datos y analítica, CMS headless y más opciones móviles y de escritorio. Límite conocido: el deploy es una sola capa, así que un stack React + Laravel puede proponer Vercel sin decir dónde corre Laravel.
- [ ] **T-07 — Decidir el primer deploy y escribir `RUNBOOK.md`**
  Hecho cuando: hay hosting elegido, runbook escrito y CI corriendo tests.
- [ ] **T-08 — Llevar el bloque exportado al kit de `makeRuleIA`** · `RF-07`
  Hecho cuando: está decidido cómo se integra (o se descarta) y anotado en `03_DECISIONS.md`.
