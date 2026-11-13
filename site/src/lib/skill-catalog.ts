import { getItemsByCategory } from "@/lib/manifest";
import { EXTERNAL_SKILLS } from "@/lib/external-skills";

/**
 * El catálogo es una página de decisión: entrás, mirás para qué sirve cada
 * skill y elegís cuál instalar para el proyecto que tenés entre manos. No es
 * la descarga: las skills del hub vienen en el kit global de /instalar.
 *
 * Acá vive solo la estructura: id, label, origen, links, comandos de
 * instalación. Toda la prosa (autor, resumen, cuándo usarla, cómo se
 * invoca, notas) es contenido de interfaz y vive traducida en
 * `messages/*.json`, bajo `SkillData.<id>` — `SkillCard` la lee de ahí.
 */

export type SkillOrigin = "hub" | "externa";

export interface CatalogSkill {
  /** Clave de `SkillData.<id>` en messages. */
  id: string;
  label: string;
  origin: SkillOrigin;
  site?: string;
  repo?: string;
  /** Comandos por índice — el `tool` y la `note` de cada uno están en messages. */
  installCommands: string[];
}

/** Repos de las skills del hub que tienen uno propio. */
const HUB_SKILL_REPOS: Record<string, string> = {
  "api-security-best-practices": "https://github.com/sickn33/antigravity-awesome-skills",
  brainstorming: "https://github.com/obra/superpowers",
  "error-handling-patterns": "https://github.com/wshobson/agents",
  fastapi: "https://github.com/fastapi/fastapi",
  "frontend-design": "https://github.com/anthropics/skills",
  impeccable: "https://github.com/pbakaus/impeccable",
  "prisma-database-setup": "https://github.com/prisma/skills",
  "seo-audit": "https://github.com/coreyhaines31/marketingskills",
  "vercel-composition-patterns": "https://github.com/vercel-labs/agent-skills",
  "vercel-react-best-practices": "https://github.com/vercel-labs/agent-skills",
  "web-design-guidelines": "https://github.com/vercel-labs/agent-skills",
  "wordpress-block-theming": "https://github.com/automattic/wordpress-agent-skills",
};

export function getCatalogSkills(): CatalogSkill[] {
  const hub: CatalogSkill[] = getItemsByCategory("skill")
    .filter((i) => i.tool === "antigravity")
    .map((item) => ({
      id: item.id,
      label: item.label,
      origin: "hub" as const,
      repo: HUB_SKILL_REPOS[item.label],
      installCommands: item.install ? [item.install] : [],
    }));

  const externas: CatalogSkill[] = EXTERNAL_SKILLS.map((skill) => ({
    id: skill.id,
    label: skill.label,
    origin: "externa" as const,
    site: skill.site,
    repo: skill.repo,
    installCommands: skill.installCommands,
  }));

  return [...hub, ...externas].sort((a, b) => a.label.localeCompare(b.label));
}
