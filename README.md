# Antigravity Rules — Guía del Sistema

Sistema de reglas para el workflow dual-AI de Orange Latam (Gemini/Antigravity como
desarrollador principal, Claude como PM/auditor). Carga selectiva por contexto —
nada se lee completo en cada mensaje salvo lo estrictamente "Always On".

---

## Estructura

```
~/.gemini/                                    # GLOBAL — una sola vez, aplica a todos los proyectos
├── GEMINI.md                                 # Always On — núcleo: principios, stack base, naming, jerarquía
└── antigravity/global_workflows/
    ├── new-feature.md                        # /new-feature
    ├── bug-fix.md                            # /bug-fix
    ├── session-close.md                      # /session-close
    ├── security-audit.md                     # /security-audit
    ├── deploy-checklist.md                   # /deploy-checklist
    └── tools-reference.md                    # /tools-reference

[proyecto]/
└── .agents/                                  # WORKSPACE — override local, por proyecto
    ├── rules/
    │   ├── security.md                       # Model Decision
    │   ├── architecture.md                   # Model Decision
    │   ├── ui-ux.md                          # Model Decision
    │   ├── operations.md                     # Model Decision
    │   ├── cms.md                            # Model Decision
    │   └── stack-conventions.md              # Glob: *.tsx,*.ts,*.jsx,*.js,*.py,*.php,*.css
    └── skills/                               # opcional — ver § Skills
```

> **¿Por qué global + workspace?** Trabajas varios proyectos a la vez (Media Hub,
> Abencia, Agency CRM, sitios de cliente). `GEMINI.md` y los 6 workflows no cambian
> de un proyecto a otro — van en `~/.gemini/` una sola vez. Las reglas técnicas
> (`security.md`, `architecture.md`, etc.) sí pueden variar por proyecto — un sitio
> WordPress no necesita las mismas convenciones que Abencia en Next.js — así que
> viven en `.agents/rules/` dentro de cada repo, donde se pueden ajustar sin tocar
> lo global. Si todos tus proyectos comparten exactamente las mismas reglas técnicas,
> también puedes moverlas a `~/.gemini/antigravity/rules/` y saltarte la copia por
> proyecto — pero perderías la posibilidad de variarlas caso por caso.

---

## Instalación

### Paso 1 — Archivos globales (una sola vez)

**macOS / Linux**
```bash
mkdir -p ~/.gemini/antigravity/global_workflows
cp GEMINI.md ~/.gemini/GEMINI.md
cp new-feature.md bug-fix.md session-close.md security-audit.md deploy-checklist.md tools-reference.md \
   ~/.gemini/antigravity/global_workflows/
```

**Windows (PowerShell)**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.gemini\antigravity\global_workflows"
Copy-Item "GEMINI.md" "$env:USERPROFILE\.gemini\GEMINI.md"
Copy-Item "new-feature.md","bug-fix.md","session-close.md","security-audit.md","deploy-checklist.md","tools-reference.md" `
  "$env:USERPROFILE\.gemini\antigravity\global_workflows\"
```

### Paso 2 — Reglas de workspace (por cada proyecto)

```bash
mkdir -p .agents/rules
cp security.md architecture.md ui-ux.md operations.md cms.md stack-conventions.md .agents/rules/
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

# ui-ux-pro-max — SOLO si vas a usarlo (ver advertencia de seguridad abajo)
npm install -g uipro-cli && uipro init --ai antigravity

# Context7 MCP — documentación de librerías en tiempo real, por proyecto
npx ctx7 setup
```

> ⚠️ **`ui-ux-pro-max`:** auditorías externas (skills.sh Gen Agent Trust Hub, MCPxel)
> lo marcan como riesgo Medium — ejecuta scripts Python vía shell sin sandboxing.
> En `tools-reference.md` está restringido a "solo cuando el proyecto no tiene
> todavía un sistema de diseño definido". Para proyectos con brand ya definido
> (caso habitual en Orange Latam) usa `frontend-design` en su lugar.

### Paso 4 — Ajustar stack por proyecto

Si el proyecto difiere del stack base (`GEMINI.md § 3`), documentarlo en el
`00_GEMINI_START.md` del proyecto — ese archivo tiene prioridad sobre la tabla
de stack de `GEMINI.md` (ver `GEMINI.md § 5`, nota de excepción).

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
| `ui-ux.md` | Model Decision | Interfaces, componentes visuales, formularios, estados de carga/error, SEO de páginas |
| `operations.md` | Model Decision | CI/CD, logging, infraestructura, integración de agentes/LLM |
| `cms.md` | Model Decision | WordPress, Drupal, o CMS headless (Sanity, Contentful, Strapi) |
| `stack-conventions.md` | Glob `*.tsx,*.ts,*.jsx,*.js,*.py,*.php,*.css` | Al editar cualquier archivo de esos tipos |

> `tools-reference.md` **no** está en esta tabla a propósito — es workflow
> (`trigger: manual`, vive en `antigravity/global_workflows/`), no regla. Ver
> tabla de Workflows abajo.

Si una regla y un workflow describen lo mismo (ej. checklist de seguridad en
`security-audit.md` vs. el detalle en `security.md`), **la regla en
`.agents/rules/` es la fuente de verdad** — los workflows son resúmenes
operativos, no la documentación completa.

---

## Workflows

6 workflows, todos `trigger: manual` — **se invocan escribiendo el comando en el
chat, la IA no los dispara por su cuenta.** Las líneas tipo "Recordatorio: invocar
`/session-close`" dentro de cada workflow son avisos para que tú escribas el
siguiente comando — no encadenan automáticamente.

