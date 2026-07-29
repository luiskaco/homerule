"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { ManifestItem } from "@/lib/manifest";

export default function ItemPreviewModal({
  item,
  onClose,
}: {
  item: ManifestItem;
  onClose: () => void;
}) {
  const t = useTranslations("Build");
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-4 dark:border-neutral-800">
          <div>
            <h3 className="font-semibold">{item.label.replace(/\.md$/, "")}</h3>
            {item.description && (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {item.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            ✕
          </button>
        </div>

        {item.files.length > 1 && (
          <div className="flex flex-wrap gap-1 border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
            {item.files.map((f, i) => (
              <button
                key={f.destPath}
                onClick={() => setActiveFile(i)}
                className={`rounded px-2 py-1 text-xs ${
                  i === activeFile
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {f.destPath}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-auto p-4">
          <p className="mb-2 font-mono text-xs text-neutral-400">{file.destPath}</p>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
            {file.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
