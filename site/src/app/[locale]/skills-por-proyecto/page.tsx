import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCatalogSkills, type CatalogSkill } from "@/lib/skill-catalog";
import { JOB_TYPES, getSkillNamesForJobType } from "@/lib/skill-job-types";

export default async function SkillsPorProyectoPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("SkillsByProject");

  const skills = getCatalogSkills();
  const byName = new Map(skills.map((s) => [s.label, s]));

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl sm:p-12">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start gap-4">
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300">
            {t.rich("intro", {
              catalogLink: () => (
                <Link href="/mejores-skill" className="font-semibold text-violet-400 underline hover:text-violet-300">
                  {t("introCatalogLink")}
                </Link>
              ),
            })}
          </p>
        </div>
      </section>

      {JOB_TYPES.map((jobType) => {
        const items = getSkillNamesForJobType(jobType.id)
          .map((name) => byName.get(name))
          .filter((i): i is CatalogSkill => Boolean(i))
          .sort((a, b) => a.label.localeCompare(b.label));

        return (
          <section key={jobType.id}>
            <h2 className="text-xl font-bold text-white">{jobType.label}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{jobType.description}</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <div key={item.id} className="card-vibrant-purple rounded-2xl p-5">
                  <h3 className="font-mono text-sm font-bold text-white">{item.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.summary || "—"}</p>
                  <code className="mt-3 block break-words rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-300">
                    {item.install[0]?.command ?? t("noInstallFallback")}
                  </code>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
