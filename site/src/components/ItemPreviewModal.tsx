"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { ManifestItem } from "@/lib/manifest";
import { resolveItemDescription } from "@/lib/item-description";

export default function ItemPreviewModal({
  item,
  onClose,
}: {
  item: ManifestItem;
  onClose: () => void;
}) {
  const t = useTranslations("Build");
  const descriptions = useTranslations("ItemDescriptions");
  const [activeFile, setActiveFile] = useState(0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const file = item.files[activeFile];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="glass-panel flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-4">
          <div>
            <h3 className="font-mono font-bold text-white">{item.label.replace(/\.md$/, "")}</h3>
            {item.description && (
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                {resolveItemDescription(item, descriptions)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {item.files.length > 1 && (
          <div className="flex flex-wrap gap-1 border-b border-slate-800 px-4 py-2">
            {item.files.map((f, i) => (
              <button
                key={f.destPath}
                onClick={() => setActiveFile(i)}
                className={`rounded-lg px-2 py-1 font-mono text-xs transition ${
                  i === activeFile
                    ? "bg-violet-500 text-white"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                {f.destPath}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-auto p-4">
          <p className="mb-2 font-mono text-xs text-slate-500">{file.destPath}</p>
          <pre className="whitespace-pre-wrap wrap-break-word font-mono text-xs leading-relaxed text-slate-300">
            {file.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
