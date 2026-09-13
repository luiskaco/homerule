"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import type { ItemCategory, ManifestItem, ToolId } from "@/lib/manifest";
import { fetchManifestItems } from "@/lib/manifest-client";
import { getPreset, TOOLS } from "@/lib/presets";
import { buildZip, downloadBlob } from "@/lib/zip";
import { resolveItemDescription } from "@/lib/item-description";
import ItemPreviewModal from "@/components/ItemPreviewModal";

const SECTIONS: { category: ItemCategory; titleKey: string }[] = [
  { category: "global", titleKey: "sectionGlobal" },
  { category: "rule", titleKey: "sectionRule" },
  { category: "skill", titleKey: "sectionSkill" },
  { category: "agent", titleKey: "sectionAgent" },
  { category: "command", titleKey: "sectionCommand" },
  { category: "database", titleKey: "sectionDatabase" },
];

export default function BuildClient({ tool, presetId }: { tool: ToolId; presetId: string }) {
  const t = useTranslations("Build");
  const stacks = useTranslations("StackLabels");
  const descriptions = useTranslations("ItemDescriptions");
  const tools = useTranslations("Tools");
  const extTools = useTranslations("ExternalTools");
  const preset = getPreset(tool, presetId) ?? getPreset(tool, "manual")!;
  const toolMeta = TOOLS.find((t) => t.id === tool)!;

  const [allItems, setAllItems] = useState<ManifestItem[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(preset.itemIds));
  const [downloading, setDownloading] = useState(false);
  const [previewItem, setPreviewItem] = useState<ManifestItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchManifestItems().then((fetched) => {
      if (!cancelled) setAllItems(fetched);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Items visibles para este tool. Antigravity y Claude Code son catálogos
  // estancos: no hay items compartidos, así que alcanza con filtrar por `tool`.
  // Las plantillas SDD (categoría "template") se bajan aparte, desde /plantillas.
  const items = useMemo(
    () => (allItems ?? []).filter((i) => i.tool === tool && i.category !== "template"),
    [allItems, tool]
  );

  const totalTokens = useMemo(() => {
    return items
      .filter((i) => selected.has(i.id))
      .reduce((sum, i) => sum + i.approxTokens, 0);
  }, [items, selected]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await buildZip(items, Array.from(selected));
      downloadBlob(blob, `${tool}-${preset.id}.zip`);
    } finally {
      setDownloading(false);
    }
  }

  if (!allItems) {
    return <p className="text-sm text-slate-400">{t("loading")}</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-violet-300">{tools(`${toolMeta.id}.label`)}</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">{stacks(`${preset.id}.label`)}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          {stacks(`${preset.id}.description`)}
        </p>
      </div>

      {SECTIONS.map(({ category, titleKey }) => {
        const sectionItems = items.filter((i) => i.category === category);
        if (sectionItems.length === 0) return null;

        // Para Claude Code, la sección "Skills" mezcla skills reales
        // (externas, instalables aparte) con rules del proyecto convertidas
        // a SKILL.md nativo — se separan visualmente para que no se vean
        // como si Claude tuviera 8 skills propias en vez de las 2-3 reales.
        const realSkills =
          category === "skill" ? sectionItems.filter((i) => !i.id.includes(":rule:")) : sectionItems;
        const ruleSkills =
          category === "skill" ? sectionItems.filter((i) => i.id.includes(":rule:")) : [];

        function renderRow(item: ManifestItem) {
          return (
            <label
              key={item.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm transition hover:border-slate-700"
            >
              <input
                type="checkbox"
                className="mt-1 accent-violet-500"
                checked={selected.has(item.id)}
                onChange={() => toggle(item.id)}
              />
              <span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPreviewItem(item);
                  }}
                  className="font-mono font-semibold text-slate-100 underline decoration-dotted underline-offset-2 hover:text-violet-300 hover:decoration-solid"
                >
                  {item.label.replace(/\.md$/, "")}
                </button>
                {item.description && (
                  <span className="block text-slate-400">
                    {resolveItemDescription(item, descriptions)}
                  </span>
                )}
                <span className="block text-xs text-slate-500">
                  {t("approxTokens", { count: item.approxTokens })}
                </span>
              </span>
            </label>
          );
        }

        return (
          <section key={category}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              {t(titleKey)}
            </h2>
            <div className="mt-3 flex flex-col gap-2">{realSkills.map(renderRow)}</div>

            {ruleSkills.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {t("projectRulesTitle")}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {t.rich("projectRulesBody", {
                    rulesDir: () => <code>.agents/rules/</code>,
                    skillMd: () => <code>SKILL.md</code>,
                  })}
                </p>
                <div className="mt-3 flex flex-col gap-2">{ruleSkills.map(renderRow)}</div>
              </div>
            )}
          </section>
        );
      })}

      {preset.externalTools.length > 0 && (
        <section className="rounded-2xl border border-dashed border-slate-700 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            {t("externalToolsHeading")}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {preset.externalTools.map((tool) => (
              <li key={tool.id} className="text-sm">
                <span className="font-semibold text-slate-200">{extTools(`${tool.id}.name`)}</span>
                <code className="ml-2 inline-block break-all rounded border border-slate-800 bg-slate-950/80 px-2 py-0.5 font-mono text-xs text-slate-300">
                  {tool.installCommand}
                </code>
                <p className="mt-1 text-xs text-slate-500">{extTools(`${tool.id}.note`)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="glass-panel sticky bottom-4 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-400">
          {t("selectedSummary", { count: selected.size, tokens: totalTokens })}
        </span>
        <button
          onClick={handleDownload}
          disabled={downloading || selected.size === 0}
          className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-400 disabled:opacity-50"
        >
          {downloading ? t("generating") : t("download")}
        </button>
      </div>

      {previewItem && (
        <ItemPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      )}
    </div>
  );
}
