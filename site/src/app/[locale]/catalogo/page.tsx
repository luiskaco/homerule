import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import CatalogPreviewButton from "@/components/CatalogPreviewButton";
import { agentAccess, agentModel, agentName } from "@/lib/agent-info";
import { resolveItemDescription } from "@/lib/item-description";
import { TOOL_THEME } from "@/lib/kit";
import { getItemsByCategory, type ManifestItem } from "@/lib/manifest";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Catalog" });
  return { title: t("metaTitle"), description: t("metaDescription"), alternates: localeAlternates(locale, "/catalogo") };
}

interface Entry {
  previewId: string;
  name: string;
  description: string;
  badges?: { label: string; tone: string }[];
}

function EntryList({ entries }: { entries: Entry[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {entries.map((entry) => (
        <li key={entry.previewId} className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-sm font-semibold text-white">{entry.name}</h3>
            {entry.badges?.map((badge) => (
              <span key={badge.label} className={`rounded-full border px-2 py-0.5 text-xs ${badge.tone}`}>
                {badge.label}
              </span>
            ))}
            <span className="ml-auto">
              <CatalogPreviewButton itemId={entry.previewId} />
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">{entry.description}</p>
        </li>
      ))}
    </ul>
  );
}

export default async function CatalogPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Catalog");
  const descriptions = await getTranslations("ItemDescriptions");
  const describe = (item: ManifestItem) => resolveItemDescription(item, descriptions);

  const rules: Entry[] = getItemsByCategory("rule").map((item) => ({
    previewId: item.id,
    name: item.label.replace(/\.md$/, ""),
    description: describe(item),
  }));
  const database = getItemsByCategory("database").find((i) => i.tool === "antigravity");
  if (database) rules.push({ previewId: database.id, name: "database", description: t("databaseDescription") });
  rules.sort((a, b) => a.name.localeCompare(b.name));

  const commands: Entry[] = getItemsByCategory("command")
    .filter((i) => i.tool === "antigravity")
    .map((item) => ({ previewId: item.id, name: `/${item.label.replace(/\.md$/, "")}`, description: describe(item) }));

  const accessTone = {
    readOnly: "border-slate-700 text-slate-300",
    writes: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    servers: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  };
  const agents = (tool: "claude-code" | "antigravity"): Entry[] =>
    getItemsByCategory("agent")
      .filter((i) => i.tool === tool)
      .map((item) => {
        const access = agentAccess(item);
        const model = agentModel(item);
        return {
          previewId: item.id,
          name: agentName(item),
          description: describe(item),
          badges: [
            { label: t(`access.${access}`), tone: accessTone[access] },
            ...(model ? [{ label: model, tone: "border-slate-700 font-mono text-slate-400" }] : []),
          ],
        };
      });
  const skillCount = getItemsByCategory("skill").filter((i) => i.tool === "antigravity").length;

  const sections = [
    { id: "rules", title: t("rulesTitle"), body: t("rulesBody"), entries: rules },
    { id: "commands", title: t("commandsTitle"), body: t("commandsBody"), entries: commands },
    { id: "agents-claude", title: t("agentsClaudeTitle"), body: t("agentsClaudeBody"), entries: agents("claude-code"), dot: TOOL_THEME["claude-code"].dot },
    { id: "agents-antigravity", title: t("agentsAntigravityTitle"), body: t("agentsAntigravityBody"), entries: agents("antigravity"), dot: TOOL_THEME.antigravity.dot },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-300">{t("intro")}</p>
        <nav aria-label={t("sectionsLabel")} className="mt-4 flex flex-wrap gap-2 text-sm">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="rounded-lg border border-slate-800 px-3 py-1 text-slate-300 hover:border-slate-700 hover:text-white">
              {section.title}
            </a>
          ))}
          <Link href="/mejores-skill" className="rounded-lg border border-slate-800 px-3 py-1 text-slate-300 hover:border-slate-700 hover:text-white">
            {t("skillsLink", { count: skillCount })}
          </Link>
        </nav>
      </section>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="flex scroll-mt-24 flex-col gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              {section.dot && <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${section.dot}`} />}
              {section.title}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-400">{section.body}</p>
          </div>
          <EntryList entries={section.entries} />
        </section>
      ))}
    </div>
  );
}
