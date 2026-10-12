#!/usr/bin/env python3
"""Verifica la paridad entre core/CORE.md y .gemini/GEMINI.md.

Los dos núcleos se mantienen a mano en paralelo (ver AGENTS.md § Paridad CORE/GEMINI).
Este script falla (exit 1) si divergen en las secciones que deben ser
idénticas. Divergencias intencionales que NO se comparan:

- Título del archivo (línea 1).
- § 3, punto 2 de "Versiones actualizadas": el fallback difiere por tool
  (Claude: web search / Antigravity: subagente `browser`) — la línea se
  normaliza antes de comparar el resto de la sección.
- § 6 Jerarquía y § 8 Auto-revisión: difieren en nombres propios de cada
  tool; solo se verifica que ambas secciones existan.
- § 7: el heading difiere ("Comandos" vs "Workflows") — se compara el cuerpo.
- Bloque <!-- codebase-memory-mcp --> (gestionado por la máquina, se ignora).

Uso:  python scripts/check-core-parity.py
"""

import re
import sys
from difflib import unified_diff
from pathlib import Path

# Consola de Windows en cp1252: forzar UTF-8 para poder imprimir los diffs.
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO = Path(__file__).resolve().parent.parent
CORE = REPO / "core" / "CORE.md"
GEMINI = REPO / ".gemini" / "GEMINI.md"

SKIP_BODY_COMPARE = {"6", "8"}


def sections(path: Path) -> dict[str, tuple[str, str]]:
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"<!-- codebase-memory-mcp:start -->[\s\S]*?<!-- codebase-memory-mcp:end -->", "", text)
    out = {}
    for m in re.finditer(r"^## (\d+)\. (.+?)\n([\s\S]*?)(?=^## \d+\. |\Z)", text, re.MULTILINE):
        num, title, body = m.group(1), m.group(2).strip(), m.group(3).strip()
        out[num] = (title, body)
    return out


def normalize(body: str) -> str:
    # § 3 punto 2: el fallback de documentación difiere por tool a propósito.
    body = re.sub(
        r"^2\. \*\*Consulta la documentación vigente\*\*.*$",
        "2. **Consulta la documentación vigente** [fallback específico por tool]",
        body,
        flags=re.MULTILINE,
    )
    body = re.sub(r"\s+$", "", body, flags=re.MULTILINE)
    return body


core, gemini = sections(CORE), sections(GEMINI)
errors = []

for num in sorted(set(core) | set(gemini), key=int):
    in_core, in_gemini = num in core, num in gemini
    if not (in_core and in_gemini):
        errors.append(f"§ {num}: existe solo en {'CORE.md' if in_core else 'GEMINI.md'}")
        continue
    if num in SKIP_BODY_COMPARE:
        continue
    a, b = normalize(core[num][1]), normalize(gemini[num][1])
    if a != b:
        diff = "\n".join(
            unified_diff(a.splitlines(), b.splitlines(), fromfile=f"CORE.md § {num}", tofile=f"GEMINI.md § {num}", lineterm="")
        )
        errors.append(f"§ {num} ({core[num][0]}) difiere:\n{diff}")

if errors:
    print("PARIDAD ROTA entre core/CORE.md y .gemini/GEMINI.md:\n")
    print("\n\n".join(errors))
    print("\nRegla: los cambios en secciones compartidas se replican en el mismo commit (ver CLAUDE.md).")
    sys.exit(1)

print(f"Paridad OK — {len(core)} secciones, {len(SKIP_BODY_COMPARE)} con divergencia intencional (§ 6, § 8).")
