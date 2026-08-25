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
  "global:grill.md",
  "global:new-feature.md",
  "global:bug-fix.md",
  "global:session-close.md",
  "global:security-audit.md",
  "global:deploy-checklist.md",
  "global:tools-reference.md",
];

/**
 * Subagentes de Claude Code (.claude/agents/*.md). Formato nativo sin
 * equivalente en Antigravity, igual para los 8 stacks.
 */
const CLAUDE_COMMAND_ITEM_IDS = [
  "claude-code:workflow:grill",
  "claude-code:workflow:new-feature",
  "claude-code:workflow:bug-fix",
  "claude-code:workflow:session-close",
  "claude-code:workflow:security-audit",
  "claude-code:workflow:deploy-checklist",
  "claude-code:workflow:tools-reference",
];

const CLAUDE_AGENT_ITEM_IDS = [
  "claude-code:agent:explorer",
  "claude-code:agent:planner",
  "claude-code:agent:code-reviewer",
  "claude-code:agent:ui-reviewer",
  "claude-code:agent:security-auditor",
  "claude-code:agent:debugger",
  "claude-code:agent:test-writer",
  "claude-code:agent:docs-writer",
];

interface StackShape {
  rules: string[];
  skills: string[];
}

const STACKS: Record<string, StackShape> = {
  "nextjs-branded": {
    rules: ["architecture", "ui-ux", "seo", "pwa", "stack-conventions", "security", "operations"],
    skills: ["domain-modeling", "frontend-design", "impeccable", "web-design-guidelines", "vercel-react-best-practices", "vercel-composition-patterns"],
  },
  "nextjs-unbranded": {
    rules: ["architecture", "ui-ux", "seo", "pwa", "stack-conventions", "security", "operations"],
    skills: ["domain-modeling", "frontend-design", "impeccable", "web-design-guidelines", "vercel-react-best-practices", "vercel-composition-patterns"],
  },
  "wordpress-cms": {
    rules: ["cms", "seo", "security", "stack-conventions", "operations"],
    skills: ["domain-modeling", "seo-audit", "web-design-guidelines", "wordpress-block-theming"],
  },
  "fastapi-python": {
    rules: ["architecture", "security", "operations", "stack-conventions"],
    skills: ["domain-modeling", "fastapi", "error-handling-patterns", "api-security-best-practices"],
  },
  "html-plano": {
    rules: ["architecture", "ui-ux", "seo", "stack-conventions", "security", "operations"],
    skills: ["domain-modeling", "web-design-guidelines", "impeccable"],
  },
  "react-spa": {
    rules: ["architecture", "ui-ux", "seo", "pwa", "stack-conventions", "security", "operations"],
    skills: ["domain-modeling", "frontend-design", "impeccable", "web-design-guidelines", "vercel-composition-patterns"],
  },
  vue: {
    rules: ["architecture", "ui-ux", "seo", "pwa", "stack-conventions", "security", "operations"],
    skills: ["domain-modeling", "frontend-design", "impeccable", "web-design-guidelines"],
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
      ...shape.rules.map((r) => `rule:${r}`),
      ...shape.skills.map((s) => `skill:${s}`),
    ];
  }
  return [
    `${tool}:core`,
    ...shape.rules.map((r) => `${tool}:rule:${r}`),
    ...shape.skills.map((s) => `${tool}:skill:${s}`),
    ...(tool === "claude-code" ? [...CLAUDE_COMMAND_ITEM_IDS, ...CLAUDE_AGENT_ITEM_IDS] : []),
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
  "nextjs-branded": [CONTEXT7],
  "nextjs-unbranded": [CONTEXT7],
  "wordpress-cms": [CONTEXT7],
  "fastapi-python": [CONTEXT7],
  "html-plano": [CONTEXT7],
  "react-spa": [CONTEXT7],
  vue: [CONTEXT7],
  manual: [CONTEXT7],
};

const antigravityPresets: Preset[] = Object.keys(STACKS).map((stackId) =>
  buildPreset("antigravity", stackId, ANTIGRAVITY_STACK_TOOLS[stackId] ?? [CONTEXT7])
);

// Claude Code: mismos 8 stacks que Antigravity, contenido nativo (skills + subagentes).
const claudeCodePresets: Preset[] = Object.keys(STACKS).map((stackId) =>
  buildPreset("claude-code", stackId, [SKILLS_SH])
);

export const presets: Preset[] = [...antigravityPresets, ...claudeCodePresets];

export function getPreset(tool: ToolId, id: string): Preset | undefined {
  return presets.find((p) => p.tool === tool && p.id === id);
}

export function getPresetsByTool(tool: ToolId): Preset[] {
  return presets.filter((p) => p.tool === tool);
}

export const TOOLS: { id: ToolId; label: string; description: string }[] = [
  { id: "antigravity", label: "Antigravity (Gemini)", description: "GEMINI.md global + .agents/rules + .agents/skills." },
  { id: "claude-code", label: "Claude Code", description: "CLAUDE.md + .claude/skills + .claude/commands + .claude/agents (subagentes)." },
];
