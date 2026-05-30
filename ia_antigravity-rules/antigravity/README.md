# Antigravity Rules — Guía de Instalación

Estructura de reglas optimizada para consumo mínimo de tokens.

---

## Estructura

```
proyecto/
├── GEMINI.md                          # Siempre cargado (~400 tokens) — reglas core Antigravity
├── AGENTS.md                          # Siempre cargado (~200 tokens) — cross-tool + checklist
└── .agent/
    ├── rules/                         # Carga selectiva por contexto
    │   ├── ui-ux.md                   # Solo tareas de UI/UX/diseño
    │   ├── architecture.md            # Solo tareas de estructura/backend
    │   ├── security.md                # Solo tareas de auth/API/datos sensibles
    │   ├── cms.md                     # Solo tareas de CMS
    │   └── operations.md              # Solo tareas de infra/CI/CD/testing
    └── skills/                        # Carga bajo demanda por el agente
        ├── web-design-guidelines/     # Auditoría de UI (Vercel)
        ├── taste-skill/               # Estética anti-slop
        └── impeccable/                # Vocabulario de diseño + comandos
```

---

## Instalación

### 1. Copiar archivos al proyecto

```bash
# Desde la raíz del proyecto
cp GEMINI.md ./
cp AGENTS.md ./
cp -r .agent/ ./
```

### 2. Instalar skills externas

```bash
# web-design-guidelines (Vercel)
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines

# taste-skill
npx skills add https://github.com/Leonxlnx/taste-skill

# impeccable — ver instrucciones en impeccable.style para tu herramienta
```

### 3. Actualizar el stack en AGENTS.md

Editar la sección "Stack & Contexto" en `AGENTS.md` con los datos reales del proyecto.

---

## Consumo de Tokens

| Archivo | Tokens aprox. | Cuándo carga |
|---------|--------------|--------------|
| `GEMINI.md` | ~400 | Siempre |
| `AGENTS.md` | ~200 | Siempre |
| `ui-ux.md` | ~600 | Tareas de UI |
| `architecture.md` | ~300 | Tareas de estructura |
| `security.md` | ~500 | Tareas de auth/API |
| `cms.md` | ~400 | Tareas de CMS |
| `operations.md` | ~500 | Tareas de infra |
| **Base siempre activa** | **~600** | — |
| **Máximo con todo activo** | **~2.900** | — |

Comparado con cargar todo siempre: ~7.500 tokens → **reducción del 92% en el caso base.**

---

## Cómo Referenciar Reglas Manualmente

En Antigravity, para activar una regla específica:

```
@security-rule revisa este endpoint de login
@ui-ux-rule audita este componente
@architecture-rule diseña este módulo de pagos
```
