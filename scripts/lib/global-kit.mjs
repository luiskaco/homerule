// Arma el kit global de cada herramienta a partir de los items del manifest
// (ADR-038, ADR-039). Lo usan el generador del sitio, que publica un JSON por
// herramienta para los ZIPs, y `install-global.mjs`, que instala desde ese
// mismo JSON: así lo que baja de la web y lo que se instala desde el repo es
// siempre lo mismo.
//
// Formato de cada kit:
//   { tool, label, targets: [{ root, label, files: { "<ruta relativa a root>": "<contenido>" } }] }
// `root` es una carpeta de la carpeta personal: `.claude`, `.gemini`, `.codex` o `.agents`.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MACHINE_BLOCK = /\n*<!-- codebase-memory-mcp:start -->[\s\S]*?<!-- codebase-memory-mcp:end -->\n*/;
const CLAUDE_AGENTS_NOTE =
  " Claude Code no carga `AGENTS.md` por sí solo cuando existe un `CLAUDE.md`: leerlo al iniciar la sesión.";

function replaceOnce(text, pattern, replacement, what) {
  if (!pattern.test(text)) throw new Error(`global-kit: no se encontró ${what}`);
  return text.replace(pattern, replacement);
}

function readCore(repo, ...path) {
  return readFileSync(join(repo, ...path), "utf8").replace(/\r\n/g, "\n").replace(MACHINE_BLOCK, "\n");
}

/** @returns {{ tool: string, label: string, targets: { root: string, label: string, files: Record<string, string> }[] }[]} */
export function buildGlobalKits(items, repo) {
  const pick = (tool, categories) => items.filter((i) => i.tool === tool && categories.includes(i.category));
  const firstDatabase = (tool) => items.find((i) => i.tool === tool && i.category === "database");
  const kits = [];

  // --- Claude Code → ~/.claude/ ---------------------------------------------------
  {
    const files = {};
    for (const item of [...pick("claude-code", ["skill", "command", "agent"]), firstDatabase("claude-code")]) {
      for (const f of item.files) {
        if (!f.destPath.startsWith(".claude/")) throw new Error(`global-kit: ruta inesperada ${f.destPath}`);
        // Los hooks de los subagentes viven en la carpeta personal, no en el proyecto.
        const content = f.destPath.startsWith(".claude/agents/")
          ? f.content.replaceAll("$CLAUDE_PROJECT_DIR/.claude/hooks/", "$HOME/.claude/hooks/")
          : f.content;
        files[f.destPath.slice(".claude/".length)] = content;
      }
    }
    let claudeMd = replaceOnce(readCore(repo, "core", "CORE.md"), /^# Core Rules — Global\n/, "# Claude Code — Global\n", "el título de CORE.md");
    claudeMd = replaceOnce(
      claudeMd,
      /(el desvío se documenta en el `AGENTS\.md` del proyecto, que tiene prioridad sobre ellas\.)/,
      `$1${CLAUDE_AGENTS_NOTE}`,
      "la excepción de § 5"
    );
    files["CLAUDE.md"] = claudeMd.trimEnd() + "\n";
    kits.push({ tool: "claude-code", label: "Claude Code", targets: [{ root: ".claude", label: "Claude Code", files }] });
  }

  // --- Antigravity → ~/.gemini/ ---------------------------------------------------
  {
    const files = {};
    const map = (destPath) => {
      for (const [from, to] of [
        [".agents/rules/", "config/rules/"],
        [".agents/skills/", "config/skills/"],
        [".agents/agents/", "config/agents/"],
      ]) {
        if (destPath.startsWith(from)) return to + destPath.slice(from.length);
      }
      throw new Error(`global-kit: ruta inesperada ${destPath}`);
    };
    for (const item of [...pick("antigravity", ["rule", "skill", "command", "agent"]), firstDatabase("antigravity")]) {
      for (const f of item.files) files[map(f.destPath)] = f.content;
    }
    files["GEMINI.md"] = readCore(repo, ".gemini", "GEMINI.md").trimEnd() + "\n";
    kits.push({ tool: "antigravity", label: "Antigravity", targets: [{ root: ".gemini", label: "Antigravity", files }] });
  }

  // --- Codex → ~/.codex/AGENTS.md y ~/.agents/skills/ -------------------------------
  // No tiene rules con disparador ni comandos con "/": las rules y los comandos
  // van como skills, que Codex elige solo o se piden con `$nombre`.
  {
    let agentsMd = replaceOnce(readCore(repo, "core", "CORE.md"), /^# Core Rules — Global\n/, "# Codex — Global\n", "el título de CORE.md");
    agentsMd = replaceOnce(
      agentsMd,
      /^Invocar con `\/` en el chat:$/m,
      // Función, no texto: en un reemplazo de texto, "$`" inserta lo anterior al match.
      () => "En Codex son skills: invocar con `$` y el nombre (por ejemplo, `$new-feature`), o pedirlo con palabras:",
      "la línea de invocación de § 7"
    );
    agentsMd = replaceOnce(agentsMd, /\n> Esto es una \*\*auto-revisión inline\*\*[\s\S]*?(?=\n(?!>)|$)/, "", "la nota de subagentes de § 8");

    const skills = {};
    for (const item of [...pick("claude-code", ["skill"]).filter((i) => i.id.startsWith("claude-code:rule:")), firstDatabase("claude-code")]) {
      for (const f of item.files) skills["skills/" + f.destPath.slice(".claude/skills/".length)] = f.content;
    }
    for (const item of pick("antigravity", ["skill", "command"])) {
      for (const f of item.files) skills["skills/" + f.destPath.slice(".agents/skills/".length)] = f.content;
    }
    kits.push({
      tool: "codex",
      label: "Codex",
      targets: [
        { root: ".codex", label: "Codex (instrucciones)", files: { "AGENTS.md": agentsMd.trimEnd() + "\n" } },
        { root: ".agents", label: "Codex (skills)", files: skills },
      ],
    });
  }

  return kits;
}
