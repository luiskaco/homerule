import type { ManifestItem, ToolId } from "@/lib/manifest";

/**
 * Navegación del kit (ADR-024): un selector de tool + cuatro secciones. Las tres
 * primeras son rutas estáticas por segmento (`/kits/<tool>/…`); el armador
 * sigue en `/build?tool=` porque es interactivo y ya lee el query.
 */
export const KIT_TOOLS: ToolId[] = ["antigravity", "claude-code", "hybrid"];

export type KitSection = "presets" | "stacks" | "subagents" | "build";

export const KIT_SECTIONS: KitSection[] = ["presets", "stacks", "subagents", "build"];

/** Clave de localStorage con el último tool elegido (lo lee el link "Kits" del nav). */
export const LAST_TOOL_KEY = "kit:last-tool";

/**
 * Evento de window que KitHeader dispara al guardar el tool. En /build el tool
 * va en el query, así que cambiarlo no cambia el pathname y el nav no se
 * enteraría solo.
 */
export const LAST_TOOL_EVENT = "kit:last-tool-change";

export function isToolId(value: string | undefined): value is ToolId {
  return KIT_TOOLS.includes(value as ToolId);
}

export function kitHref(tool: ToolId, section: KitSection, preset?: string): string {
  switch (section) {
    case "presets":
      return `/kits/${tool}`;
    case "stacks":
      return `/kits/${tool}/stacks`;
    case "subagents":
      return `/kits/${tool}/subagentes`;
    case "build":
      return `/build?tool=${tool}&preset=${preset ?? "manual"}`;
  }
}

/** Sección activa a partir del pathname (sin prefijo de idioma). */
export function sectionFromPathname(pathname: string): KitSection | null {
  if (pathname.startsWith("/build")) return "build";
  const match = pathname.match(/^\/kits\/[^/]+(\/[^/]+)?/);
  if (!match) return null;
  if (match[1] === "/stacks") return "stacks";
  if (match[1] === "/subagentes") return "subagents";
  return "presets";
}

/** Tool del pathname `/kits/<tool>/…`, si lo hay. */
export function toolFromPathname(pathname: string): ToolId | null {
  const tool = pathname.match(/^\/kits\/([^/]+)/)?.[1];
  return isToolId(tool) ? tool : null;
}

/**
 * Un color fijo por tool en todo el sitio: esmeralda para Antigravity, violeta
 * para Claude Code y celeste para el híbrido. Las clases van escritas enteras porque Tailwind las detecta
 * escaneando el código: un `bg-${color}-500` armado en runtime no se genera.
 */
export const TOOL_THEME: Record<
  ToolId,
  {
    dot: string;
    text: string;
    hoverText: string;
    tabActive: string;
    soft: string;
    cardHover: string;
    button: string;
    focus: string;
    accent: string;
  }
> = {
  antigravity: {
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    hoverText: "hover:text-emerald-300",
    tabActive: "border-emerald-400 text-white",
    soft: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    cardHover: "hover:border-emerald-500/50",
    button: "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
    focus: "focus-visible:outline-emerald-400",
    accent: "accent-emerald-500",
  },
  "claude-code": {
    dot: "bg-violet-400",
    text: "text-violet-300",
    hoverText: "hover:text-violet-300",
    tabActive: "border-violet-400 text-white",
    soft: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    cardHover: "hover:border-violet-500/50",
    button: "bg-violet-600 text-white hover:bg-violet-500",
    focus: "focus-visible:outline-violet-400",
    accent: "accent-violet-500",
  },
  hybrid: {
    dot: "bg-sky-400",
    text: "text-sky-300",
    hoverText: "hover:text-sky-300",
    tabActive: "border-sky-400 text-white",
    soft: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    cardHover: "hover:border-sky-500/50",
    button: "bg-sky-500 text-slate-950 hover:bg-sky-400",
    focus: "focus-visible:outline-sky-400",
    accent: "accent-sky-500",
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

export function isSkillItem(item: ManifestItem): boolean {
  return item.category === "skill" && !isRuleItem(item);
}
