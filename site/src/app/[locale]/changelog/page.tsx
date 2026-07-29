import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "Changelog" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

/** Centinelas: se reemplazan por texto traducido al renderizar. */
const UNRELEASED = "@@unreleased";
const FIRST_VERSIONS = "@@firstVersions";

type EntryKind = "agregado" | "cambios" | "arreglado" | "quitado" | "docs";

interface Entry {
  kind: EntryKind;
  items: string[];
}

interface Release {
  date: string;
  title?: string;
  entries: Entry[];
}

const KIND_KEY: Record<EntryKind, string> = {
  agregado: "kindAdded",
  cambios: "kindChanged",
  arreglado: "kindFixed",
  quitado: "kindRemoved",
  docs: "kindDocs",
};

const KIND_STYLE: Record<EntryKind, string> = {
  agregado: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  cambios: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  arreglado: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  quitado: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  docs: "bg-amber-500/10 text-amber-300 border-amber-500/30",
};

const RELEASES: Release[] = [
  {
    date: UNRELEASED,
    entries: [
      {
        kind: "cambios",
        items: [
          "Reorganización de la interfaz del sitio: layout, nav, home y tarjetas de skills ajustados.",
          "Se agrega esta bitácora de cambios (CHANGELOG.md + página /changelog).",
          "Nav reorganizado en 3 secciones: Antigravity solo, Antigravity + Claude y Claude solo; el catálogo de skills queda como ventana independiente.",
          "Labels del nav normalizados: se reemplazan los tres “Inicio” genéricos por labels descriptivos, y un grupo de un solo ítem pasa a ser link directo.",
          "Se fusionan /stacks y /stacks-app en una única página /stacks con el tema visual actual.",
          "El proyecto pasa a usar su propia convención /docs para seguimiento del trabajo (06_TASKS.md y 07_DECISIONS.md).",
          "/ pasa a ser el índice del hub (los 3 modos de uso, el catálogo de skills y la bitácora); los presets por stack de Antigravity se mudan a su propia página /antigravity.",
        ],
      },
      {
        kind: "arreglado",
        items: [
          "Contenido específico de Antigravity que se filtraba a los ZIPs de Claude Code: 00_GEMINI_START.md ya no se incluye en presets de claude-code, y las referencias sueltas a GEMINI.md en archivos compartidos ahora también apuntan a CORE.md.",
        ],
      },
      {
        kind: "quitado",
        items: ["Páginas placeholder vacías y sin link en el nav: /proximamente y /mejores-repos-utilidades."],
      },
    ],
  },
  {
    date: "2026-07-29",
    entries: [{ kind: "agregado", items: ["Skill project-planning para cerrar el gap entre brainstorming y ejecución."] }],
  },
  {
    date: "2026-07-28",
    entries: [
      {
        kind: "agregado",
        items: [
          'Rediseño del sitio a "Vibrant Flat UI 3.0".',
          "Nueva pestaña /stacks-app.",
          "Nuevos templates de prompt.",
          "Skill api-security-best-practices sumada al catálogo.",
        ],
      },
    ],
  },
  {
    date: "2026-07-25",
    entries: [
      {
        kind: "agregado",
        items: [
          "Skills de diseño de terceros versionadas en .claude/skills/.",
          "Catálogo unificado con la estructura de tarjetas del glosario.",
          "Skills externas sumadas al catálogo + glosario con detalle.",
          "Menú hamburguesa para navegación responsive.",
          "Reorganización del nav en menús agrupados + catálogo de skills y templates de prompt.",
        ],
      },
      { kind: "quitado", items: ["Skills de diseño gráfico removidas del bundle de uipro."] },
    ],
  },
  {
    date: "2026-07-22",
    entries: [{ kind: "cambios", items: ["Se remueve la skill ui-ux-pro-max, consolidando su rol en frontend-design."] }],
  },
  {
    date: "2026-07-20",
    entries: [
      { kind: "agregado", items: ['Pestañas placeholder: "Mejores SKILL", "Próximamente" y "Mejores repos de utilidades".'] },
      { kind: "cambios", items: ["Se exige el uso de versiones actualizadas y se corrige la lista de rules."] },
    ],
  },
  {
    date: "2026-07-15",
    entries: [{ kind: "cambios", items: ["El proyecto se enfoca en el workflow Gemini + Claude; se agregan subagentes y se corrige el límite de rules."] }],
  },
  {
    date: "2026-07-05",
    entries: [
      { kind: "agregado", items: ['Sitio "Rules Hub" descargable con soporte multi-agente y de base de datos.'] },
      { kind: "arreglado", items: ["Responsividad mobile del nav, footer y páginas de build."] },
    ],
  },
  {
    date: "2026-07-02",
    entries: [
      {
        kind: "agregado",
        items: [
          "Secciones de PWA, dark mode, i18n y privacidad en las rules.",
          "Documentación de las skills frontend-design y seo-audit.",
        ],
      },
    ],
  },
  {
    date: "2026-06-21",
    entries: [{ kind: "cambios", items: ["Reorganización de la estructura del repo a la raíz del proyecto; README actualizado."] }],
  },
  {
    date: "2026-06-13",
    entries: [
      {
        kind: "cambios",
        items: [
          "Reorganización de reglas de antigravity-v2, eliminación de reglas obsoletas.",
          "Actualización de las opciones de workflow y la lógica de subagentes en GEMINI.md.",
        ],
      },
      { kind: "agregado", items: ["Rules de Antigravity y actualización de instrucciones de agente."] },
    ],
  },
  {
    date: "2026-06-11",
    entries: [{ kind: "agregado", items: ["Documentación de los procesos internos de subagentes para tareas de código."] }],
  },
  {
    date: "2026-06-07",
    entries: [
      {
        kind: "docs",
        items: ["Corrección de typo en el workflow de bug-fix.", "Actualización de workflows y README de Antigravity."],
      },
    ],
  },
  {
    date: "2026-06-01",
    entries: [
      {
        kind: "docs",
        items: [
          "Revisión de README para instalación de Antigravity Rules v2.",
          "Actualización de session-close.md, new-feature.md y GEMINI.md.",
        ],
      },
    ],
  },
  {
    date: "2026-05-31",
    entries: [
      {
        kind: "agregado",
        items: ["README raíz del proyecto.", "Actualización de workflows de agentes, skills y documentación."],
      },
    ],
  },
  {
    date: "2026-05-24 — 2026-05-30",
    title: FIRST_VERSIONS,
    entries: [
      {
        kind: "agregado",
        items: [
          "Primeras rules de gobernanza de IA (ia_antigravity-rules, README global, reglas v3/v4).",
          "Commit inicial del proyecto.",
        ],
      },
    ],
  },
];

