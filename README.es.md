# Homerule

> Tus reglas de IA, en casa en cada proyecto.

[English](README.md) · **Español**

Kit de reglas, skills, comandos y subagentes para trabajar con IA en **Claude Code**,
**Antigravity** y **Codex**. Se instala una sola vez en la carpeta personal y vale para
todos los proyectos (ADR-038). Cada proyecto lleva solo su documentación en `docs/` y
un **`AGENTS.md`** con lo esencial: quien lo clone trae su propia forma de trabajar
(ADR-036).

El sitio (`site/`) entrega las dos piezas (ADR-039): el kit global de cada herramienta,
con su instalador, y el arranque de un proyecto nuevo (`docs/`, `AGENTS.md` y
`CLAUDE.md`).

Carga selectiva por contexto: nada se lee completo en cada mensaje salvo lo
estrictamente "Always On".

> El contenido del kit (rules, skills, comandos, agentes y plantillas de `docs/`) está
> en español (ADR-009). La IA responde en el idioma del usuario.

---

## Estructura

```
~/.claude/                  # Claude Code: CLAUDE.md, skills/ (rules y skills), commands/, agents/, hooks/
~/.gemini/                  # Antigravity: GEMINI.md y config/{rules,skills,agents}/
~/.codex/AGENTS.md          # Codex: reglas generales
~/.agents/skills/           # Codex: rules, skills y comandos como skills

[proyecto]/
├── AGENTS.md               # lo esencial del proyecto, para cualquier IA o persona (ADR-036)
├── CLAUDE.md               # solo importa AGENTS.md
└── docs/                   # 01_PRD, 02_TASKS, 03_DECISIONS, 04_CHANGELOG y los opcionales
```

Las rules se activan solas según lo que se esté tocando (seguridad, base de datos,
interfaz, SEO…), así que el kit se instala completo. Si un proyecto se desvía de una
regla, el desvío va en su `AGENTS.md`, que manda sobre el kit.

---

## Instalación

### Desde la web

En `/instalar`, elegí la herramienta y bajá el ZIP. Adentro vienen el kit y el mismo
instalador que se usa desde el repo. Necesita Node 24 o más nuevo.

```bash
node install.mjs           # muestra qué va a cambiar
node install.mjs --write   # instala, con respaldo
```

Para arrancar un proyecto, `/proyecto-nuevo` arma el ZIP con `docs/`, `AGENTS.md` y
`CLAUDE.md`.

### Desde el repo

Instala el kit una sola vez en tu carpeta personal, para Claude Code, Antigravity y
Codex a la vez (ADR-038).

```bash
git clone https://github.com/luiskaco/homerule.git
```

```bash
node scripts/install-global.mjs --write
```

Sin `--write` solo muestra qué cambiaría. Para actualizar: `git pull` y volver a
correrlo. Deja respaldo en `kit-backup/`, borra lo que el kit ya no trae y nunca pisa
un archivo tuyo con el mismo nombre.

### Claude Code como plugin

El plugin se actualiza desde git: un `/plugin update` trae las correcciones posteriores
a la instalación. El ZIP de `/instalar`, en cambio, se actualiza bajándolo de nuevo.

```
/plugin marketplace add luiskaco/homerule
/plugin install ai-rules-hub@ai-rules-hub
```

Trae las 9 rules como skills nativas, los 7 comandos y 8 de los 10 subagentes:
`server-inspector` y `server-operator` van solo en el ZIP, porque el plugin ignora el
hook que los controla (ADR-026). **No** trae `CLAUDE.md` ni `AGENTS.md`: un plugin
aporta comandos, agentes y skills, no memoria de proyecto. Para el núcleo global,
instalá el kit desde `/instalar`.

Las skills de terceros (`hallmark`, `impeccable`, las de Vercel, etc.) no van en el
plugin a propósito: se instalan desde su repo original, con el comando que figura en el
catálogo.

### Context7 (opcional, por proyecto)

Documentación al día de las librerías para la IA. Es un servidor MCP, no una skill, así
que no viene en el kit:

```bash
npx ctx7 setup
```

---

## Rules: modos de activación

`GEMINI.md` (`~/.gemini/`) y `CLAUDE.md` (`~/.claude/`) son Always On: se leen en cada
mensaje, sin excepción.

Cada rule define su modo en el frontmatter (`trigger`) y, salvo `manual`, una
`description` que le dice al modelo cuándo activarse solo.

