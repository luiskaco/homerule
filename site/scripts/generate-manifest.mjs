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

/** Núcleo sin nada propio de un tool, derivado de CORE.md (copia del kit híbrido). */
function buildNeutralCore(coreRaw, header) {
  let core = stripMachineBlocks(coreRaw);
  core = replaceOrThrow(core, /^# Core Rules — Global\n/, header, "el título");
  core = replaceOrThrow(
    core,
    /^Invocar con `\/` en el chat:$/m,
    "Invocar con `/` si tu herramienta los expone como comandos; si no, leer el archivo del comando y seguir sus pasos:",
    "la línea de invocación de § 7"
  );
  return replaceOrThrow(core, CLAUDE_SUBAGENT_NOTE, "", "la nota de subagentes de § 8").trimEnd();
}

/**
 * `AGENTS.md` de todos los kits: solo lo esencial del proyecto, sin las reglas
 * generales (ADR-036). Cada herramienta trae las suyas.
 */
function buildAgentsMd(mapRaw) {
  return mapRaw.replace(/\r\n/g, "\n");
}

/** `CLAUDE.md` del kit híbrido: importa AGENTS.md; las reglas generales están en los globales. */
function buildHybridClaudeMd() {
  return [
    "# CLAUDE.md",
    "",
    "@AGENTS.md",
    "",
    "---",
    "",
    "## Solo para Claude Code",
    "",
    "- Las reglas generales se cargan desde `~/.claude/CLAUDE.md`.",
    "- Los comandos de `.claude/commands/` y las skills de `.claude/skills/` son punteros a `.agents/`, " +
      "la carpeta que comparte con Antigravity. Cualquier cambio se hace ahí.",
    "- Los subagentes de `.claude/agents/` y sus hooks son propios de Claude Code.",
    "",
  ].join("\n");
}

/** `CLAUDE.md` del kit: reglas generales de CORE.md + import de AGENTS.md (ADR-036). */
function buildClaudeMd(title, coreRaw) {
  const core = replaceOrThrow(stripMachineBlocks(coreRaw), /^# Core Rules — Global\n/, `# ${title}\n`, "el título");
  return [
    core.trimEnd(),
    "",
    "---",
    "",
    "## Proyecto",
    "",
    "Lo esencial de este proyecto está en `AGENTS.md`, que lee cualquier IA. " +
      "Se importa acá porque, con un `CLAUDE.md` presente, Claude Code no lo lee solo:",
    "",
    "@AGENTS.md",
    "",
    "## Solo para Claude Code",
    "",
    "- Los comandos de § 7 son nativos: viven en `.claude/commands/` y se invocan con `/`.",
    "- Las rules de § 6 son skills nativas en `.claude/skills/<regla>/` — se activan solas por su descripción.",
    "",
  ].join("\n");
}

const DB_ENGINES = [
  { id: "postgres", label: "PostgreSQL", description: "Relacional, integridad referencial fuerte — default recomendado." },
  { id: "mysql", label: "MySQL", description: "Relacional — hosting compartido / stack LAMP existente." },
  { id: "mongodb", label: "MongoDB", description: "Documentos, esquema variable, alto volumen de escritura." },
  { id: "supabase", label: "Supabase", description: "Postgres + auth + storage + realtime integrados." },
  { id: "sqlite", label: "SQLite", description: "Un archivo, sin servidor — apps locales, herramientas internas o un solo servidor." },
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
  const content = buildAgentsMd(readFileSync(AGENTS_MAP_PATH, "utf8"));
  items.push({
    id: "antigravity:agents-md",
    category: "global",
    tool: "antigravity",
    label: "AGENTS.md",
    description:
      "Lo esencial del proyecto en el estándar abierto AGENTS.md — qué es, comandos y lo que no se negocia, para cualquier IA o persona.",
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
  // CLAUDE.md lleva las reglas generales e importa AGENTS.md (ADR-036): van en
  // el mismo item para que el import nunca apunte a un archivo que no se descargó.
  const coreFiles = [
    { destPath: cfg.coreDestPath, content: buildClaudeMd(cfg.coreTitle, coreBodyRaw) },
    { destPath: "AGENTS.md", content: buildAgentsMd(agentsMapRaw) },
  ];
  items.push({
    id: `${toolId}:core`,
    category: "global",
    tool: toolId,
    label: `${cfg.coreDestPath} + AGENTS.md`,
    description: `Reglas generales en ${cfg.coreDestPath} para ${cfg.label}, y lo esencial del proyecto en AGENTS.md, que lee cualquier IA.`,
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

// ============================================================
// Kit híbrido — tool: "hybrid" (ADR-031).
// Autocontenido como los otros dos: cada item trae su fuente en `.agents/` y el
// puntero de `.claude/` que evita tener dos copias de la misma regla.
// ============================================================

function pushHybridItem(id, category, label, description, files, extra = {}) {
  items.push({ id: `hybrid:${id}`, category, tool: "hybrid", label, description, ...extra, files, approxTokens: approxTokens(files) });
}

function rulePointer(id, description, file) {
  const body = `Esta regla vive en \`.agents/rules/${file}\`, compartida con Antigravity. Leé ese archivo y aplicalo.\n`;
  return { destPath: `.claude/skills/${id}/SKILL.md`, content: buildSkillMd(id, description, body) };
}

{
  const coreRaw = readFileSync(CORE_MD_PATH, "utf8");
  const mapRaw = readFileSync(AGENTS_MAP_PATH, "utf8");

  // Los dos primeros van a la carpeta del usuario: `zip.ts` los aísla en `global/`.
  pushHybridItem("global:GEMINI.md", "global", "~/.gemini/GEMINI.md", "Reglas generales de Antigravity. Se cargan solas en todos tus proyectos.", [
    { destPath: "GEMINI.md", content: stripMachineBlocks(readFileSync(join(REPO_ROOT, ".gemini", "GEMINI.md"), "utf8")) },
  ]);
  pushHybridItem("global:CLAUDE.md", "global", "~/.claude/CLAUDE.md", "Reglas generales de Claude Code. Se cargan solas en todos tus proyectos.", [
    {
      destPath: "CLAUDE.md",
      content: replaceOrThrow(
        stripMachineBlocks(coreRaw),
        /^# Core Rules — Global\n/,
        `# ${TOOL_CONFIG["claude-code"].coreTitle}\n`,
        "el título"
      ),
    },
  ]);
  pushHybridItem("agents-md", "global", "AGENTS.md", "Lo esencial del proyecto, sin las reglas generales que ya cargan los archivos globales.", [
    { destPath: "AGENTS.md", content: buildAgentsMd(mapRaw) },
  ]);
  pushHybridItem("claude-md", "global", "CLAUDE.md", "Importa AGENTS.md y agrega lo exclusivo de Claude Code.", [
    { destPath: "CLAUDE.md", content: buildHybridClaudeMd() },
  ]);
  const coreCopy = buildNeutralCore(
    coreRaw,
    "# Reglas generales — copia\n\n" +
      "Copia de las reglas globales de Claude Code y Antigravity. Ninguna herramienta la carga sola: " +
      "leerla solo si no tenés esos archivos globales. Si difiere de ellos, mandan los globales.\n"
  );
  pushHybridItem("core-copy", "global", ".agents/CORE.md", "Copia de las reglas generales para otra máquina u otra herramienta.", [
    { destPath: ".agents/CORE.md", content: `${coreCopy}\n` },
  ]);
}

for (const file of readdirSync(RULES_DIR).sort()) {
  if (extname(file) !== ".md") continue;
  const content = readFileSync(join(RULES_DIR, file), "utf8");
  const fm = parseFrontmatter(content);
  const id = file.replace(/\.md$/, "");
  const files = [{ destPath: `.agents/rules/${file}`, content }, rulePointer(id, fm.description, file)];
  if (file === "database.md") {
    for (const engine of DB_ENGINES) {
      pushHybridItem(`database:${engine.id}`, "database", engine.label, engine.description, files);
    }
  } else {
    pushHybridItem(`rule:${id}`, "rule", file, fm.description || "", files);
  }
}

for (const skillName of readdirSync(SKILLS_DIR).sort()) {
  const skillPath = join(SKILLS_DIR, skillName);
  if (!statSync(skillPath).isDirectory()) continue;
  const raw = readSkillSource(skillName);
  const fm = parseFrontmatter(raw);
  const source = `.agents/skills/${skillName}/SKILL.md`;
  const sourceFiles = walk(skillPath).map((full) => ({
    destPath: `.agents/skills/${skillName}/${toPosix(relative(skillPath, full))}`,
    content: readFileSync(full, "utf8"),
  }));
  if (isWorkflowSkill(raw)) {
    const description = fm.description || `Workflow manual /${skillName}`;
    pushHybridItem(`workflow:${skillName}`, "command", `${skillName}.md`, description, [
      ...sourceFiles,
      {
        destPath: `.claude/commands/${skillName}.md`,
        content: `---\ndescription: ${yamlQuote(description)}\n---\n\nLeé \`${source}\` y seguí sus pasos.\n`,
      },
    ]);
  } else {
    const body = `Esta skill vive en \`${source}\`, compartida con Antigravity. Leé ese archivo y seguilo; sus rutas relativas parten de esa carpeta.\n`;
    pushHybridItem(
      `skill:${skillName}`,
      "skill",
      skillName,
      fm.description || "",
      [...sourceFiles, { destPath: `.claude/skills/${skillName}/SKILL.md`, content: buildSkillMd(skillName, fm.description, body) }],
      fm.install ? { install: fm.install } : {}
    );
  }
}

// Los subagentes no se comparten: cada tool usa su formato, su modelo y sus hooks.
for (const item of items.filter((i) => i.category === "agent" && i.tool !== "hybrid")) {
  items.push({ ...item, id: `hybrid:${item.id}`, tool: "hybrid" });
}

mkdirSync(join(SITE_DIR, "public"), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify({ items }, null, 2), "utf8");

console.log(`manifest.json generated with ${items.length} items`);
