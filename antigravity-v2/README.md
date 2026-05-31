# Antigravity Rules — Guía de Instalación

---

## Estructura completa

```
~/.gemini/                                      # GLOBAL — todo el sistema
├── GEMINI.md                                   # Always On — reglas core
└── antigravity/global_workflows/
    ├── new-feature.md                          # /new-feature
    ├── session-close.md                        # /session-close
    ├── security-audit.md                       # /security-audit
    └── deploy-checklist.md                     # /deploy-checklist

[proyecto]/
└── .agents/                                    # WORKSPACE — override local
    ├── rules/
    │   ├── ui-ux.md                            # Model Decision
    │   ├── architecture.md                     # Model Decision
    │   ├── security.md                         # Model Decision
    │   ├── cms.md                              # Model Decision
    │   ├── operations.md                       # Model Decision
    │   ├── stack-conventions.md                # Glob: **/*.{ts,tsx,js,jsx,py,php,css}
    │   └── tools-reference.md                  # Manual
    └── skills/
        ├── ui-ux-pro-max/                      # ⚠️ Placeholder — instalar global
        ├── impeccable/                         # ⚠️ Placeholder — instalar global
        ├── web-design-guidelines/              # ⚠️ Placeholder — instalar global
        ├── react-best-practices/               # ⚠️ Placeholder — instalar global
        ├── fastapi/                            # ⚠️ Placeholder — instalar global
        └── nodejs/                             # ⚠️ Placeholder — instalar global
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

> Todas las skills del ZIP son **placeholders**. Debes instalarlas para que la IA tenga el conocimiento real.

**Globales — ejecutar una sola vez en tu máquina (aplican a todos los proyectos):**
```bash
# Diseño UI/UX
npm install -g uipro-cli && uipro init --ai antigravity
npx skills add vercel-labs/agent-skills --skill web-design-guidelines
# impeccable: ver instrucciones en impeccable.style

# Stack
npx skills add vercel-labs/agent-skills --skill react-best-practices
npx skills add fastapi/fastapi --skill fastapi
npx skills add mcollina/skills --skill nodejs
```

**Por proyecto — ejecutar en cada proyecto nuevo:**
```bash
# Context7 MCP — se conecta al contexto específico del proyecto
npx ctx7 setup
```

---

### Paso 4 — Actualizar stack por proyecto

Solo si el proyecto difiere del stack base:
```
Nombre:        [NOMBRE DEL PROYECTO]           ✏️
Base de datos: [PostgreSQL / MySQL / MongoDB]   ✏️
Frontend:      [Vanilla JS]                    ✏️ solo si NO es React/Next.js
Estilos:       [CSS puro]                      ✏️ solo si NO es Tailwind
```

---

## Rutas por plataforma

| Plataforma | Ruta global |
|------------|------------|
| Windows | `C:\Users\TuUsuario\.gemini\` |
| macOS | `/Users/TuUsuario/.gemini/` |
| Linux | `/home/TuUsuario/.gemini/` |

---

## Modos de Activación — Rules

| Archivo | Modo | Cuándo carga |
|---------|------|-------------|
| `GEMINI.md` | Always On | Siempre |
| `ui-ux.md` | Model Decision | La IA detecta tareas de UI |
| `architecture.md` | Model Decision | La IA detecta diseño de estructura |
| `security.md` | Model Decision | La IA detecta auth/APIs |
| `cms.md` | Model Decision | La IA detecta tareas de CMS |
| `operations.md` | Model Decision | La IA detecta infra/CI/CD |
| `stack-conventions.md` | Glob `**/*.{ts,tsx,js,jsx,py,php,css}` | Al editar cualquier archivo de código |
| `tools-reference.md` | Manual `/tools-reference` | Solo en setup |

---

## Workflows

4 workflows en el orden natural del trabajo: **inicio → cierre → seguridad → deploy**

| Comando | Cuándo invocarlo |
|---------|-----------------|
| `/new-feature` | Antes de empezar cualquier tarea — define el plan, crea la rama, actualiza `06_TASKS.md` |
| `/session-close` | Al terminar el día o una tarea — verifica docs, código y genera commit sugerido |
| `/security-audit` | Antes de subir features con auth, APIs o datos sensibles — revisa OWASP Top 10 |
| `/deploy-checklist` | Antes de subir a producción — checklist completo de código, seguridad, UI y docs |

### Flujo típico del día
```
/new-feature        ← empiezas
  ... trabajas ...
/session-close      ← terminas el día o la tarea
/security-audit     ← si tocaste auth, APIs o datos
/deploy-checklist   ← antes de subir a producción
```

---

## Skills

### Cómo funcionan

Las skills son conocimiento externo empaquetado. Se activan de dos formas:
- **Automática (Glob):** el agente detecta el tipo de archivo y carga la skill
- **Manual:** escribiendo `/nombre-skill` en el chat

No reemplazan `stack-conventions.md` — se complementan:

| | `stack-conventions` | Skills |
|--|---------------------|--------|
| Qué es | Tus reglas del proyecto | Conocimiento externo |
| Ejemplo | "usamos Zod para validación" | "así se evitan waterfalls en React" |
| Cuándo carga | Glob al editar código | Auto o manual |

---

### Skills de Diseño UI/UX

| Skill | Estado | Cuándo activarla |
|-------|--------|-----------------|
| `ui-ux-pro-max` | ⚠️ Placeholder | Construyendo UI nueva |
| `impeccable` | ⚠️ Placeholder | Revisando UI existente |
| `web-design-guidelines` | ⚠️ Placeholder | Auditando estándares técnicos |

> ⚠️ Instalar antes de usar — ver Paso 3.

Nunca las 3 a la vez — la IA elige según el contexto de la tarea.

---

### Skills de Stack

> ⚠️ Son **placeholders** en el ZIP. Sin instalarlas la IA solo ve el placeholder, no las reglas reales. Instalar con `npx skills add` antes de usar.

| Skill | Estado | Activa con | Uso manual |
|-------|--------|-----------|-----------|
| `react-best-practices` | ⚠️ Placeholder | `*.tsx`, `*.jsx` | `/react-best-practices` |
| `fastapi` | ⚠️ Placeholder | `*.py` | `/fastapi` |
| `nodejs` | ⚠️ Placeholder | `*.js`, `*.ts` | `/nodejs` |

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
