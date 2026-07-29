import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getItemsByCategory } from "@/lib/manifest";
import { getPreset } from "@/lib/presets";

export default async function SubagentesPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Subagentes");

  const agents = getItemsByCategory("agent").filter((i) => i.tool === "claude-code");
  const preset = getPreset("claude-code", "manual")!;

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
          {t.rich("intro", {
            agentsGlob: () => <code>.claude/agents/*.md</code>,
            description: () => <code>description</code>,
          })}
        </p>
      </section>

      <section className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
        <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">{t("whatIsTitle")}</h2>
        <p className="mt-2">
          {t.rich("whatIsBody", {
            md: () => <code>.md</code>,
            name: () => <code>name</code>,
            description: () => <code>description</code>,
            description2: () => <code>description</code>,
            tools: () => <code>tools</code>,
            model: () => <code>model</code>,
            agentsDir: () => <code>.claude/agents/</code>,
          })}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t("listTitle", { count: agents.length })}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {agents.map((agent) => (
            <div key={agent.id} className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
              <h3 className="font-mono font-semibold">{agent.label.replace(/\.md$/, "")}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{agent.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="font-semibold">{t("downloadTitle")}</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {t.rich("downloadBody", {
            buildPath: () => <code>/build</code>,
          })}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/build?tool=claude-code&preset=${preset.id}`}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            {t("downloadCta")}
          </Link>
          <Link
            href="/agents"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            {t("seePresets")}
          </Link>
        </div>
      </section>
    </div>
  );
}
