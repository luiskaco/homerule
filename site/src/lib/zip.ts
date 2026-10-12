import JSZip from "jszip";
import type { ManifestItem, ToolId } from "@/lib/manifest";

const TOOL_LABELS: Record<ToolId, string> = {
  antigravity: "Antigravity (Gemini)",
  "claude-code": "Claude Code",
};

/**
 * Prefijo de carpeta dentro del ZIP. Los `destPath` del manifest ya son rutas
 * relativas a la raíz del proyecto (`docs/x.md`, `.agents/rules/x.md`,
 * `.claude/agents/x.md`), así que por defecto no lleva prefijo — agregarlo
 * duplicaba el segmento (`docs/docs/…`, `.agents/.agents/…`).
 *
 * La excepción es el global de Antigravity: `GEMINI.md` y los workflows se
 * instalan en `~/.gemini/`, no en el proyecto, y se aíslan en `global/` para
 * que el `cp -r` de la raíz no se los lleve por error. `AGENTS.md` también es
 * categoría global, pero va a la raíz del proyecto (ADR-016).
 */
const ANTIGRAVITY_AGENTS_MD_ID = "antigravity:agents-md";

function isAntigravityUserLevel(item: ManifestItem): boolean {
  return item.tool === "antigravity" && item.category === "global" && item.id !== ANTIGRAVITY_AGENTS_MD_ID;
}

function destFolder(item: ManifestItem): string {
  return isAntigravityUserLevel(item) ? "global" : "";
}

function buildAntigravitySection(items: ManifestItem[]): string {
  const global = items.filter(isAntigravityUserLevel);
  const agentsMd = items.find((i) => i.id === ANTIGRAVITY_AGENTS_MD_ID);
  const rest = items.filter((i) => i.category !== "global");
  const lines: string[] = [`## ${TOOL_LABELS.antigravity}\n`];

  if (global.length) {
    lines.push("**Paso 1 — Global (`~/.gemini/`)**\n");
    lines.push("macOS / Linux:");
    lines.push("```bash");
    lines.push("mkdir -p ~/.gemini/antigravity/global_workflows");
    lines.push("cp global/GEMINI.md ~/.gemini/GEMINI.md");
    const workflows = global.filter((i) => i.id !== "global:GEMINI.md");
    if (workflows.length) {
      lines.push(
        `cp ${workflows
          .map((i) => `global/antigravity/global_workflows/${i.label}`)
          .join(" ")} ~/.gemini/antigravity/global_workflows/`
      );
    }
    lines.push("```\n");
    lines.push("Windows (PowerShell):");
    lines.push("```powershell");
    lines.push(
      'New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\\.gemini\\antigravity\\global_workflows"'
    );
    lines.push('Copy-Item "global/GEMINI.md" "$env:USERPROFILE\\.gemini\\GEMINI.md"');
    if (workflows.length) {
      lines.push(
        `Copy-Item ${workflows
          .map((i) => `"global/antigravity/global_workflows/${i.label}"`)
          .join(",")} "$env:USERPROFILE\\.gemini\\antigravity\\global_workflows\\"`
      );
    }
    lines.push("```\n");
  }

  if (rest.length || agentsMd) {
    lines.push("**Paso 2 — Workspace (raíz del proyecto)**\n");
    lines.push("```bash");
    if (agentsMd) lines.push("cp AGENTS.md /ruta/a/tu-proyecto/");
    if (rest.length) lines.push("cp -r .agents/. /ruta/a/tu-proyecto/.agents/");
    lines.push("```\n");
    if (agentsMd) {
      lines.push(
        "`AGENTS.md` es el estándar abierto que leen Codex, Cursor, Copilot y el propio " +
          "Antigravity: si otra IA continúa el proyecto, ahí encuentra las reglas y el mapa. " +
          "Completá su sección **Proyecto** al arrancar.\n"
      );
    }
  }

  return lines.join("\n");
}

function buildGenericToolSection(tool: ToolId, items: ManifestItem[]): string {
  const lines: string[] = [`## ${TOOL_LABELS[tool]}\n`];
  lines.push(
    "Copiá el contenido de este ZIP (excepto `docs/` y `INSTALL.md`) a la raíz de tu proyecto:\n"
  );
  lines.push("```bash");
  lines.push("cp -r ./* /ruta/a/tu-proyecto/");
  lines.push("```\n");
  lines.push("Incluye:");
  for (const item of items) {
    for (const file of item.files) {
      lines.push(`- \`${file.destPath}\``);
    }
  }
  lines.push("");
  if (items.some((i) => i.files.some((f) => f.destPath === "AGENTS.md"))) {
    lines.push(
      "Las reglas viven en `AGENTS.md`, el estándar abierto que leen Codex, Cursor y " +
        "Copilot, y `CLAUDE.md` las importa: si otra IA continúa el proyecto, encuentra " +
        "lo mismo. Completá la sección **Proyecto** de `AGENTS.md` al arrancar.\n"
    );
  }
  return lines.join("\n");
}

function buildInstallMd(selected: ManifestItem[]): string {
  const templates = selected.filter((i) => i.category === "template");
  const rest = selected.filter((i) => i.category !== "template");

  const lines: string[] = ["# Instalación\n"];
  if (rest.length > 0) {
    lines.push(
      "Este ZIP fue generado por AI Rules Hub y es autocontenido: todo lo que hay " +
        "acá adentro es para un solo agente. Cada sección de abajo corresponde a una " +
        "carpeta del ZIP.\n"
    );
  } else {
    lines.push(
      "Este ZIP fue generado por AI Rules Hub — son las plantillas SDD de `docs/`, " +
        "independientes del agente que uses.\n"
    );
  }

  const byTool = new Map<ToolId, ManifestItem[]>();
  for (const item of rest) {
    const list = byTool.get(item.tool) ?? [];
    list.push(item);
    byTool.set(item.tool, list);
  }

  if (byTool.has("antigravity")) {
    lines.push(buildAntigravitySection(byTool.get("antigravity")!));
  }
  for (const [tool, items] of byTool) {
    if (tool === "antigravity") continue;
    lines.push(buildGenericToolSection(tool, items));
  }

  if (templates.length) {
    lines.push("## Plantillas SDD (`docs/`, raíz del proyecto)\n");
    lines.push("```bash");
    lines.push("cp -r docs/. /ruta/a/tu-proyecto/docs/");
    lines.push("```");
    lines.push(
      "\nSon esqueletos vacíos — completar antes de que el equipo/IA los use como fuente de verdad.\n"
    );
  }

  return lines.join("\n");
}

export async function buildZip(items: ManifestItem[], selectedIds: string[]): Promise<Blob> {
  const selected = items.filter((i) => selectedIds.includes(i.id));
  const zip = new JSZip();

  for (const item of selected) {
    const folder = destFolder(item);
    for (const file of item.files) {
      zip.file(folder ? `${folder}/${file.destPath}` : file.destPath, file.content);
    }
  }

  zip.file("INSTALL.md", buildInstallMd(selected));

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
