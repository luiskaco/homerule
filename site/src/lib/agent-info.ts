import type { ManifestItem } from "@/lib/manifest";

/**
 * Tools que escriben archivos, en los dos formatos. Se detectan sobre el
 * frontmatter real del agente en vez de mantener una lista a mano: así un
 * agente nuevo o un cambio de tools no deja la ficha desactualizada en silencio.
 */
const WRITE_TOOLS = ["write_to_file", "replace_file_content", "multi_replace_file_content", "Write", "Edit", "NotebookEdit"];

/**
 * Agentes que cambian servidores sin escribir archivos (ADR-026). Eso no se ve en
 * las tools del frontmatter (solo tienen el shell), así que se marcan por nombre.
 */
const CHANGES_SERVERS = new Set(["server-operator"]);

function frontmatterOf(item: ManifestItem): string {
  return (item.files[0]?.content ?? "").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
}

/** `auditor/agent.md` → `auditor` · `code-reviewer.md` → `code-reviewer` */
export function agentName(item: ManifestItem): string {
  return item.label.replace(/\/agent\.md$/, "").replace(/\.md$/, "");
}

export type AgentAccess = "readOnly" | "writes" | "servers";

export function agentAccess(item: ManifestItem): AgentAccess {
  if (CHANGES_SERVERS.has(agentName(item))) return "servers";
  const fm = frontmatterOf(item);
  return WRITE_TOOLS.some((tool) => new RegExp(`\\b${tool}\\b`).test(fm)) ? "writes" : "readOnly";
}

export function agentModel(item: ManifestItem): string | null {
  return frontmatterOf(item).match(/^model:\s*(\S+)/m)?.[1] ?? null;
}
