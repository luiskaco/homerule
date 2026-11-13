# Tareas

> Solo lo abierto. Al cerrar una tarea, se borra de acá y deja una línea en el
> `CHANGELOG.md` de la raíz (ADR-025). El avance va en los commits, no acá.
> Como mucho 10 abiertas: si hay más, cerrar o descartar antes de sumar otra.
> El kit sigue en pausa hasta el 2026-11-19: ver `docs/kit-pause.md`.

## Dónde quedó

- **Última actualización:** 2026-11-13
- **Dónde quedó:** kit global, sitio simple (Homerule) y freno de secretos al commitear (ADR-041) en `main` y en Vercel; 26 proyectos migrados. Falta fusionar makeControlHubk40 (fusionar despliega a producción).
- **Próximo paso:** llevar los globales y el freno de secretos a la otra PC (T-04, paso 6 de `docs/kit-pause.md`); revisión de la pausa el 2026-11-19 (T-03).
- **Bloqueos:** ninguno.

## Abiertas

- [ ] **T-03 — Revisión de la pausa** (2026-11-19): la lista de temas está en `docs/kit-pause.md`, sección "Para revisar".
  Hecho cuando: cada tema quedó decidido, hecho o descartado.
- [ ] **T-04 — Llevar lo nuevo a la PC del trabajo**: globales al día y documentos de los 19 proyectos migrados con `docs/migrate-docs.md`.
  Hecho cuando: la sección "Novedades para llevar a la PC del trabajo" de `docs/kit-pause.md` queda vacía.
- [ ] **T-07 — Agentes de servidores en Antigravity** (ADR-026): repetir las pruebas 6–8 pidiendo el subagente con palabras, contra un sshd descartable.
  Hecho cuando: se sabe si Antigravity respeta la política de cada agente, y queda anotado en ADR-026.
- [ ] **T-09 — Tabla de tokens del README**: `update-token-table.py` mide el `GEMINI.md` crudo y no conoce el `AGENTS.md` que arma el generador.
  Hecho cuando: la tabla refleja lo que carga cada kit.
- [ ] **T-10 — Identidad de Homerule**: el nombre ya está elegido (Homerule, 2026-11-13) y se usa en el sitio, los README y el plugin. El repo ya se llama `luiskaco/homerule`. Falta la identidad visual minimalista, el dominio (el sitio sigue en `make-rule-ia.vercel.app`) y decidir si el plugin cambia su nombre interno (`ai-rules-hub`: cambiarlo obliga a reinstalarlo).
  Hecho cuando: el sitio tiene la identidad nueva y el repo y el dominio usan el nombre.
- [ ] **T-11 — Una sola fuente para los agentes repetidos** (después del 2026-11-19, rama aparte): `web-researcher`, `server-inspector`, `server-operator` y el revisor de código se mantienen a mano en Claude y en Antigravity, iguales en un 85 %. Generar los de Antigravity desde los de Claude, con bloques propios de cada herramienta.
  Hecho cuando: el generador arma los agentes de Antigravity, un `--check` falla si quedan atrás y se probó uno en Antigravity (junto con T-07).
