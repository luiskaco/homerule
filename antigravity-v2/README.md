# Antigravity Rules — Guía de Instalación

Estructura correcta basada en la arquitectura oficial de Google Antigravity.

---

## Estructura

```
~/.gemini/                                      # GLOBAL — todo el sistema
├── GEMINI.md                                   # Always On — reglas core
└── antigravity/global_workflows/
    ├── session-close.md                        # /session-close
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
    ├── workflows/
    │   └── session-close.md                    # Override local de /session-close
    └── skills/
        ├── ui-ux-pro-max/
        ├── impeccable/
        └── web-design-guidelines/
```

---

## Instalación

### Paso 1 — Archivos globales (una sola vez, para todos los proyectos)

#### Windows (PowerShell)
```powershell
# Crear carpetas
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.gemini\antigravity\global_workflows"

# Copiar GEMINI.md global
Copy-Item ".gemini\GEMINI.md" "$env:USERPROFILE\.gemini\GEMINI.md"

# Copiar workflows globales
Copy-Item ".gemini\antigravity\global_workflows\*" "$env:USERPROFILE\.gemini\antigravity\global_workflows\"
```

#### macOS / Linux
```bash
# Crear carpetas
mkdir -p ~/.gemini/antigravity/global_workflows

# Copiar GEMINI.md global
cp .gemini/GEMINI.md ~/.gemini/GEMINI.md

# Copiar workflows globales
cp .gemini/antigravity/global_workflows/* ~/.gemini/antigravity/global_workflows/
```

---

### Paso 2 — Archivos de workspace (por cada proyecto)

#### Windows (PowerShell)
```powershell
# Desde la raíz del proyecto
Copy-Item -Recurse ".agents" ".\"
```

#### macOS / Linux
```bash
# Desde la raíz del proyecto
cp -r .agents/ ./
```

---

### Paso 3 — Instalar skills externas (todas las plataformas)

```bash
# ui-ux-pro-max — sistema de diseño por industria
npm install -g uipro-cli
uipro init --ai antigravity

# web-design-guidelines (Vercel)
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines

# impeccable — ver instrucciones en impeccable.style

# Context7 MCP — documentación de librerías en tiempo real
npx ctx7 setup
```

---

### Paso 4 — Actualizar stack por proyecto

Solo si el proyecto difiere del stack base, especificarlo al inicio de la sesión en Antigravity:

```
Nombre: [NOMBRE DEL PROYECTO]
Base de datos: [PostgreSQL / MySQL / MongoDB]
Frontend: [Vanilla JS]   # solo si NO es React/Next.js
Estilos: [CSS puro]      # solo si NO es Tailwind
```

---

## Rutas por plataforma

| Plataforma | Ruta global (`~/.gemini/`) |
|------------|---------------------------|
| Windows | `C:\Users\TuUsuario\.gemini\` |
| macOS | `/Users/TuUsuario/.gemini/` |
| Linux | `/home/TuUsuario/.gemini/` |

---

## Modos de Activación

| Archivo | Modo | Por qué |
|---------|------|---------|
| `GEMINI.md` | Always On | Core — siempre necesario |
| `ui-ux.md` | Model Decision | La IA detecta tareas de UI |
| `architecture.md` | Model Decision | La IA detecta diseño de estructura |
| `security.md` | Model Decision | La IA detecta auth/APIs |
| `cms.md` | Model Decision | La IA detecta tareas de CMS |
| `operations.md` | Model Decision | La IA detecta infra/CI/CD |
| `stack-conventions.md` | Glob `**/*.{ts,tsx,js,jsx,py,php,css}` | Al editar cualquier archivo de código |
| `tools-reference.md` | Manual | Solo en setup — invocar con `/` |
| `/session-close` | Manual | Al terminar cada tarea |
| `/deploy-checklist` | Manual | Antes de cada deploy |

---

## Workflows

| Comando | Cuándo usarlo |
|---------|--------------|
| `/session-close` | Al terminar cada tarea con cambios en código o docs |
| `/deploy-checklist` | Antes de merge a main o deploy a producción |

---

## Skills de Diseño

| Skill | Momento |
|-------|---------|
| `ui-ux-pro-max` | Construyendo UI nueva |
| `impeccable` | Revisando UI existente |
| `web-design-guidelines` | Auditando estándares técnicos |

Nunca las 3 a la vez — elegir según el momento de la tarea.

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
