import { setRequestLocale } from "next-intl/server";
import BuildClient from "@/components/BuildClient";
import type { ToolId } from "@/lib/manifest";

export default async function BuildPage(
  props: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ tool?: string; preset?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  setRequestLocale(params.locale);
  const tool = (searchParams.tool ?? "antigravity") as ToolId;
  return <BuildClient tool={tool} presetId={searchParams.preset ?? "manual"} />;
}
