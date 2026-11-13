# Tareas

> Solo lo abierto. Al cerrar una tarea, se borra de acá y deja una línea en el
> `CHANGELOG.md` de la raíz (ADR-025). El avance va en los commits, no acá.
> Como mucho 10 abiertas: si hay más, cerrar o descartar antes de sumar otra.
> El kit sigue en pausa hasta el 2026-11-19: ver `docs/kit-pause.md`.

## Dónde quedó

- **Última actualización:** 2026-11-13
- **Dónde quedó:** kit global (ADR-038, PR #35) y sitio simple (ADR-039, rama `feat/site-simple`, sobre `feat/global-kit`) hechos; 26 proyectos migrados el 2026-11-13. Falta fusionar makeControlHubk40 (fusionar despliega a producción).
- **Próximo paso:** fusionar el PR #35 y después el del sitio simple: fusionar a `main` despliega el sitio en Vercel.
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
- [ ] **T-10 — Rebranding del sitio**: nombre nuevo e identidad visual minimalista. Bloqueado por el nombre.
  Hecho cuando: el autor elige el nombre y el sitio lo usa.
- [ ] **T-11 — Una sola fuente para los agentes repetidos** (después del 2026-11-19, rama aparte): `web-researcher`, `server-inspector`, `server-operator` y el revisor de código se mantienen a mano en Claude y en Antigravity, iguales en un 85 %. Generar los de Antigravity desde los de Claude, con bloques propios de cada herramienta.
  Hecho cuando: el generador arma los agentes de Antigravity, un `--check` falla si quedan atrás y se probó uno en Antigravity (junto con T-07).
