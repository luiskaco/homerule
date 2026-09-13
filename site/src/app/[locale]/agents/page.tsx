import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TOOLS, getPresetsByTool } from "@/lib/presets";

/** Chip de código inline usado en la copy del hero. */
function codeChip(colorClass: string, text: string) {
  return (
    <code className={`rounded-md bg-slate-950 px-2 py-0.5 font-mono text-sm border border-slate-800 ${colorClass}`}>
      {text}
    </code>
  );
}

export default async function AgentsPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Agents");
  const tools = await getTranslations("Tools");

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-300 ring-1 ring-inset ring-cyan-500/30 w-fit">
            {t("badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">{t("title")}</h1>
          <p className="mt-2 max-w-3xl text-slate-300 leading-relaxed text-sm sm:text-base">
            {t.rich("intro", {
              claudeMd: () => codeChip("text-cyan-300", "CLAUDE.md"),
              skillsDir: () => codeChip("text-violet-300", ".claude/skills"),
              commandsDir: () => codeChip("text-pink-300", ".claude/commands"),
              skillMd: () => <code className="font-mono text-amber-300">SKILL.md</code>,
              agentsDir: () => <code>.claude/agents/</code>,
              skillsShLink: () => (
                <a
                  href="https://www.skills.sh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-cyan-400 underline hover:text-cyan-300"
                >
                  skills.sh
                </a>
              ),
              subagentsLink: () => (
                <Link href="/subagentes" className="font-bold text-violet-400 underline hover:text-violet-300">
                  {t("introSubagentsLink")}
                </Link>
              ),
            })}
          </p>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {TOOLS.filter((tool) => tool.id !== "antigravity").map((tool) => {
          const toolPresets = getPresetsByTool(tool.id);
          const defaultPreset = toolPresets.find((p) => p.id !== "manual") ?? toolPresets[0];
          return (
            <Link
              key={tool.id}
              href={`/build?tool=${tool.id}&preset=${defaultPreset.id}`}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-cyan-500/10"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {tools(`${tool.id}.label`)}
                </h2>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/30">
                  {t("toolBadge")}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">{tools(`${tool.id}.description`)}</p>
              {toolPresets.length > 1 && (
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>{t("stacksAvailable", { count: toolPresets.length })}</span>
                  <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                    {t("configure")}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
