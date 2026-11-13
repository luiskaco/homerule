import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import GlobalKitDownload from "@/components/GlobalKitDownload";
import { getItemsByCategory } from "@/lib/manifest";
import { KIT_PATHS, KIT_TOOLS, TOOL_THEME, isRuleItem, type KitTool } from "@/lib/kit";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Install" });
  return { title: t("metaTitle"), description: t("metaDescription"), alternates: localeAlternates(locale, "/instalar") };
}

function Command({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-200">
      {children}
    </pre>
  );
}

/** Lo que trae cada kit, contado desde el manifest (las rules incluyen `database`). */
function counts() {
  const rules = getItemsByCategory("rule").length + 1;
  const skills = getItemsByCategory("skill").filter((i) => i.tool === "antigravity" && !isRuleItem(i)).length;
  const commands = getItemsByCategory("command").filter((i) => i.tool === "antigravity").length;
  const agents = (tool: "antigravity" | "claude-code") => getItemsByCategory("agent").filter((i) => i.tool === tool).length;
  return {
    "claude-code": { rules, skills, commands, agents: agents("claude-code") },
    antigravity: { rules, skills, commands, agents: agents("antigravity") },
    codex: { rules, skills, commands, agents: 0 },
  } satisfies Record<KitTool, { rules: number; skills: number; commands: number; agents: number }>;
}

export default async function InstallPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Install");
  const byTool = counts();

  return (
    <div className="flex flex-col gap-10">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-300">{t("intro")}</p>
      </section>

      <ul className="grid gap-4 lg:grid-cols-3">
        {KIT_TOOLS.map((tool) => {
          const c = byTool[tool];
          return (
            <li key={tool} className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${TOOL_THEME[tool].dot}`} />
                  {t(`tools.${tool}.label`)}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{t(`tools.${tool}.description`)}</p>
              </div>
              <p className="text-sm text-slate-300">
                {tool === "codex" ? t("countsCodex", c) : t("counts", c)}
              </p>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("installsIn")}</p>
                <ul className="mt-1 flex flex-col gap-0.5 font-mono text-xs text-slate-300">
                  {KIT_PATHS[tool].map((path) => (
                    <li key={path} className="break-all">
                      {path}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">
                <GlobalKitDownload tool={tool} />
              </div>
            </li>
          );
        })}
      </ul>

      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-xl font-semibold text-white">{t("howTitle")}</h2>
        <ol className="flex list-decimal flex-col gap-4 pl-5 text-sm leading-relaxed text-slate-300 marker:text-slate-500">
          <li>{t("step1")}</li>
          <li className="flex flex-col gap-2">
            {t("step2")}
            <Command>node install.mjs</Command>
          </li>
          <li className="flex flex-col gap-2">
            {t("step3")}
            <Command>node install.mjs --write</Command>
          </li>
        </ol>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-slate-400">
          <li>{t("noteRequirements")}</li>
          <li>{t("noteUpdate")}</li>
          <li>{t("noteSafe")}</li>
        </ul>
      </section>

      <section className="flex max-w-3xl flex-col gap-3 rounded-xl border border-dashed border-slate-700 p-6">
        <h2 className="text-base font-semibold text-white">{t("pluginTitle")}</h2>
        <p className="text-sm leading-relaxed text-slate-400">{t("pluginBody")}</p>
        <Command>{"/plugin marketplace add luiskaco/homerule\n/plugin install ai-rules-hub@ai-rules-hub"}</Command>
      </section>

      <section className="flex max-w-3xl flex-col gap-2">
        <h2 className="text-base font-semibold text-white">{t("nextTitle")}</h2>
        <p className="text-sm leading-relaxed text-slate-400">
          {t.rich("nextBody", {
            link: (chunks) => (
              <Link href="/proyecto-nuevo" className="font-medium text-violet-300 underline underline-offset-2 hover:text-violet-200">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </section>
    </div>
  );
}