export default async function ChangelogPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Changelog");

  const label = (value: string) =>
    value === UNRELEASED ? t("unreleased") : value === FIRST_VERSIONS ? t("firstVersions") : value;

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 sm:p-12 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-bold tracking-wide text-violet-300 ring-1 ring-inset ring-violet-500/30 backdrop-blur-md">
            {t("badge")}
          </div>
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            {t("titleStart")} <span className="text-gradient-purple">{t("titleAccent")}</span>
          </h1>
          <p className="max-w-2xl text-base text-slate-300 leading-relaxed sm:text-lg">
            {t("intro")}
          </p>
        </div>
      </section>

      <section className="relative flex flex-col gap-8 pl-6 sm:pl-8">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-violet-500/60 via-slate-700 to-transparent sm:left-[11px]" />

        {RELEASES.map((release) => (
          <div key={release.date} className="relative">
            <span className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-violet-500 shadow shadow-violet-500/50 sm:-left-8" />
            <div className="glass-panel rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-lg font-bold text-white">{label(release.date)}</h2>
                {release.title && <span className="text-sm font-medium text-slate-400">{label(release.title)}</span>}
              </div>

              <div className="mt-4 flex flex-col gap-4">
                {release.entries.map((entry, i) => (
                  <div key={i}>
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${KIND_STYLE[entry.kind]}`}
                    >
                      {t(KIND_KEY[entry.kind])}
                    </span>
                    <ul className="mt-2 flex flex-col gap-1.5 text-sm text-slate-300 leading-relaxed">
                      {entry.items.map((item, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-violet-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
