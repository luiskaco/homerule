export interface PromptTemplate {
  id: string;
  /** Skills que el template referencia — se muestran como chips en la tarjeta. */
  skillRefs: string[];
}

/**
 * Solo ids y referencias. El título, el "cuándo usarlo" y el texto del prompt
 * son contenido de interfaz y viven en `messages/*.json` (`Prompts.items.<id>`),
 * traducidos por locale.
 */
export const PROMPT_TEMPLATES: PromptTemplate[] = [
  { id: "seo-audit", skillRefs: ["seo-audit", "ai-seo"] },
  { id: "seo-image", skillRefs: ["seo-audit", "frontend-design"] },
  { id: "seo-browser-tool", skillRefs: ["agent-browser", "seo-audit"] },
  { id: "frontend-design", skillRefs: ["frontend-design", "impeccable"] },
  { id: "planificacion-modulos", skillRefs: ["brainstorming", "architecture"] },
  { id: "social-media-content", skillRefs: ["ai-seo", "brainstorming"] },
  { id: "video-scripting", skillRefs: ["brainstorming"] },
];
