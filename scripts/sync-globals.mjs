#!/usr/bin/env node
// Genera los archivos globales de esta máquina desde la fuente del repo, para
// no copiarlos a mano (T-02):
//   core/CORE.md       → ~/.claude/CLAUDE.md
//   .gemini/GEMINI.md  → ~/.gemini/GEMINI.md
//
// Uso:
//   node scripts/sync-globals.mjs          # solo compara; sale con 1 si hay diferencias
//   node scripts/sync-globals.mjs --write  # escribe, con copia de respaldo .bak-AAAA-MM-DD
//
// Respeta el final de línea que ya tiene cada global (el de Gemini suele ser CRLF)
// y conserva el bloque que el MCP codebase-memory inyecta en esta máquina.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("..", import.meta.url));
const HOME = process.env.GLOBALS_HOME || homedir();
const WRITE = process.argv.includes("--write");

const MACHINE_BLOCK = /\n*<!-- codebase-memory-mcp:start -->[\s\S]*?<!-- codebase-memory-mcp:end -->\n*/;

/** Agregado solo del global de Claude: con un CLAUDE.md presente, Claude Code no lee AGENTS.md. */
const CLAUDE_AGENTS_NOTE =
  " Claude Code no carga `AGENTS.md` por sí solo cuando existe un `CLAUDE.md`: leerlo al iniciar la sesión.";

function replaceOnce(text, pattern, replacement, what) {
  if (!pattern.test(text)) throw new Error(`sync-globals: no se encontró ${what} en la fuente`);
  return text.replace(pattern, replacement);
}

const TARGETS = [
  {
    source: join(REPO, "core", "CORE.md"),
    target: join(HOME, ".claude", "CLAUDE.md"),
    build: (src) => {
      let out = replaceOnce(src, /^# Core Rules — Global\n/, "# Claude Code — Global\n", "el título de CORE.md");
      return replaceOnce(
        out,
        /(el desvío se documenta en el `AGENTS\.md` del proyecto, que tiene prioridad sobre ellas\.)/,
        `$1${CLAUDE_AGENTS_NOTE}`,
        "la excepción de § 5"
      );
    },
  },
  {
    source: join(REPO, ".gemini", "GEMINI.md"),
    target: join(HOME, ".gemini", "GEMINI.md"),
    build: (src) => src,
  },
];

const today = new Date().toISOString().slice(0, 10);
let pending = 0;

for (const { source, target, build } of TARGETS) {
  const src = readFileSync(source, "utf8").replace(/\r\n/g, "\n").replace(MACHINE_BLOCK, "\n");
  let next = build(src).trimEnd() + "\n";

  const current = existsSync(target) ? readFileSync(target, "utf8") : null;
  const crlf = current?.includes("\r\n") ?? false;
  const block = current?.replace(/\r\n/g, "\n").match(MACHINE_BLOCK);
  if (block) next = `${next.trimEnd()}\n\n${block[0].trim()}\n`;
  if (crlf) next = next.replace(/\n/g, "\r\n");

  if (current === next) {
    console.log(`al día: ${target}`);
    continue;
  }
  pending++;
  if (!WRITE) {
    console.log(`desactualizado: ${target}`);
    continue;
  }
  if (current !== null) {
    const backup = `${target}.bak-${today}`;
    if (!existsSync(backup)) copyFileSync(target, backup);
    console.log(`respaldo: ${backup}`);
  } else {
    mkdirSync(dirname(target), { recursive: true });
  }
  writeFileSync(target, next);
  console.log(`escrito: ${target}`);
}

if (!WRITE && pending) {
  console.log(`\n${pending} global(es) desactualizado(s). Para actualizarlos: node scripts/sync-globals.mjs --write`);
  process.exit(1);
}
