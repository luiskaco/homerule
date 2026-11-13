import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import NewProjectDownload, { type TemplateOption } from "@/components/NewProjectDownload";
import { getItem, getItemsByCategory } from "@/lib/manifest";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "NewProject" });
  return { title: t("metaTitle"), description: t("metaDescription"), alternates: localeAlternates(locale, "/proyecto-nuevo") };
}

/** Los 4 documentos que van siempre; el resto se crea cuando el proyecto lo pide (ADR-035). */
const FIXED = new Set(["01_PRD.md", "02_TASKS.md", "03_DECISIONS.md", "04_CHANGELOG.md"]);

export default async function NewProjectPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("NewProject");
  const descriptions = await getTranslations("DocTemplates");

  // Las plantillas son iguales en los dos tools: alcanza con las de uno.
  const templates: TemplateOption[] = getItemsByCategory("template")
    .filter((item) => item.tool === "antigravity")
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((item) => ({
      file: item.label,
      description: descriptions(`descriptions.${item.label.replace(/\.md$/, "")}`),
      content: item.files[0].content,
      fixed: FIXED.has(item.label),
    }));
  const agentsMd = getItem("antigravity:agents-md")?.files[0].content ?? "";

  return (
    <div className="flex flex-col gap-10">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-300">{t("intro")}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          {t.rich("prerequisite", {
            link: (chunks) => (
              <Link href="/instalar" className="font-medium text-violet-300 underline underline-offset-2 hover:text-violet-200">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </section>

      <NewProjectDownload templates={templates} agentsMd={agentsMd} />
    </div>
  );
}