| Archivo | Trigger | Se activa cuando… |
|---|---|---|
| `security.md` | Model Decision | Auth, endpoints de API, validación de inputs, uploads, secrets, CORS |
| `architecture.md` | Model Decision | Módulo o archivo nuevo, decisión de en qué capa o carpeta va algo |
| `ui-ux.md` | Model Decision | Interfaces, componentes visuales, formularios, estados de carga/error, accesibilidad, dark mode, i18n |
| `seo.md` | Model Decision | Meta tags, Open Graph, structured data, canonical, hreflang, Core Web Vitals como factor de ranking |
| `pwa.md` | Model Decision | Manifest, service worker, cache, estado offline, update flow — **solo si el proyecto es una PWA** |
| `operations.md` | Model Decision | CI/CD, logging, infraestructura, integración de agentes/LLM |
| `cms.md` | Model Decision | WordPress, Drupal, o CMS headless (Sanity, Contentful, Strapi) |
| `database.md` | Model Decision | Diseño de schema, migraciones, elección de ORM, pooling, índices, credenciales de DB |
| `stack-conventions.md` | Glob `*.tsx,*.ts,*.jsx,*.js,*.py,*.php,*.css` | Al editar cualquier archivo de esos tipos |

> `tools-reference` **no** está en esta tabla a propósito: es un comando, no una regla.
> Ver la tabla de Workflows abajo.

Si una regla y un workflow describen lo mismo (por ejemplo, el checklist de seguridad
de `/security-audit` y el detalle de `security.md`), **la regla es la fuente de
verdad**: los workflows son resúmenes operativos, no la documentación completa.

---

## Workflows

7 workflows, implementados como skills (ADR-020): **se invocan escribiendo el comando
en el chat.** En Claude Code son comandos y solo corren si los escribís; en Antigravity
son skills, así que además pueden activarse solos cuando la tarea coincide con su
descripción. En Codex son skills que se piden con `$` y el nombre. Las líneas tipo
"Recordatorio: invocar `/session-close`" dentro de cada workflow son avisos para que
escribas el siguiente comando: no encadenan automáticamente.

| Comando | Cuándo invocarlo | Qué hace |
|---|---|---|
| `/grill` | Antes de `/new-feature`, cuando el plan todavía es difuso o traés una idea en vez de un requerimiento | Interrogatorio de a una pregunta por turno hasta dejar resueltos problema real, bordes, fuera de alcance, decisiones irreversibles y criterio de terminado. Cierra con un resumen que alimenta al workflow siguiente |
| `/new-feature` | Antes de empezar cualquier tarea nueva | Define el plan, crea la rama git (`feat/...` o `fix/...`), crea o actualiza `02_TASKS.md` y documenta un ADR si hay decisión arquitectónica. Espera tu aprobación del plan antes de codificar |
| `/bug-fix` | Algo está roto | Identifica la causa raíz antes de tocar código, evalúa el impacto, crea la rama `fix/...`, plantea un plan de 2-3 pasos y espera aprobación |
| `/session-close` | Al terminar el día o dejar el proyecto | Actualiza los docs de `/docs` que correspondan, verifica el build y el flujo probado, borra las tareas cerradas de `02_TASKS.md` dejando una línea en `04_CHANGELOG.md`, reescribe "Dónde quedó" y sugiere el commit |
| `/security-audit` | Antes de subir features con auth, APIs o datos sensibles | Checklist OWASP + auth + secrets + uploads (resumen; detalle en `security.md`). Lista hallazgos con severidad Critical/High/Medium |
| `/deploy-checklist` | Antes de un merge a `main` o un deploy a producción | Checklist completo: código, seguridad, UI, SEO, documentación |
| `/tools-reference` | Setup inicial o cuando necesites ver qué skills usar y cuándo | Tabla de skills de diseño + Context7 |

### Cómo pedir algo: no hace falta decir "skill"

- **Explícito:** escribí el comando (`/grill`, `/new-feature`…). Funciona en Claude Code
  y en Antigravity.
- **Automático:** describí la tarea con tus palabras ("quiero planificar esta feature",
  "revisá la seguridad antes de subir") y el agente activa la skill cuya descripción
  calza. Las rules (`security`, `seo`, `ui-ux`…) se activan así.
