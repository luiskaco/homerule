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
  const t = await getTranslations({ locale, namespace: "Stacks" });
  const tools = await getTranslations({ locale, namespace: "Tools" });
  return {
    title: t("metaTitle", { tool: tools(`${tool}.label`) }),
    description: t("metaDescription"),
    alternates: localeAlternates(locale, `/kits/${tool}/stacks`),
  };
}

function code(text: string): ReactNode {
  return (
    <code className="rounded-md border border-slate-800 bg-slate-950 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-200">
      {text}
    </code>
  );
}

export default async function KitStacksPage(props: { params: Params }) {
  const { locale, tool } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Stacks");
  const stacks = await getTranslations("StackLabels");
  const extTools = await getTranslations("ExternalTools");
  const theme = TOOL_THEME[tool];
  const presets = getPresetsByTool(tool).filter((p) => p.id !== "manual");

  const installNote =
    tool === "antigravity"
      ? t.rich("installNote.antigravity", {
          rulesDir: () => code(".agents/rules/"),
          skillsDir: () => code(".agents/skills/"),
        })
      : t.rich("installNote.claude-code", {
          ruleSkill: () => code(".claude/skills/<id>/SKILL.md"),
          skillsDir: () => code(".claude/skills/"),
        });

  return (
    <div className="flex flex-col gap-10">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-300">
          {t.rich("intro", { presetsFile: () => code("site/src/lib/presets.ts") })}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{installNote}</p>
      </section>

      <ul className="grid gap-4 lg:grid-cols-2">
        {presets.map((preset) => {
          const items = preset.itemIds.map((id) => getItem(id)).filter((i) => i !== undefined);
          const rules = items.filter(isRuleItem);
          const skills = items.filter(isSkillItem);

          return (
            <li key={preset.id} className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-base font-semibold text-white">{stacks(`${preset.id}.label`)}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{stacks(`${preset.id}.description`)}</p>

              <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("rulesHeading", { count: rules.length })}
              </h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {rules.map((rule) => (
                  <li key={rule.id} className={`max-w-full break-all rounded-md border px-2 py-0.5 font-mono text-xs ${theme.soft}`}>
                    {rule.label.replace(/\.md$/, "")}
                  </li>
                ))}
              </ul>

              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("skillsHeading", { count: skills.length })}
              </h3>
              {skills.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="max-w-full break-all rounded-md border border-slate-700 bg-slate-800/60 px-2 py-0.5 font-mono text-xs text-slate-200"
                    >
                      {skill.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-400">{t("noSkills")}</p>
              )}

              {preset.externalTools.length > 0 && (
                <div className="mt-5 border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("externalToolsHeading")}
                  </h3>
                  <ul className="mt-2 flex flex-col gap-3">
                    {preset.externalTools.map((ext) => (
                      <li key={ext.id} className="text-sm">
                        <span className="font-medium text-slate-200">{extTools(`${ext.id}.name`)}</span>
                        <code className="mt-1 block w-fit max-w-full break-all rounded-md border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-xs text-slate-300">
                          {ext.installCommand}
                        </code>
                        <p className="mt-1 text-xs text-slate-400">{extTools(`${ext.id}.note`)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-5">
                <Link
                  href={kitHref(tool, "build", preset.id)}
                  className={`inline-block whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.button} ${theme.focus}`}
                >
                  {t("cta")}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
