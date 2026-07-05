// Walks the repo (one level above /site) and builds site/public/manifest.json
// Run automatically via prebuild/predev — see package.json.
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_DIR = fileURLToPath(new URL("..", import.meta.url));
const REPO_ROOT = join(SITE_DIR, "..");
// Served as a static file (fetched at runtime) instead of imported into the
// JS bundle — the manifest is a few MB once every skill/tool variant is in.
const OUT_FILE = join(SITE_DIR, "public", "manifest.json");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (value === ">" || value === "|" || value === "") continue;
    value = value.replace(/^["']|["']$/g, "");
    fm[m[1]] = value;
  }
  return fm;
}

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").replace(/^\s+/, "");
}

function yamlQuote(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ")}"`;
}

function buildSkillMd(name, description, body) {
  return `---\nname: ${name}\ndescription: ${yamlQuote(description || name)}\n---\n\n${body}`;
}

function buildCursorMdc(fm, body) {
  const lines = ["---", `description: ${yamlQuote(fm.description || "")}`];
  const globSource = fm.trigger === "glob" ? fm.globs : fm.glob;
  if (globSource) {
    const globs = globSource.split(",").map((g) => g.trim()).filter(Boolean);
    lines.push(`globs: [${globs.map((g) => `"${g}"`).join(", ")}]`);
  }
  lines.push("alwaysApply: false", "---", "");
  return lines.join("\n") + body;
}

function approxTokens(files) {
  const chars = files.reduce((sum, f) => sum + f.content.length, 0);
  return Math.round(chars / 4);
}

function toPosix(p) {
  return p.split("\\").join("/");
}

const RULES_DIR = join(REPO_ROOT, ".agents", "rules");
const SKILLS_DIR = join(REPO_ROOT, ".agents", "skills");
const WORKFLOWS_DIR = join(REPO_ROOT, ".gemini", "antigravity", "global_workflows");
const TEMPLATES_DIR = join(REPO_ROOT, "docs-templates");
const CORE_MD_PATH = join(REPO_ROOT, "core", "CORE.md");
const DATABASE_MD_PATH = join(RULES_DIR, "database.md");

const DB_ENGINES = [
  { id: "postgres", label: "PostgreSQL", description: "Relacional, integridad referencial fuerte — default recomendado." },
  { id: "mysql", label: "MySQL", description: "Relacional — hosting compartido / stack LAMP existente." },
  { id: "mongodb", label: "MongoDB", description: "Documentos, esquema variable, alto volumen de escritura." },
  { id: "supabase", label: "Supabase", description: "Postgres + auth + storage + realtime integrados." },
];

const TOOL_CONFIG = {
  "claude-code": {
    label: "Claude Code",
    coreDestPath: "CLAUDE.md",
    coreTitle: "Claude Code — Global",
    skillsDir: ".claude/skills",
    commandsDir: ".claude/commands",
  },
  codex: {
    label: "Codex CLI",
    coreDestPath: "AGENTS.md",
    coreTitle: "Codex — Global",
    skillsDir: ".codex/skills",
    commandsDir: null,
  },
  opencode: {
    label: "OpenCode",
    coreDestPath: "AGENTS.md",
    coreTitle: "OpenCode — Global",
    skillsDir: ".opencode/skills",
    commandsDir: ".opencode/commands",
  },
  cursor: {
    label: "Cursor",
    coreDestPath: ".cursor/rules/000-core.mdc",
    coreTitle: "Core",
    rulesDir: ".cursor/rules",
    commandsDir: ".cursor/commands",
    isMdcCore: true,
  },
};

const items = [];

// ============================================================
// Antigravity layer (existing) — tool: "antigravity"
// ============================================================

{
  const content = readFileSync(join(REPO_ROOT, ".gemini", "GEMINI.md"), "utf8");
  items.push({
    id: "global:GEMINI.md",
    category: "global",
    tool: "antigravity",
    label: "GEMINI.md",
    description: "Núcleo global Always On — principios, stack base, naming, jerarquía de reglas.",
    files: [{ destPath: "GEMINI.md", content }],
    approxTokens: approxTokens([{ content }]),
  });
}

for (const file of readdirSync(WORKFLOWS_DIR).sort()) {
  const content = readFileSync(join(WORKFLOWS_DIR, file), "utf8");
  const fm = parseFrontmatter(content);
  items.push({
    id: `global:${file}`,
    category: "global",
    tool: "antigravity",
    label: file,
    description: fm.description || `Workflow manual /${file.replace(/\.md$/, "")}`,
    files: [{ destPath: `antigravity/global_workflows/${file}`, content }],
    approxTokens: approxTokens([{ content }]),
  });
}

for (const file of readdirSync(RULES_DIR).sort()) {
  if (extname(file) !== ".md" || file === "database.md") continue;
  const content = readFileSync(join(RULES_DIR, file), "utf8");
  const fm = parseFrontmatter(content);
  const id = file.replace(/\.md$/, "");
  items.push({
    id: `rule:${id}`,
    category: "rule",
    tool: "antigravity",
    label: file,
    description: fm.description || "",
    files: [{ destPath: `.agents/rules/${file}`, content }],
    approxTokens: approxTokens([{ content }]),
  });
}

for (const skillName of readdirSync(SKILLS_DIR).sort()) {
  const skillPath = join(SKILLS_DIR, skillName);
  if (!statSync(skillPath).isDirectory()) continue;
  const fileEntries = walk(skillPath).map((full) => {
    const content = readFileSync(full, "utf8");
    const rel = toPosix(relative(skillPath, full));
    return { destPath: `.agents/skills/${skillName}/${rel}`, content };
  });
  let fm = {};
  try {
    fm = parseFrontmatter(readFileSync(join(skillPath, "SKILL.md"), "utf8"));
  } catch {
    // no SKILL.md at root
  }
  items.push({
    id: `skill:${skillName}`,
    category: "skill",
    tool: "antigravity",
    label: skillName,
    description: fm.description || "",
    files: fileEntries,
    approxTokens: approxTokens(fileEntries),
  });
}

for (const file of readdirSync(TEMPLATES_DIR).sort()) {
  if (extname(file) !== ".md") continue;
  const content = readFileSync(join(TEMPLATES_DIR, file), "utf8");
  const id = file.replace(/\.md$/, "");
  items.push({
    id: `template:${id}`,
    category: "template",
    tool: "antigravity",
    label: file,
    description: "",
    files: [{ destPath: `docs/${file}`, content }],
    approxTokens: approxTokens([{ content }]),
  });
}

{
  const raw = readFileSync(DATABASE_MD_PATH, "utf8");
  const dbFiles = [{ destPath: ".agents/rules/database.md", content: raw }];
  for (const engine of DB_ENGINES) {
    items.push({
      id: `antigravity:database:${engine.id}`,
      category: "database",
      tool: "antigravity",
      label: engine.label,
      description: engine.description,
      files: dbFiles,
      approxTokens: approxTokens(dbFiles),
    });
  }
}

// ============================================================
// Per-tool layers: Claude Code, Codex, OpenCode, Cursor
// ============================================================

const coreBodyRaw = readFileSync(CORE_MD_PATH, "utf8");
const databaseRaw = readFileSync(DATABASE_MD_PATH, "utf8");
const databaseFm = parseFrontmatter(databaseRaw);
const databaseBody = stripFrontmatter(databaseRaw);

for (const [toolId, cfg] of Object.entries(TOOL_CONFIG)) {
  // --- Core memory file ---
  const coreBody = coreBodyRaw.replace(/^# Core Rules — Global/, `# ${cfg.coreTitle}`);
  const coreContent = cfg.isMdcCore
    ? `---\ndescription: ${yamlQuote("Reglas globales del proyecto")}\nalwaysApply: true\n---\n\n${coreBody}`
    : coreBody;
  items.push({
    id: `${toolId}:core`,
    category: "global",
    tool: toolId,
    label: cfg.coreDestPath,
    description: `Memoria global del proyecto para ${cfg.label}.`,
    files: [{ destPath: cfg.coreDestPath, content: coreContent }],
    approxTokens: approxTokens([{ content: coreContent }]),
  });

  // --- Rules → native skill (Claude/Codex/OpenCode) or .mdc rule (Cursor) ---
  for (const file of readdirSync(RULES_DIR).sort()) {
    if (extname(file) !== ".md" || file === "database.md") continue;
    const raw = readFileSync(join(RULES_DIR, file), "utf8");
    const fm = parseFrontmatter(raw);
    const body = stripFrontmatter(raw);
    const id = file.replace(/\.md$/, "");
    let files;
    if (cfg.rulesDir) {
      files = [{ destPath: `${cfg.rulesDir}/${id}.mdc`, content: buildCursorMdc(fm, body) }];
    } else {
      files = [{ destPath: `${cfg.skillsDir}/${id}/SKILL.md`, content: buildSkillMd(id, fm.description, body) }];
    }
    items.push({
      id: `${toolId}:rule:${id}`,
      category: "skill",
      tool: toolId,
      label: file,
      description: fm.description || "",
      files,
      approxTokens: approxTokens(files),
    });
  }

  // --- Skills → copied as-is (Claude/Codex/OpenCode) or converted to .mdc (Cursor) ---
  for (const skillName of readdirSync(SKILLS_DIR).sort()) {
    const skillPath = join(SKILLS_DIR, skillName);
    if (!statSync(skillPath).isDirectory()) continue;
    const allFiles = walk(skillPath);
    let fm = {};
    try {
      fm = parseFrontmatter(readFileSync(join(skillPath, "SKILL.md"), "utf8"));
    } catch {
      // no SKILL.md at root
    }

    let files;
    if (cfg.rulesDir) {
      let skillMdRaw = "";
      try {
        skillMdRaw = readFileSync(join(skillPath, "SKILL.md"), "utf8");
      } catch {
        // no SKILL.md — skip main body, keep extra files only
      }
      const body = skillMdRaw ? stripFrontmatter(skillMdRaw) : "";
      // Cursor no auto-carga archivos extra de una skill (solo el .mdc) — no
      // incluir los archivos de referencia adicionales para no listar algo
      // que en la práctica no hace nada dentro de Cursor.
      files = [{ destPath: `${cfg.rulesDir}/${skillName}.mdc`, content: buildCursorMdc(fm, body) }];
    } else {
      files = allFiles.map((full) => {
        const rel = toPosix(relative(skillPath, full));
        return { destPath: `${cfg.skillsDir}/${skillName}/${rel}`, content: readFileSync(full, "utf8") };
      });
    }

    items.push({
      id: `${toolId}:skill:${skillName}`,
      category: "skill",
      tool: toolId,
      label: skillName,
      description: fm.description || "",
      files,
      approxTokens: approxTokens(files),
    });
  }

  // --- Workflows → commands (Claude/OpenCode/Cursor) or skill (Codex, commands deprecated there) ---
  for (const file of readdirSync(WORKFLOWS_DIR).sort()) {
    const raw = readFileSync(join(WORKFLOWS_DIR, file), "utf8");
    const fm = parseFrontmatter(raw);
    const body = stripFrontmatter(raw);
    const id = file.replace(/\.md$/, "");
    const description = fm.description || `Workflow manual /${id}`;
    let files;
    let category;
    if (cfg.commandsDir) {
      category = "command";
      files = [{ destPath: `${cfg.commandsDir}/${file}`, content: raw }];
    } else {
      category = "skill";
      files = [{ destPath: `${cfg.skillsDir}/${id}/SKILL.md`, content: buildSkillMd(id, description, body) }];
    }
    items.push({
      id: `${toolId}:workflow:${id}`,
      category,
      tool: toolId,
      label: file,
      description,
      files,
      approxTokens: approxTokens(files),
    });
  }

  // --- Database add-on ---
  const dbFiles = cfg.rulesDir
    ? [{ destPath: `${cfg.rulesDir}/database.mdc`, content: buildCursorMdc(databaseFm, databaseBody) }]
    : [{ destPath: `${cfg.skillsDir}/database/SKILL.md`, content: buildSkillMd("database", databaseFm.description, databaseBody) }];
  for (const engine of DB_ENGINES) {
    items.push({
      id: `${toolId}:database:${engine.id}`,
      category: "database",
      tool: toolId,
      label: engine.label,
      description: engine.description,
      files: dbFiles,
      approxTokens: approxTokens(dbFiles),
    });
  }
}

mkdirSync(join(SITE_DIR, "public"), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify({ items }, null, 2), "utf8");

console.log(`manifest.json generated with ${items.length} items`);
