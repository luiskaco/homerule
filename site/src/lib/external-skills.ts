/**
 * Glosario de skills externas — skills de terceros que NO viajan en el ZIP de
 * /build. Se instalan aparte, con su propio comando. Acá se documenta qué hace
 * cada una, cuándo conviene usarla y cómo se instala en Claude Code /
 * Antigravity.
 */

export interface ExternalSkillInstall {
  /** Herramienta o método: "Claude Code", "Antigravity", "Manual"... */
  tool: string;
  command: string;
  note?: string;
}

export interface ExternalSkill {
  id: string;
  label: string;
  author: string;
  /** Sitio oficial / demo. */
  site: string;
  repo: string;
  /** Una línea: qué problema resuelve. */
  summary: string;
  /** Párrafo corto: para qué sirve en la práctica. */
  whatItDoes: string;
  /** Cuándo tirar de ella. */
  whenToUse: string[];
  /** Skills sueltas que trae el paquete, si son varias. */
  includes?: { name: string; description: string }[];
  install: ExternalSkillInstall[];
  /** Cómo se invoca una vez instalada. */
  usage: string[];
  /** Requisitos, licencias, avisos. */
  notes?: string[];
}

export const EXTERNAL_SKILLS: ExternalSkill[] = [
  {
    id: "hallmark",
    label: "hallmark",
    author: "Together AI (nutlope)",
    site: "https://www.usehallmark.com/",
    repo: "https://github.com/nutlope/hallmark",
    summary:
      "Skill de diseño web que se niega a producir páginas con cara de generadas por IA.",
    whatItDoes:
      "Elige una macroestructura según el brief, la viste con uno de sus veinte temas y pasa la página por 57 'slop-test gates' antes de devolverla. Está construida para evitar los defaults en los que todo LLM cae: gradiente violeta, todo centrado, tarjetas con iconito, sans-serif genérica. Dos briefs distintos dan sitios distintos, no el mismo template con otro color.",
    whenToUse: [
      "Landing pages, sitios de producto o páginas de marketing donde el diseño tiene que diferenciarse.",
      "Rediseñar una página existente sin tocar el copy ni la arquitectura de información.",
      "Auditar una UI que ya escribiste y que 'se ve a IA' pero no sabés por qué.",
      "Extraer el ADN visual (estructura, tipografía, color) de un sitio que te gusta.",
    ],
    install: [
      {
        tool: "Claude Code / Cursor / Codex",
        command: "npx skills add nutlope/hallmark",
        note: "Detecta la herramienta sola. Re-ejecutá el mismo comando para actualizar.",
      },
      {
        tool: "Manual",
        command: "SKILL.md + references/ → ~/.claude/skills/hallmark/",
        note: "En Cursor va a .cursor/rules/hallmark.mdc (solo el cuerpo, sin frontmatter); en Codex a ~/.codex/skills/hallmark/.",
      },
    ],
    usage: [
      "Sin verbo: pedís UI nueva y la skill arranca sola — \"armá una landing para un SaaS de facturación\".",
      "hallmark audit <archivo> — puntúa el código existente contra los anti-patterns. Solo diagnóstico, no edita.",
      "hallmark redesign <archivo> — tira la estructura, conserva copy + IA + marca, reconstruye con otra huella.",
      "hallmark study <captura | URL> — extrae el ADN de un diseño que admirás. Se niega a clonar pixel a pixel.",
    ],
    notes: [
      "Licencia MIT.",
      "Emite HTML + CSS autocontenido, con la macroestructura firmada en un comentario del CSS.",
    ],
  },
  {
    id: "emilkowalski-skills",
    label: "emilkowalski/skills",
    author: "Emil Kowalski (ex Vercel / Linear)",
    site: "https://emilkowal.ski/skill",
    repo: "https://github.com/emilkowalski/skill",
    summary:
      "Paquete de 7 skills de design engineering: animación, motion y criterio de UI destilados de años de oficio.",
    whatItDoes:
      "Los agentes no tienen buen gusto: eligen ease-in para una animación de entrada cuando corresponde ease-out, o un borde sólido donde iba una sombra semitransparente. Estas skills enumeran esos errores chicos que se acumulan y explican cómo corregirlos, para que el agente tome las decisiones que tomaría un design engineer.",
    whenToUse: [
      "Cuando la UI funciona pero se siente rígida o barata y no sabés qué tocar.",
      "Antes de mergear un PR con animaciones — para que alguien las revise con criterio estricto.",
      "Cuando querés pedirle una animación a la IA y no tenés la palabra exacta para describirla.",
      "Cuando el agente está por escribir a mano un toast, un dropdown o un modal en vez de usar una librería probada.",
    ],
    includes: [
      {
        name: "emil-design-eng",
        description: "La skill principal — sobre todo animación, más algo de criterio de diseño.",
      },
      {
        name: "review-animations",
        description: "Revisa tus animaciones de forma estricta contra sus reglas.",
      },
      {
        name: "improve-animations",
        description:
          "Audita todas las animaciones del codebase y devuelve planes priorizados y autocontenidos que puede ejecutar cualquier agente.",
      },
      {
        name: "find-animation-opportunities",
        description:
          "Busca lugares de la UI que realmente ganarían con movimiento — y te dice qué NO animar.",
      },
      {
        name: "animation-vocabulary",
        description:
          "Glosario inverso: describís el efecto con palabras vagas y te devuelve el término exacto para prompear.",
      },
      {
        name: "apple-design",
        description:
          "Principios de interfaz y motion de Apple, destilados de sus charlas de WWDC y traducidos a la web.",
      },
      {
        name: "pick-ui-library",
        description:
          "Que el agente elija la librería correcta entre las que Emil usa y confía, en vez de improvisar o instalar un paquete abandonado.",
      },
    ],
    install: [
      {
        tool: "Claude Code / Cursor / Codex",
        command: "npx skills@latest add emilkowalski/skills",
        note: "Instala las 7 skills de una. El repo es emilkowalski/skill (singular) pero el comando usa skills (plural).",
      },
    ],
    usage: [
      "Se activan solas al pedir trabajo de UI o animación.",
      "También se pueden invocar por nombre: \"usá improve-animations en src/components\".",
    ],
    notes: [
      "Complemento del curso animations.dev y de aiforui.dev.",
    ],
  },
  {
    id: "ui-ux-pro-max",
    label: "ui-ux-pro-max",
    author: "nextlevelbuilder",
    site: "https://www.uupm.cc/#styles",
    repo: "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill",
    summary:
      "Base de datos consultable de estilos de UI, paletas, pares tipográficos y reglas de UX por industria.",
    whatItDoes:
      "Ante un pedido de UI busca en su base — 84 estilos (Glassmorphism, Neumorphism, Brutalism, Aurora UI...), 192 paletas de color por tipo de producto, 74 pares de fuentes de Google Fonts y 161 reglas de razonamiento por industria — y genera un design system completo con el código para el stack que uses (22 soportados: React, Next.js, Vue, Svelte, Tailwind, Flutter, SwiftUI, React Native...).",
    whenToUse: [
      "Arrancar de cero y necesitar un design system coherente antes de escribir componentes.",
      "No saber qué estilo visual le va a un rubro (fintech, spa, gaming) y querer opciones fundamentadas.",
      "Elegir paleta y tipografía sin improvisar.",
    ],
    install: [
      {
        tool: "Claude Code (marketplace)",
        command:
          "/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill\n/plugin install ui-ux-pro-max@ui-ux-pro-max-skill",
      },
      {
        tool: "CLI (recomendado)",
        command:
          "npm install -g ui-ux-pro-max-cli\ncd /ruta/a/tu/proyecto\nuipro init --ai claude       # Claude Code\nuipro init --ai antigravity  # Antigravity",
        note: "El paquete npm es ui-ux-pro-max-cli pero el comando sigue siendo uipro. Los releases viejos de uipro-cli están stale.",
      },
      {
        tool: "Global (todos los proyectos)",
        command: "uipro init --ai claude --global",
        note: "Instala en ~/.claude/skills/ en vez de en el proyecto.",
      },
    ],
    usage: [
      "Se activa sola al pedir trabajo de UI: \"armá una landing para mi SaaS\".",
      "uipro update — refresca los archivos de la skill desde el paquete instalado.",
      "uipro uninstall --ai claude — la saca.",
    ],
    notes: [
      "Requiere Python 3.x para el script de búsqueda (solo librería estándar, sin llamadas de red).",
      "Tiene tier Premium; el core es open source.",
      "Ojo: esta skill se sacó del ZIP de /build — su rol quedó consolidado en la skill propia frontend-design. Queda acá como referencia por si querés la base de datos completa.",
    ],
  },
  {
    id: "webapp-testing",
    label: "webapp-testing",
    author: "Anthropic",
    site: "https://skills.sh/s/anthropics/skills/webapp-testing",
    repo: "https://github.com/anthropics/skills",
    summary:
      "Patrones de testing para apps web — cuándo probar unitario, integración o end-to-end, y qué mockear.",
    whatItDoes:
      "Da el criterio para elegir el nivel de prueba correcto según lo que se está verificando, en vez de que el agente escriba tests que solo cubren la implementación y siempre pasan.",
    whenToUse: [
      "Escribir tests nuevos para una feature — antes de decidir si es unitario, de integración o e2e.",
      "Revisar una suite existente que tiene alta cobertura pero no atrapa regresiones reales.",
      "Decidir qué mockear y qué probar contra la implementación real.",
    ],
    install: [
      {
        tool: "Claude Code / Cursor / Codex",
        command: "npx skills add anthropics/skills --skill webapp-testing",
      },
    ],
    usage: [
      "Se activa sola al pedir tests para código de una app web.",
      "También se puede invocar por nombre al revisar una suite existente.",
    ],
    notes: ["Parte del mismo repo oficial que frontend-design y canvas-design."],
  },
  {
    id: "test-driven-development",
    label: "test-driven-development",
    author: "obra (superpowers)",
    site: "https://skills.sh/s/obra/superpowers/test-driven-development",
    repo: "https://github.com/obra/superpowers",
    summary:
      "Loop de TDD: test que falla primero, cambio mínimo para pasarlo, verificación, recién ahí refactor.",
    whatItDoes:
      "Fuerza el orden correcto — test antes que implementación — para que el agente no escriba código primero y le agregue tests de relleno después, que es lo que produce cobertura sin protección real.",
    whenToUse: [
      "Implementar una función o endpoint donde el comportamiento esperado ya se puede describir de antemano.",
      "Arreglar un bug — escribir primero el test que lo reproduce, después el fix.",
      "Cuando la cobertura existe pero nadie confía en que atrapa regresiones.",
    ],
    install: [
      {
        tool: "Claude Code / Cursor / Codex",
        command: "npx skills add obra/superpowers --skill test-driven-development",
      },
    ],
    usage: [
      "Se activa sola al implementar una feature nueva con comportamiento verificable.",
      "Se puede invocar por nombre: \"usá test-driven-development para esto\".",
    ],
    notes: [
      "Parte del paquete superpowers — incluye también brainstorming, systematic-debugging y otras skills de proceso.",
    ],
  },
  {
    id: "copywriting",
    label: "copywriting",
    author: "Corey Haines",
    site: "https://skills.sh/s/coreyhaines31/marketingskills/copywriting",
    repo: "https://github.com/coreyhaines31/marketingskills",
    summary:
      "Copy persuasivo para headlines, landing pages, email y ads — claridad y beneficios concretos antes que creatividad.",
    whatItDoes:
      "Da un framework de copywriting orientado a conversión: beneficios sobre features, lenguaje del cliente sobre jerga de producto, un CTA claro por sección. Sirve para redactar de cero o para revisar copy ya escrito que suena genérico.",
    whenToUse: [
      "Escribir el copy de una landing, feature page o pricing page desde cero.",
      "Pulir un texto ya escrito que suena a folleto ('robusto', 'innovador', frases largas parejas).",
      "Redactar CTAs, headlines o subject lines de email.",
    ],
    install: [
      {
        tool: "Claude Code / Cursor / Codex",
        command: "npx skills add coreyhaines31/marketingskills --skill copywriting",
      },
    ],
    usage: [
      "Se activa sola al pedir copy de marketing o revisar texto de interfaz.",
      "Pide contexto de producto/audiencia si no lo tiene — mejor dárselo de entrada.",
    ],
    notes: [
      "Parte de un paquete de 20 skills de marketing del mismo autor (SEO, CRO, email, ads) — se pueden instalar sueltas o todas juntas.",
    ],
  },
];
