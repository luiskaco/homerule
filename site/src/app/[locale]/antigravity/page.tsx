import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPresetsByTool } from "@/lib/presets";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: "Antigravity" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

/** Chip de código inline usado en la copy del hero. */
function codeChip(colorClass: string, text: string): ReactNode {
  return (
    <code
      className={`rounded-md bg-violet-950/80 px-2 py-0.5 font-mono text-sm font-bold border border-violet-500/30 ${colorClass}`}
    >
      {text}
    </code>
  );
}

export default async function AntigravityPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("Antigravity");
  const stacks = await getTranslations("StackLabels");
  const presets = getPresetsByTool("antigravity");

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-linear-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 sm:p-12 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-cyan-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start gap-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-bold tracking-wide text-violet-300 ring-1 ring-inset ring-violet-500/30 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-ping" />
            {t("badge")}
          </div>

          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl sm:leading-tight">
            {t("titleStart")} <span className="text-gradient-purple">{t("titleAccent")}</span>
          </h1>

          <p className="max-w-2xl text-base text-slate-300 leading-relaxed sm:text-lg">
            {t.rich("intro", {
              geminiMd: () => codeChip("text-amber-300", "GEMINI.md"),
              agentsDir: () => codeChip("text-cyan-300", ".agents/"),
            })}
          </p>

          <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-1.5 border border-slate-800">
              <span className="text-emerald-400">✓</span> {t("chip1")}
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-1.5 border border-slate-800">
              <span className="text-cyan-400">✓</span> {t("chip2")}
            </div>
          </div>
        </div>
      </section>

      {/* Presets Grid */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-violet-400">⚡</span> {t("presetsTitle")}
          </h2>
          <p className="text-sm text-slate-400">{t("presetsSubtitle")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset, idx) => {
            const colorClasses = [
              "card-vibrant-purple border-t-2 border-t-violet-500",
              "card-vibrant-emerald border-t-2 border-t-emerald-500",
              "card-vibrant-amber border-t-2 border-t-amber-500",
            ];
            const badgeColors = [
              "bg-violet-500/10 text-violet-300 border border-violet-500/30",
              "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
              "bg-amber-500/10 text-amber-300 border border-amber-500/30",
            ];

            return (
              <Link
                key={preset.id}
                href={`/build?tool=antigravity&preset=${preset.id}`}
                className={`group flex flex-col justify-between rounded-2xl p-6 shadow-xl ${colorClasses[idx % colorClasses.length]}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                      {stacks(`${preset.id}.label`)}
                    </h3>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${badgeColors[idx % badgeColors.length]}`}>
                      {t("presetBadge")}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">{stacks(`${preset.id}.description`)}</p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold text-violet-400 group-hover:text-violet-300">
                  {t("presetCta")}{" "}
                  <span className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Explorer Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🔍</span> {t("customTitle")}
            </h3>
            <p className="text-sm text-slate-300 max-w-xl">
              {t.rich("customBody", {
                stacksLink: () => (
                  <Link href="/stacks" className="font-bold text-violet-400 hover:underline">
                    {t("customBodyLink")}
                  </Link>
                ),
              })}
            </p>
          </div>
          <Link
            href="/build?tool=antigravity&preset=manual"
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition-all hover:bg-violet-500 hover:scale-105"
          >
            {t("customCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
