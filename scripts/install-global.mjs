#!/usr/bin/env node
// Instala el kit en la carpeta personal, para todos los proyectos del equipo
// (ADR-038). Reemplaza a sync-globals.mjs.
//
//   Claude Code  → ~/.claude/CLAUDE.md, skills/ (rules y skills), commands/,
//                  agents/ y hooks/ de los subagentes
//   Antigravity  → ~/.gemini/GEMINI.md y ~/.gemini/config/{rules,skills,agents}/
//
// Uso:
//   node scripts/install-global.mjs           # solo compara; sale con 1 si hay algo pendiente
//   node scripts/install-global.mjs --write   # instala, con respaldo en kit-backup/<fecha-hora>/
//   node scripts/install-global.mjs --write --force   # también pisa archivos ajenos con el mismo nombre
//
// Sale del manifest del sitio, así instala lo mismo que traen los ZIPs. Registra
// lo instalado en .kit-installed.json y, en la próxima corrida, borra lo que el
// kit ya no trae. Nunca pisa un archivo que no instaló él, salvo con --force.
// No toca los hooks de Antigravity ni el hook de datos personales (ADR-034).
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("..", import.meta.url));
const HOME = process.env.GLOBALS_HOME || homedir();
const WRITE = process.argv.includes("--write");
const FORCE = process.argv.includes("--force");
const STAMP = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");

const MACHINE_BLOCK = /\n*<!-- codebase-memory-mcp:start -->[\s\S]*?<!-- codebase-memory-mcp:end -->\n*/;
const CLAUDE_AGENTS_NOTE =
  " Claude Code no carga `AGENTS.md` por sí solo cuando existe un `CLAUDE.md`: leerlo al iniciar la sesión.";

function replaceOnce(text, pattern, replacement, what) {
  if (!pattern.test(text)) throw new Error(`install-global: no se encontró ${what}`);
  return text.replace(pattern, replacement);
}

// --- 1. Manifest fresco, desde la fuente --------------------------------------
const gen = spawnSync(process.execPath, ["scripts/generate-manifest.mjs"], { cwd: join(REPO, "site"), encoding: "utf8" });
if (gen.status !== 0) {
  process.stderr.write(gen.stderr || gen.stdout);
  throw new Error("install-global: falló generate-manifest");
}
const { items } = JSON.parse(readFileSync(join(REPO, "site", "public", "manifest.json"), "utf8"));
const pick = (tool, categories) => items.filter((i) => i.tool === tool && categories.includes(i.category));
const firstDatabase = (tool) => items.find((i) => i.tool === tool && i.category === "database");

// --- 2. Qué va a dónde -----------------------------------------------------------
/** @type {{root: string, label: string, files: Map<string, string>}[]} */
const targets = [];

