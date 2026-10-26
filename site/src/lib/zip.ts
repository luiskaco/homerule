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
 * La excepción es el global de Antigravity: `GEMINI.md` se instala en
 * `~/.gemini/`, no en el proyecto, y se aísla en `global/` para que el
 * `cp -r` de la raíz no se lo lleve por error. `AGENTS.md` también es
 * categoría global, pero va a la raíz del proyecto (ADR-016). Los comandos ya
 * no son globales: son skills de workspace en `.agents/skills/` (ADR-020).
 */
const ANTIGRAVITY_AGENTS_MD_ID = "antigravity:agents-md";

function isAntigravityUserLevel(item: ManifestItem): boolean {
  return item.tool === "antigravity" && item.category === "global" && item.id !== ANTIGRAVITY_AGENTS_MD_ID;
}

function destFolder(item: ManifestItem): string {
  return isAntigravityUserLevel(item) ? "global" : "";
}

/**
 * Los agentes de servidores (ADR-026) necesitan una lista de alias en el
 * proyecto y que `ssh` no esté en la allow list del usuario: sin eso, el
 * "cada cambio con aprobación" no se cumple.
 */
function buildServerAgentsNote(tool: ToolId, items: ManifestItem[]): string | null {
  if (!items.some((i) => i.category === "agent" && /:agent:server-(inspector|operator)$/.test(i.id))) return null;

  const hostsFile = tool === "antigravity" ? ".agents/ssh-hosts.txt" : ".claude/ssh-hosts.txt";
  const lines = ["**Agentes de servidores**\n"];
  lines.push(
    `- Creá \`${hostsFile}\` con los alias de \`~/.ssh/config\` que pueden usar, uno por línea. ` +
      "`server-operator` no se conecta sin ese archivo; `server-inspector`, sin él, acepta cualquier alias del config."
  );
  lines.push(
    "- No pongas `ssh`, `scp` ni `rsync` en la allow list de comandos: los cambios correrían sin pedir aprobación."
  );
  if (tool === "antigravity") {
    lines.push(
      "- Corren con `commandExecutionPolicy: off`: cada comando espera tu aprobación. Antigravity no tiene hooks, " +
        "así que las reglas de alias, opciones y bloqueo duro dependen del prompt del agente."
    );
  } else {
    lines.push(
      "- Un hook (`.claude/hooks/ssh-guard.mjs`, necesita Node) revisa cada comando. `server-operator` no corre si la " +
        "sesión está en `bypassPermissions` o `dontAsk`."
    );
  }
  lines.push("- Para el inspector conviene un alias con un usuario sin sudo en el servidor.\n");
  return lines.join("\n");
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
    lines.push("mkdir -p ~/.gemini");
    lines.push("cp global/GEMINI.md ~/.gemini/GEMINI.md");
    lines.push("```\n");
    lines.push("Windows (PowerShell):");
    lines.push("```powershell");
    lines.push('New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\\.gemini"');
    lines.push('Copy-Item "global/GEMINI.md" "$env:USERPROFILE\\.gemini\\GEMINI.md"');
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

  const serverNote = buildServerAgentsNote("antigravity", items);
  if (serverNote) lines.push(serverNote);

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
  const serverNote = buildServerAgentsNote(tool, items);
  if (serverNote) lines.push(serverNote);
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
