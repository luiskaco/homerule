import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPresetsByTool } from "@/lib/presets";
import { getItem } from "@/lib/manifest";

const BADGE_COLORS = {
  rule: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  skill: "border-pink-500/30 bg-pink-500/10 text-pink-300",
};

const BORDER_ACCENT_COLORS = [
  "border-t-violet-500",
  "border-t-indigo-500",
  "border-t-pink-500",
  "border-t-emerald-500",
  "border-t-cyan-500",
  "border-t-amber-500",
  "border-t-purple-500",
];

export default async function StacksPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("Stacks");
  const stacks = await getTranslations("StackLabels");
  const extTools = await getTranslations("ExternalTools");
  const presets = getPresetsByTool("antigravity").filter((p) => p.id !== "manual");

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-linear-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 sm:p-10 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3.5 py-1 text-xs font-bold text-violet-300 ring-1 ring-inset ring-violet-500/30 w-fit">
            {t("badge")}
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {t("titleStart")} <span className="text-gradient-purple">{t("titleAccent")}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
            {t.rich("intro", {
              presetsFile: () => (
                <code className="rounded-md bg-slate-950 px-2 py-0.5 font-mono text-xs text-cyan-300 border border-slate-800">
                  site/src/lib/presets.ts
                </code>
              ),
              claudeLink: () => (
                <Link href="/agents" className="font-bold text-violet-400 underline hover:text-violet-300">
                  {t("introClaudeLink")}
                </Link>
              ),
            })}
          </p>
        </div>
      </section>

      {/* Grid de Stacks */}
      <div className="grid gap-6 sm:grid-cols-2">
        {presets.map((preset, idx) => {
          const items = preset.itemIds
            .map((id) => getItem(id))
            .filter((i): i is NonNullable<typeof i> => Boolean(i))
            .filter((i) => i.category === "rule" || i.category === "skill");

          const rules = items.filter((i) => i.category === "rule");
          const skills = items.filter((i) => i.category === "skill");

          return (
            <div
              key={preset.id}
              className={`flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl border-t-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${BORDER_ACCENT_COLORS[idx % BORDER_ACCENT_COLORS.length]}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-white">{stacks(`${preset.id}.label`)}</h2>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-400">
                    {preset.id}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{stacks(`${preset.id}.description`)}</p>

                {/* Rules asignadas */}
                <div className="mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    {t("rulesHeading", { count: rules.length })}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {rules.map((rule) => (
                      <span
                        key={rule.id}
                        className={`rounded-md border px-2 py-0.5 font-mono text-xs ${BADGE_COLORS.rule}`}
                      >
                        {rule.label.replace(/\.md$/, "")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills asignadas */}
                <div className="mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400">
                    {t("skillsHeading", { count: skills.length })}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <span
                          key={skill.id}
                          className={`rounded-md border px-2 py-0.5 font-mono text-xs ${BADGE_COLORS.skill}`}
                        >
                          {skill.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">{t("noSkills")}</span>
                    )}
                  </div>
                </div>

                {/* Herramientas externas */}
                {preset.externalTools.length > 0 && (
                  <div className="mt-4 border-t border-slate-800 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {t("externalToolsHeading")}
                    </h3>
                    <ul className="mt-2 flex flex-col gap-2">
                      {preset.externalTools.map((tool) => (
                        <li key={tool.id} className="text-sm">
                          <span className="font-medium text-slate-200">
                            {extTools(`${tool.id}.name`)}
                          </span>
                          <code className="ml-2 mt-1 block break-all rounded-sm bg-slate-950 px-2 py-1 text-xs text-cyan-300 border border-slate-800 w-fit">
                            {tool.installCommand}
                          </code>
                          <p className="mt-1 text-xs text-slate-500">{extTools(`${tool.id}.note`)}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end border-t border-slate-800 pt-4">
                <Link
                  href={`/build?tool=antigravity&preset=${preset.id}`}
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-violet-500"
                >
                  {t("cta")}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
