import { getPresetsByTool } from "@/lib/presets";

export interface StackRef {
  id: string;
  label: string;
}

/** En qué stacks (Antigravity) aparece una skill, derivado de presets.ts. */
export function getStacksForSkill(skillName: string): StackRef[] {
  return getPresetsByTool("antigravity")
    .filter((p) => p.itemIds.includes(`skill:${skillName}`))
    .map((p) => ({ id: p.id, label: p.label }));
}
