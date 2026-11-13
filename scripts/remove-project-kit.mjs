#!/usr/bin/env node
// Quita de un proyecto las copias del kit, que ahora viven en la carpeta
// personal (ADR-038). Solo borra lo que es copia exacta de alguna versión del
// kit; lo propio del proyecto y lo que alguien modificó se queda.
//
// Uso:
//   node scripts/remove-project-kit.mjs <ruta-del-proyecto>           # solo muestra
//   node scripts/remove-project-kit.mjs <ruta-del-proyecto> --write   # borra
//
// Un archivo del proyecto se considera copia del kit si su contenido es igual a
// alguna versión que tuvo ese archivo en la historia de este repo, o a lo que
// hoy genera el manifest para cualquiera de los tres kits. No toca `AGENTS.md`,
// `CLAUDE.md`, `docs/`, `.claude/settings*.json` ni `.claude/ssh-hosts.txt`.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmdirSync, statSync, unlinkSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const projectArg = args.find((a) => !a.startsWith("--"));
if (!projectArg) {
  console.error("Uso: node scripts/remove-project-kit.mjs <ruta-del-proyecto> [--write]");
  process.exit(2);
}
const PROJECT = resolve(projectArg);
if (PROJECT === resolve(REPO)) throw new Error("remove-project-kit: este repo es la fuente del kit, no se limpia");

const KIT_DIRS = [".claude/skills", ".claude/commands", ".claude/agents", ".claude/hooks", ".agents/rules", ".agents/skills", ".agents/agents"];
const KEEP = new Set([".claude/settings.json", ".claude/settings.local.json", ".claude/ssh-hosts.txt"]);

// El kit agrega `source:` e `install:` al frontmatter de las skills de terceros:
// una copia sin esas dos líneas sigue siendo la misma skill.
const norm = (text) => text.replace(/\r\n/g, "\n").replace(/^(?:source|install): .*\n/gm, "");
const hash = (text) => createHash("sha256").update(norm(text)).digest("hex");
const git = (argv) => spawnSync("git", argv, { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 28 });

// --- Contenidos conocidos del kit, por ruta -----------------------------------
/** @type {Map<string, Set<string>>} ruta relativa → hashes de sus versiones */
const known = new Map();
const addKnown = (path, content) => {
  if (!known.has(path)) known.set(path, new Set());
  known.get(path).add(hash(content));
};

const gen = spawnSync(process.execPath, ["scripts/generate-manifest.mjs"], { cwd: join(REPO, "site"), encoding: "utf8" });
if (gen.status !== 0) throw new Error("remove-project-kit: falló generate-manifest");
for (const item of JSON.parse(readFileSync(join(REPO, "site", "public", "manifest.json"), "utf8")).items) {
  for (const f of item.files) addKnown(f.destPath, f.content);
}

// Todas las versiones históricas de cada archivo de esas carpetas en este repo.
const log = git(["log", "--all", "--format=%H", "--name-only", "--", ...KIT_DIRS]);
if (log.status !== 0) throw new Error("remove-project-kit: falló git log");
const blobsByPath = new Map();
let commit = null;
for (const line of log.stdout.split("\n")) {
  if (/^[0-9a-f]{40}$/.test(line)) commit = line;
  else if (line && commit) {
    if (!blobsByPath.has(line)) blobsByPath.set(line, new Set());
    blobsByPath.get(line).add(commit);
  }
}
for (const [path, commits] of blobsByPath) {
  for (const c of commits) {
    const shown = git(["show", `${c}:${path}`]);
    if (shown.status === 0) addKnown(path, shown.stdout);
  }
}

// --- Recorrer el proyecto --------------------------------------------------------
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const toRel = (full) => relative(PROJECT, full).split(sep).join("/");
const files = KIT_DIRS.flatMap((d) => walk(join(PROJECT, d))).map(toRel).filter((p) => !KEEP.has(p));

const remove = [];
const modified = [];
const own = [];
for (const rel of files) {
  const versions = known.get(rel);
  if (!versions) {
    own.push(rel);
    continue;
  }
  const content = readFileSync(join(PROJECT, rel), "utf8");
  (versions.has(hash(content)) ? remove : modified).push(rel);
}

console.log(`Proyecto: ${PROJECT}`);
console.log(`  copias exactas del kit (se borran): ${remove.length}`);
console.log(`  del kit pero modificadas (decidir a mano): ${modified.length}`);
for (const p of modified) console.log(`    ${p}`);
console.log(`  propias del proyecto (se quedan): ${own.length}`);
for (const p of own) console.log(`    ${p}`);

if (WRITE) {
  for (const rel of remove) unlinkSync(join(PROJECT, rel));
  // Carpetas que quedaron vacías, de la más profunda a la más alta.
  const dirs = new Set();
  for (const rel of remove) {
    let d = dirname(join(PROJECT, rel));
    while (d.startsWith(PROJECT) && d !== PROJECT) {
      dirs.add(d);
      d = dirname(d);
    }
  }
  for (const d of [...dirs].sort((a, b) => b.length - a.length)) {
    if (existsSync(d) && readdirSync(d).length === 0) rmdirSync(d);
  }
  console.log(`\nBorrados ${remove.length} archivos. Revisá el diff con git antes de commitear.`);
} else if (remove.length) {
  console.log("\nPara borrarlos: agregar --write");
}
