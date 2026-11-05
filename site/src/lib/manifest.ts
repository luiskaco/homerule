import { readFileSync } from "node:fs";
import { join } from "node:path";

export type ItemCategory = "global" | "rule" | "skill" | "template" | "database" | "command" | "agent";

export type ToolId = "antigravity" | "claude-code" | "hybrid";

export interface ManifestFile {
  destPath: string;
  content: string;
}

export interface ManifestItem {
  id: string;
  category: ItemCategory;
  tool: ToolId;
  label: string;
  description: string;
  install?: string;
  files: ManifestFile[];
  approxTokens: number;
}

/**
 * Server-only accessor (reads public/manifest.json from disk via `fs`).
 * Never import this from a "use client" component — use
 * `fetchManifestItems()` from `@/lib/manifest-client` there instead,
 * so the (large) manifest content isn't bundled into client JS.
 */
let cached: { items: ManifestItem[] } | null = null;

function getManifestSync(): { items: ManifestItem[] } {
  if (!cached) {
    const raw = readFileSync(join(process.cwd(), "public", "manifest.json"), "utf8");
    cached = JSON.parse(raw) as { items: ManifestItem[] };
  }
  return cached;
}

export function getItem(id: string): ManifestItem | undefined {
  return getManifestSync().items.find((i) => i.id === id);
}

export function getItemsByTool(tool: ToolId): ManifestItem[] {
  return getManifestSync().items.filter((i) => i.tool === tool);
}

export function getItemsByCategory(category: ItemCategory): ManifestItem[] {
  return getManifestSync().items.filter((i) => i.category === category);
}