{
  const root = join(HOME, ".claude");
  const files = new Map();
  for (const item of [...pick("claude-code", ["skill", "command", "agent"]), firstDatabase("claude-code")]) {
    for (const f of item.files) {
      if (!f.destPath.startsWith(".claude/")) throw new Error(`install-global: ruta inesperada ${f.destPath}`);
      // Los hooks de los subagentes viven en la carpeta personal, no en el proyecto.
      const content = f.destPath.startsWith(".claude/agents/")
        ? f.content.replaceAll("$CLAUDE_PROJECT_DIR/.claude/hooks/", "$HOME/.claude/hooks/")
        : f.content;
      files.set(f.destPath.slice(".claude/".length), content);
    }
  }
  const core = readFileSync(join(REPO, "core", "CORE.md"), "utf8").replace(/\r\n/g, "\n").replace(MACHINE_BLOCK, "\n");
  let claudeMd = replaceOnce(core, /^# Core Rules — Global\n/, "# Claude Code — Global\n", "el título de CORE.md");
  claudeMd = replaceOnce(
    claudeMd,
    /(el desvío se documenta en el `AGENTS\.md` del proyecto, que tiene prioridad sobre ellas\.)/,
    `$1${CLAUDE_AGENTS_NOTE}`,
    "la excepción de § 5"
  );
  files.set("CLAUDE.md", claudeMd.trimEnd() + "\n");
  targets.push({ root, label: "Claude Code", files });
}

{
  const root = join(HOME, ".gemini");
  const files = new Map();
  const map = (destPath) => {
    if (destPath.startsWith(".agents/rules/")) return "config/rules/" + destPath.slice(".agents/rules/".length);
    if (destPath.startsWith(".agents/skills/")) return "config/skills/" + destPath.slice(".agents/skills/".length);
    if (destPath.startsWith(".agents/agents/")) return "config/agents/" + destPath.slice(".agents/agents/".length);
    throw new Error(`install-global: ruta inesperada ${destPath}`);
  };
  for (const item of [...pick("antigravity", ["rule", "skill", "command", "agent"]), firstDatabase("antigravity")]) {
    for (const f of item.files) files.set(map(f.destPath), f.content);
  }
  const gemini = readFileSync(join(REPO, ".gemini", "GEMINI.md"), "utf8").replace(/\r\n/g, "\n").replace(MACHINE_BLOCK, "\n");
  files.set("GEMINI.md", gemini.trimEnd() + "\n");
  targets.push({ root, label: "Antigravity", files });
}

// --- 3. Comparar e instalar ------------------------------------------------------
function removeEmptyDirs(dir, stop) {
  while (dir.startsWith(stop) && dir !== stop && existsSync(dir) && readdirSync(dir).length === 0) {
    rmdirSync(dir);
    dir = dirname(dir);
  }
}

let pending = 0;
let conflicts = 0;

for (const { root, label, files } of targets) {
  const registryPath = join(root, ".kit-installed.json");
  const installed = new Set(existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, "utf8")).files : []);
  const backupRoot = join(root, "kit-backup", STAMP);
  const backup = (rel) => {
    const src = join(root, rel);
    const dst = join(backupRoot, rel);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  };

  const report = { nuevos: [], actualizados: [], iguales: 0, borrar: [], conflictos: [] };
  const finalFiles = [];

  for (const [rel, rawContent] of files) {
    const target = join(root, rel);
    const current = existsSync(target) ? readFileSync(target, "utf8") : null;
    // Los dos núcleos conservan el final de línea y el bloque de codebase-memory de esta máquina.
    let content = rawContent;
    if (rel === "CLAUDE.md" || rel === "GEMINI.md") {
      const block = current?.replace(/\r\n/g, "\n").match(MACHINE_BLOCK);
      if (block) content = `${content.trimEnd()}\n\n${block[0].trim()}\n`;
      if (current?.includes("\r\n")) content = content.replace(/\n/g, "\r\n");
    }
    if (current === content) {
      report.iguales++;
      finalFiles.push(rel);
      continue;
    }
    const owned = installed.has(rel) || rel === "CLAUDE.md" || rel === "GEMINI.md";
    if (current !== null && !owned && !FORCE) {
      report.conflictos.push(rel);
      continue;
    }
    (current === null ? report.nuevos : report.actualizados).push(rel);
    finalFiles.push(rel);
    if (WRITE) {
      if (current !== null) backup(rel);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
  }

  for (const rel of installed) {
    if (files.has(rel) || !existsSync(join(root, rel))) continue;
    report.borrar.push(rel);
    if (WRITE) {
      backup(rel);
      unlinkSync(join(root, rel));
      removeEmptyDirs(dirname(join(root, rel)), root);
    }
  }

  if (WRITE) writeFileSync(registryPath, JSON.stringify({ updated: new Date().toISOString(), files: finalFiles.sort() }, null, 2) + "\n");

  const changes = report.nuevos.length + report.actualizados.length + report.borrar.length;
  pending += changes;
  conflicts += report.conflictos.length;
  console.log(`\n${label} (${root})`);
  console.log(`  iguales: ${report.iguales} · nuevos: ${report.nuevos.length} · actualizados: ${report.actualizados.length} · a borrar: ${report.borrar.length} · conflictos: ${report.conflictos.length}`);
  for (const [name, list] of [["actualizados", report.actualizados], ["a borrar", report.borrar], ["conflictos (archivos ajenos, no se tocan)", report.conflictos]]) {
    if (list.length) console.log(`  ${name}:\n    ${list.join("\n    ")}`);
  }
  if (WRITE && changes) console.log(`  respaldo: ${relative(HOME, backupRoot)}`);
}

if (!WRITE) {
  if (pending || conflicts) {
    console.log(`\n${pending} cambio(s) pendiente(s)${conflicts ? `, ${conflicts} conflicto(s)` : ""}. Para instalar: node scripts/install-global.mjs --write`);
    process.exit(1);
  }
  console.log("\nEl kit global está al día.");
}
