import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDocTemplates } from "@/lib/doc-templates";
import DocTemplatesDownload from "@/components/DocTemplatesDownload";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: "DocTemplates" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function PlantillasPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("DocTemplates");
  const templates = getDocTemplates();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{t("intro")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.file}
            className="card-vibrant-purple rounded-2xl p-5"
          >
            <h3 className="font-mono text-sm font-semibold">{template.file}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{t(`descriptions.${template.file.replace(/\.md$/, "")}`)}</p>
          </div>
        ))}
      </div>

      <DocTemplatesDownload />
    </div>
  );
}
