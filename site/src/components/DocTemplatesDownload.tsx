"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { fetchManifestItems } from "@/lib/manifest-client";
import { buildZip, downloadBlob } from "@/lib/zip";

export default function DocTemplatesDownload() {
  const t = useTranslations("DocTemplates");
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const allItems = await fetchManifestItems();
      // Las plantillas son idénticas en los dos tools (se emiten una vez por
      // tool) — alcanza con la lista de uno para armar el ZIP.
      const templates = allItems.filter((i) => i.category === "template" && i.tool === "antigravity");
      const blob = await buildZip(
        templates,
        templates.map((i) => i.id)
      );
      downloadBlob(blob, "plantillas-sdd.zip");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-slate-400">{t("downloadBody")}</p>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="shrink-0 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-400 disabled:opacity-50"
        >
          {downloading ? t("generating") : t("download")}
        </button>
      </div>
    </div>
  );
}
