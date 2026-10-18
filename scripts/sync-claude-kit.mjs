// Regenera los derivados locales de Claude Code a partir de la fuente única,
// con la misma conversión que usa site/scripts/generate-manifest.mjs:
//
//   .agents/skills/<id>/SKILL.md con `metadata: kind: workflow`  →  .claude/commands/<id>.md
//     (frontmatter nativo con solo `description`; ADR-020)
//
//   .agents/rules/*.md                         →  .claude/skills/<id>/SKILL.md
//     (la rule se convierte a skill nativa, como en los ZIPs del kit)
//
// Correr después de editar cualquier workflow o rule:
//   node scripts/sync-claude-kit.mjs
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const SKILLS_SRC_DIR = join(REPO_ROOT, ".agents", "skills");
const RULES_DIR = join(REPO_ROOT, ".agents", "rules");
const COMMANDS_DIR = join(REPO_ROOT, ".claude", "commands");
const SKILLS_DIR = join(REPO_ROOT, ".claude", "skills");

function parseDescription(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return "";
  const m = match[1].match(/^description:\s*(.*)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").replace(/^\s+/, "");
}

// Un workflow es una skill con `metadata: kind: workflow` (ADR-020).
function isWorkflowSkill(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return Boolean(match && /^[ \t]+kind:\s*workflow\s*$/m.test(match[1]));
}

function yamlQuote(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ")}"`;
}

// --- Workflows → comandos ---
mkdirSync(COMMANDS_DIR, { recursive: true });
let commands = 0;
for (const id of readdirSync(SKILLS_SRC_DIR).sort()) {
  const skillFile = join(SKILLS_SRC_DIR, id, "SKILL.md");
  if (!existsSync(skillFile)) continue;
  const raw = readFileSync(skillFile, "utf8");
  if (!isWorkflowSkill(raw)) continue;
  const description = parseDescription(raw) || `Workflow manual /${id}`;
  writeFileSync(
    join(COMMANDS_DIR, `${id}.md`),
    `---\ndescription: ${yamlQuote(description)}\n---\n\n${stripFrontmatter(raw)}`,
    "utf8"
  );
  commands++;
}

// --- Rules → skills nativas ---
let skills = 0;
for (const file of readdirSync(RULES_DIR).sort()) {
  if (extname(file) !== ".md") continue;
  const raw = readFileSync(join(RULES_DIR, file), "utf8");
  const id = file.replace(/\.md$/, "");
  const description = parseDescription(raw) || id;
  const dir = join(SKILLS_DIR, id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "SKILL.md"),
    `---\nname: ${id}\ndescription: ${yamlQuote(description)}\n---\n\n${stripFrontmatter(raw)}`,
    "utf8"
  );
  skills++;
}

console.log(`${commands} comandos → .claude/commands/ · ${skills} rules → .claude/skills/`);
