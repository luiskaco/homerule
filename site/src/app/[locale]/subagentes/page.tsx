import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getItemsByCategory } from "@/lib/manifest";
import type { ManifestItem } from "@/lib/manifest";
import { getPreset } from "@/lib/presets";
import { resolveItemDescription } from "@/lib/item-description";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: "Subagentes" });
  return { title: t("metaTitle"), description: t("metaDescription") };
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

function AgentCard({
  item,
  accent,
  t,
  description,
}: {
  item: ManifestItem;
  accent: string;
  t: (k: string) => string;
  description: string;
}) {
  const writes = writesFiles(item);
  const model = modelOf(item);

  return (
    <div className={`${accent} rounded-2xl p-5`}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-sm font-bold text-white">{agentName(item)}</h3>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            writes
              ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
              : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
          }`}
        >
          {writes ? t("badgeWrites") : t("badgeReadOnly")}
        </span>
        {model && (
          <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 font-mono text-[10px] text-slate-400">
            {model}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

export default async function SubagentesPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("Subagentes");
  const descriptions = await getTranslations("ItemDescriptions");

  const all = getItemsByCategory("agent");
  const antigravityAgents = all.filter((i) => i.tool === "antigravity");
  const claudeAgents = all.filter((i) => i.tool === "claude-code");

  const antigravityPreset = getPreset("antigravity", "manual")!;
  const claudePreset = getPreset("claude-code", "manual")!;

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-linear-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl sm:p-12">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-bold tracking-wide text-violet-300 ring-1 ring-inset ring-violet-500/30 backdrop-blur-md">
            {t("badge", { count: antigravityAgents.length + claudeAgents.length })}
          </div>
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            {t("titleStart")} <span className="text-gradient-purple">{t("titleAccent")}</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{t("intro")}</p>
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold text-white">{t("whatIsTitle")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">{t("whatIsBody")}</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-xl border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4 font-bold">{t("formatTool")}</th>
                <th className="py-2 pr-4 font-bold">{t("formatPath")}</th>
                <th className="py-2 font-bold">{t("formatInvoke")}</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-slate-800/60">
                <td className="py-2.5 pr-4 font-semibold text-slate-200">Antigravity</td>
                <td className="py-2.5 pr-4 font-mono text-xs">.agents/agents/&lt;nombre&gt;/agent.md</td>
                <td className="py-2.5 font-mono text-xs">invoke_subagent</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-semibold text-slate-200">Claude Code</td>
                <td className="py-2.5 pr-4 font-mono text-xs">.claude/agents/&lt;nombre&gt;.md</td>
                <td className="py-2.5 font-mono text-xs">Task tool</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-500">{t("formatNote")}</p>
      </section>

      <section>
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-xl font-bold text-white">
            {t("antigravityTitle", { count: antigravityAgents.length })}
          </h2>
          <span className="text-sm text-slate-500">{t("antigravitySubtitle")}</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {antigravityAgents.map((item) => (
            <AgentCard
              key={item.id}
              item={item}
              accent="card-vibrant-emerald"
              t={t}
              description={resolveItemDescription(item, descriptions)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-xl font-bold text-white">{t("claudeTitle", { count: claudeAgents.length })}</h2>
          <span className="text-sm text-slate-500">{t("claudeSubtitle")}</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {claudeAgents.map((item) => (
            <AgentCard
              key={item.id}
              item={item}
              accent="card-vibrant-purple"
              t={t}
              description={resolveItemDescription(item, descriptions)}
            />
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold text-white">{t("downloadTitle")}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{t("downloadBody")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/build?tool=antigravity&preset=${antigravityPreset.id}`}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            {t("downloadAntigravity")}
          </Link>
          <Link
            href={`/build?tool=claude-code&preset=${claudePreset.id}`}
            className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-400"
          >
            {t("downloadClaude")}
          </Link>
        </div>
      </section>
    </div>
  );
}
