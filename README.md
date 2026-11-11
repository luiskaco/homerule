# AI Rules Hub — Guía del Sistema

Sistema de reglas para dos formas de trabajo con IA:

- **Híbrida** — Gemini/Antigravity como desarrollador principal, Claude como
  PM/auditor.
- **Claude Code individual** — Claude como desarrollador completo, con la misma
  base de reglas convertida a formato nativo (`CLAUDE.md` + `.claude/skills` +
  `.claude/commands` + `.claude/agents`).

Para proyectos que se trabajan con las dos IA está el kit híbrido **Claude + Gemini** (ADR-031): un solo juego de reglas y skills en `.agents/`, punteros en `.claude/` y las reglas generales en los archivos globales.

Los dos kits dejan además un **`AGENTS.md`** en la raíz del proyecto — el
estándar abierto que leen Codex, Cursor, Copilot y Antigravity — con las reglas
en versión neutral y un mapa del proyecto: si mañana lo continúa otra IA,
encuentra lo mismo (ADR-016).

Carga selectiva por contexto — nada se lee completo en cada mensaje salvo lo
estrictamente "Always On".

---

## Estructura

```
~/.gemini/                                    # GLOBAL — una sola vez, aplica a todos los proyectos
└── GEMINI.md                                 # Always On — núcleo: principios, stack base, naming, jerarquía

[proyecto]/
├── AGENTS.md                                 # reglas neutrales + mapa — lo lee cualquier IA (ADR-016)
└── .agents/                                  # WORKSPACE — override local, por proyecto
    ├── rules/
    │   ├── security.md                       # Model Decision
    │   ├── architecture.md                   # Model Decision
    │   ├── ui-ux.md                          # Model Decision
    │   ├── seo.md                            # Model Decision
    │   ├── pwa.md                            # Model Decision — solo proyectos PWA
    │   ├── operations.md                     # Model Decision
    │   ├── cms.md                            # Model Decision
    │   ├── database.md                       # Model Decision — schema, migraciones, pooling, índices
    │   └── stack-conventions.md              # Glob: *.tsx,*.ts,*.jsx,*.js,*.py,*.php,*.css
    ├── agents/                               # subagentes de Antigravity — ver § Subagentes
    │   ├── auditor/agent.md                  # review de diff — solo lectura
    │   ├── backend/agent.md                  # implementa servidor, datos, migraciones
    │   ├── frontend/agent.md                 # implementa interfaz
    │   └── security/agent.md                 # auditoría de seguridad — solo lectura
    └── skills/                               # los 7 comandos (/grill, /new-feature…, ADR-020) + skills opcionales — ver § Skills
```

> **¿Por qué global + workspace?** Trabajas varios proyectos a la vez (Media Hub,
> Abencia, Agency CRM, sitios de cliente). `GEMINI.md` no cambia
> de un proyecto a otro — va en `~/.gemini/` una sola vez. Las reglas técnicas
> (`security.md`, `architecture.md`, etc.) sí pueden variar por proyecto — un sitio
> WordPress no necesita las mismas convenciones que Abencia en Next.js — así que
> viven en `.agents/rules/` dentro de cada repo, donde se pueden ajustar sin tocar
> lo global. Si todos tus proyectos comparten exactamente las mismas reglas técnicas,
> también puedes moverlas a `~/.gemini/config/rules/` y saltarte la copia por
> proyecto — pero perderías la posibilidad de variarlas caso por caso.

---

## Instalación

### Claude Code — como plugin (recomendado)

El plugin se actualiza desde git: un `/plugin update` trae las correcciones
posteriores a la instalación. El ZIP, en cambio, es una copia congelada.

```
/plugin marketplace add luiskaco/-makeRuleIA
/plugin install ai-rules-hub@ai-rules-hub
```

