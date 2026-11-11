# Tareas

> Solo lo abierto. Al cerrar una tarea, se borra de acá y deja una línea en el
> `CHANGELOG.md` de la raíz (ADR-025). El avance va en los commits, no acá.
> Como mucho 10 abiertas: si hay más, cerrar o descartar antes de sumar otra.
> El kit sigue en pausa hasta el 2026-11-19: ver `docs/kit-pause.md`.

## Dónde quedó

- **Última actualización:** 2026-11-10
- **Dónde quedó:** rama `feat/docs-simplify`, fase 1 hecha (PR #32, sin fusionar por decisión del autor). Detalle para la PC de la oficina en `docs/handoff-docs-simplify.md`.
- **Próximo paso:** plan de la fase 2 (T-02).
- **Bloqueos:** ninguno. Los 19 proyectos están en la PC del trabajo, no en esta.

## Abiertas

- [ ] **T-01 — Simplificar los documentos, fase 1** (ADR-035, excepción a la pausa)
  Hecho cuando: plantillas, comandos y este repo usan la estructura nueva, hay guía de migración, y paridad, plugin y build pasan.
- [ ] **T-02 — Simplificar núcleo y subagentes, fase 2**: quitar la redundancia entre `CORE.md`, `GEMINI.md`, los globales, los `AGENTS.md` de los proyectos y los subagentes.
  Hecho cuando: cada regla vive en un solo lugar y el autor aprueba el plan. Reemplaza a "Optimizar `GEMINI.md`, `AGENTS.md` y `CLAUDE.md`".
- [ ] **T-03 — Revisión de la pausa** (2026-11-19): la lista de temas está en `docs/kit-pause.md`, sección "Para revisar".
  Hecho cuando: cada tema quedó decidido, hecho o descartado.
- [ ] **T-04 — Llevar lo nuevo a la PC del trabajo**: globales al día y documentos de los 19 proyectos migrados con `docs/migrate-docs.md`.
  Hecho cuando: la sección "Novedades para llevar a la PC del trabajo" de `docs/kit-pause.md` queda vacía.
- [ ] **T-05 — Subir el kit de seguridad que falta** (ADR-033): frutiflex, porLaSalud y pluginWordpress.
  Hecho cuando: los tres tienen la skill `security-mitigations` en su repo.
- [ ] **T-06 — Kit híbrido, fase 3** (ADR-031): migrar makeNewMonitorLatam cuando el autor termine de trabajar ahí.
  Hecho cuando: el proyecto usa el kit híbrido y está subido.
- [ ] **T-07 — Agentes de servidores en Antigravity** (ADR-026): repetir las pruebas 6–8 pidiendo el subagente con palabras, contra un sshd descartable.
  Hecho cuando: se sabe si Antigravity respeta la política de cada agente, y queda anotado en ADR-026.
- [ ] **T-08 — Preset "app interna"**: los presets de Next.js, React y Vue instalan `seo` siempre; evaluar uno sin esa regla.
  Hecho cuando: hay preset o queda descartado con el motivo.
- [ ] **T-09 — Tabla de tokens del README**: `update-token-table.py` mide el `GEMINI.md` crudo y no conoce el `AGENTS.md` que arma el generador.
  Hecho cuando: la tabla refleja lo que carga cada kit.
- [ ] **T-10 — Rebranding del sitio**: nombre nuevo e identidad visual minimalista. Bloqueado por el nombre.
  Hecho cuando: el autor elige el nombre y el sitio lo usa.
