import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getItemsByCategory, type ManifestItem } from "@/lib/manifest";
import { JOB_TYPES, getSkillNamesForJobType } from "@/lib/skill-job-types";

export default async function SkillsPorProyectoPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("SkillsByProject");

  const skills = getItemsByCategory("skill").filter((i) => i.tool === "antigravity");
  const byName = new Map(skills.map((s) => [s.label, s]));

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          {t.rich("intro", {
            catalogLink: () => (
              <Link href="/mejores-skill" className="underline">
                {t("introCatalogLink")}
              </Link>
            ),
          })}
        </p>
      </div>

      {JOB_TYPES.map((jobType) => {
        const items = getSkillNamesForJobType(jobType.id)
          .map((name) => byName.get(name))
          .filter((i): i is ManifestItem => Boolean(i))
          .sort((a, b) => a.label.localeCompare(b.label));

        return (
          <section key={jobType.id}>
            <h2 className="text-lg font-semibold">{jobType.label}</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{jobType.description}</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
                  <h3 className="font-mono font-semibold">{item.label}</h3>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {item.description || "—"}
                  </p>
                  <code className="mt-3 block break-words rounded bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-900">
                    {item.install || t("noInstallFallback")}
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