| Comando | Cuándo invocarlo | Qué hace |
|---|---|---|
| `/new-feature` | Antes de empezar cualquier tarea nueva | Define el plan, crea la rama git (`feat/...` o `fix/...`), crea o actualiza `06_TASKS.md`, documenta ADR si hay decisión arquitectónica. Espera tu aprobación del plan antes de codificar |
| `/bug-fix` | Algo está roto | Identifica causa raíz antes de tocar código, evalúa impacto, crea rama `fix/...`, plantea plan de 2-3 pasos y espera aprobación |
| `/session-close` | Al terminar el día o una tarea | Actualiza físicamente los docs de `/docs` relevantes, verifica build y flujo probado, marca la tarea como completed en `06_TASKS.md`, genera commit sugerido |
| `/security-audit` | Antes de subir features con auth, APIs o datos sensibles | Checklist OWASP + auth + secrets + uploads (resumen — detalle en `security.md`). Lista hallazgos con severidad Critical/High/Medium |
| `/deploy-checklist` | Antes de merge a `main` o deploy a producción | Checklist completo: código, seguridad, UI, SEO, documentación |
| `/tools-reference` | Setup inicial o cuando necesites ver qué skills usar y cuándo | Tabla de skills de diseño + Context7, sin instalación duplicada (apunta a este README) |

### Flujo típico de una tarea

```
/new-feature           ← defines la tarea, se crea la rama y se actualiza 06_TASKS.md
  ... trabajas ...
/security-audit         ← si tocaste auth, APIs o datos sensibles
/deploy-checklist        ← si vas a hacer merge a main
/session-close          ← siempre al cerrar, actualiza docs y sugiere el commit
```

`/bug-fix` reemplaza a `/new-feature` cuando el punto de partida es algo roto, no
una feature nueva — el resto del flujo (`/security-audit`, `/deploy-checklist`,
`/session-close`) aplica igual.

---

## Skills

Conocimiento externo empaquetado — complementan `stack-conventions.md`, no lo
reemplazan.

| | `stack-conventions.md` | Skills |
|---|---|---|
| Qué es | Tus reglas del proyecto | Conocimiento externo de la comunidad |
| Ejemplo | "usamos Zod para validación" | "así se evitan waterfalls en React" |
| Cuándo carga | Glob al editar código | Según criterio definido en `tools-reference.md` |

### Las 6 skills activas

| Skill | Cuándo activarla |
|---|---|
| `frontend-design` | Iniciar UI nueva en proyecto **con** sistema de diseño ya definido (caso habitual en Orange Latam) |
| `ui-ux-pro-max` | Iniciar UI nueva en proyecto **sin** sistema de diseño definido todavía — ver advertencia de seguridad arriba |
| `impeccable` (polish) | Revisar UI existente o antes de PR — requiere que `frontend-design` haya corrido antes |
| `web-design-guidelines` | Auditar a11y, forms, performance contra Web Interface Guidelines de Vercel |
| `vercel-react-best-practices` | Escribir o revisar componentes React/Next.js — 70 reglas de performance |
| `vercel-composition-patterns` | Refactorizar componentes con muchos props booleanos, diseñar APIs de componentes reutilizables (shadcn/ui) |

Nunca más de 2-3 activas a la vez. Detalle completo, jerarquía si hay conflicto e
instalación de cada una (`frontend-design`, `ui-ux-pro-max`, `impeccable`,
`web-design-guidelines`, `vercel-react-best-practices`,
`vercel-composition-patterns`) está en `tools-reference.md` — no se duplica aquí
para evitar que las dos copias diverjan.

### Skills de Marketing/SEO

Categoría aparte — no compiten con las skills de diseño de arriba.

| Skill | Cuándo activarla |
|---|---|
| `seo-audit` | Auditar o diagnosticar problemas de SEO — caída de tráfico, indexación, ranking. Diagnóstico únicamente: los umbrales concretos (Lighthouse, OG, meta tags) los define `ui-ux.md § SEO Técnico`, no la skill |

Instalación: `npx skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit`
(el paquete trae ~30 skills de marketing — solo se instala `seo-audit`, no el paquete completo).
Detalle en [`.agents/skills/seo-audit/SKILL.md`](.agents/skills/seo-audit/SKILL.md).

---

## Consumo de Tokens (aproximado)

Estimación por caracteres/4 — no es el tokenizer real, sirve como orden de magnitud.

| Archivo | ~Tokens | Cuándo carga |
|---|---|---|
| `GEMINI.md` | ~1,160 | Siempre |
| `security.md` | ~940 | Model Decision |
| `architecture.md` | ~600 | Model Decision |
| `ui-ux.md` | ~2,010 | Model Decision |
| `operations.md` | ~1,240 | Model Decision |
| `cms.md` | ~690 | Model Decision |
| `stack-conventions.md` | ~500 | Glob |
| `tools-reference.md` | ~490 | Manual |
| `new-feature.md` | ~365 | Manual |
| `bug-fix.md` | ~345 | Manual |
| `session-close.md` | ~530 | Manual |
| `security-audit.md` | ~655 | Manual |
| `deploy-checklist.md` | ~410 | Manual |
| **Base siempre activa** | **~1,160** | `GEMINI.md` |
| **Caso típico** (1-2 reglas + 1 workflow) | **~2,400–3,400** | sesión normal de código |
| **Máximo con todo activo** | **~9,825** | improbable — varias reglas casi nunca se activan juntas |

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
