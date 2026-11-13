#!/usr/bin/env node
// Instala el kit en la carpeta personal, para todos los proyectos (ADR-038).
//
//   Claude Code  → ~/.claude/CLAUDE.md, skills/ (rules y skills), commands/,
//                  agents/ y hooks/ de los subagentes
//   Antigravity  → ~/.gemini/GEMINI.md y ~/.gemini/config/{rules,skills,agents}/
//   Codex        → ~/.codex/AGENTS.md y ~/.agents/skills/ (rules y comandos como skills)
//
// Corre de dos formas, con el mismo código (ADR-039):
//   - Desde el repo: arma los tres kits con el generador del sitio y los instala.
//   - Desde el ZIP que baja la web: instala el `kit.json` que viene al lado.
//
// Uso:
//   node install.mjs                     # solo compara; sale con 1 si hay algo pendiente
//   node install.mjs --write             # instala, con respaldo en kit-backup/<fecha-hora>/
//   node install.mjs --write --force     # también pisa archivos ajenos con el mismo nombre
//   node install.mjs --from <kit.json>   # instala un kit puntual
//
// Registra lo instalado en .kit-installed.json y, en la próxima corrida, borra
// lo que el kit ya no trae. Nunca pisa un archivo que no instaló él, salvo con
// --force. No toca los hooks de Antigravity ni el hook de datos personales (ADR-034).
// Solo usa módulos de Node: tiene que correr suelto, fuera del repo.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const HOME = process.env.GLOBALS_HOME || homedir();
const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const FORCE = args.includes("--force");
const FROM = args.includes("--from") ? args[args.indexOf("--from") + 1] : null;
const STAMP = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");

const MACHINE_BLOCK = /\n*<!-- codebase-memory-mcp:start -->[\s\S]*?<!-- codebase-memory-mcp:end -->\n*/;

// --- 1. Qué kits instalar ----------------------------------------------------------
function loadKits() {
  if (FROM) return [JSON.parse(readFileSync(FROM, "utf8"))];
  const zipKit = join(HERE, "kit.json");
  if (existsSync(zipKit)) return [JSON.parse(readFileSync(zipKit, "utf8"))];

  // Desde el repo: el generador del sitio arma los tres kits en site/public/global-kit/.
  const repo = join(HERE, "..");
  const gen = spawnSync(process.execPath, ["scripts/generate-manifest.mjs"], { cwd: join(repo, "site"), encoding: "utf8" });
  if (gen.status !== 0) {
    process.stderr.write(gen.stderr || gen.stdout);
    throw new Error("install-global: falló generate-manifest");
  }
  const dir = join(repo, "site", "public", "global-kit");
  return ["claude-code", "antigravity", "codex"].map((tool) => JSON.parse(readFileSync(join(dir, `${tool}.json`), "utf8")));
}

// El kit puede venir de un ZIP: solo se aceptan las carpetas del kit y rutas relativas sin "..".
const KIT_ROOTS = [".claude", ".gemini", ".codex", ".agents"];
function assertSafe(target) {
  if (!KIT_ROOTS.includes(target.root)) throw new Error(`install-global: carpeta no permitida "${target.root}"`);
  for (const rel of Object.keys(target.files)) {
    const parts = rel.split("/");
    if (rel.startsWith("/") || rel.includes("\\") || /^[a-zA-Z]:/.test(rel) || parts.some((p) => p === "" || p === "." || p === "..")) {
      throw new Error(`install-global: ruta no permitida "${target.root}/${rel}"`);
    }
  }
}

/** @type {{root: string, label: string, files: Map<string, string>}[]} */
const targets = loadKits().flatMap((kit) =>
  kit.targets.map((target) => {
    assertSafe(target);
    return { root: join(HOME, target.root), label: target.label, files: new Map(Object.entries(target.files)) };
  })
);

// --- 3. Comparar e instalar ------------------------------------------------------
function removeEmptyDirs(dir, stop) {
  while (dir.startsWith(stop) && dir !== stop && existsSync(dir) && readdirSync(dir).length === 0) {
    rmdirSync(dir);
    dir = dirname(dir);
  }
}

/** Núcleos de cada herramienta: se instalan siempre y conservan lo propio de la máquina. */
const CORE_FILES = new Set(["CLAUDE.md", "GEMINI.md", "AGENTS.md"]);

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
    if (CORE_FILES.has(rel)) {
      const block = current?.replace(/\r\n/g, "\n").match(MACHINE_BLOCK);
      if (block) content = `${content.trimEnd()}\n\n${block[0].trim()}\n`;
      if (current?.includes("\r\n")) content = content.replace(/\n/g, "\r\n");
    }
    if (current === content) {
      report.iguales++;
      finalFiles.push(rel);
      continue;
    }
    const owned = installed.has(rel) || CORE_FILES.has(rel);
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
