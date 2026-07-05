import type { ManifestItem } from "@/lib/manifest";

/** Client-safe loader — fetches public/manifest.json instead of bundling it into JS. */
export async function fetchManifestItems(): Promise<ManifestItem[]> {
  const res = await fetch("/manifest.json");
  const data = (await res.json()) as { items: ManifestItem[] };
  return data.items;
}
