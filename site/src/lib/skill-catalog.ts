import { getItemsByCategory } from "@/lib/manifest";
import { getStacksForSkill, type StackRef } from "@/lib/skill-stacks";
import { EXTERNAL_SKILLS, type ExternalSkillInstall } from "@/lib/external-skills";

/**
 * El catálogo es una página de decisión: entrás, mirás para qué sirve cada
 * skill y elegís cuál instalar para el proyecto que tenés entre manos. No es
 * la descarga — eso es /build.
 *
 * Cada entrada mezcla dos fuentes:
 *  - manifest.json (label, description, install) → generado desde los
 *    SKILL.md del repo, para no duplicar lo que ya vive en el frontmatter.
 *  - HUB_SKILL_META (abajo) → lo que no entra en el frontmatter: autor,
 *    repo, cuándo usarla, cómo se invoca.
 * Las skills externas traen todo en external-skills.ts.
 */

export type SkillOrigin = "hub" | "externa";

export interface CatalogSkill {
  id: string;
  label: string;
  origin: SkillOrigin;
  author: string;
  site?: string;
  repo?: string;
  /** Una línea: qué problema resuelve. */
  summary: string;
  /** Párrafo: qué hace en la práctica. Opcional si el summary alcanza. */
  whatItDoes?: string;
  whenToUse: string[];
  includes?: { name: string; description: string }[];
  install: ExternalSkillInstall[];
  usage: string[];
  notes?: string[];
  /** Stacks de /build que ya la traen incluida (solo skills del hub). */
  stacks: StackRef[];
}

interface HubSkillMeta {
  author: string;
  repo?: string;
  whenToUse: string[];
  usage: string[];
  notes?: string[];
  /** Sobrescribe el comando del frontmatter cuando no hay uno. */
  installOverride?: ExternalSkillInstall[];
}

