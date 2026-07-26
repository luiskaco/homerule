r"""Empaqueta cada skill de .claude/skills/ en un ZIP subible a Claude Desktop.

    python scripts/make-desktop-zips.py

Deja los ZIPs en skills-desktop/ (gitignored). Cada uno contiene la carpeta
de la skill con su SKILL.md en la raiz: `hallmark/SKILL.md`.

No se usa Compress-Archive de PowerShell 5.1: escribe los separadores de ruta
como `\` y el estandar ZIP exige `/`, con lo cual algunos lectores tratan
`hallmark\SKILL.md` como un unico archivo suelto y la skill queda sin su
SKILL.md en la raiz.
"""

import os
import shutil
import zipfile

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO_ROOT, ".claude", "skills")
DEST = os.path.join(REPO_ROOT, "skills-desktop")


def build(name: str) -> tuple[int, int]:
    folder = os.path.join(SRC, name)
    zip_path = os.path.join(DEST, name + ".zip")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for root, _dirs, files in os.walk(folder):
            for f in files:
                full = os.path.join(root, f)
                arc = name + "/" + os.path.relpath(full, folder).replace("\\", "/")
                z.write(full, arc)

    with zipfile.ZipFile(zip_path) as z:
        names = z.namelist()
    assert all("\\" not in n for n in names), f"{name}: rutas con separador \\"
    assert f"{name}/SKILL.md" in names, f"{name}: falta SKILL.md en la raiz"

    return os.path.getsize(zip_path) // 1024, len(names)


def main() -> None:
    if not os.path.isdir(SRC):
        raise SystemExit(
            "No existe .claude/skills/ — instala las skills primero "
            "(ver README, seccion 'Skills de diseño')."
        )

    if os.path.isdir(DEST):
        shutil.rmtree(DEST)
    os.makedirs(DEST)

    for name in sorted(os.listdir(SRC)):
        if not os.path.isdir(os.path.join(SRC, name)):
            continue
        kb, count = build(name)
        print(f"{name:<32} {kb:>5} KB  {count:>3} archivos")

    print(f"\nListos en {DEST}")


if __name__ == "__main__":
    main()
