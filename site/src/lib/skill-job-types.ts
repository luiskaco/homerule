export type JobTypeId = "seo" | "web" | "backend" | "testing" | "redaccion" | "general";

export interface JobType {
  id: JobTypeId;
  label: string;
  description: string;
}

export const JOB_TYPES: JobType[] = [
  {
    id: "seo",
    label: "SEO",
    description: "Auditoría y optimización para buscadores.",
  },
  {
    id: "web",
    label: "Web / Frontend",
    description: "Diseño de interfaz, UX, performance de UI.",
  },
  {
    id: "backend",
    label: "Backend / API",
    description: "Servicios, APIs, manejo de errores, runtime.",
  },
  {
    id: "testing",
    label: "Testing",
    description: "Escribir y automatizar pruebas — TDD, unitarias, end-to-end.",
  },
  {
    id: "redaccion",
    label: "Redacción",
    description: "Copy, contenido y comunicación persuasiva.",
  },
  {
    id: "general",
    label: "General",
    description: "Transversales — no atadas a una capa técnica.",
  },
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