const HUB_SKILL_META: Record<string, HubSkillMeta> = {
  "ai-seo": {
    author: "Anthropic — nativa de Claude Code",
    whenToUse: [
      "Optimizar contenido para que aparezca citado en AI Overviews, ChatGPT, Perplexity, Claude o Gemini.",
      "Portales de contenido o reportes donde la visibilidad en IA ya pesa tanto como el SEO clásico.",
      "Cuando se menciona AEO, GEO, llms.txt o zero-click search.",
    ],
    usage: [
      "Se activa sola al pedir optimización para motores de IA.",
      "Complementa a seo-audit, no la reemplaza: una cubre indexación/crawl clásico, la otra citabilidad por LLMs.",
    ],
    installOverride: [
      {
        tool: "Claude Code",
        command: "— ya viene disponible",
        note: "Skill nativa de Claude Code, no publicada en el registro de npx skills add. No requiere instalación.",
      },
    ],
  },
  brainstorming: {
    author: "obra/superpowers",
    repo: "https://github.com/obra/superpowers",
    whenToUse: [
      "Antes de cualquier trabajo creativo: crear features, construir componentes, agregar funcionalidad o cambiar comportamiento.",
      "Cuando la idea todavía es difusa y hace falta convertirla en un diseño concreto antes de escribir código.",
    ],
    usage: [
      "Hace preguntas de a una para refinar la idea, presenta el diseño y espera tu aprobación.",
      "Tiene un hard gate: no escribe código ni scaffolding hasta que apruebes el diseño — incluso en proyectos que parecen triviales.",
    ],
  },
  "error-handling-patterns": {
    author: "wshobson/agents",
    repo: "https://github.com/wshobson/agents",
    whenToUse: [
      "Implementar manejo de errores en features nuevas.",
      "Diseñar APIs resilientes a fallos.",
      "Debuggear problemas de producción o mejorar la confiabilidad de la app.",
      "Implementar retry, circuit breaker o manejo de errores async/concurrentes.",
    ],
    usage: [
      "Se activa sola al implementar manejo de errores o diseñar APIs.",
      "Cubre excepciones, tipos Result, propagación de errores y degradación elegante — transversal a lenguajes.",
    ],
  },
  fastapi: {
    author: "Equipo oficial de FastAPI",
    repo: "https://github.com/fastapi/fastapi",
    whenToUse: [
      "Cualquier trabajo sobre un backend FastAPI o modelos Pydantic.",
    ],
    usage: [
      "Activación automática: se dispara sola al tocar archivos .py que usen FastAPI o Pydantic.",
    ],
    notes: [
      "Es la skill del repositorio oficial — se mantiene actualizada con cada versión del framework.",
    ],
  },
  "frontend-design": {
    author: "Anthropic",
    repo: "https://github.com/anthropics/skills",
    whenToUse: [
      "Al iniciar cualquier UI nueva, tenga o no el proyecto un sistema de diseño definido.",
      "Al rediseñar una interfaz existente que se ve como un default genérico de framework.",
    ],
    usage: [
      "Si ya hay sistema de diseño (brief de marca, paleta, tipografía) refina decisiones dentro de ese sistema.",
      "Si no lo hay, infiere una dirección coherente a partir del brief y el contexto del proyecto.",
    ],
  },
  impeccable: {
    author: "Paul Bakaus",
    repo: "https://github.com/pbakaus/impeccable",
    whenToUse: [
      "Auditar, pulir, criticar o mejorar una interfaz que ya existe.",
      "Pase final de calidad antes de shipear.",
    ],
    usage: [
      "Se invoca por comando: /impeccable <comando> — audit (a11y, performance, responsive), critique (jerarquía, claridad), polish (pase final), harden (errores, i18n, overflow, edge cases), entre 23 en total.",
    ],
    notes: [
      "205K+ instalaciones en skills.sh.",
      "El repo publica cada comando como skill individual, si no querés el paquete completo.",
    ],
  },
  "prisma-database-setup": {
    author: "Equipo oficial de Prisma",
    repo: "https://github.com/prisma/skills",
    whenToUse: [
      "Iniciar un proyecto nuevo con Prisma.",
      "Diseñar o modificar modelos en schema.prisma.",
      "Configurar el datasource (PostgreSQL, MySQL, SQLite...) o correr prisma migrate por primera vez.",
    ],
    usage: [
      "Se activa sola al tocar schema.prisma o configurar migraciones.",
    ],
    notes: [
      "Especialmente útil en schemas relacionales grandes, donde un mal diseño temprano se paga caro después.",
    ],
  },
  "seo-audit": {
    author: "coreyhaines31/marketingskills",
    repo: "https://github.com/coreyhaines31/marketingskills",
    whenToUse: [
      "Caídas de tráfico o de ranking.",
      "Páginas que no indexan, errores de crawl, dudas de on-page SEO.",
      "Pedidos vagos tipo \"revisá el SEO de esto\".",
    ],
    usage: [
      "Diagnóstico únicamente — no aplica cambios.",
      "Los umbrales y specs concretos del proyecto viven en .agents/rules/seo.md y tienen prioridad sobre cualquier sugerencia genérica de la skill.",
    ],
    notes: [
      "Se instala solo seo-audit, no el paquete de marketing completo.",
    ],
  },
  "vercel-composition-patterns": {
    author: "Vercel Engineering",
    repo: "https://github.com/vercel-labs/agent-skills",
    whenToUse: [
      "Un componente acumuló muchos props booleanos (isOpen, showFooter, variant...) que empiezan a combinarse de formas inválidas.",
      "Diseñar desde cero la API pública de un componente reutilizable.",
    ],
    usage: [
      "Propone slots, compound components y render props al estilo shadcn/ui en vez de flags.",
    ],
  },
  "vercel-react-best-practices": {
    author: "Vercel Engineering",
    repo: "https://github.com/vercel-labs/agent-skills",
    whenToUse: [
      "Escribir componentes React o páginas Next.js nuevas.",
      "Implementar data fetching (cliente o servidor).",
      "Revisar o refactorizar código buscando problemas de performance.",
      "Optimizar bundle size o tiempos de carga.",
    ],
    usage: [
      "70 reglas en 8 categorías, priorizadas por impacto — pensadas para guiar refactors automáticos.",
    ],
  },
  "web-design-guidelines": {
    author: "Vercel Engineering",
    repo: "https://github.com/vercel-labs/agent-skills",
    whenToUse: [
      "Revisar UI, verificar accesibilidad, auditar diseño o chequear cumplimiento de estándares de interfaz.",
    ],
    usage: [
      "Descarga las Web Interface Guidelines actualizadas y revisa los archivos indicados contra todas sus reglas.",
      "Reporta en formato archivo:línea — descripción del issue.",
    ],
  },
  "wordpress-block-theming": {
    author: "Automattic",
    repo: "https://github.com/automattic/wordpress-agent-skills",
    whenToUse: [
      "Construir o modificar un theme de WordPress basado en bloques (Full Site Editing).",
      "Configurar theme.json — paleta, tipografía, spacing.",
      "Trabajar con templates/*.html, parts/*.html, block patterns o bloques custom.",
    ],
    usage: [
      "No aplica a themes clásicos basados solo en PHP (index.php, header.php...).",
    ],
    notes: [
      "Skill oficial de la empresa detrás de WordPress.com y WooCommerce — la fuente más directa para convenciones de theming con bloques.",
    ],
  },
};

/** Primera oración de la descripción — sirve de resumen de una línea. */
function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return (match ? match[0] : trimmed).trim();
}

/** Lo que queda de la descripción después del resumen. */
function restOfText(text: string, summary: string): string | undefined {
  const rest = text.trim().slice(summary.length).trim();
  return rest.length > 0 ? rest : undefined;
}

export function getCatalogSkills(): CatalogSkill[] {
  const hub: CatalogSkill[] = getItemsByCategory("skill")
    .filter((i) => i.tool === "antigravity")
    .map((item) => {
      const meta = HUB_SKILL_META[item.label];
      const description = item.description || item.label;
      const summary = firstSentence(description);

      return {
        id: item.id,
        label: item.label,
        origin: "hub" as const,
        author: meta?.author ?? "—",
        repo: meta?.repo,
        summary,
        whatItDoes: restOfText(description, summary),
        whenToUse: meta?.whenToUse ?? [],
        install:
          meta?.installOverride ??
          (item.install
            ? [{ tool: "Claude Code / Antigravity", command: item.install }]
            : []),
        usage: meta?.usage ?? [],
        notes: meta?.notes,
        stacks: getStacksForSkill(item.label),
      };
    });

  const externas: CatalogSkill[] = EXTERNAL_SKILLS.map((skill) => ({
    id: skill.id,
    label: skill.label,
    origin: "externa" as const,
    author: skill.author,
    site: skill.site,
    repo: skill.repo,
    summary: skill.summary,
    whatItDoes: skill.whatItDoes,
    whenToUse: skill.whenToUse,
    includes: skill.includes,
    install: skill.install,
    usage: skill.usage,
    notes: skill.notes,
    stacks: [],
  }));

  return [...hub, ...externas].sort((a, b) => a.label.localeCompare(b.label));
}
