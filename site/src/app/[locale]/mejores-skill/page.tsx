import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SkillCard from "@/components/SkillCard";
import { getCatalogSkills } from "@/lib/skill-catalog";

export default async function MejoresSkillPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("SkillCatalog");
  const skills = getCatalogSkills();

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl sm:p-12">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start gap-4">
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300">
            {t.rich("intro", {
              byProjectLink: () => (
                <Link href="/skills-por-proyecto" className="font-semibold text-violet-400 underline hover:text-violet-300">
                  {t("introByProjectLink")}
                </Link>
              ),
            })}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
            {t.rich("origins", {
              hub: () => <strong className="font-semibold text-slate-200">{t("originHub")}</strong>,
              external: () => <strong className="font-semibold text-slate-200">{t("originExternal")}</strong>,
              buildLink: () => (
                <Link href="/build" className="font-semibold text-violet-400 underline hover:text-violet-300">
                  /build
                </Link>
              ),
            })}
          </p>
        </div>
      </section>

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

      <div className="flex flex-col gap-6">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
}
