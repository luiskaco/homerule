export type JobTypeId = "seo" | "web" | "backend" | "testing" | "redaccion" | "general";

export interface JobType {
  id: JobTypeId;
}

/**
 * Solo los ids y su orden de presentación. El label y la descripción de cada
 * tipo de trabajo son texto de interfaz: viven en `messages/*.json`
 * (`SkillCatalog.jobType.<id>`), no acá.
 */
export const JOB_TYPES: JobType[] = [
  { id: "seo" },
  { id: "web" },
  { id: "backend" },
  { id: "testing" },
  { id: "redaccion" },
  { id: "general" },
];

/** Many-to-many: una skill puede servir para más de un tipo de proyecto. */
export const SKILL_JOB_TYPES: Record<string, JobTypeId[]> = {
  "seo-audit": ["seo"],
  "ai-seo": ["seo"],
  "frontend-design": ["web"],
  impeccable: ["web"],
  "vercel-react-best-practices": ["web"],
  "vercel-composition-patterns": ["web"],
  "web-design-guidelines": ["web"],
  "wordpress-block-theming": ["web"],
  "ui-patterns": ["web"],
  fastapi: ["backend"],
  "prisma-database-setup": ["backend"],
  "error-handling-patterns": ["backend", "general"],
  brainstorming: ["general"],
  "webapp-testing": ["testing"],
  "test-driven-development": ["testing"],
  copywriting: ["redaccion"],
};

export function getJobTypesForSkill(skillName: string): JobType[] {
  const ids = SKILL_JOB_TYPES[skillName] ?? [];
  return JOB_TYPES.filter((jt) => ids.includes(jt.id));
}

export function getSkillNamesForJobType(jobType: JobTypeId): string[] {
  return Object.entries(SKILL_JOB_TYPES)
    .filter(([, ids]) => ids.includes(jobType))
    .map(([name]) => name);
}
