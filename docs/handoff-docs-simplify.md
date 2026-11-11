# Recordatorio — simplificación de documentos y núcleo

Para seguir este trabajo en la PC de la oficina. Al llegar, pedirle a la IA:
"leé `docs/handoff-docs-simplify.md` y seguimos". Borrar este archivo cuando
se fusione la rama.

## Traer la rama

```bash
git fetch
```

```bash
git checkout feat/docs-simplify
```

```bash
git pull
```

## Dónde quedó (2026-11-10)

- **Fase 1, documentos: hecha.** Está en la rama `feat/docs-simplify` y en el
  PR #32, abierto. **No se fusiona con main todavía**, por decisión del autor.
- Qué cambió: 4 documentos fijos y 5 opcionales, tareas solo con lo abierto,
  índice de ADR y changelog de una línea por cambio (ADR-035). Este repo ya
  está migrado.
- Todo lo nuevo de este trabajo se sigue sumando a esta misma rama.

## Próximo paso: fase 2, núcleo y subagentes (T-02)

Objetivo: cada regla en un solo lugar. Lo ya detectado:

- **Reglas en hasta 5 copias:** `core/CORE.md`, `.gemini/GEMINI.md`, los dos
  archivos globales y el `AGENTS.md` de 17 de los 19 proyectos.
- **La regla de escritura 8 repite en parte a la 3 y a la 7.**
- **Subagentes:** revisar dónde se pisan sus instrucciones con el núcleo y
  entre ellos. `debugger` y un posible agente de rendimiento ya están en la
  lista de la revisión del 19 (`docs/kit-pause.md`).

Primero un plan corto para aprobar, después los cambios.

## Esperar al merge

- **Archivos globales:** no actualizarlos con esta rama. Los proyectos todavía
  tienen los documentos viejos, y los globales nuevos les pedirían los
  nombres nuevos.
- **Migrar los 19 proyectos:** después del merge, de a uno, con
  `docs/migrate-docs.md`. Antes del merge el sitio sigue entregando el kit
  viejo.

## A mano, una sola vez

- Desactivar en claude.ai la skill de cuenta `project-docs-scaffold`: usa la
  estructura vieja de 8 archivos y ya salió del repo.
