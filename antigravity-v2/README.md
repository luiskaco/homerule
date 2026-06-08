# Antigravity Rules v2 — Guía de Instalación

---

## Estructura completa

```
~/.gemini/                                          # GLOBAL — aplica a todos los proyectos
├── GEMINI.md                                       # Always On — reglas core, stack, naming, docs
└── antigravity/global_workflows/
    ├── new-feature.md                              # /new-feature
    ├── bug-fix.md                                  # /bug-fix
    ├── session-close.md                            # /session-close
    ├── security-audit.md                           # /security-audit
    └── deploy-checklist.md                         # /deploy-checklist

[proyecto]/
└── .agents/                                        # WORKSPACE — override local por proyecto
    ├── rules/
    │   ├── ui-ux.md                                # Model Decision
    │   ├── architecture.md                         # Model Decision
    │   ├── security.md                             # Model Decision
    │   ├── cms.md                                  # Model Decision
    │   ├── operations.md                           # Model Decision
    │   ├── stack-conventions.md                    # Glob: **/*.{ts,tsx,js,jsx,py,php,css}
    │   └── tools-reference.md                      # Manual: /tools-reference
    └── skills/
        ├── ui-ux-pro-max/                          # ⚠️ Placeholder — instalar global
        ├── impeccable/                             # ⚠️ Placeholder — instalar global
        ├── web-design-guidelines/                  # ⚠️ Placeholder — instalar global
        ├── react-best-practices/                   # ⚠️ Placeholder — instalar global
        ├── fastapi/                                # ⚠️ Placeholder — instalar global
        └── nodejs/                                 # ⚠️ Placeholder — instalar global
```

---

## Instalación

### Paso 1 — Archivos globales (una sola vez, para todos los proyectos)

#### Windows (PowerShell)
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.gemini\antigravity\global_workflows"
Copy-Item ".gemini\GEMINI.md" "$env:USERPROFILE\.gemini\GEMINI.md"
Copy-Item ".gemini\antigravity\global_workflows\*" "$env:USERPROFILE\.gemini\antigravity\global_workflows\"
```

#### macOS / Linux
```bash
mkdir -p ~/.gemini/antigravity/global_workflows
cp .gemini/GEMINI.md ~/.gemini/GEMINI.md
cp .gemini/antigravity/global_workflows/* ~/.gemini/antigravity/global_workflows/
```

---

### Paso 2 — Archivos de workspace (por cada proyecto)

#### Windows (PowerShell)
```powershell
Copy-Item -Recurse ".agents" ".\"
```

#### macOS / Linux
```bash
cp -r .agents/ ./
```

---

### Paso 3 — Instalar skills (tú las ejecutas en tu terminal)

> ⚠️ Todas las skills del ZIP son **placeholders**. Sin instalarlas la IA solo ve
> la referencia, no el conocimiento real.

**Globales — ejecutar una sola vez en tu máquina:**
```bash
# Skills de diseño UI/UX
npm install -g uipro-cli && uipro init --ai antigravity
npx skills add vercel-labs/agent-skills --skill web-design-guidelines
npx skills add vercel-labs/agent-skills --skill react-best-practices
# impeccable: ver instrucciones en impeccable.style

# Skills de stack
npx skills add fastapi/fastapi --skill fastapi
npx skills add mcollina/skills --skill nodejs
```

**Por proyecto — ejecutar en cada proyecto nuevo:**
```bash
# Context7 MCP — documentación de librerías en tiempo real
npx ctx7 setup
```

---

### Paso 4 — Actualizar stack por proyecto

Abrir `GEMINI.md` y completar solo si el proyecto difiere del stack base:
```
Nombre:        [NOMBRE DEL PROYECTO]           ✏️
Base de datos: [PostgreSQL / MySQL / MongoDB]   ✏️
Frontend:      [Vanilla JS]                    ✏️  solo si NO es React/Next.js
Estilos:       [CSS puro]                      ✏️  solo si NO es Tailwind
```

---

## Rutas por plataforma

| Plataforma | Ruta global |
|------------|------------|
| Windows | `C:\Users\TuUsuario\.gemini\` |
| macOS | `/Users/TuUsuario/.gemini/` |
| Linux | `/home/TuUsuario/.gemini/` |

---

## Rules — Modos de Activación

Antigravity escanea `.agents/rules/` automáticamente. Cada regla tiene su modo definido en el frontmatter.

| Archivo | Modo | Cuándo carga |
|---------|------|-------------|
| `GEMINI.md` | Always On | Siempre — en cada mensaje |
| `ui-ux.md` | Model Decision | La IA detecta tareas de UI, diseño o componentes |
| `architecture.md` | Model Decision | La IA detecta diseño de módulos, APIs o estructura |
| `security.md` | Model Decision | La IA detecta auth, endpoints o datos sensibles |
| `cms.md` | Model Decision | La IA detecta tareas de WordPress o CMS headless |
| `operations.md` | Model Decision | La IA detecta infra, CI/CD o sistemas de IA |
| `stack-conventions.md` | Glob `**/*.{ts,tsx,js,jsx,py,php,css}` | Al editar cualquier archivo de código |
| `tools-reference.md` | Manual | Solo invocar con `/tools-reference` en setup |

---

## Workflows

5 workflows que siguen el orden natural del trabajo.
La IA los ejecuta cuando los invocas — **tú decides cuándo usarlos**.

| Comando | Cuándo invocarlo | Qué hace la IA |
|---------|-----------------|----------------|
| `/new-feature` | Antes de empezar cualquier tarea nueva | Define el plan, crea la rama git, crea o actualiza `06_TASKS.md` con la tarea en `In Progress`, documenta ADR si hay decisión arquitectónica |
| `/bug-fix` | Cuando algo está roto | Identifica la causa raíz antes de codificar, evalúa impacto, crea rama fix/, verifica que el fix no rompe otra cosa |
| `/session-close` | Al terminar el día o una tarea | Actualiza físicamente los docs de `/docs`, mueve tarea a `Completed` en `06_TASKS.md`, corre el build, genera commit sugerido |
| `/security-audit` | Antes de subir features con auth, APIs o datos sensibles | Revisa OWASP Top 10, tokens, secrets y datos sensibles. Lista hallazgos con severidad Critical/High/Medium |
| `/deploy-checklist` | Antes de merge a main o deploy a producción | Checklist completo de código, seguridad, UI, SEO y docs |

### Flujo típico del día
```
/new-feature          ← inicias tarea nueva — IA crea rama y actualiza 06_TASKS.md
/bug-fix              ← si algo está roto — IA identifica causa raíz primero
  ... trabajas ...
