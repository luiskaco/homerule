import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDocTemplates } from "@/lib/doc-templates";
import DocTemplatesDownload from "@/components/DocTemplatesDownload";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "DocTemplates" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function PlantillasPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("DocTemplates");
  const templates = getDocTemplates();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">{t("intro")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.file}
            className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-mono text-sm font-semibold">{template.file}</h3>
              {template.tools.length === 1 && (
                <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-500 border border-violet-500/30">
                  {t("onlyAntigravity")}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{template.description}</p>
          </div>
        ))}
      </div>

      <DocTemplatesDownload />
    </div>
  );
}
