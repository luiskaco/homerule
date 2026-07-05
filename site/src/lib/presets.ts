import type { ToolId } from "@/lib/manifest";

export interface ExternalTool {
  name: string;
  installCommand: string;
  note?: string;
}

export interface Preset {
  id: string;
  label: string;
  description: string;
  tool: ToolId;
  /** Manifest item ids preselected for this stack (global/core items are added automatically). */
  itemIds: string[];
  externalTools: ExternalTool[];
}

const TEMPLATE_ITEM_IDS = [
  "template:00_GEMINI_START",
  "template:01_PROJECT_PRD",
  "template:02_SDD",
  "template:03_SYSTEM_SPEC",
  "template:04_DATA_MODEL",
  "template:05_ARCHITECTURE",
  "template:06_TASKS",
  "template:07_DECISIONS",
  "template:08_CHANGELOG",
];

const CONTEXT7: ExternalTool = {
  name: "Context7 MCP",
  installCommand: "npx ctx7 setup",
  note: "Documentación de librerías en tiempo real, por proyecto.",
};

const SKILLS_SH: ExternalTool = {
  name: "Más skills en skills.sh",
  installCommand: "npx skills add <owner/repo> --skill <nombre>",
  note: "Directorio de skills de la comunidad compatible con este agente — https://www.skills.sh/",
};

/** Antigravity-only global workflow items (GEMINI.md + comandos manuales). */
const ANTIGRAVITY_GLOBAL_ITEM_IDS = [
  "global:GEMINI.md",
  "global:new-feature.md",
  "global:bug-fix.md",
  "global:session-close.md",
  "global:security-audit.md",
  "global:deploy-checklist.md",
  "global:tools-reference.md",
];

interface StackShape {
  rules: string[];
  skills: string[];
}

const STACKS: Record<string, StackShape> = {
  "nextjs-branded": {
    rules: ["architecture", "ui-ux", "stack-conventions", "security", "operations"],
    skills: ["frontend-design", "impeccable", "web-design-guidelines", "vercel-react-best-practices", "react-best-practices", "nodejs"],
  },
  "nextjs-unbranded": {
    rules: ["architecture", "ui-ux", "stack-conventions", "security", "operations"],
    skills: ["ui-ux-pro-max", "impeccable", "web-design-guidelines", "vercel-react-best-practices", "react-best-practices", "nodejs"],
  },
  "wordpress-cms": {
    rules: ["cms", "security", "stack-conventions", "operations"],
    skills: ["seo-audit", "web-design-guidelines"],
  },
  "fastapi-python": {
    rules: ["architecture", "security", "operations", "stack-conventions"],
    skills: ["fastapi", "error-handling-patterns"],
  },
  "html-plano": {
    rules: ["architecture", "ui-ux", "stack-conventions", "security", "operations"],
    skills: ["web-design-guidelines", "impeccable"],
  },
  "react-spa": {
    rules: ["architecture", "ui-ux", "stack-conventions", "security", "operations"],
    skills: ["frontend-design", "impeccable", "web-design-guidelines", "react-best-practices", "nodejs"],
  },
  vue: {
    rules: ["architecture", "ui-ux", "stack-conventions", "security", "operations"],
    skills: ["frontend-design", "impeccable", "web-design-guidelines", "nodejs"],
  },
  manual: { rules: [], skills: [] },
};

const STACK_LABELS: Record<string, { label: string; description: string }> = {
  "nextjs-branded": {
    label: "Next.js / React — con sistema de diseño",
    description: "Proyecto Next.js que ya tiene brand, paleta y tipografía definidos (caso habitual en Orange Latam).",
  },
  "nextjs-unbranded": {
    label: "Next.js / React — sin sistema de diseño",
    description: "Proyecto Next.js arrancando de cero, sin brief de marca ni paleta todavía.",
  },
  "wordpress-cms": {
    label: "WordPress / CMS",
    description: "Sitio WordPress puro o headless (Sanity, Contentful, Strapi).",
  },
  "fastapi-python": {
    label: "FastAPI / Python",
    description: "Backend Python con FastAPI.",
  },
  "html-plano": {
    label: "HTML / CSS / JS plano",
    description: "Sitio estático sin framework — HTML, CSS puro y Vanilla JS.",
  },
  "react-spa": {
    label: "React — SPA (sin Next.js)",
    description: "Proyecto React puro (Vite/CRA), sin framework full-stack.",
  },
  vue: {
    label: "Vue",
    description: "Proyecto Vue (Composition API + Pinia).",
  },
  manual: {
    label: "Manual / desde cero",
    description: "Sin preselección — elegís cada pieza a mano.",
  },
};

