import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: "Changelog" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates(params.locale, "/changelog"),
  };
}

/** Centinelas: se reemplazan por texto traducido al renderizar. */
const UNRELEASED = "@@unreleased";
const FIRST_VERSIONS = "@@firstVersions";

type EntryKind = "agregado" | "cambios" | "arreglado" | "quitado" | "docs";

interface Release {
  /** Clave de `ChangelogData.<key>` en messages. */
  key: string;
  date: string;
  title?: string;
  kinds: EntryKind[];
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

/**
 * Solo la estructura: qué releases hay, en qué orden y con qué tipos de
 * entrada. El texto de cada ítem vive traducido en `messages/*.json`, bajo
 * `ChangelogData.<release>.<kind>` (array, se lee con `t.raw`).
 */
const RELEASES: Release[] = [
  { key: "unreleased", date: UNRELEASED, kinds: ["cambios", "agregado", "arreglado", "quitado"] },
  { key: "2026-07-29", date: "2026-07-29", kinds: ["agregado"] },
  { key: "2026-07-28", date: "2026-07-28", kinds: ["agregado"] },
  { key: "2026-07-25", date: "2026-07-25", kinds: ["agregado", "quitado"] },
  { key: "2026-07-22", date: "2026-07-22", kinds: ["cambios"] },
  { key: "2026-07-20", date: "2026-07-20", kinds: ["agregado", "cambios"] },
  { key: "2026-07-15", date: "2026-07-15", kinds: ["cambios"] },
  { key: "2026-07-05", date: "2026-07-05", kinds: ["agregado", "arreglado"] },
  { key: "2026-07-02", date: "2026-07-02", kinds: ["agregado"] },
  { key: "2026-06-21", date: "2026-06-21", kinds: ["cambios"] },
  { key: "2026-06-13", date: "2026-06-13", kinds: ["cambios", "agregado"] },
  { key: "2026-06-11", date: "2026-06-11", kinds: ["agregado"] },
  { key: "2026-06-07", date: "2026-06-07", kinds: ["docs"] },
  { key: "2026-06-01", date: "2026-06-01", kinds: ["docs"] },
  { key: "2026-05-31", date: "2026-05-31", kinds: ["agregado"] },
  {
    key: "2026-05-24 — 2026-05-30",
    date: "2026-05-24 — 2026-05-30",
    title: FIRST_VERSIONS,
    kinds: ["agregado"],
  },
];

export default async function ChangelogPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("Changelog");
  const data = await getTranslations("ChangelogData");

  const label = (value: string) =>
    value === UNRELEASED ? t("unreleased") : value === FIRST_VERSIONS ? t("firstVersions") : value;

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-linear-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 sm:p-12 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl">
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
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-linear-to-b from-violet-500/60 via-slate-700 to-transparent sm:left-[11px]" />

        {RELEASES.map((release) => (
          <div key={release.key} className="relative">
            <span className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-violet-500 shadow-sm shadow-violet-500/50 sm:-left-8" />
            <div className="glass-panel rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-lg font-bold text-white">{label(release.date)}</h2>
                {release.title && <span className="text-sm font-medium text-slate-400">{label(release.title)}</span>}
              </div>

              <div className="mt-4 flex flex-col gap-4">
                {release.kinds.map((kind) => {
                  const items = data.raw(`${release.key}.${kind}`) as string[];
                  return (
                    <div key={kind}>
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${KIND_STYLE[kind]}`}
                      >
                        {t(KIND_KEY[kind])}
                      </span>
                      <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-slate-300">
                        {items.map((item, j) => (
                          <li key={j} className="flex gap-2">
                            <span className="text-violet-400">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