- **Forzar una concreta:** nombrala en el pedido ("usá la skill `hallmark` para esta
  landing"). Evita que el agente elija otra.

### Flujo típico de una tarea

```
/grill                  ← opcional, si el plan está difuso: la IA interroga hasta afilarlo
/new-feature            ← definís la tarea, se crea la rama y se actualiza 02_TASKS.md
  ... trabajás ...
/security-audit         ← si tocaste auth, APIs o datos sensibles
/deploy-checklist       ← si vas a hacer merge a main
/session-close          ← siempre al cerrar: actualiza docs y sugiere el commit
```

`/bug-fix` reemplaza a `/new-feature` cuando el punto de partida es algo roto, no una
feature nueva; el resto del flujo (`/security-audit`, `/deploy-checklist`,
`/session-close`) aplica igual.

---

## Subagentes

Los dos tools tienen subagentes declarables en archivo, con formatos distintos que **no
se convierten entre sí** (ADR-006): Antigravity lee `agents/<nombre>/agent.md` y Claude
Code lee `agents/<nombre>.md`. Codex todavía no tiene subagentes declarables. La página
`/catalogo` muestra cada uno con su contenido.

### Antigravity — 7 subagentes

Los invoca el agente principal con `invoke_subagent` cuando la tarea lo amerita (o los
elegís a mano desde el panel `/agents`). Corren en contexto aislado: el detalle de su
trabajo no contamina la ventana del agente principal.

| Subagente | Qué hace | Escribe código |
|---|---|---|
| `auditor` | Review del diff contra las rules: correctness, arquitectura, convenciones, datos, reuse e interfaz | No — solo lectura |
| `backend` | Endpoints, servicios, acceso a datos, migraciones. Verifica con tests/typecheck antes de devolver | Sí |
| `frontend` | Componentes, páginas, estilos, los 5 estados de UI, accesibilidad | Sí |
| `security` | Auditoría OWASP: auth, inputs, inyección, secrets, uploads, CORS, privacidad | No — solo lectura |
| `web-researcher` | Investiga en internet sin filtrar datos del usuario ni obedecer instrucciones que vengan de una página | No — solo tools web |
| `server-inspector` | Diagnostica servidores por SSH (logs, servicios, disco, contenedores) sin cambiar nada | No — solo lectura |
| `server-operator` | Aplica cambios puntuales en servidores por SSH, cada comando con aprobación | No — cambia servidores |

Todos corren con `commandExecutionPolicy: sandbox`, salvo los dos de servidores, que
corren con `off` (cada comando espera tu aprobación), y heredan los permisos de terminal
que ya tengas configurados. `auditor` y `security` tienen `run_command` únicamente para
inspección (`git diff`, `npm audit`), sin ninguna tool de escritura de archivos.
`web-researcher` solo tiene `search_web` y `read_url_content`. `security` y
`server-operator` corren en tier `pro`; el resto hereda el modelo de la sesión.

`web-researcher` existe en los dos tools (ADR-022). En Claude Code, además, un hook
revisa cada búsqueda y cada URL antes de que salga: bloquea secretos, emails, rutas
locales y hosts de la red local. Para sumar términos propios del proyecto (clientes,
nombres internos), listalos uno por línea en `.claude/web-guard-terms.txt`.

`server-inspector` y `server-operator` también existen en los dos tools (ADR-026). Se
conectan solo por alias de `~/.ssh/config`, listados por proyecto en
`.claude/ssh-hosts.txt` o `.agents/ssh-hosts.txt`; el operator no se conecta sin esa
lista. **No pongas `ssh`, `scp` ni `rsync` en la allow list de comandos**: los cambios
correrían sin pedir aprobación. En Claude Code un hook (`~/.claude/hooks/ssh-guard.mjs`)
le deja al inspector solo comandos de lectura, le hace pedir aprobación al operator en
cada comando y les bloquea a los dos lo que deja sin acceso al servidor; en Antigravity
esas reglas viven en el prompt.

### Claude Code — 10 subagentes

`planner`, `code-reviewer`, `ui-reviewer`, `security-auditor`, `db-migration-reviewer`,
`debugger`, `test-writer`, `web-researcher`, `server-inspector` y `server-operator`.

Son 8 por defecto (ADR-027): lo que ya cubre Claude Code o un comando del kit no tiene
subagente propio. Para buscar en el código está el agente `Explore` de Claude Code; los
docs y el commit los cierra `/session-close`, y el chequeo de deploy,
`/deploy-checklist`. Los comandos delegan en su agente: `/bug-fix` en `debugger` y
`/security-audit` en `security-auditor`.

---

## Skills

Conocimiento externo empaquetado: complementan `stack-conventions.md`, no lo
reemplazan.

| | `stack-conventions.md` | Skills |
|---|---|---|
| Qué es | Tus reglas del proyecto | Conocimiento externo de la comunidad |
| Ejemplo | "usamos Zod para validación" | "así se evitan waterfalls en React" |
| Cuándo carga | Glob, al editar código | Según el criterio de `tools-reference` |

### Skills de diseño

| Skill | Cuándo activarla |
|---|---|
| `frontend-design` | Iniciar UI nueva, con o sin sistema de diseño ya definido |
| `impeccable` (polish) | Revisar UI existente o antes de un PR; conviene que `frontend-design` haya corrido antes |
| `web-design-guidelines` | Auditar a11y, formularios y performance contra las Web Interface Guidelines de Vercel |
| `vercel-react-best-practices` | Escribir o revisar componentes React/Next.js — 70 reglas de performance |
| `vercel-composition-patterns` | Refactorizar componentes con muchos props booleanos, diseñar APIs de componentes reutilizables (shadcn/ui) |
| `ui-patterns` | Elegir o nombrar un patrón de interfaz: animaciones, menús, modales, cajones, toasts, skeletons, estados vacíos |

Nunca más de 2-3 activas a la vez. El detalle completo, la jerarquía si hay conflicto y
la instalación de cada una están en `/tools-reference`, no acá, para que las dos copias
no diverjan.

### Skills de marketing/SEO

| Skill | Cuándo activarla |
|---|---|
| `seo-audit` | Auditar o diagnosticar problemas de SEO: caída de tráfico, indexación, ranking. Solo diagnóstico: los umbrales concretos (Lighthouse, OG, meta tags) los define `seo.md`, no la skill |
| `ai-seo` | Que el contenido sea citado por motores de IA (AI Overviews, ChatGPT, Perplexity): AEO/GEO, `llms.txt` |

### Skill de dominio

| Skill | Cuándo activarla |
|---|---|
| `domain-modeling` | Mientras se trabaja, no como paso aparte: al aparecer un término del dominio nuevo o ambiguo, o al nombrar entidades, tipos y endpoints. Mantiene el glosario `docs/CONTEXT.md`, que es lenguaje del negocio, no esquema técnico (eso es `DATA_MODEL.md`) |

La plantilla del glosario está en `docs-templates/CONTEXT.md` y se crea recién cuando
hay 3 términos que lo justifiquen (ADR-012).

### Skills de lanzamiento y seguridad

| Skill | Cuándo activarla |
|---|---|
| `security-mitigations` | Al implementar o auditar login, permisos, APIs, uploads, dependencias, IA o WordPress: un índice lleva al tema que toca, sin leer todo |
| `prelaunch-compliance-audit` | Antes de lanzar una web o app (o con una ya publicada): auditoría contra 43 reglas legales, de privacidad, seguridad, accesibilidad, técnicas y SEO. Investiga la normativa vigente del país del proyecto, entrega un reporte por severidad y propone arreglos que no aplica sin aprobación. También redacta privacidad, términos, reembolsos, cookies y aviso legal a partir de los hechos del proyecto |
| `api-security-best-practices` | Diseñar o revisar endpoints de API: auth, validación de inputs, rate limiting, protección contra inyección/SSRF/DDoS. No la uses para elegir los umbrales del proyecto (eso lo define `security.md`), sí para los patrones de implementación (JWT, Zod, rate limiters, headers) |

`/deploy-checklist` recomienda `prelaunch-compliance-audit` en el primer lanzamiento.
Carga por partes: `SKILL.md` tiene el flujo y el formato del reporte; el catálogo, la
normativa por país y los textos legales están en `references/` y se leen solo cuando el
paso los necesita. No sustituye a un abogado ni a una prueba de penetración.

### Skills de diseño de terceros

A diferencia de las de `.agents/skills/`, **no** entran en el kit global: son código de
otros repos, con su propia licencia y su propio ciclo de actualización.

| Origen | Skills | Dónde viven |
|---|---|---|
| [nutlope/hallmark](https://github.com/nutlope/hallmark) | `hallmark` | Cuenta de Claude del autor |
| [emilkowalski/skills](https://github.com/emilkowalski/skill) | `emil-design-eng`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `apple-design`, `pick-ui-library` | Cuenta de Claude del autor |
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `ui-ux-pro-max`, `design-system`, `ui-styling` | Vendorizadas en `.claude/skills/` |

Para usarlas en otra máquina o cuenta, instalarlas como skills personales:

```bash
npx skills add nutlope/hallmark
npx skills add emilkowalski/skills
npx ui-ux-pro-max-cli init --ai claude
```

`skills-lock.json` registra solo `api-security-best-practices`. Las tres de `uipro
init` **no** están en el lock: el CLI de uipro no lo escribe, así que su única
referencia de versión es este repo (git).

> `uipro init` instala además `design`, `brand`, `banner-design` y `slides`, un paquete
> propio de diseño gráfico (logos, identidad corporativa, banners de redes,
> presentaciones) que su README no menciona. Se borraron a mano por quedar fuera del
> alcance del repo: si volvés a correr `uipro init`, reaparecen.

#### Subirlas a Claude Desktop

Claude Desktop las toma como skill personal en formato ZIP. Para generarlos:

```bash
python scripts/make-desktop-zips.py
```

Deja un `.zip` por skill en `skills-desktop/` (gitignored), cada uno con su `SKILL.md`
en la raíz de la carpeta. **No alcanza con copiar solo el `SKILL.md`** salvo en las de
un único archivo: `ui-ux-pro-max` son 39 archivos, y sin su `data/` la skill queda
apuntando a archivos que no existen.

> `ui-ux-pro-max` funciona parcialmente en Desktop: su `SKILL.md` invoca
> `python3 skills/ui-ux-pro-max/scripts/search.py`, una ruta relativa al proyecto que
> ahí no existe. Los CSV de datos se leen igual, pero la búsqueda automatizada del
> design system no corre.

---

## Consumo de tokens (aproximado)

Estimación por caracteres/4: no es el tokenizer real, sirve como orden de magnitud. La
tabla se regenera con `python scripts/update-token-table.py`; no editarla a mano.

<!-- token-table:start -->
| Archivo | ~Tokens | Cuándo carga |
|---|---|---|
| `GEMINI.md` | ~2,497 | Siempre |
| `security.md` | ~2,315 | Model Decision |
| `architecture.md` | ~1,572 | Model Decision |
| `ui-ux.md` | ~2,000 | Model Decision |
| `seo.md` | ~1,445 | Model Decision |
| `pwa.md` | ~578 | Model Decision — solo PWA |
| `operations.md` | ~1,553 | Model Decision |
| `cms.md` | ~690 | Model Decision |
| `database.md` | ~873 | Model Decision |
| `stack-conventions.md` | ~874 | Glob |
| `/tools-reference` | ~1,267 | Skill — slash o por descripción |
| `/grill` | ~604 | Skill — slash o por descripción |
| `/new-feature` | ~440 | Skill — slash o por descripción |
| `/bug-fix` | ~405 | Skill — slash o por descripción |
| `/session-close` | ~488 | Skill — slash o por descripción |
| `/security-audit` | ~370 | Skill — slash o por descripción |
| `/deploy-checklist` | ~792 | Skill — slash o por descripción |
| **Base siempre activa** | **~2,497** | `GEMINI.md` |
| **Caso típico** (1-2 reglas + 1 workflow) | **~4,439–8,079** | sesión normal de código |
| **Máximo con todo activo** | **~15,664** | improbable — varias reglas casi nunca se activan juntas |
<!-- token-table:end -->

El "máximo con todo activo" es un techo teórico (por ejemplo, tocar auth + UI + infra +
CMS en el mismo mensaje), no el caso real. En la práctica, una tarea de feature normal
carga `GEMINI.md` + 1-2 reglas relevantes + el workflow invocado.

---

## Notas de mantenimiento

- **`security.md` es la fuente de verdad de seguridad.** `/security-audit` y la sección
  de seguridad de `/deploy-checklist` son checklists resumidos que apuntan a secciones
  específicas; si se actualiza una regla de seguridad, revisar si el resumen de los
  workflows quedó desactualizado.
- **`architecture.md` tiene una excepción explícita para Next.js App Router**: Server
  Components/Actions sí pueden tocar la capa de datos; Client Components no. No aplicar
  el patrón estricto de capas a un proyecto App Router sin leer esa excepción primero.
- **`operations.md` asume infraestructura self-hosted** (Docker Compose + Cloudflare
  Tunnel) como caso por defecto, no AWS/GCP; las reglas de Secret Manager de proveedor
  cloud son condicionales, solo si un proyecto específico se despliega ahí.
- Todos los archivos usan LF (no CRLF) y `description` no vacío en su frontmatter; si se
  edita un archivo desde Windows, verificar que no se reintroduzcan CRLF antes de
  commitear.
