"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import type { ItemCategory, ManifestItem, ToolId } from "@/lib/manifest";
import { fetchManifestItems } from "@/lib/manifest-client";
import { getPreset, TOOLS } from "@/lib/presets";
import { buildZip, downloadBlob } from "@/lib/zip";
import ItemPreviewModal from "@/components/ItemPreviewModal";

const SECTIONS: { category: ItemCategory; titleKey: string }[] = [
  { category: "global", titleKey: "sectionGlobal" },
  { category: "rule", titleKey: "sectionRule" },
  { category: "skill", titleKey: "sectionSkill" },
  { category: "agent", titleKey: "sectionAgent" },
  { category: "command", titleKey: "sectionCommand" },
  { category: "database", titleKey: "sectionDatabase" },
  { category: "template", titleKey: "sectionTemplate" },
];

export default function BuildClient({ tool, presetId }: { tool: ToolId; presetId: string }) {
  const t = useTranslations("Build");
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
  const items = useMemo(() => (allItems ?? []).filter((i) => i.tool === tool), [allItems, tool]);

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
    return <p className="text-sm text-neutral-500">{t("loading")}</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-400">{toolMeta.label}</p>
        <h1 className="text-2xl font-bold tracking-tight">{preset.label}</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {preset.description}
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
              className="flex items-start gap-3 rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              <input
                type="checkbox"
                className="mt-1"
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
                  className="font-medium underline decoration-dotted underline-offset-2 hover:decoration-solid"
                >
                  {item.label.replace(/\.md$/, "")}
                </button>
                {item.description && (
                  <span className="block text-neutral-600 dark:text-neutral-400">
                    {item.description}
                  </span>
                )}
                <span className="block text-xs text-neutral-400">
                  {t("approxTokens", { count: item.approxTokens })}
                </span>
              </span>
            </label>
          );
        }

        return (
          <section key={category}>
            <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              {t(titleKey)}
            </h2>
            <div className="mt-3 flex flex-col gap-2">{realSkills.map(renderRow)}</div>

            {ruleSkills.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  {t("projectRulesTitle")}
                </h3>
                <p className="mt-1 text-xs text-neutral-500">
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
        <section className="rounded-lg border border-dashed border-neutral-300 p-4 dark:border-neutral-700">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            {t("externalToolsHeading")}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {preset.externalTools.map((t) => (
              <li key={t.name} className="text-sm">
                <span className="font-medium">{t.name}</span>
                <code className="ml-2 inline-block break-all rounded bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-900">
                  {t.installCommand}
                </code>
                {t.note && <p className="mt-1 text-xs text-neutral-500">{t.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="sticky bottom-4 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white/90 p-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {t("selectedSummary", { count: selected.size, tokens: totalTokens })}
        </span>
        <button
          onClick={handleDownload}
          disabled={downloading || selected.size === 0}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
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
