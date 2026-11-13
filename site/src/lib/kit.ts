import type { ManifestItem } from "@/lib/manifest";

/**
 * Herramientas para las que hay kit global (ADR-038, ADR-039). Cada una tiene
 * su JSON en `public/global-kit/<tool>.json`, que arma el generador.
 */
export type KitTool = "claude-code" | "antigravity" | "codex";

export const KIT_TOOLS: KitTool[] = ["claude-code", "antigravity", "codex"];

/** Dónde instala cada kit, dentro de la carpeta personal. */
export const KIT_PATHS: Record<KitTool, string[]> = {
  "claude-code": ["~/.claude/CLAUDE.md", "~/.claude/skills/", "~/.claude/commands/", "~/.claude/agents/", "~/.claude/hooks/"],
  antigravity: ["~/.gemini/GEMINI.md", "~/.gemini/config/rules/", "~/.gemini/config/skills/", "~/.gemini/config/agents/"],
  codex: ["~/.codex/AGENTS.md", "~/.agents/skills/"],
};

/**
 * Un color fijo por herramienta en todo el sitio: violeta Claude Code,
 * esmeralda Antigravity y celeste Codex. Las clases van escritas enteras porque
 * Tailwind las detecta escaneando el código: un `bg-${color}-500` armado en
 * runtime no se genera.
 */
export const TOOL_THEME: Record<KitTool, { text: string; soft: string; dot: string; button: string; focus: string }> = {
  "claude-code": {
    text: "text-violet-300",
    soft: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    dot: "bg-violet-400",
    button: "bg-violet-600 text-white hover:bg-violet-500",
    focus: "focus-visible:outline-violet-400",
  },
  antigravity: {
    text: "text-emerald-300",
    soft: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
    button: "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
    focus: "focus-visible:outline-emerald-400",
  },
  codex: {
    text: "text-sky-300",
    soft: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    dot: "bg-sky-400",
    button: "bg-sky-500 text-slate-950 hover:bg-sky-400",
    focus: "focus-visible:outline-sky-400",
  },
};

/**
 * Las rules de Claude Code viajan como skills nativas (`category: "skill"`,
 * id `claude-code:rule:<id>`), así que la categoría no alcanza para separarlas:
 * se clasifican por id.
 */
export function isRuleItem(item: ManifestItem): boolean {
  return /(^|:)rule:/.test(item.id);
}
