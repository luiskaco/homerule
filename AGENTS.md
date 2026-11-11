# AGENTS.md — makeRuleIA (AI Rules Hub)

Instrucciones del repo para cualquier agente de código (estándar
[AGENTS.md](https://agents.md)). Este repo es la **fuente** desde la que se
generan los kits de reglas para Antigravity y Claude Code, más el sitio
(`site/`) que los arma y descarga como ZIP.

Este archivo cubre **solo lo propio del repo**. Las reglas globales (modo de
comunicación, planificar antes de actuar, stack, naming, `/docs`,
auto-revisión) viven en el núcleo de cada tool y no se duplican acá:

- Claude Code → `core/CORE.md` (importado desde `CLAUDE.md`).
- Antigravity → `.gemini/GEMINI.md`.
- Otra herramienta (Codex, Cursor, Copilot…) → tomar `core/CORE.md` como
  referencia.

---

## Estructura

| Ruta | Qué es |
|---|---|
| `core/CORE.md` | Núcleo Always On — fuente del `AGENTS.md` neutral y del `CLAUDE.md` que reciben los kits |
| `core/agents-map.md` | Mapa del proyecto que se agrega al `AGENTS.md` de los kits (con variables por tool) |
| `.gemini/GEMINI.md` | Núcleo Always On del kit de Antigravity |
| `.agents/rules/` | Las 9 rules técnicas — fuente única para ambos tools |
| `.agents/skills/` | Skills del kit — se copian tal cual a los dos tools. Incluye los 7 workflows (skills con `metadata: kind: workflow`, ADR-020): Claude los recibe como `.claude/commands/` |
| `.agents/agents/` | 7 subagentes de Antigravity (fuente e instalación local) |
| `.claude/agents/` | 10 subagentes de Claude Code (fuente e instalación local), 8 por defecto (ADR-027); `server-inspector` y `server-operator` van solo en el ZIP, no en el plugin (ADR-026) |
| `.claude/hooks/` | `personal-data-guard.mjs` es un hook global que se instala a mano por equipo y no viaja en ningún kit (ADR-034). El resto son hooks de los subagentes: `readonly-bash.mjs` impone el solo lectura en los revisores (ADR-021), `web-guard.mjs` revisa lo que `web-researcher` manda a internet (ADR-022) y `ssh-guard.mjs` controla los agentes de servidores (ADR-026). `shell-parse.mjs` es el parser que comparten `readonly-bash` y `ssh-guard`. Viajan en el ZIP con cada agente que los usa, junto con lo que importan |
| `docs-templates/` | Plantillas `/docs` que se empaquetan en los kits |
| `docs/` | Documentación de este repo: `01_PRD`, `02_TASKS`, `03_DECISIONS`, `ARCHITECTURE`, `DATA_MODEL` y el recordatorio de la pausa. El changelog vive en la raíz (ADR-025) |
| `scripts/` | Generadores y guards (ver Comandos) |
| `site/` | Sitio Next.js 16 (App Router, React 19, next-intl, Tailwind 4) — deploy en Vercel |

## Fuente vs. derivados

Editar siempre la fuente, nunca un derivado.

- **Fuente** (lo que `site/scripts/generate-manifest.mjs` empaqueta en los
  ZIPs): `.agents/rules/`, `.agents/skills/` (workflows incluidos),
  `.agents/agents/`, `core/CORE.md`, `core/agents-map.md`,
  `.claude/agents/`, `.claude/hooks/` y `docs-templates/`.
- **El `AGENTS.md` y el `CLAUDE.md` de los kits no tienen fuente propia**: los
  arma el generador desde `core/CORE.md` + `core/agents-map.md` (ADR-016). Si se
  reescribe § 7 o la nota de subagentes de § 8 en `CORE.md`, el generador falla
  a propósito — ajustar `buildAgentsMd()`.
- Este `AGENTS.md` (el de la raíz) es solo del repo y no se empaqueta.
- **Kit híbrido** (`tool: "hybrid"`, ADR-031): sale de la misma fuente. El generador agrega a cada rule, skill y workflow un puntero de `.claude/` hacia `.agents/`; no tiene fuente propia.
- **Derivados — se regeneran, no se editan a mano:**
  - `.claude/commands/` y `.claude/skills/<regla>/SKILL.md` (las 9 rules
    convertidas) ← `node scripts/sync-claude-kit.mjs` después de editar
    cualquier workflow o rule.
  - `.claude-plugin/plugin.json` y `marketplace.json` ←
    `node scripts/build-plugin.mjs`.
  - `site/public/manifest.json` ← lo regenera `prebuild`/`predev` del sitio.
  - La tabla de tokens del `README.md` ← `python scripts/update-token-table.py`.
- **Skills de terceros vendorizadas** (en `.agents/skills/` y `.claude/skills/`):
  no editarlas — se actualizan reinstalando (ver `skills-lock.json` y README
  § Skills de diseño de terceros).

## Paridad CORE/GEMINI

`core/CORE.md` y `.gemini/GEMINI.md` se mantienen a mano en paralelo. Si se
edita una sección compartida (§ 0–§ 8) en uno, replicar el cambio en el otro en
el mismo commit y verificar con `python scripts/check-core-parity.py`.

Difieren a propósito solo en: título, § 3 punto 2 (fallback de documentación
por tool), § 6 (nombres de la jerarquía) y la nota de subagentes de § 8.

## Comandos

```bash
node scripts/sync-claude-kit.mjs          # regenera comandos y rules→skills de Claude
node scripts/build-plugin.mjs --check     # falla si el plugin quedó atrás de la fuente
python scripts/check-core-parity.py       # paridad CORE.md ↔ GEMINI.md
node scripts/test-readonly-bash.mjs       # casos del hook de solo lectura de los revisores
node scripts/test-web-guard.mjs           # casos del hook de web-researcher
node scripts/test-ssh-guard.mjs           # casos del hook de los agentes de servidores
node scripts/test-personal-data-guard.mjs # casos del hook global de datos personales
python scripts/update-token-table.py      # tabla de tokens del README
python scripts/make-desktop-zips.py       # ZIPs de skills para Claude Desktop (skills-desktop/, gitignored)

cd site && npm install && npm run dev     # sitio en local (regenera el manifest)
cd site && npm run build                  # build de producción
```

## Convenciones

- Identificadores y nombres de archivo en inglés; comentarios y documentación
  en español (ADR-009).
- Commits: Conventional Commits (`feat` / `fix` / `refactor` / `docs` /
  `chore` / `perf`).
- Finales de línea LF en todo el repo (`.gitattributes`). Los guards `--check`
  comparan byte a byte.
- Una skill nueva en `.agents/skills/` o una plantilla nueva en `docs-templates/`
  necesita su texto de interfaz en `site/messages/es.json` y `en.json`
  (`SkillData.<id>` / `DocTemplates.descriptions.<archivo>`): sin eso el build
  rompe el prerender. `site/scripts/check-messages.mjs` lo verifica en
  `predev`/`prebuild`. Antes de abrir un PR que toque el sitio, correr
  `npm run build`, no solo `tsc`.
- Antes de codificar un cambio, registrarlo en `docs/02_TASKS.md`; al cerrarlo,
  borrarlo de ahí y sumar una línea al `CHANGELOG.md` de la raíz (ADR-025: este
  repo no tiene `docs/04_CHANGELOG.md`).

## Dónde va cada cosa en `/docs`

- `DATA_MODEL.md` — entidades y campos técnicos.
- `03_DECISIONS.md` — decisiones con alternativas evaluadas y trade-offs (ADR), con su línea en el índice.
- `CONTEXT.md` — glosario del dominio, sin numerar (ADR-012). Lenguaje del
  negocio, no esquema ni decisiones. Lo mantiene la skill `domain-modeling`.
