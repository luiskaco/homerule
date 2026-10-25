import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getItemsByCategory } from "@/lib/manifest";
import type { ManifestItem, ToolId } from "@/lib/manifest";
import { resolveItemDescription } from "@/lib/item-description";
import { TOOL_THEME, kitHref } from "@/lib/kit";
import { localeAlternates } from "@/lib/seo";

type Params = Promise<{ locale: string; tool: ToolId }>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { locale, tool } = await props.params;
  const t = await getTranslations({ locale, namespace: "Subagentes" });
  const tools = await getTranslations({ locale, namespace: "Tools" });
  return {
    title: t("metaTitle", { tool: tools(`${tool}.label`) }),
    description: t("metaDescription"),
    alternates: localeAlternates(locale, `/kits/${tool}/subagentes`),
  };
}

/**
 * Tools que escriben archivos, en los dos formatos. Se detectan sobre el
 * frontmatter real del agente en vez de mantener una lista a mano acá — así un
 * agente nuevo o un cambio de tools no deja la ficha desactualizada en silencio.
 */
const WRITE_TOOLS = [
  "write_to_file",
  "replace_file_content",
  "multi_replace_file_content",
  "Write",
  "Edit",
  "NotebookEdit",
];

/** Ruta e invocación de cada formato — los dos tools no se convierten entre sí (ADR-006). */
const FORMAT: Record<ToolId, { path: string; invoke: string }> = {
  antigravity: { path: ".agents/agents/<nombre>/agent.md", invoke: "invoke_subagent" },
  "claude-code": { path: ".claude/agents/<nombre>.md", invoke: "Agent tool" },
};

function frontmatterOf(item: ManifestItem): string {
  const content = item.files[0]?.content ?? "";
  return content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
}

function writesFiles(item: ManifestItem): boolean {
  const fm = frontmatterOf(item);
  return WRITE_TOOLS.some((tool) => new RegExp(`\\b${tool}\\b`).test(fm));
}

function modelOf(item: ManifestItem): string | null {
  return frontmatterOf(item).match(/^model:\s*(\S+)/m)?.[1] ?? null;
}

/** `auditor/agent.md` → `auditor` · `code-reviewer.md` → `code-reviewer` */
function agentName(item: ManifestItem): string {
  return item.label.replace(/\/agent\.md$/, "").replace(/\.md$/, "");
}

export default async function KitSubagentesPage(props: { params: Params }) {
  const { locale, tool } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Subagentes");
  const descriptions = await getTranslations("ItemDescriptions");
  const theme = TOOL_THEME[tool];
  const agents = getItemsByCategory("agent").filter((i) => i.tool === tool);

  return (
    <div className="flex flex-col gap-10">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t("title", { count: agents.length })}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-300">{t("intro")}</p>

        <dl className="mt-5 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
          <dt className="text-slate-500">{t("formatPath")}</dt>
          <dd className="min-w-0 break-all font-mono text-slate-200">{FORMAT[tool].path}</dd>
          <dt className="text-slate-500">{t("formatInvoke")}</dt>
          <dd className="font-mono text-slate-200">{FORMAT[tool].invoke}</dd>
        </dl>
        {tool === "antigravity" && <p className="mt-3 text-sm leading-relaxed text-slate-400">{t("formatNote")}</p>}
      </section>

      <ul className="grid gap-4 sm:grid-cols-2">
        {agents.map((item) => {
          const writes = writesFiles(item);
          const model = modelOf(item);
          return (
            <li key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-mono text-sm font-semibold text-white">{agentName(item)}</h2>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                    writes ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : theme.soft
                  }`}
                >
                  {writes ? t("badgeWrites") : t("badgeReadOnly")}
                </span>
                {model && (
                  <span className="rounded-full border border-slate-700 px-2 py-0.5 font-mono text-xs text-slate-400">
                    {model}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {resolveItemDescription(item, descriptions)}
              </p>
            </li>
          );
        })}
      </ul>

      <section className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-700 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-slate-400">{t("downloadBody")}</p>
        <Link
          href={kitHref(tool, "build")}
          className={`shrink-0 self-start whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:self-auto ${theme.button} ${theme.focus}`}
        >
          {t("downloadCta")}
        </Link>
      </section>
    </div>
  );
}
