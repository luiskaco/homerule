import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getItem } from "@/lib/manifest";
import type { ToolId } from "@/lib/manifest";
import { getPresetsByTool } from "@/lib/presets";
import { TOOL_THEME, isRuleItem, isSkillItem, kitHref } from "@/lib/kit";
import { localeAlternates } from "@/lib/seo";

type Params = Promise<{ locale: string; tool: ToolId }>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { locale, tool } = await props.params;
  const t = await getTranslations({ locale, namespace: "KitPresets" });
  const tools = await getTranslations({ locale, namespace: "Tools" });
  return {
    title: t("metaTitle", { tool: tools(`${tool}.label`) }),
    description: t("metaDescription"),
    alternates: localeAlternates(locale, `/kits/${tool}`),
  };
}

function code(text: string): ReactNode {
  return (
    <code className="rounded-md border border-slate-800 bg-slate-950 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-200">
      {text}
    </code>
  );
}

export default async function KitPresetsPage(props: { params: Params }) {
  const { locale, tool } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("KitPresets");
  const stacks = await getTranslations("StackLabels");
  const theme = TOOL_THEME[tool];

  // "manual" va aparte: no es un stack, es el punto de partida en blanco.
  const presets = getPresetsByTool(tool).filter((p) => p.id !== "manual");

  const intro =
    tool === "antigravity"
      ? t.rich("intro.antigravity", {
          geminiMd: () => code("GEMINI.md"),
          agentsDir: () => code(".agents/"),
        })
      : tool === "hybrid"
      ? t.rich("intro.hybrid", {
          agentsDir: () => code(".agents/"),
          claudeDir: () => code(".claude/"),
        })
      : t.rich("intro.claude-code", {
          claudeMd: () => code("CLAUDE.md"),
          skillsDir: () => code(".claude/skills"),
          commandsDir: () => code(".claude/commands"),
          agentsDir: () => code(".claude/agents/"),
        });

  return (
    <div className="flex flex-col gap-10">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-300">{intro}</p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((preset) => {
          const items = preset.itemIds.map((id) => getItem(id)).filter((i) => i !== undefined);
          const rules = items.filter(isRuleItem).length;
          const skills = items.filter(isSkillItem).length;
          return (
            <li key={preset.id} className="flex">
              <Link
                href={kitHref(tool, "build", preset.id)}
                className={`group flex w-full flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.cardHover} ${theme.focus}`}
              >
                <h2 className="text-base font-semibold text-white">{stacks(`${preset.id}.label`)}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                  {stacks(`${preset.id}.description`)}
                </p>
                <p className="mt-4 text-xs text-slate-400">{t("counts", { rules, skills })}</p>
                <span className={`mt-3 text-sm font-semibold ${theme.text}`}>
                  {t("cta")}
                  <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-700 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-base font-semibold text-white">{t("customTitle")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            {t.rich("customBody", {
              stacksLink: (chunks) => (
                <Link href={kitHref(tool, "stacks")} className={`font-medium underline underline-offset-2 ${theme.text}`}>
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
        <Link
          href={kitHref(tool, "build")}
          className={`shrink-0 self-start whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:self-auto ${theme.button} ${theme.focus}`}
        >
          {t("customCta")}
        </Link>
      </section>
    </div>
  );
}
