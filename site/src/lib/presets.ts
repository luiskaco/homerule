import type { ToolId } from "@/lib/manifest";

export interface ExternalTool {
  /** Clave de `ExternalTools.<id>` en messages — de ahí salen nombre y nota. */
  id: string;
  installCommand: string;
}

export interface Preset {
  /** Clave de `StackLabels.<id>` en messages — de ahí salen label y descripción. */
  id: string;
  tool: ToolId;
  /** Manifest item ids preselected for this stack (global/core items are added automatically). */
  itemIds: string[];
  externalTools: ExternalTool[];
}

const CONTEXT7: ExternalTool = {
  id: "context7",
  installCommand: "npx ctx7 setup",
};

const SKILLS_SH: ExternalTool = {
  id: "skillsSh",
  installCommand: "npx skills add <owner/repo> --skill <nombre>",
};

/**
 * Antigravity-only global items: GEMINI.md (va a `~/.gemini/`) y AGENTS.md (va a
 * la raíz del proyecto, para que otra IA pueda continuarlo). Los comandos ya no
 * son globales: desde ADR-020 son skills de workspace (`.agents/skills/`).
 */
const ANTIGRAVITY_GLOBAL_ITEM_IDS = ["global:GEMINI.md", "antigravity:agents-md"];

/** Comandos de Antigravity: los 7 workflows, ahora skills de workspace (ADR-020). */
const ANTIGRAVITY_COMMAND_ITEM_IDS = [
  "antigravity:workflow:grill",
  "antigravity:workflow:new-feature",
  "antigravity:workflow:bug-fix",
  "antigravity:workflow:session-close",
  "antigravity:workflow:security-audit",
  "antigravity:workflow:deploy-checklist",
  "antigravity:workflow:tools-reference",
];

/**
 * Comandos y subagentes de Claude Code (.claude/commands/*, .claude/agents/*.md),
 * iguales para los 8 stacks. Antigravity tiene sus propios subagentes en formato
 * nativo (.agents/agents/<name>/agent.md); los dos catálogos no se mezclan.
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
  "claude-code:agent:planner",
  "claude-code:agent:code-reviewer",
  "claude-code:agent:ui-reviewer",
  "claude-code:agent:security-auditor",
  "claude-code:agent:db-migration-reviewer",
  "claude-code:agent:debugger",
  "claude-code:agent:test-writer",
  "claude-code:agent:web-researcher",
];

const ANTIGRAVITY_AGENT_ITEM_IDS = [
  "antigravity:agent:auditor",
  "antigravity:agent:backend",
  "antigravity:agent:frontend",
  "antigravity:agent:security",
  "antigravity:agent:web-researcher",
];

interface StackShape {
  rules: string[];
  skills: string[];
}

const STACKS: Record<string, StackShape> = {
  "nextjs-branded": {
    rules: ["architecture", "ui-ux", "seo", "pwa", "stack-conventions", "security", "operations"],
    skills: ["domain-modeling", "prelaunch-compliance-audit", "frontend-design", "impeccable", "web-design-guidelines", "vercel-react-best-practices", "vercel-composition-patterns"],
  },
  "nextjs-unbranded": {
    rules: ["architecture", "ui-ux", "seo", "pwa", "stack-conventions", "security", "operations"],
    skills: ["domain-modeling", "prelaunch-compliance-audit", "frontend-design", "impeccable", "web-design-guidelines", "vercel-react-best-practices", "vercel-composition-patterns"],
  },
  "wordpress-cms": {
    rules: ["cms", "seo", "security", "stack-conventions", "operations"],
    skills: ["domain-modeling", "prelaunch-compliance-audit", "seo-audit", "web-design-guidelines", "wordpress-block-theming"],
  },
  "fastapi-python": {
    rules: ["architecture", "security", "operations", "stack-conventions"],
    skills: ["domain-modeling", "prelaunch-compliance-audit", "fastapi", "error-handling-patterns", "api-security-best-practices"],
  },
  "html-plano": {
    rules: ["architecture", "ui-ux", "seo", "stack-conventions", "security", "operations"],
    skills: ["domain-modeling", "prelaunch-compliance-audit", "web-design-guidelines", "impeccable"],
  },
  "react-spa": {
    rules: ["architecture", "ui-ux", "seo", "pwa", "stack-conventions", "security", "operations"],
    skills: ["domain-modeling", "prelaunch-compliance-audit", "frontend-design", "impeccable", "web-design-guidelines", "vercel-composition-patterns"],
  },
  vue: {
    rules: ["architecture", "ui-ux", "seo", "pwa", "stack-conventions", "security", "operations"],
    skills: ["domain-modeling", "prelaunch-compliance-audit", "frontend-design", "impeccable", "web-design-guidelines"],
  },
  manual: { rules: [], skills: [] },
};

function toolItemIds(tool: ToolId, shape: StackShape): string[] {
  if (tool === "antigravity") {
    return [
      ...ANTIGRAVITY_GLOBAL_ITEM_IDS,
      ...ANTIGRAVITY_COMMAND_ITEM_IDS,
      ...shape.rules.map((r) => `rule:${r}`),
      ...shape.skills.map((s) => `skill:${s}`),
      ...ANTIGRAVITY_AGENT_ITEM_IDS,
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
  return {
    id: stackId,
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

/** Label y descripción salen de `Tools.<id>` en messages. */
export const TOOLS: { id: ToolId }[] = [{ id: "antigravity" }, { id: "claude-code" }];
