#!/usr/bin/env python3
"""Regenera la tabla de consumo de tokens del README.md.

Estimación por caracteres/4 (mismo criterio que generate-manifest.mjs).
Reescribe el bloque entre <!-- token-table:start --> y <!-- token-table:end -->.

Uso:  python scripts/update-token-table.py
"""

import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
README = REPO / "README.md"

RULES_DIR = REPO / ".agents" / "rules"
WORKFLOWS_DIR = REPO / ".gemini" / "antigravity" / "global_workflows"
GEMINI = REPO / ".gemini" / "GEMINI.md"

# Orden y etiqueta de carga por archivo — refleja la tabla histórica del README.
RULE_LOAD = {
    "security.md": "Model Decision",
    "architecture.md": "Model Decision",
    "ui-ux.md": "Model Decision",
    "seo.md": "Model Decision",
    "pwa.md": "Model Decision — solo PWA",
    "operations.md": "Model Decision",
    "cms.md": "Model Decision",
    "database.md": "Model Decision",
    "stack-conventions.md": "Glob",
}
WORKFLOW_ORDER = [
    "tools-reference.md",
    "grill.md",
    "new-feature.md",
    "bug-fix.md",
    "session-close.md",
    "security-audit.md",
    "deploy-checklist.md",
]


def tokens(path: Path) -> int:
    return round(len(path.read_text(encoding="utf-8")) / 4)


def check_coverage(directory: Path, known: set[str], label: str) -> None:
    """Un archivo nuevo sin entrada acá quedaría fuera de la tabla en silencio."""
    on_disk = {f.name for f in directory.glob("*.md")}
    missing = sorted(on_disk - known)
    if missing:
        raise SystemExit(
            f"{label} sin entrada en el script: {', '.join(missing)}.\n"
            f"Agregalos a {'RULE_LOAD' if label == 'Rules' else 'WORKFLOW_ORDER'} en scripts/update-token-table.py."
        )


check_coverage(RULES_DIR, set(RULE_LOAD), "Rules")
check_coverage(WORKFLOWS_DIR, set(WORKFLOW_ORDER), "Workflows")


def fmt(n: int) -> str:
    return f"{n:,}".replace(",", ".") if False else f"{n:,}"


rows = []
gemini_tokens = tokens(GEMINI)
rows.append(("`GEMINI.md`", gemini_tokens, "Siempre"))

rule_tokens = {}
for name, load in RULE_LOAD.items():
    path = RULES_DIR / name
    if not path.exists():
        continue
    rule_tokens[name] = tokens(path)
    rows.append((f"`{name}`", rule_tokens[name], load))

workflow_tokens = {}
for name in WORKFLOW_ORDER:
    path = WORKFLOWS_DIR / name
    if not path.exists():
        continue
    workflow_tokens[name] = tokens(path)
    rows.append((f"`{name}`", workflow_tokens[name], "Manual"))

# Caso típico: GEMINI + 2 reglas frecuentes (security + ui-ux como techo,
# architecture como piso) + 1 workflow. Máximo: todo activo a la vez.
tipico_min = gemini_tokens + rule_tokens.get("architecture.md", 0) + min(workflow_tokens.values())
tipico_max = (
    gemini_tokens
    + rule_tokens.get("security.md", 0)
    + rule_tokens.get("ui-ux.md", 0)
    + max(workflow_tokens.values())
)
maximo = gemini_tokens + sum(rule_tokens.values()) + max(workflow_tokens.values())

lines = ["| Archivo | ~Tokens | Cuándo carga |", "|---|---|---|"]
for label, n, load in rows:
    lines.append(f"| {label} | ~{fmt(n)} | {load} |")
lines.append(f"| **Base siempre activa** | **~{fmt(gemini_tokens)}** | `GEMINI.md` |")
lines.append(
    f"| **Caso típico** (1-2 reglas + 1 workflow) | **~{fmt(tipico_min)}–{fmt(tipico_max)}** | sesión normal de código |"
)
lines.append(
    f"| **Máximo con todo activo** | **~{fmt(maximo)}** | improbable — varias reglas casi nunca se activan juntas |"
)
table = "\n".join(lines)

content = README.read_text(encoding="utf-8")
new_content, count = re.subn(
    r"(<!-- token-table:start -->\n)[\s\S]*?(\n<!-- token-table:end -->)",
    lambda m: m.group(1) + table + m.group(2),
    content,
)
if count != 1:
    raise SystemExit("No se encontró el bloque token-table en README.md")

README.write_text(new_content, encoding="utf-8", newline="\n")
print(f"Tabla regenerada: {len(rows)} archivos, máximo ~{fmt(maximo)} tokens")
