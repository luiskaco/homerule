# 01 — Product Requirements Document

## Problema

Configurar un agente de IA (Antigravity/Gemini o Claude Code) con reglas,
workflows, skills y documentación coherentes lleva horas por proyecto, y cada
proyecto termina con copias divergentes. Luis trabaja varios proyectos en
paralelo (agencia Orange Latam + propios) y necesita que todos arranquen con el
mismo sistema de reglas, mantenido en un solo lugar.

## Objetivos

- Una sola fuente de reglas (`.agents/rules/`, `core/CORE.md`, workflows) que
  se edita una vez y se distribuye a los dos tools.
- Kits descargables por stack en ZIP, autocontenidos, desde el sitio
  (`site/`, Next.js en Vercel).
- Que instalar un kit en un proyecto nuevo tome minutos: copiar el ZIP y
  seguir el `INSTALL.md` incluido.

## Alcance

### Incluido

- Rules de Antigravity (`.agents/rules/`) con triggers por contexto.
- Núcleo global por tool: `GEMINI.md` (Antigravity) y `CORE.md` → `CLAUDE.md`
  (Claude Code).
- 6 workflows/comandos manuales compartidos en contenido.
- 9 subagentes de Claude Code (`.claude/agents/`).
- Skills externas vendorizadas y catálogo de skills en el sitio.
- Plantillas de documentación `/docs` 01–08 (`docs-templates/`).
- Sitio generador de ZIPs por stack, ES/EN.

### Fuera de alcance

- Traducir al inglés el contenido empaquetado (ADR-005/ADR-009 — pendiente si
  el hub se hace público internacional).
- Soporte para tools distintos de Antigravity y Claude Code.
- ZIP híbrido "Antigravity + Claude" (eliminado por ADR-006).

## Usuarios y casos de uso

- **Luis (único usuario hoy):** arranca un proyecto nuevo → baja el ZIP de su
  stack → instala → el agente ya conoce reglas, docs y comandos.
- **Mantenimiento:** edita una regla en `.agents/rules/` → el generador emite
  los dos formatos → los proyectos futuros la reciben.

## Requisitos funcionales

- El generador (`site/scripts/generate-manifest.mjs`) recoge el contenido por
  carpeta sin configuración manual por archivo.
- Cada ZIP es autocontenido: no referencia rutas del otro tool (ADR-006).
- Los presets por stack preseleccionan rules, skills, comandos y agentes
  relevantes (`site/src/lib/presets.ts`).

## Requisitos no funcionales

- Presupuesto de contexto: rule más grande < 24.000 bytes (límite por archivo de
  Antigravity; las rules Always On comparten además 20.000 tokens);
  base Always On ~2k tokens, caso típico < 7k (ver tabla del README).
- El sitio no requiere backend ni variables de entorno: manifest en build time,
  ZIP armado en el navegador.
- Todo archivo distribuido usa LF y frontmatter con `description` no vacío.
