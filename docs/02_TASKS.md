# Tareas

> Solo lo abierto. Al cerrar una tarea, se borra de acá y deja una línea en el
> `CHANGELOG.md` de la raíz (ADR-025). El avance va en los commits, no acá.
> Como mucho 10 abiertas: si hay más, cerrar o descartar antes de sumar otra.
> El kit sigue en pausa hasta el 2026-11-19: ver `docs/kit-pause.md`.

## Dónde quedó

- **Última actualización:** 2026-11-13
- **Dónde quedó:** PR #32 y #34 fusionados en main el 2026-11-13. Rama `feat/global-kit`: el kit se instala en la carpeta personal (ADR-038) con `scripts/install-global.mjs`.
- **Próximo paso:** kit global (T-13, ADR-038): instalar con `node scripts/install-global.mjs --write`, probar en una sesión nueva y migrar los proyectos.
- **Bloqueos:** ninguno. Los 19 proyectos están en la PC del trabajo, no en esta.

## Abiertas

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
- [ ] **T-11 — Una sola fuente para los agentes repetidos** (después del 2026-11-19, rama aparte): `web-researcher`, `server-inspector`, `server-operator` y el revisor de código se mantienen a mano en Claude y en Antigravity, iguales en un 85 %. Generar los de Antigravity desde los de Claude, con bloques propios de cada herramienta.
  Hecho cuando: el generador arma los agentes de Antigravity, un `--check` falla si quedan atrás y se probó uno en Antigravity (junto con T-07).
- [ ] **T-13 — Kit instalado en global, no en cada proyecto** (después del merge de #32 y #34, con ADR): reglas, skills, comandos, subagentes y hooks en `~/.claude/` y en `~/.gemini/` (`GEMINI.md`, `config/rules/`, `config/skills/`), instalados con un script desde la fuente. Cada repo queda solo con `docs/` y el `AGENTS.md` esencial: quien lo clone trae su propia forma de trabajar (decisión del autor, 2026-11-13). Falta verificar dónde van los subagentes globales de Antigravity y pasar los hooks a rutas de la carpeta personal.
  Hecho cuando: un script instala y actualiza el kit global en las dos herramientas, y la guía de migración borra las copias del kit de los proyectos.