/session-close        ← IA actualiza docs, corre build y marca tarea como completed
/security-audit       ← solo si tocaste auth, APIs o datos sensibles
/deploy-checklist     ← solo antes de subir a producción
```

### Relación entre workflows
- `/new-feature` y `/bug-fix` → agregan tarea en `06_TASKS.md` como `In Progress`
- `/session-close` → mueve la tarea a `Completed` y actualiza todos los docs relevantes
- `/bug-fix` → si el bug era de seguridad, invoca `/security-audit` automáticamente al terminar
- `/security-audit` → si encuentra algo Critical, bloquea hasta corregir antes de `/deploy-checklist`
- La IA conecta el ciclo automáticamente — no tienes que recordárselo

### Comportamiento de /session-close
La IA sigue este orden estricto:
1. **Actualiza los docs primero** — escribe los cambios en `/docs` antes de mostrar el checklist
2. **Mueve la tarea** en `06_TASKS.md` de `In Progress` a `Completed`
3. **Corre el build** activamente — no asume que compila
4. **Emite el bloque de cierre** con el estado real de cada doc

Regla importante: si la IA marca un doc como `⚠️ pendiente` teniendo la información disponible en la sesión, es un error — debe actualizar el archivo directamente.

---

## Skills

### Cómo funcionan

Las skills son conocimiento externo empaquetado — mejores prácticas de la comunidad.
Antigravity escanea `.agents/skills/` automáticamente y activa cada skill según su `glob`.

No reemplazan `stack-conventions.md` — se complementan:

| | `stack-conventions` | Skills |
|--|---------------------|--------|
| Qué es | Tus reglas del proyecto | Conocimiento externo |
| Ejemplo | "usamos Zod para validación" | "así se evitan waterfalls en React" |
| Cuándo carga | Glob al editar código | Auto por Glob o manual |

---

### Skills de Diseño UI/UX

La IA elige automáticamente según el contexto — nunca las 3 a la vez.

| Skill | Cuándo la activa la IA | Uso manual |
|-------|----------------------|-----------|
| `ui-ux-pro-max` | Construyendo UI nueva | `/ui-ux-pro-max` |
| `impeccable` | Revisando UI existente | `/impeccable audit` |
| `web-design-guidelines` | Auditando estándares técnicos | `/web-design-guidelines` |

---

### Skills de Stack

Se activan automáticamente por tipo de archivo al editar código.

| Skill | Activa con | Uso manual |
|-------|-----------|-----------|
| `react-best-practices` | `*.tsx`, `*.jsx` | `/react-best-practices` |
| `fastapi` | `*.py` | `/fastapi` |
| `nodejs` | `*.js`, `*.ts` | `/nodejs` |

> ⚠️ Son placeholders en el ZIP — instalar en Paso 3 para que funcionen con conocimiento real.

---

### Buscar más skills

```bash
npx skills find "php"
npx skills find "wordpress"
npx skills list       # ver todas las instaladas
npx skills update     # actualizar todas
```

---

## Consumo de Tokens

| Archivo | Tokens | Cuándo carga |
|---------|--------|-------------|
| `GEMINI.md` | ~600 | Siempre |
| `ui-ux.md` | ~1,484 | Model Decision |
| `architecture.md` | ~436 | Model Decision |
| `security.md` | ~707 | Model Decision |
| `cms.md` | ~585 | Model Decision |
| `operations.md` | ~955 | Model Decision |
| `stack-conventions.md` | ~386 | Glob |
| `tools-reference.md` | ~384 | Manual |
| **Base siempre activa** | **~600** | — |
| **Máximo con todo activo** | **~5,537** | — |
