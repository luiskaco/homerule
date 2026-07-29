import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SkillCard from "@/components/SkillCard";
import { getCatalogSkills } from "@/lib/skill-catalog";

export default async function MejoresSkillPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("SkillCatalog");
  const skills = getCatalogSkills();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          {t.rich("intro", {
            byProjectLink: () => (
              <Link href="/skills-por-proyecto" className="underline">
                {t("introByProjectLink")}
              </Link>
            ),
          })}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          {t.rich("origins", {
            hub: () => <strong className="font-semibold">{t("originHub")}</strong>,
            external: () => <strong className="font-semibold">{t("originExternal")}</strong>,
            buildLink: () => (
              <Link href="/build" className="underline">
                /build
              </Link>
            ),
          })}
        </p>
      </div>

      {/* Índice — saltar directo a la skill */}
      <nav className="flex flex-wrap gap-1.5 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        {skills.map((skill) => (
          <a
            key={skill.id}
            href={`#${skill.label}`}
            className="rounded-full border border-neutral-200 px-2.5 py-0.5 font-mono text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
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
