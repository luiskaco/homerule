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
  const lines = match[1].split(/\r?\n/);
  const fm = {};
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const value = m[2].trim();

    // YAML block scalar: `key: >` (folded) or `key: |` (literal) — consume
    // the following more-indented lines instead of discarding them.
    if (/^[>|][-+]?$/.test(value)) {
      const folded = value.startsWith(">");
      const collected = [];
      let j = i + 1;
      while (j < lines.length && (/^\s+\S/.test(lines[j]) || lines[j].trim() === "")) {
        collected.push(lines[j].replace(/^\s+/, ""));
        j++;
      }
      while (collected.length && collected[collected.length - 1] === "") collected.pop();
      fm[key] = folded ? collected.join(" ").replace(/\s+/g, " ").trim() : collected.join("\n").trimEnd();
      i = j - 1;
      continue;
    }

    if (value === "") continue;
    fm[key] = value.replace(/^["']|["']$/g, "");
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

function approxTokens(files) {
  const chars = files.reduce((sum, f) => sum + f.content.length, 0);
  return Math.round(chars / 4);
}

// Un workflow es una skill con `metadata: kind: workflow` (ADR-020): Claude Code
// lo recibe como comando y Antigravity como skill de workspace, pero no como
// skill "normal" del catálogo.
function isWorkflowSkill(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return Boolean(match && /^[ \t]+kind:\s*workflow\s*$/m.test(match[1]));
}

function readSkillSource(skillName) {
  try {
    return readFileSync(join(SKILLS_DIR, skillName, "SKILL.md"), "utf8");
  } catch {
    return "";
  }
}

function toPosix(p) {
  return p.split("\\").join("/");
}

const RULES_DIR = join(REPO_ROOT, ".agents", "rules");
const SKILLS_DIR = join(REPO_ROOT, ".agents", "skills");
const ANTIGRAVITY_AGENTS_DIR = join(REPO_ROOT, ".agents", "agents");
const TEMPLATES_DIR = join(REPO_ROOT, "docs-templates");
const CORE_MD_PATH = join(REPO_ROOT, "core", "CORE.md");
const DATABASE_MD_PATH = join(RULES_DIR, "database.md");
const CLAUDE_AGENTS_DIR = join(REPO_ROOT, ".claude", "agents");
const AGENTS_MAP_PATH = join(REPO_ROOT, "core", "agents-map.md");

// ============================================================
// AGENTS.md — estándar abierto que lee cualquier agente (ADR-016)
// ============================================================

// Bloque que el MCP codebase-memory inyecta en los núcleos de este repo. Es
// configuración de la máquina del autor, no del kit: no debe llegar a los ZIPs.
const CODEBASE_MEMORY_BLOCK = /\n*<!-- codebase-memory-mcp:start -->[\s\S]*?<!-- codebase-memory-mcp:end -->\n*/;

function stripMachineBlocks(content) {
  return content.replace(/\r\n/g, "\n").replace(CODEBASE_MEMORY_BLOCK, "\n");
}

// Nota de § 8 sobre subagentes de `.claude/agents/`: es de Claude Code, así que
// sale del AGENTS.md neutral y pasa al CLAUDE.md del kit.
const CLAUDE_SUBAGENT_NOTE = /\n> Esto es una \*\*auto-revisión inline\*\*[\s\S]*?(?=\n(?!>)|$)/;

// Reemplazo que falla si el ancla desaparece: si alguien reescribe CORE.md,
// el build se corta en vez de emitir un AGENTS.md con texto de Claude adentro.
function replaceOrThrow(content, pattern, replacement, what) {
  if (!pattern.test(content)) {
    throw new Error(`generate-manifest: no se encontró ${what} en core/CORE.md — revisar buildAgentsMd()`);
  }
  return content.replace(pattern, replacement);
}

const AGENTS_MD_TOOL = {
  antigravity: {
    TOOL_LABEL: "Antigravity",
    RULES_PATH: ".agents/rules/<regla>.md",
    SKILLS_PATH: ".agents/skills/",
    AGENTS_PATH: ".agents/agents/<nombre>/agent.md",
    WORKFLOWS_PATH: "`.agents/skills/<comando>/SKILL.md`",
  },
  "claude-code": {
    TOOL_LABEL: "Claude Code",
    RULES_PATH: ".claude/skills/<regla>/SKILL.md",
    SKILLS_PATH: ".claude/skills/",
    AGENTS_PATH: ".claude/agents/<nombre>.md",
    WORKFLOWS_PATH: "`.claude/commands/<comando>.md`",
  },
};

/** `AGENTS.md` del kit: núcleo neutral derivado de CORE.md + mapa del proyecto. */
function buildAgentsMd(toolId, coreRaw, mapRaw) {
  const vars = AGENTS_MD_TOOL[toolId];
  let core = stripMachineBlocks(coreRaw);
  core = replaceOrThrow(
    core,
    /^# Core Rules — Global\n/,
    "# AGENTS.md — Reglas del proyecto\n\n" +
      "Instrucciones para cualquier agente de IA que trabaje en este repo " +
      "(estándar abierto [AGENTS.md](https://agents.md)). El proyecto puede " +
      "continuarlo otra herramienta: estas reglas no dependen de ninguna.\n",
    "el título"
  );
  core = replaceOrThrow(
    core,
    /^Invocar con `\/` en el chat:$/m,
    "Invocar con `/` si tu herramienta los expone como comandos; si no, ver **Mapa del proyecto** más abajo:",
    "la línea de invocación de § 7"
  );
  core = replaceOrThrow(core, CLAUDE_SUBAGENT_NOTE, "", "la nota de subagentes de § 8");
  const map = mapRaw.replace(/\r\n/g, "\n").replace(/\{\{(\w+)\}\}/g, (m, key) => {
    if (!(key in vars)) throw new Error(`generate-manifest: variable desconocida ${m} en core/agents-map.md`);
    return vars[key];
  });
  return `${core.trimEnd()}\n\n${map}`;
}

/** `CLAUDE.md` del kit: importa AGENTS.md y agrega solo lo exclusivo de Claude Code. */
function buildClaudeMd(title, coreRaw) {
  const note = stripMachineBlocks(coreRaw).match(CLAUDE_SUBAGENT_NOTE);
  if (!note) throw new Error("generate-manifest: no se encontró la nota de subagentes de § 8 en core/CORE.md");
  return [
    `# ${title}`,
    "",
    "Las reglas del proyecto viven en `AGENTS.md` — estándar abierto que lee " +
      "cualquier agente, así el proyecto puede continuarse con otra herramienta. " +
      "Se importan acá porque, con un `CLAUDE.md` presente, Claude Code no lo lee solo:",
    "",
    "@AGENTS.md",
    "",
    "---",
    "",
    "## Solo para Claude Code",
    "",
    "- Los comandos de § 7 son nativos: viven en `.claude/commands/` y se invocan con `/`.",
    "- Las rules de § 6 son skills nativas en `.claude/skills/<regla>/` — se activan solas por su descripción.",
    "",
    note[0].trim(),
    "",
  ].join("\n");
}

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
};

const items = [];

// ============================================================
// Antigravity layer (existing) — tool: "antigravity"
// ============================================================

{
  const content = stripMachineBlocks(readFileSync(join(REPO_ROOT, ".gemini", "GEMINI.md"), "utf8"));
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

// AGENTS.md va a la raíz del proyecto, no a `~/.gemini/` como GEMINI.md: es lo
// que encuentra cualquier otro agente que continúe el proyecto (ADR-016).
{
  const content = buildAgentsMd(
    "antigravity",
    readFileSync(CORE_MD_PATH, "utf8"),
    readFileSync(AGENTS_MAP_PATH, "utf8")
  );
  items.push({
    id: "antigravity:agents-md",
    category: "global",
    tool: "antigravity",
    label: "AGENTS.md",
    description:
      "Reglas del proyecto en el estándar abierto AGENTS.md — para que cualquier IA pueda continuarlo, no solo Gemini.",
    files: [{ destPath: "AGENTS.md", content }],
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

// Los workflows son skills marcadas (ADR-020): en Antigravity viajan como skill
// de workspace y se invocan con `/<nombre>`; se listan aparte como "comandos".
for (const skillName of readdirSync(SKILLS_DIR).sort()) {
  const skillPath = join(SKILLS_DIR, skillName);
  if (!statSync(skillPath).isDirectory()) continue;
  const workflow = isWorkflowSkill(readSkillSource(skillName));
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
    id: workflow ? `antigravity:workflow:${skillName}` : `skill:${skillName}`,
    category: workflow ? "command" : "skill",
    tool: "antigravity",
    label: workflow ? `${skillName}.md` : skillName,
    description: fm.description || "",
    ...(fm.install ? { install: fm.install } : {}),
    files: fileEntries,
    approxTokens: approxTokens(fileEntries),
  });
}

// Subagentes de Antigravity. `.agents/agents/<name>/agent.md` es el path de
// descubrimiento nativo a nivel workspace — el mismo que este repo usa como
// fuente, así que no hay derivado que sincronizar.
for (const agentName of readdirSync(ANTIGRAVITY_AGENTS_DIR).sort()) {
  const agentDir = join(ANTIGRAVITY_AGENTS_DIR, agentName);
  if (!statSync(agentDir).isDirectory()) continue;
  const fileEntries = walk(agentDir).map((full) => {
    const rel = toPosix(relative(agentDir, full));
    return { destPath: `.agents/agents/${agentName}/${rel}`, content: readFileSync(full, "utf8") };
  });
  let fm = {};
  try {
    fm = parseFrontmatter(readFileSync(join(agentDir, "agent.md"), "utf8"));
  } catch {
    // subagente sin agent.md en la raíz
  }
  items.push({
    id: `antigravity:agent:${agentName}`,
    category: "agent",
    tool: "antigravity",
    label: `${agentName}/agent.md`,
    description: fm.description || "",
    files: fileEntries,
    approxTokens: approxTokens(fileEntries),
  });
}

// Las plantillas de /docs son agnósticas del tool, pero se emiten una vez por
// tool igual: ningún item del manifest pertenece a los dos a la vez. Así cada
// ZIP es autocontenido y la vista de /build filtra por `tool` a secas, sin
// casos especiales por categoría. Los desvíos por proyecto (stack, docs,
// reglas) van en la sección "Proyecto" de AGENTS.md, no en una plantilla
// propia de un tool (ADR-018).
for (const file of readdirSync(TEMPLATES_DIR).sort()) {
  if (extname(file) !== ".md") continue;
  const content = readFileSync(join(TEMPLATES_DIR, file), "utf8");
  const id = file.replace(/\.md$/, "");
  for (const toolId of ["antigravity", "claude-code"]) {
    items.push({
      id: `${toolId}:template:${id}`,
      category: "template",
      tool: toolId,
      label: file,
      description: "",
      files: [{ destPath: `docs/${file}`, content }],
      approxTokens: approxTokens([{ content }]),
    });
  }
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
// Per-tool layer: Claude Code (memoria + rules→skills + skills + comandos + db)
// ============================================================

const coreBodyRaw = readFileSync(CORE_MD_PATH, "utf8");
const agentsMapRaw = readFileSync(AGENTS_MAP_PATH, "utf8");
const databaseRaw = readFileSync(DATABASE_MD_PATH, "utf8");
const databaseFm = parseFrontmatter(databaseRaw);
const databaseBody = stripFrontmatter(databaseRaw);

for (const [toolId, cfg] of Object.entries(TOOL_CONFIG)) {
  // --- Core memory file ---
  // CLAUDE.md importa AGENTS.md (ADR-016): van en el mismo item para que el
  // import nunca apunte a un archivo que el usuario no descargó.
  const coreFiles = [
    { destPath: cfg.coreDestPath, content: buildClaudeMd(cfg.coreTitle, coreBodyRaw) },
    { destPath: "AGENTS.md", content: buildAgentsMd(toolId, coreBodyRaw, agentsMapRaw) },
  ];
  items.push({
    id: `${toolId}:core`,
    category: "global",
    tool: toolId,
    label: `${cfg.coreDestPath} + AGENTS.md`,
    description: `Memoria global del proyecto: reglas en AGENTS.md (las lee cualquier IA) y ${cfg.coreDestPath} que las importa para ${cfg.label}.`,
    files: coreFiles,
    approxTokens: approxTokens(coreFiles),
  });

  // --- Rules → native Claude Code skill ---
  for (const file of readdirSync(RULES_DIR).sort()) {
    if (extname(file) !== ".md" || file === "database.md") continue;
    const raw = readFileSync(join(RULES_DIR, file), "utf8");
    const fm = parseFrontmatter(raw);
    const body = stripFrontmatter(raw);
    const id = file.replace(/\.md$/, "");
    const files = [{ destPath: `${cfg.skillsDir}/${id}/SKILL.md`, content: buildSkillMd(id, fm.description, body) }];
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

  // --- Skills → copied as-is ---
  for (const skillName of readdirSync(SKILLS_DIR).sort()) {
    const skillPath = join(SKILLS_DIR, skillName);
    if (!statSync(skillPath).isDirectory()) continue;
    if (isWorkflowSkill(readSkillSource(skillName))) continue;
    let fm = {};
    try {
      fm = parseFrontmatter(readFileSync(join(skillPath, "SKILL.md"), "utf8"));
    } catch {
      // no SKILL.md at root
    }

    const files = walk(skillPath).map((full) => {
      const rel = toPosix(relative(skillPath, full));
      return { destPath: `${cfg.skillsDir}/${skillName}/${rel}`, content: readFileSync(full, "utf8") };
    });

    items.push({
      id: `${toolId}:skill:${skillName}`,
      category: "skill",
      tool: toolId,
      label: skillName,
      description: fm.description || "",
      ...(fm.install ? { install: fm.install } : {}),
      files,
      approxTokens: approxTokens(files),
    });
  }

  // --- Workflows → commands ---
  // Las skills marcadas como workflow (ADR-020) se re-emiten como comandos
  // nativos: frontmatter solo con `description`, sin `name` ni `metadata`.
  for (const skillName of readdirSync(SKILLS_DIR).sort()) {
    const raw = readSkillSource(skillName);
    if (!isWorkflowSkill(raw)) continue;
    const fm = parseFrontmatter(raw);
    const body = stripFrontmatter(raw);
    const description = fm.description || `Workflow manual /${skillName}`;
    const nativeContent = `---\ndescription: ${yamlQuote(description)}\n---\n\n${body}`;
    const files = [{ destPath: `${cfg.commandsDir}/${skillName}.md`, content: nativeContent }];
    items.push({
      id: `${toolId}:workflow:${skillName}`,
      category: "command",
      tool: toolId,
      label: `${skillName}.md`,
      description,
      files,
      approxTokens: approxTokens(files),
    });
  }

  // --- Database add-on ---
  const dbFiles = [{ destPath: `${cfg.skillsDir}/database/SKILL.md`, content: buildSkillMd("database", databaseFm.description, databaseBody) }];
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

// ============================================================
// Claude Code subagents — tool: "claude-code" únicamente.
// `.claude/agents/*.md` es el formato nativo de Claude Code. Antigravity tiene
// su propio formato declarable (`.agents/agents/<name>/agent.md`, emitido más
// arriba): los dos catálogos son estancos y no se convierten entre sí (ADR-006).
// ============================================================

// Varios agentes llaman a un hook desde su frontmatter (readonly-bash en los
// revisores, ADR-021; web-guard en web-researcher, ADR-022; ssh-guard en los de
// servidores, ADR-026): cada script que el agente nombra viaja en el mismo item
// para que nunca apunte a un archivo que no se descargó, junto con los módulos
// que importa (shell-parse.mjs). Van después del .md: /subagentes lee el
// frontmatter de files[0].
const CLAUDE_HOOKS = readdirSync(join(REPO_ROOT, ".claude", "hooks"))
  .filter((f) => extname(f) === ".mjs")
  .sort()
  .map((f) => {
    const destPath = `.claude/hooks/${f}`;
    return { destPath, content: readFileSync(join(REPO_ROOT, destPath), "utf8") };
  });

/** Los hooks que el agente nombra, más los que esos importan con `from "./x.mjs"`. */
function hooksFor(agentContent) {
  const included = CLAUDE_HOOKS.filter((h) => agentContent.includes(h.destPath));
  for (let i = 0; i < included.length; i++) {
    for (const [, name] of included[i].content.matchAll(/from\s+["']\.\/([\w.-]+\.mjs)["']/g)) {
      const dep = CLAUDE_HOOKS.find((h) => h.destPath === `.claude/hooks/${name}`);
      if (!dep) throw new Error(`${included[i].destPath} importa ${name}, que no está en .claude/hooks/`);
      if (!included.includes(dep)) included.push(dep);
    }
  }
  return included.sort((a, b) => a.destPath.localeCompare(b.destPath));
}

for (const file of readdirSync(CLAUDE_AGENTS_DIR).sort()) {
  if (extname(file) !== ".md") continue;
  const content = readFileSync(join(CLAUDE_AGENTS_DIR, file), "utf8");
  const fm = parseFrontmatter(content);
  const id = file.replace(/\.md$/, "");
  const files = [{ destPath: `.claude/agents/${file}`, content }, ...hooksFor(content)];
  items.push({
    id: `claude-code:agent:${id}`,
    category: "agent",
    tool: "claude-code",
    label: file,
    description: fm.description || "",
    files,
    approxTokens: approxTokens(files),
  });
}

mkdirSync(join(SITE_DIR, "public"), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify({ items }, null, 2), "utf8");

console.log(`manifest.json generated with ${items.length} items`);
