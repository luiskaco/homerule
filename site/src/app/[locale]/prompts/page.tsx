import { getTranslations, setRequestLocale } from "next-intl/server";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";
import PromptTemplateCard from "@/components/PromptTemplateCard";

export default async function PromptsPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Prompts");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">{t("intro")}</p>
      </div>

      <div className="flex flex-col gap-4">
        {PROMPT_TEMPLATES.map((template) => (
          <PromptTemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
