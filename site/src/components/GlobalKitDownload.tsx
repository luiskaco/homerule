"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TOOL_THEME, type KitTool } from "@/lib/kit";
import { buildGlobalKitZip, downloadBlob } from "@/lib/zip";

export default function GlobalKitDownload({ tool }: { tool: KitTool }) {
  const t = useTranslations("Install");
  const [state, setState] = useState<"idle" | "working" | "error">("idle");
  const theme = TOOL_THEME[tool];

  async function handleDownload() {
    setState("working");
    try {
      downloadBlob(await buildGlobalKitZip(tool), `kit-${tool}.zip`);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={state === "working"}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 ${theme.button} ${theme.focus}`}
      >
        {state === "working" ? t("generating") : t("download")}
      </button>
      <p role="status" className="min-h-5 text-xs text-rose-300">
        {state === "error" ? t("downloadError") : ""}
      </p>
    </div>
  );
}