Trae las 9 rules como skills nativas, los 7 comandos y 8 de los 10 subagentes: `server-inspector`
y `server-operator` van solo en el ZIP, porque el plugin ignora el hook que los controla (ADR-026). **No**
trae `CLAUDE.md` ni `AGENTS.md`: un plugin aporta comandos, agentes y skills, no memoria de
proyecto — si querés el núcleo global, bajá el ZIP desde `/build`.

Las skills de terceros (`hallmark`, `impeccable`, las de Vercel, etc.) no van en
el plugin a propósito: se instalan desde su repo original, con el comando que
figura en el catálogo.

Antigravity no tiene un sistema equivalente — ahí la instalación es la de abajo.

### Paso 1 — Archivo global (una sola vez)

**macOS / Linux**
```bash
mkdir -p ~/.gemini
cp GEMINI.md ~/.gemini/GEMINI.md
```

**Windows (PowerShell)**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.gemini"
Copy-Item "GEMINI.md" "$env:USERPROFILE\.gemini\GEMINI.md"
```

> **Migración (ADR-020):** los 7 comandos eran workflows en
> `~/.gemini/antigravity/global_workflows/`. Antigravity deja de ejecutarlos el
> 19/10/2026: ahora son skills de workspace (Paso 2). Podés borrar esa carpeta o
> correr `/migrate-workflows` en la app de Antigravity.

### Paso 2 — Reglas de workspace (por cada proyecto)

```bash
# AGENTS.md — reglas para cualquier IA que continúe el proyecto (completar su sección "Proyecto")
cp AGENTS.md ./

mkdir -p .agents/rules
cp security.md architecture.md ui-ux.md seo.md pwa.md operations.md cms.md database.md stack-conventions.md .agents/rules/

# comandos (/grill, /new-feature…) — son skills de workspace, una carpeta por comando
cp -r grill new-feature bug-fix session-close security-audit deploy-checklist tools-reference .agents/skills/

# subagentes (opcional) — Antigravity los descubre solo al abrir el workspace
cp -r agents/ .agents/agents/
```

Si el proyecto es WordPress puro o no usa alguna de las reglas (ej. un sitio sin CMS
headless), puedes omitir ese archivo — `model_decision` simplemente nunca se activa
si no hay contexto que lo dispare, así que de todas formas no cuesta nada dejarlo.

### Paso 3 — Skills externas (manual, en tu terminal)

```bash
# frontend-design (Anthropic)
npx skills add https://github.com/anthropics/skills --skill frontend-design

# Auditoría técnica de UI (Vercel Web Interface Guidelines)
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines

# Performance y composición React/Next.js
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns

# impeccable (polish) — ver instrucciones en impeccable.style

# Context7 MCP — documentación de librerías en tiempo real, por proyecto
npx ctx7 setup

