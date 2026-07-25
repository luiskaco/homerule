import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";
import PromptTemplateCard from "@/components/PromptTemplateCard";

export default function PromptsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Templates de Prompt</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Estructura base para arrancar los pedidos más frecuentes — asignar
          rol y contexto antes de la tarea puntual. Completá los corchetes y
          ajustá según el caso.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {PROMPT_TEMPLATES.map((template) => (
          <PromptTemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
