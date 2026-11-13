"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ItemPreviewModal from "@/components/ItemPreviewModal";
import type { ManifestItem } from "@/lib/manifest";
import { fetchManifestItems } from "@/lib/manifest-client";

/** Muestra el contenido de un item del kit. El manifest se pide recién al abrir, no viaja en la página. */
export default function CatalogPreviewButton({ itemId }: { itemId: string }) {
  const t = useTranslations("Preview");
  const [item, setItem] = useState<ManifestItem | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function open() {
    setState("loading");
    try {
      const found = (await fetchManifestItems()).find((i) => i.id === itemId);
      if (!found) throw new Error(itemId);
      setItem(found);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={state === "loading"}
        className="rounded-md px-2 py-1 text-xs font-medium text-violet-300 transition-colors hover:bg-slate-800 hover:text-violet-200 focus-visible:outline-2 focus-visible:outline-violet-400 disabled:opacity-60"
      >
        {state === "loading" ? t("loading") : state === "error" ? t("error") : t("open")}
      </button>
      {item && <ItemPreviewModal item={item} onClose={() => setItem(null)} />}
    </>
  );
}
