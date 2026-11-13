import JSZip from "jszip";
import type { KitTool } from "@/lib/kit";

/**
 * Los dos ZIPs del sitio (ADR-039):
 *
 * - Kit global, uno por herramienta: el `kit.json` que arma el generador, el
 *   instalador (`scripts/install-global.mjs`, el mismo que se usa desde el repo)
 *   y un INSTALL.md. Se instala una vez por máquina, en la carpeta personal.
 * - Proyecto nuevo: `docs/`, `AGENTS.md` y `CLAUDE.md`, para la raíz del proyecto.
 *
 * Los textos de los archivos que van adentro del ZIP están en español, igual que
 * el kit (ADR-009).
 */

const TOOL_LABEL: Record<KitTool, string> = {
  "claude-code": "Claude Code",
  antigravity: "Antigravity",
  codex: "Codex",
};

function installMd(tool: KitTool): string {
  return [
    `# Kit global — ${TOOL_LABEL[tool]}`,
    "",
    "Se instala una vez por máquina, en tu carpeta personal, y vale para todos tus proyectos.",
    "Necesita Node 24 o más nuevo.",
    "",
    "Desde esta carpeta:",
    "",
    "```bash",
    "node install.mjs           # muestra qué va a cambiar, sin tocar nada",
    "node install.mjs --write   # instala, con respaldo de lo que pisa",
    "```",
    "",
    "Para actualizar, bajá el ZIP de nuevo y repetí los dos comandos: instala lo nuevo y borra lo que el kit ya no trae.",
    "",
    "- El respaldo queda en `kit-backup/<fecha-hora>/`, dentro de cada carpeta que toca.",
    "- Nunca pisa un archivo tuyo con el mismo nombre: lo informa como conflicto. Para pisarlo, `--force`.",
    "- Conserva el bloque de codebase-memory y el final de línea de tus archivos globales.",
    "",
  ].join("\n");
}

export async function buildGlobalKitZip(tool: KitTool): Promise<Blob> {
  const [kit, installer] = await Promise.all([
    fetch(`/global-kit/${tool}.json`).then((r) => {
      if (!r.ok) throw new Error(`kit ${tool}: ${r.status}`);
      return r.text();
    }),
    fetch("/global-kit/install.mjs").then((r) => {
      if (!r.ok) throw new Error(`instalador: ${r.status}`);
      return r.text();
    }),
  ]);
  const folder = `kit-${tool}`;
  const zip = new JSZip();
  zip.file(`${folder}/install.mjs`, installer);
  zip.file(`${folder}/kit.json`, kit);
  zip.file(`${folder}/INSTALL.md`, installMd(tool));
  return zip.generateAsync({ type: "blob" });
}

export interface ProjectFile {
  path: string;
  content: string;
}

export async function buildProjectZip(files: ProjectFile[]): Promise<Blob> {
  const zip = new JSZip();
  for (const file of files) zip.file(file.path, file.content);
  return zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
