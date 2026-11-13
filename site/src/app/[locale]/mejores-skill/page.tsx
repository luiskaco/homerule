import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import SkillCard from "@/components/SkillCard";
import SkillViewsToggle from "@/components/SkillViewsToggle";
import { getCatalogSkills, type CatalogSkill } from "@/lib/skill-catalog";
import { JOB_TYPES, getSkillNamesForJobType } from "@/lib/skill-job-types";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  return { alternates: localeAlternates(locale, "/mejores-skill") };
}

export default async function MejoresSkillPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("SkillCatalog");
  const data = await getTranslations("SkillData");
  const skills = getCatalogSkills();
  const byName = new Map(skills.map((s) => [s.label, s]));

  const flatView = (
    <div className="flex flex-col gap-6">
      {/* Índice — saltar directo a la skill */}
      <nav className="glass-panel flex flex-wrap gap-1.5 rounded-2xl p-4">
        {skills.map((skill) => (
          <a
            key={skill.id}
            href={`#${skill.label}`}
            className="rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-0.5 font-mono text-xs text-slate-300 transition hover:border-violet-500/50 hover:text-white"
          >
            {skill.label}
          </a>
        ))}
      </nav>

      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );

  const byProjectView = (
    <div className="flex flex-col gap-10">
      {JOB_TYPES.map((jobType) => {
        const items = getSkillNamesForJobType(jobType.id)
          .map((name) => byName.get(name))
          .filter((i): i is CatalogSkill => Boolean(i))
          .sort((a, b) => a.label.localeCompare(b.label));

        return (
          <section key={jobType.id}>
            <h2 className="text-xl font-bold text-white">{t(`jobType.${jobType.id}.label`)}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              {t(`jobType.${jobType.id}.description`)}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <div key={item.id} className="card-vibrant-purple rounded-2xl p-5">
                  <h3 className="font-mono text-sm font-bold text-white">{item.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{data(`${item.id}.summary`)}</p>
                  <code className="mt-3 block wrap-break-word rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-300">
                    {item.installCommands[0] ?? t("noInstallFallback")}
                  </code>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-linear-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl sm:p-12">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start gap-4">
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300">{t("intro")}</p>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
            {t.rich("origins", {
              hub: () => <strong className="font-semibold text-slate-200">{t("originHub")}</strong>,
              external: () => <strong className="font-semibold text-slate-200">{t("originExternal")}</strong>,
              installLink: (chunks) => (
                <Link href="/instalar" className="font-semibold text-violet-400 underline hover:text-violet-300">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </section>

      <SkillViewsToggle
        flatLabel={t("viewFlat")}
        byProjectLabel={t("viewByProject")}
        flatView={flatView}
        byProjectView={byProjectView}
      />
    </div>
  );
}