# api-security-best-practices — patrones de seguridad de API (ver § Skills de Seguridad)
npx skills add sickn33/antigravity-awesome-skills --skill api-security-best-practices
```

### Paso 4 — Ajustar stack por proyecto

Si el proyecto difiere del stack base (`GEMINI.md § 3`), de la convención de
`/docs` o de alguna regla, documentarlo en el
`AGENTS.md` del proyecto — tiene prioridad sobre `GEMINI.md` (ver § 5, nota de
excepción).

> **Migración:** `00_GEMINI_START.md` ya no existe (ADR-018). Si un proyecto
> todavía lo tiene, mover su contenido al `AGENTS.md` del proyecto
> y borrarlo — `GEMINI.md` ya no lo lee.

---

## Rules — Modos de Activación

`GEMINI.md` (`~/.gemini/`) es Always On — se lee en cada mensaje, sin excepción.

El resto vive en `.agents/rules/` y Antigravity los escanea automáticamente. Cada
uno define su modo en el frontmatter (`trigger`) y, salvo `manual`, una
`description` que le dice al modelo cuándo activarse solo.

| Archivo | Trigger | Se activa cuando... |
|---|---|---|
| `security.md` | Model Decision | Auth, endpoints de API, validación de inputs, uploads, secrets, CORS |
| `architecture.md` | Model Decision | Módulo o archivo nuevo, decisión de en qué capa/carpeta va algo |
| `ui-ux.md` | Model Decision | Interfaces, componentes visuales, formularios, estados de carga/error, accesibilidad, dark mode, i18n |
| `seo.md` | Model Decision | Meta tags, Open Graph, structured data, canonical, hreflang, Core Web Vitals como ranking factor |
| `pwa.md` | Model Decision | Manifest, service worker, cache, estado offline, update flow — **solo si el proyecto es una PWA** |
| `operations.md` | Model Decision | CI/CD, logging, infraestructura, integración de agentes/LLM |
| `cms.md` | Model Decision | WordPress, Drupal, o CMS headless (Sanity, Contentful, Strapi) |
| `database.md` | Model Decision | Diseño de schema, migraciones, elección de ORM, pooling, índices, credenciales de DB |
| `stack-conventions.md` | Glob `*.tsx,*.ts,*.jsx,*.js,*.py,*.php,*.css` | Al editar cualquier archivo de esos tipos |

> `tools-reference` **no** está en esta tabla a propósito — es un comando
> (skill de workspace en `.agents/skills/tools-reference/`), no regla. Ver
> tabla de Workflows abajo.

Si una regla y un workflow describen lo mismo (ej. checklist de seguridad en
`security-audit.md` vs. el detalle en `security.md`), **la regla en
`.agents/rules/` es la fuente de verdad** — los workflows son resúmenes
operativos, no la documentación completa.

---

## Workflows

7 workflows, implementados como skills (ADR-020) — **se invocan escribiendo el
comando en el chat.** En Claude Code son comandos y solo corren si los escribís;
en Antigravity son skills, así que además pueden activarse solos cuando la tarea
coincide con su descripción. Las líneas tipo "Recordatorio: invocar
`/session-close`" dentro de cada workflow son avisos para que tú escribas el
siguiente comando — no encadenan automáticamente.

| Comando | Cuándo invocarlo | Qué hace |
|---|---|---|
| `/grill` | Antes de `/new-feature`, cuando el plan todavía es difuso o traés una idea en vez de un requerimiento | Interrogatorio de a una pregunta por turno hasta dejar resueltos problema real, bordes, fuera de alcance, decisiones irreversibles y criterio de terminado. Cierra con un resumen que alimenta al workflow siguiente |
| `/new-feature` | Antes de empezar cualquier tarea nueva | Define el plan, crea la rama git (`feat/...` o `fix/...`), crea o actualiza `02_TASKS.md`, documenta ADR si hay decisión arquitectónica. Espera tu aprobación del plan antes de codificar |
| `/bug-fix` | Algo está roto | Identifica causa raíz antes de tocar código, evalúa impacto, crea rama `fix/...`, plantea plan de 2-3 pasos y espera aprobación |
| `/session-close` | Al terminar el día o una tarea | Actualiza físicamente los docs de `/docs` relevantes, verifica build y flujo probado, borra las tareas cerradas de `02_TASKS.md` dejando una línea en `04_CHANGELOG.md`, reescribe "Dónde quedó" y genera commit sugerido |
| `/security-audit` | Antes de subir features con auth, APIs o datos sensibles | Checklist OWASP + auth + secrets + uploads (resumen — detalle en `security.md`). Lista hallazgos con severidad Critical/High/Medium |
| `/deploy-checklist` | Antes de merge a `main` o deploy a producción | Checklist completo: código, seguridad, UI, SEO, documentación |
| `/tools-reference` | Setup inicial o cuando necesites ver qué skills usar y cuándo | Tabla de skills de diseño + Context7, sin instalación duplicada (apunta a este README) |

### Cómo pedir algo: no hace falta decir "skill"

- **Explícito:** escribí el comando (`/grill`, `/new-feature`…). Funciona en
  Claude Code y en Antigravity.
- **Automático:** describí la tarea con tus palabras ("quiero planificar esta
  feature", "revisá la seguridad antes de subir") y el agente activa la skill
  cuya descripción calza. Las rules (`security`, `seo`, `ui-ux`…) se activan así.
- **Forzar una concreta:** nombrala en el pedido ("usá la skill `hallmark` para
  esta landing"). Evita que el agente elija otra.

Diferencia entre tools: en Claude Code los 7 comandos solo corren si los escribís
con `/`; en Antigravity, al ser skills, también pueden activarse solos.

### Flujo típico de una tarea

```
/grill                  ← opcional, si el plan está difuso: la IA interroga hasta afilarlo
/new-feature           ← defines la tarea, se crea la rama y se actualiza 02_TASKS.md
  ... trabajas ...
