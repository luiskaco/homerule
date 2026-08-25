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
      // tool "antigravity" trae el superset de los 10 archivos (incluye
      // 00_GEMINI_START.md) — el contenido de los otros 9 es idéntico al de
      // claude-code, así que alcanza con esta lista para el ZIP.
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
    <div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{t("downloadBody")}</p>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="shrink-0 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {downloading ? t("generating") : t("download")}
        </button>
      </div>
    </div>
  );
}
