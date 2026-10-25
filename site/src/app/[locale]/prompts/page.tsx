import { getTranslations, setRequestLocale } from "next-intl/server";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";
import PromptTemplateCard from "@/components/PromptTemplateCard";

export default async function PromptsPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("Prompts");

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-linear-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl sm:p-12">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start gap-4">
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300">{t("intro")}</p>
        </div>
      </section>

      <div className="flex flex-col gap-4">
        {PROMPT_TEMPLATES.map((template) => (
          <PromptTemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
