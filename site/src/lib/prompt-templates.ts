export interface PromptTemplate {
  id: string;
  title: string;
  whenToUse: string;
  skillRefs: string[];
  template: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "seo-audit",
    title: "Auditoría SEO de un sitio (con link)",
    whenToUse:
      "Cuando compartís la URL de un sitio (propio o de un cliente) y pedís que se audite o diagnostique el SEO.",
    skillRefs: ["seo-audit", "ai-seo"],
    template: `# Rol
Actuás como experto en SEO técnico y en AEO/GEO (que el contenido sea citado por IA).

# Contexto
- Sitio a auditar: [URL]
- Qué es: [tipo de sitio / stack / negocio]
- Objetivo: [rankear, generar leads, ser citado por IA, todo]

# Tarea
1. Usá \`seo-audit\` para el diagnóstico técnico (meta tags, indexación, Core Web Vitals, structured data, canonical/hreflang).
2. Usá \`ai-seo\` para evaluar citabilidad por IA (AI Overviews, ChatGPT, Perplexity): estructura del contenido, llms.txt, extraibilidad.

# Reglas
- Diagnóstico primero — NO apliques cambios todavía.
- Priorizá los hallazgos por severidad: Critical / High / Medium.
- Si hay reglas del proyecto en \`.agents/rules/seo.md\`, esos umbrales mandan sobre los defaults de la skill.
- Esperá mi aprobación antes de tocar nada.`,
  },
  {
    id: "seo-image",
    title: "Crear imagen optimizada para SEO",
    whenToUse:
      "Cuando necesitás generar una imagen (Open Graph, hero, ilustración) que además cumpla las specs de SEO.",
    skillRefs: ["seo-audit", "frontend-design"],
    template: `# Rol
Actuás como diseñador visual con criterio de SEO técnico.

# Contexto
- Página/artículo destino: [URL o título]
- Tema y mensaje clave: [de qué trata]
- Marca/estilo: [paleta, tipografía, tono — o "inferí una dirección coherente"]
- Uso: [Open Graph / hero / thumbnail / ilustración inline]

# Specs obligatorias (SEO)
- Open Graph: 1200×630 px, < 1 MB, JPG o PNG.
- Sin texto crítico incrustado en la imagen (no es indexable) — el texto va en el HTML.
- Entregame también:
  - Nombre de archivo en kebab-case, descriptivo con la keyword (ej. \`reporte-meta-ads-orange-latam.jpg\`).
  - \`alt\` descriptivo (no "imagen1"), con la keyword principal de forma natural.

# Tarea
Proponé el concepto visual y generá la imagen. Si hay reglas en \`.agents/rules/seo.md\`, sus specs de imagen OG mandan sobre estas.`,
  },
  {
    id: "seo-browser-tool",
    title: "SEO con herramienta que usa el navegador",
    whenToUse:
      "Cuando el diagnóstico SEO requiere operar una herramienta web (Ahrefs, Semrush, Search Console, PageSpeed) automatizando el navegador.",
    skillRefs: ["agent-browser", "seo-audit"],
    template: `# Rol
Actuás como analista SEO que opera herramientas web vía navegador.

# Contexto
- Sitio: [URL]
- Herramienta a usar: [Ahrefs / Semrush / Search Console / PageSpeed Insights / otra]
- Qué necesito medir: [backlinks, keywords, Core Web Vitals, cobertura de indexación, etc.]
- Acceso: [ya estoy logueado en el navegador / credenciales / es pública]

# Tarea
1. Usá \`agent-browser\` para abrir la herramienta y navegar hasta el reporte que necesito.
2. Extraé los datos concretos (números, no capturas) y, si aplica, tomá screenshot como respaldo.
3. Cruzá los hallazgos con \`seo-audit\` para interpretarlos y priorizarlos.

# Reglas
- No toques configuración ni ejecutes acciones destructivas en la herramienta — solo lectura/navegación.
- Si algo requiere login y no hay sesión activa, pará y avisá — no inventes credenciales.
- Entregame los datos + una lista priorizada de acciones (Critical/High/Medium).`,
  },
  {
    id: "frontend-design",
    title: "Pedido de diseño de UI",
    whenToUse:
      "Cuando le pedís a Claude que diseñe o rediseñe una pantalla/componente — la estructura mínima antes de la tarea puntual.",
    skillRefs: ["frontend-design", "impeccable"],
    template: `# Rol
Actuás como diseñador líder de un estudio boutique — buscás una identidad visual propia, no un default de framework.

# Contexto
- Proyecto: [nombre / stack]
- Sistema de diseño: [ya existe: paleta/tipografía/marca — o "no existe, inferí una dirección coherente"]
- Público y objetivo de la pantalla: [quién la usa y para qué]

# Tarea
[Pantalla o componente a diseñar]

# Flujo
1. Usá \`frontend-design\` para la dirección estética (tipografía, jerarquía, paleta).
2. Cuando esté el primer pase, pasalo por \`impeccable\` (\`polish\` y \`harden\`) antes de darlo por terminado.
3. Si el proyecto ya tiene sistema de diseño, refiná dentro de él — no lo reinventes.`,
  },
  {
    id: "planificacion-modulos",
    title: "Planificación de módulos de un sistema",
    whenToUse:
      "Cuando vas a diseñar la arquitectura o los módulos de un sistema nuevo (o una feature grande) antes de escribir código.",
    skillRefs: ["brainstorming", "architecture"],
    template: `# Rol
Actuás como arquitecto de software senior.

# Contexto
- Sistema/feature a planificar: [nombre y objetivo]
- Stack y restricciones: [tecnologías, límites]
- Qué ya existe hoy: [módulos actuales, deuda técnica]

# Tarea
Usá \`brainstorming\` para explorar intención y requisitos antes de proponer módulos — no asumas que "es simple" y te saltees el paso.

Entregame:
1. Los módulos/capas principales y la responsabilidad de cada uno (sin código todavía).
2. Cómo se comunican entre sí (dependencias, contratos, flujo de datos).
3. Decisiones irreversibles o con más de una arquitectura válida — ahí parás y me preguntás.

# Regla
Esperá mi aprobación del diseño antes de crear o modificar cualquier archivo.`,
  },
  {
    id: "social-media-content",
    title: "Creación de Contenido para Redes Sociales (Post / Carrusel)",
    whenToUse:
      "Para redactar publicaciones atractivas en LinkedIn, Instagram, Twitter/X o Facebook con hooks potentes y llamadas a la acción.",
    skillRefs: ["ai-seo", "brainstorming"],
    template: `# Rol
Actuás como un Content Strategist & Copywriter de alto nivel para redes sociales.

# Contexto
- Red social principal: [Instagram / LinkedIn / Twitter / TikTok / Facebook]
- Formato: [Post individual / Carrusel informativo / Hilo / Infografía]
- Nicho / Producto: [Detallar temática o servicio]
- Público objetivo: [Describir a quién va dirigido]
- Objetivo del post: [Generar engagement / Educar / Convertir a venta / Generar tráfico]

# Tarea
Creá una propuesta de contenido que incluya:
1. **Hook (Gancho):** 3 opciones de primera línea disruptiva o intriga para detener el scroll.
2. **Cuerpo del post (Copywriting):** Mensaje directo estructurado con historia (PAS o AIDA), viñetas legibles y emojis moderados.
3. **Diapositivas (si es carrusel):** Estructura slide por slide (Texto en portada, 3-5 slides de valor, slide de cierre).
4. **Call to Action (CTA):** Indicación clara de respuesta (guardar, comentar, enviar DM).
5. **Hashtags & Palabras clave:** 5-8 hashtags relevantes y keywords para SEO en redes.

# Reglas
- Adaptar el tono exactamente al público (Profesional, informático, desenfadado, etc.).
- Sin clichés ni lenguaje robótico de IA.
- Puntos breves y escaneables visualmente.`,
  },
  {
    id: "video-scripting",
    title: "Guion de Video para Formato Corto o Largo (Reels / TikTok / YouTube)",
    whenToUse:
      "Cuando necesitás estructurar un guion paso a paso para un video de formato corto (Reels/TikTok/Shorts) o largo (YouTube).",
    skillRefs: ["brainstorming"],
    template: `# Rol
Actuás como Guionista de Video y Creador de Contenido audiovisual experimentado.

# Contexto
- Plataforma: [YouTube / Reels / TikTok / YouTube Shorts]
- Duración estimada: [30 segundos / 60 segundos / 5-10 minutos]
- Tema del video: [Explicar el tema o concepto a tratar]
- Estilo/Tono: [Dinámico, humorístico, educativo, narrativo, entrevista]
- Llamado a la acción (CTA): [Suscribirse / Hacer click en enlace / Comentar]

# Tarea
Desarrollá el guion completo estructurado en formato de 2 columnas o secciones claras:
1. **El Hook (Primeros 3-5 segundos):** Acción visual + Frase de alto impacto para evitar saltar el video.
2. **Introducción rápida (Segundos 5-15):** Promesa del video / Problema a resolver.
3. **Cuerpo / Desarrollo:** Dividido en puntos clave con notas de dirección (Audio, B-roll, texto en pantalla, efectos de sonido).
4. **Clímax o Conclusión:** Resolutiva y de alto valor.
5. **CTA Final (Últimos 5 segundos):** Cierre claro y orgánico.

# Estructura del Guion
- **[AUDIO / VOZ EN OFF]:** Transcripción exacta palabra por palabra de lo que se dice.
- **[VISUAL / B-ROLL]:** Qué aparece en pantalla (planos, gestos, texto en pantalla o apoyo gráfico).
- **[RECURSOS]:** Sonidos (SFX) o música de fondo recomendada.

# Reglas
- Mantener un ritmo ágil sin palabras de relleno.
- Incluir patrones de interrupción visuales cada 5-8 segundos para mantener la retención.`,
  },
];
