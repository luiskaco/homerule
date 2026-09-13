/**
 * Skills de terceros que no vienen en el ZIP de /build — se instalan aparte,
 * con su propio comando.
 *
 * Igual que `skill-catalog.ts`: acá va solo la estructura (links y comandos).
 * La prosa vive traducida en `messages/*.json` bajo `SkillData.<id>`.
 */
export interface ExternalSkill {
  /** Clave de `SkillData.<id>` en messages. */
  id: string;
  label: string;
  site: string;
  repo: string;
  /** Comandos por índice — el `tool` y la `note` de cada uno están en messages. */
  installCommands: string[];
}

export const EXTERNAL_SKILLS: ExternalSkill[] = [
  {
    id: "hallmark",
    label: "hallmark",
    site: "https://www.usehallmark.com/",
    repo: "https://github.com/nutlope/hallmark",
    installCommands: [
      "npx skills add nutlope/hallmark",
      "SKILL.md + references/ → ~/.claude/skills/hallmark/",
    ],
  },
  {
    id: "emilkowalski-skills",
    label: "emilkowalski/skills",
    site: "https://emilkowal.ski/skill",
    repo: "https://github.com/emilkowalski/skill",
    installCommands: ["npx skills@latest add emilkowalski/skills"],
  },
  {
    id: "ui-ux-pro-max",
    label: "ui-ux-pro-max",
    site: "https://www.uupm.cc/#styles",
    repo: "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill",
    installCommands: [
      "/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill\n/plugin install ui-ux-pro-max@ui-ux-pro-max-skill",
      "npm install -g ui-ux-pro-max-cli\ncd /ruta/a/tu/proyecto\nuipro init --ai claude       # Claude Code\nuipro init --ai antigravity  # Antigravity",
      "uipro init --ai claude --global",
    ],
  },
  {
    id: "webapp-testing",
    label: "webapp-testing",
    site: "https://skills.sh/s/anthropics/skills/webapp-testing",
    repo: "https://github.com/anthropics/skills",
    installCommands: ["npx skills add anthropics/skills --skill webapp-testing"],
  },
  {
    id: "test-driven-development",
    label: "test-driven-development",
    site: "https://skills.sh/s/obra/superpowers/test-driven-development",
    repo: "https://github.com/obra/superpowers",
    installCommands: ["npx skills add obra/superpowers --skill test-driven-development"],
  },
  {
    id: "copywriting",
    label: "copywriting",
    site: "https://skills.sh/s/coreyhaines31/marketingskills/copywriting",
    repo: "https://github.com/coreyhaines31/marketingskills",
    installCommands: ["npx skills add coreyhaines31/marketingskills --skill copywriting"],
  },
];
