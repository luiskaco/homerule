// Genera .claude-plugin/plugin.json y .claude-plugin/marketplace.json desde la
// fuente del repo — el kit de Claude Code como plugin nativo (ADR-011), que se
// actualiza desde git en vez de quedar congelado como los ZIPs.
//
//   node scripts/build-plugin.mjs            → regenera con la versión de hoy
//   node scripts/build-plugin.mjs --check    → falla si el archivo está desactualizado
//   node scripts/build-plugin.mjs --version=2026.9.13
//
// Los arrays de rutas son explícitos a propósito (ADR-011): el plugin publica
// solo contenido propio del hub. Las skills de terceros vendorizadas en
// .claude/skills/ y .agents/skills/ NO se publican — se instalan con su propio
// comando, desde su repo original.
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const PLUGIN_DIR = join(REPO_ROOT, ".claude-plugin");
const RULES_DIR = join(REPO_ROOT, ".agents", "rules");
const AGENTS_DIR = join(REPO_ROOT, ".claude", "agents");
const COMMANDS_DIR = join(REPO_ROOT, ".claude", "commands");
const CLAUDE_SKILLS_DIR = join(REPO_ROOT, ".claude", "skills");
const AGENT_SKILLS_DIR = join(REPO_ROOT, ".agents", "skills");

const REPO_SLUG = "luiskaco/-makeRuleIA";
const REPO_URL = `https://github.com/${REPO_SLUG}`;

/**
 * Skills escritas en este repo. El resto de `.agents/skills/` y
 * `.claude/skills/` son copias vendorizadas de terceros: se reconocen porque
 * traen `install:` en el frontmatter o figuran en `skills-lock.json`, y no se
 * redistribuyen por el plugin.
 */
const HUB_OWNED_SKILLS = ["domain-modeling", "prelaunch-compliance-audit", "project-planning"];

/**
 * Subagents que viajan solo por ZIP (ADR-026). Los subagents de plugin ignoran
 * `hooks`, y sin ssh-guard la aprobación por cambio y el bloqueo duro de los
 * agentes de servidores no estarían garantizados.
 */
const ZIP_ONLY_AGENTS = ["server-inspector.md", "server-operator.md"];

/** CalVer sin ceros a la izquierda — también válido como semver (ADR-014). */
function calver(date = new Date()) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function mdFiles(dir) {
  return readdirSync(dir)
    .filter((f) => extname(f) === ".md")
    .sort();
}

function thirdPartySkills() {
  const lock = JSON.parse(readFileSync(join(REPO_ROOT, "skills-lock.json"), "utf8"));
  const fromLock = Object.keys(lock.skills);
  const fromFrontmatter = readdirSync(AGENT_SKILLS_DIR).filter((name) => {
    const skillMd = join(AGENT_SKILLS_DIR, name, "SKILL.md");
    return existsSync(skillMd) && /^install:/m.test(readFileSync(skillMd, "utf8"));
  });
  return new Set([...fromLock, ...fromFrontmatter]);
}

function buildManifest(version) {
  const rules = mdFiles(RULES_DIR).map((f) => f.replace(/\.md$/, ""));

  // Guard: cada rule tiene que existir ya convertida a skill nativa. Si falta,
  // es que no se corrió sync-claude-kit.mjs — y la rule se publicaría vacía.
  const faltantes = rules.filter((id) => !existsSync(join(CLAUDE_SKILLS_DIR, id, "SKILL.md")));
  if (faltantes.length) {
    console.error(
      `Rules sin skill nativa en .claude/skills/: ${faltantes.join(", ")}\n` +
        "Corré `node scripts/sync-claude-kit.mjs` antes de generar el plugin."
    );
    process.exit(1);
  }

  const externas = thirdPartySkills();
  const propias = HUB_OWNED_SKILLS.filter((name) => existsSync(join(AGENT_SKILLS_DIR, name, "SKILL.md")));
  const coladas = propias.filter((name) => externas.has(name));
  if (coladas.length) {
    console.error(`Skills de terceros marcadas como propias: ${coladas.join(", ")}`);
    process.exit(1);
  }

  return {
    name: "ai-rules-hub",
    displayName: "AI Rules Hub",
    version,
    description:
      "Kit de reglas, comandos y subagentes para Claude Code: 9 rules como skills nativas, 7 workflows y 9 subagentes especializados.",
    author: { name: "luiskaco", url: "https://github.com/luiskaco" },
    homepage: REPO_URL,
    repository: REPO_URL,
    license: "MIT",
    keywords: ["rules", "skills", "subagents", "workflows", "code-review", "security"],
    commands: mdFiles(COMMANDS_DIR).map((f) => `./.claude/commands/${f}`),
    agents: mdFiles(AGENTS_DIR)
      .filter((f) => !ZIP_ONLY_AGENTS.includes(f))
      .map((f) => `./.claude/agents/${f}`),
    skills: [
      ...rules.map((id) => `./.claude/skills/${id}/`),
      ...propias.map((name) => `./.agents/skills/${name}/`),
    ],
  };
}

function buildMarketplace(plugin) {
  return {
    name: "ai-rules-hub",
    owner: { name: "luiskaco", url: "https://github.com/luiskaco" },
    plugins: [
      {
        name: plugin.name,
        source: "./",
        description: plugin.description,
        version: plugin.version,
        author: plugin.author,
        homepage: plugin.homepage,
        repository: plugin.repository,
        license: plugin.license,
        keywords: plugin.keywords,
      },
    ],
  };
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const versionArg = args.find((a) => a.startsWith("--version="))?.split("=")[1];

const pluginPath = join(PLUGIN_DIR, "plugin.json");
const marketplacePath = join(PLUGIN_DIR, "marketplace.json");

// En --check se compara contra la versión ya publicada: lo que se valida es que
// el contenido no se haya quedado atrás, no que alguien haya bumpeado la fecha.
const versionActual = existsSync(pluginPath)
  ? JSON.parse(readFileSync(pluginPath, "utf8")).version
  : null;
const version = versionArg ?? (check ? (versionActual ?? calver()) : calver());

const plugin = buildManifest(version);
const marketplace = buildMarketplace(plugin);

const pluginJson = JSON.stringify(plugin, null, 2) + "\n";
const marketplaceJson = JSON.stringify(marketplace, null, 2) + "\n";

if (check) {
  const desactualizados = [];
  if (!existsSync(pluginPath) || readFileSync(pluginPath, "utf8") !== pluginJson) {
    desactualizados.push(".claude-plugin/plugin.json");
  }
  if (!existsSync(marketplacePath) || readFileSync(marketplacePath, "utf8") !== marketplaceJson) {
    desactualizados.push(".claude-plugin/marketplace.json");
  }
  if (desactualizados.length) {
    console.error(
      `Desactualizado: ${desactualizados.join(", ")}\nCorré \`node scripts/build-plugin.mjs\`.`
    );
    process.exit(1);
  }
  console.log(`Plugin OK — v${version}, ${plugin.commands.length} comandos, ${plugin.agents.length} subagentes, ${plugin.skills.length} skills.`);
  process.exit(0);
}

mkdirSync(PLUGIN_DIR, { recursive: true });
writeFileSync(pluginPath, pluginJson, "utf8");
writeFileSync(marketplacePath, marketplaceJson, "utf8");

console.log(
  `Plugin v${version} generado: ${plugin.commands.length} comandos, ${plugin.agents.length} subagentes, ${plugin.skills.length} skills.`
);