function toolItemIds(tool: ToolId, shape: StackShape): string[] {
  if (tool === "antigravity") {
    return [
      ...ANTIGRAVITY_GLOBAL_ITEM_IDS,
      ...TEMPLATE_ITEM_IDS,
      ...shape.rules.map((r) => `rule:${r}`),
      ...shape.skills.map((s) => `skill:${s}`),
    ];
  }
  return [
    `${tool}:core`,
    ...TEMPLATE_ITEM_IDS,
    ...shape.rules.map((r) => `${tool}:rule:${r}`),
    ...shape.skills.map((s) => `${tool}:skill:${s}`),
  ];
}

function buildPreset(tool: ToolId, stackId: keyof typeof STACKS, externalTools: ExternalTool[]): Preset {
  const meta = STACK_LABELS[stackId];
  return {
    id: stackId,
    label: meta.label,
    description: meta.description,
    tool,
    itemIds: toolItemIds(tool, STACKS[stackId]),
    externalTools,
  };
}

const ANTIGRAVITY_STACK_TOOLS: Record<string, ExternalTool[]> = {
  "nextjs-branded": [
    {
      name: "vercel-composition-patterns",
      installCommand: "npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns",
      note: "Refactorizar componentes con muchos props booleanos, diseñar APIs de componentes reutilizables (shadcn/ui).",
    },
    CONTEXT7,
  ],
  "nextjs-unbranded": [
    {
      name: "ui-ux-pro-max CLI",
      installCommand: "npm install -g uipro-cli && uipro init --ai antigravity",
      note: "⚠️ Riesgo Medium — ejecuta scripts Python vía shell sin sandboxing. Usar solo si el proyecto no tiene todavía un sistema de diseño definido.",
    },
    {
      name: "vercel-composition-patterns",
      installCommand: "npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns",
    },
    CONTEXT7,
  ],
  "wordpress-cms": [CONTEXT7],
  "fastapi-python": [CONTEXT7],
  "html-plano": [CONTEXT7],
  "react-spa": [CONTEXT7],
  vue: [CONTEXT7],
  manual: [
    {
      name: "vercel-composition-patterns",
      installCommand: "npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns",
    },
    {
      name: "ui-ux-pro-max CLI",
      installCommand: "npm install -g uipro-cli && uipro init --ai antigravity",
      note: "⚠️ Riesgo Medium — ver advertencia de seguridad.",
    },
    CONTEXT7,
  ],
};

const antigravityPresets: Preset[] = Object.keys(STACKS).map((stackId) =>
  buildPreset("antigravity", stackId, ANTIGRAVITY_STACK_TOOLS[stackId] ?? [CONTEXT7])
);

// Claude Code y Cursor: mismos 8 stacks, contenido nativo (skills / .cursor rules).
const claudeCodePresets: Preset[] = Object.keys(STACKS).map((stackId) =>
  buildPreset("claude-code", stackId, [SKILLS_SH])
);

const cursorPresets: Preset[] = Object.keys(STACKS).map((stackId) =>
  buildPreset("cursor", stackId, [SKILLS_SH])
);

// Codex y OpenCode: MVP solo con preset Manual — el checklist de /build permite armar a mano.
const codexPresets: Preset[] = [buildPreset("codex", "manual", [SKILLS_SH])];
const opencodePresets: Preset[] = [buildPreset("opencode", "manual", [SKILLS_SH])];

export const presets: Preset[] = [
  ...antigravityPresets,
  ...claudeCodePresets,
  ...cursorPresets,
  ...codexPresets,
  ...opencodePresets,
];

export function getPreset(tool: ToolId, id: string): Preset | undefined {
  return presets.find((p) => p.tool === tool && p.id === id);
}

export function getPresetsByTool(tool: ToolId): Preset[] {
  return presets.filter((p) => p.tool === tool);
}

export const TOOLS: { id: ToolId; label: string; description: string }[] = [
  { id: "antigravity", label: "Antigravity (Gemini)", description: "GEMINI.md global + .agents/rules + .agents/skills." },
  { id: "claude-code", label: "Claude Code", description: "CLAUDE.md + .claude/skills + .claude/commands." },
  { id: "codex", label: "Codex CLI", description: "AGENTS.md + .codex/skills (comandos custom deprecados en Codex)." },
  { id: "opencode", label: "OpenCode", description: "AGENTS.md + .opencode/skills + .opencode/commands." },
  { id: "cursor", label: "Cursor", description: ".cursor/rules/*.mdc + .cursor/commands." },
];