/security-audit         ← si tocaste auth, APIs o datos sensibles
/deploy-checklist        ← si vas a hacer merge a main
/session-close          ← siempre al cerrar, actualiza docs y sugiere el commit
```

`/bug-fix` reemplaza a `/new-feature` cuando el punto de partida es algo roto, no
una feature nueva — el resto del flujo (`/security-audit`, `/deploy-checklist`,
`/session-close`) aplica igual.

---

## Subagentes

Los dos tools tienen subagentes declarables en archivo, con formatos distintos que
**no se convierten entre sí** (ADR-006): Antigravity lee
`.agents/agents/<nombre>/agent.md` del workspace, Claude Code lee
`.claude/agents/<nombre>.md`.

### Antigravity — 7 subagentes

Los invoca el agente principal con `invoke_subagent` cuando la tarea lo amerita
(o los elegís a mano desde el panel `/agents`). Corren en contexto aislado: el
detalle de su trabajo no contamina la ventana del agente principal.

| Subagente | Qué hace | Escribe código |
|---|---|---|
| `auditor` | Review del diff contra las rules: correctness, arquitectura, convenciones, datos, reuse | No — solo lectura |
| `backend` | Endpoints, servicios, acceso a datos, migraciones. Verifica con tests/typecheck antes de devolver | Sí |
| `frontend` | Componentes, páginas, estilos, los 5 estados de UI, accesibilidad | Sí |
| `security` | Auditoría OWASP: auth, inputs, inyección, secrets, uploads, CORS, privacidad | No — solo lectura |
| `web-researcher` | Investiga en internet sin filtrar datos del usuario ni obedecer instrucciones que vengan de una página | No — solo tools web |
| `server-inspector` | Diagnostica servidores por SSH (logs, servicios, disco, contenedores) sin cambiar nada | No — solo lectura |
| `server-operator` | Aplica cambios puntuales en servidores por SSH, cada comando con aprobación | No — cambia servidores |

Todos corren con `commandExecutionPolicy: sandbox`, salvo los dos de servidores,
que corren con `off` (cada comando espera tu aprobación), y heredan los permisos de
terminal que ya tengas configurados. `auditor` y `security` tienen `run_command`
únicamente para inspección (`git diff`, `npm audit`) — no tienen ninguna tool de
escritura de archivos. `web-researcher` solo tiene `search_web` y
`read_url_content`. `security` y `server-operator` corren en tier `pro`; el resto
hereda el modelo de la sesión.

`web-researcher` existe en los dos tools (ADR-022). En Claude Code, además, un
hook revisa cada búsqueda y cada URL antes de que salga: bloquea secretos, emails,
rutas locales y hosts de la red local. Para sumar términos propios del proyecto
(clientes, nombres internos), listalos uno por línea en
`.claude/web-guard-terms.txt`.

`server-inspector` y `server-operator` también existen en los dos tools (ADR-026).
Se conectan solo por alias de `~/.ssh/config`, listados por proyecto en
`.claude/ssh-hosts.txt` o `.agents/ssh-hosts.txt`; el operator no se conecta sin
esa lista. **No pongas `ssh`, `scp` ni `rsync` en la allow list de comandos**: los
cambios correrían sin pedir aprobación. En Claude Code un hook
(`.claude/hooks/ssh-guard.mjs`) le deja al inspector solo comandos de lectura, le
hace pedir aprobación al operator en cada comando y les bloquea a los dos lo que deja
sin acceso al servidor; en Antigravity esas reglas viven en el prompt. No vienen
preseleccionados en ningún preset.

### Claude Code — 10 subagentes

`planner`, `code-reviewer`, `ui-reviewer`, `security-auditor`,
`db-migration-reviewer`, `debugger`, `test-writer`, `web-researcher`,
`server-inspector` y `server-operator` (estos dos, opcionales). Detalle en la
página `/kits/claude-code/subagentes` del sitio.

Son 8 por defecto (ADR-027): lo que ya cubre Claude Code o un comando del kit no
tiene subagent propio. Para buscar en el código está el agente `Explore` de
Claude Code; los docs y el commit los cierra `/session-close`, y el chequeo de
deploy, `/deploy-checklist`. Los comandos delegan en su agente: `/bug-fix` en
`debugger` y `/security-audit` en `security-auditor`.

---

## Skills

Conocimiento externo empaquetado — complementan `stack-conventions.md`, no lo
reemplazan.

| | `stack-conventions.md` | Skills |
|---|---|---|
| Qué es | Tus reglas del proyecto | Conocimiento externo de la comunidad |
| Ejemplo | "usamos Zod para validación" | "así se evitan waterfalls en React" |
| Cuándo carga | Glob al editar código | Según criterio definido en `tools-reference.md` |

### Las 5 skills activas

| Skill | Cuándo activarla |
|---|---|
| `frontend-design` | Iniciar UI nueva, con o sin sistema de diseño ya definido (caso habitual en Orange Latam) |
| `impeccable` (polish) | Revisar UI existente o antes de PR — requiere que `frontend-design` haya corrido antes |
| `web-design-guidelines` | Auditar a11y, forms, performance contra Web Interface Guidelines de Vercel |
| `vercel-react-best-practices` | Escribir o revisar componentes React/Next.js — 70 reglas de performance |
| `vercel-composition-patterns` | Refactorizar componentes con muchos props booleanos, diseñar APIs de componentes reutilizables (shadcn/ui) |

Nunca más de 2-3 activas a la vez. Detalle completo, jerarquía si hay conflicto e
instalación de cada una (`frontend-design`, `impeccable`,
`web-design-guidelines`, `vercel-react-best-practices`,
`vercel-composition-patterns`) está en `tools-reference.md` — no se duplica aquí
para evitar que las dos copias diverjan.

### Skills de Marketing/SEO

Categoría aparte — no compiten con las skills de diseño de arriba.

| Skill | Cuándo activarla |
|---|---|
| `seo-audit` | Auditar o diagnosticar problemas de SEO — caída de tráfico, indexación, ranking. Diagnóstico únicamente: los umbrales concretos (Lighthouse, OG, meta tags) los define `seo.md`, no la skill |

Instalación: `npx skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit`
(el paquete trae ~30 skills de marketing — solo se instala `seo-audit`, no el paquete completo).
Detalle en [`.agents/skills/seo-audit/SKILL.md`](.agents/skills/seo-audit/SKILL.md).

### Skill de dominio

| Skill | Cuándo activarla |
|---|---|
| `domain-modeling` | Mientras se trabaja, no como paso aparte: al aparecer un término del dominio nuevo o ambiguo, o al nombrar entidades, tipos y endpoints. Mantiene el glosario `docs/CONTEXT.md` — que es lenguaje del negocio, no esquema técnico (eso es `DATA_MODEL.md`) |

Viene preseleccionada en los 7 stacks reales. La plantilla del glosario está en
`docs-templates/CONTEXT.md` y se crea recién cuando hay 3 términos que lo
justifiquen (ADR-012).

### Skill de lanzamiento

| Skill | Cuándo activarla |
|---|---|
| `security-mitigations` | Al implementar o auditar login, permisos, APIs, uploads, dependencias, IA o WordPress: un índice lleva al tema que toca, sin leer todo. |
| `prelaunch-compliance-audit` | Antes de lanzar una web o app (o con una ya publicada): auditoría contra 43 reglas legales, de privacidad, seguridad, accesibilidad, técnicas y SEO. Investiga la normativa vigente del país del proyecto, entrega un reporte por severidad y propone arreglos que no aplica sin aprobación. También redacta privacidad, términos, reembolsos, cookies y aviso legal a partir de los hechos del proyecto |

Viene preseleccionada en los 7 stacks reales y `/deploy-checklist` la recomienda
en el primer lanzamiento. Carga por partes: `SKILL.md` tiene el flujo y el formato
del reporte; el catálogo, la normativa por país y los textos legales están en
`references/` y se leen solo cuando el paso los necesita. No sustituye a un
abogado ni a una prueba de penetración.

### Skills de Seguridad

Complementa `security.md`: la regla define los umbrales y checklist del proyecto
(rate limits, headers obligatorios, hashing), la skill trae los patrones de
implementación paso a paso.

| Skill | Cuándo activarla |
|---|---|
| `api-security-best-practices` | Diseñar o revisar endpoints de API — auth, validación de inputs, rate limiting, protección contra inyección/SSRF/DDoS. No la uses para elegir los umbrales del proyecto (eso lo define `security.md`), sí para los patrones de implementación (JWT, Zod, rate limiters, headers) |

Instalación: `npx skills add sickn33/antigravity-awesome-skills --skill api-security-best-practices`
(el repo fuente es una colección "awesome" grande — ~1900 skills, varias con
frontmatter inválido — se instala solo esta, no el paquete completo).
Detalle en [`.agents/skills/api-security-best-practices/SKILL.md`](.agents/skills/api-security-best-practices/SKILL.md).

### Skills de diseño de terceros

A diferencia de las de `.agents/skills/`, **no** entran en el ZIP de `/build`:
son código de otros repos, con su propia licencia y su propio ciclo de
actualización.

| Origen | Skills | Dónde viven |
|---|---|---|
| [nutlope/hallmark](https://github.com/nutlope/hallmark) | `hallmark` | Cuenta de Claude del autor |
| [emilkowalski/skills](https://github.com/emilkowalski/skill) | `emil-design-eng`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `apple-design`, `pick-ui-library` | Cuenta de Claude del autor |
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `ui-ux-pro-max`, `design-system`, `ui-styling` | Vendorizadas en `.claude/skills/` |

Las 8 de hallmark y emilkowalski estaban también vendorizadas acá y se sacaron
del repo el 2026-10-28: eran idénticas a las de la cuenta y en cada sesión de
este proyecto aparecían dos veces. Para usarlas en otra máquina o cuenta,
instalarlas como skills personales:

```bash
npx skills add nutlope/hallmark
npx skills add emilkowalski/skills
```

`skills-lock.json` registra ahora solo `api-security-best-practices`. Las tres
de `uipro init` **no** están en el lock —
el CLI de uipro no lo escribe, así que su única referencia de versión es este
repo (git). Para reinstalarlas:

```bash
npx ui-ux-pro-max-cli init --ai claude
```

> `uipro init` instala además `design`, `brand`, `banner-design` y `slides`
> —un paquete propio de diseño gráfico (logos, identidad corporativa,
> banners de redes, presentaciones) que su README no menciona. Se borraron
> a mano por quedar fuera del alcance del repo: si volvés a correr `uipro
> init`, reaparecen.

#### Subirlas a Claude Desktop

Claude Desktop las toma como skill personal en formato ZIP. Para generarlos:

```bash
python scripts/make-desktop-zips.py
```

Deja un `.zip` por skill en `skills-desktop/` (gitignored), cada uno con su
`SKILL.md` en la raíz de la carpeta. **No alcanza con copiar solo el
`SKILL.md`** salvo en las de un único archivo: `ui-ux-pro-max` son 39
archivos — sin su `data/` la skill queda apuntando a archivos que no existen.

> `ui-ux-pro-max` funciona parcialmente en Desktop: su `SKILL.md` invoca
> `python3 skills/ui-ux-pro-max/scripts/search.py`, una ruta relativa al
> proyecto que ahí no existe. Los CSV de datos se leen igual, pero la búsqueda
> automatizada del design system no corre.

---

## Consumo de Tokens (aproximado)

Estimación por caracteres/4 — no es el tokenizer real, sirve como orden de
magnitud. La tabla se regenera con `python scripts/update-token-table.py` —
no editarla a mano.

<!-- token-table:start -->
| Archivo | ~Tokens | Cuándo carga |
|---|---|---|
| `GEMINI.md` | ~2,336 | Siempre |
| `security.md` | ~2,262 | Model Decision |
| `architecture.md` | ~599 | Model Decision |
| `ui-ux.md` | ~2,386 | Model Decision |
| `seo.md` | ~1,423 | Model Decision |
| `pwa.md` | ~578 | Model Decision — solo PWA |
| `operations.md` | ~1,467 | Model Decision |
| `cms.md` | ~690 | Model Decision |
| `database.md` | ~862 | Model Decision |
| `stack-conventions.md` | ~604 | Glob |
| `/tools-reference` | ~1,374 | Skill — slash o por descripción |
| `/grill` | ~622 | Skill — slash o por descripción |
| `/new-feature` | ~447 | Skill — slash o por descripción |
| `/bug-fix` | ~420 | Skill — slash o por descripción |
| `/session-close` | ~565 | Skill — slash o por descripción |
| `/security-audit` | ~880 | Skill — slash o por descripción |
| `/deploy-checklist` | ~855 | Skill — slash o por descripción |
| **Base siempre activa** | **~2,336** | `GEMINI.md` |
| **Caso típico** (1-2 reglas + 1 workflow) | **~3,355–8,358** | sesión normal de código |
| **Máximo con todo activo** | **~14,581** | improbable — varias reglas casi nunca se activan juntas |
<!-- token-table:end -->

El "máximo con todo activo" es un techo teórico (ej. tocar auth + UI + infra +
CMS en el mismo mensaje), no el caso real. En la práctica, una tarea de feature
normal carga `GEMINI.md` + 1-2 reglas relevantes + el workflow invocado.

---

## Notas de mantenimiento

- **`security.md` es la fuente de verdad de seguridad.** `security-audit.md` y la
  sección de seguridad de `deploy-checklist.md` son checklists resumidos que
  referencian secciones específicas (`§ NextAuth v5`, `§ File Uploads`) — si se
  actualiza una regla de seguridad, revisar si el resumen en los workflows quedó
  desactualizado.
- **`architecture.md` tiene una excepción explícita para Next.js App Router** —
  Server Components/Actions sí pueden tocar la capa de datos; Client Components no.
  No aplicar el patrón estricto de capas a un proyecto App Router sin leer esa
  excepción primero.
- **`operations.md` asume infraestructura self-hosted** (Docker Compose +
  Cloudflare Tunnel) como caso por defecto, no AWS/GCP — las reglas de Secret
  Manager de proveedor cloud son condicionales, solo si un proyecto específico
  se despliega ahí.
- Todos los archivos usan LF (no CRLF) y `description` no vacío en su frontmatter
  — si se edita un archivo desde Windows, verificar que no se reintroduzcan
  CRLF antes de commitear.
