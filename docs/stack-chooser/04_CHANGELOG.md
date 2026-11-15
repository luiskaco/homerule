# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/), versionado semántico
si aplica.

## [Unreleased]

### Changed

- Documentos de `docs/` migrados a la estructura nueva (`01_PRD`, `02_TASKS`, `03_DECISIONS` con índice, `04_CHANGELOG`, `ARCHITECTURE`, `DATA_MODEL`, `TESTING`). `AGENTS.md` reducido a lo propio del proyecto y sin las copias del kit en `.claude/` (las reglas viven en la carpeta personal). El aviso del ADR exportado apunta a `docs/03_DECISIONS.md`.

### Added

- Armador libre de stack: elegir la tecnología de cada capa a mano, con todas las opciones del catálogo y la opción "No uso nada".
- Avisos con su motivo (requisito ausente, choque, presupuesto, tipo de proyecto, mezcla de lenguajes) sin bloquear ninguna combinación.
- Botón "Sugerime uno": rellena solo las capas que no elegiste vos.
- Exportación a `AGENTS.md` y ADR desde un stack armado a mano, con los avisos sin resolver.
- Catálogo: PHP + Laravel, auth de Laravel, Bootstrap y Pest (97 tecnologías, 26 verificadas).

### Changed

- Pantalla rediseñada (tema Cobalt, modo claro y oscuro, resumen fijo del stack).
- El stack armado se recuerda en el navegador junto con las respuestas.

### Removed

- `ResultView`, reemplazado por el selector de fichas por capa.

## [0.1.0] - 2026-11-08

### Added

- Recomendador de stack por capas para 10 tipos de proyecto y 16 capas, con el motivo de cada elección, alternativas y descartes.
- Catálogo de 93 tecnologías, 26 verificadas contra documentación vigente.
- Perfil del usuario, piezas fijables y guardado local de respuestas.
- Exportación a un bloque de `AGENTS.md` y a un ADR.
- Kit de Claude Code: rules `architecture`, `security`, `ui-ux` y `stack-conventions`, 7 comandos y 7 subagentes.

### Changed

- Prisma deja de ofrecerse con MongoDB: la versión 7 no tiene conector, y se avisa que `latest` en npm apunta a una candidata.
- Cloudflare pasa a "Workers (con Static Assets)": para proyectos nuevos Cloudflare ya no recomienda Pages.
- La verificación pasa de sumar puntos a solo desempatar.
