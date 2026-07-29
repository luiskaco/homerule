import { setRequestLocale } from "next-intl/server";
import BuildClient from "@/components/BuildClient";
import type { ToolId } from "@/lib/manifest";

export default function BuildPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { tool?: string; preset?: string };
}) {
  setRequestLocale(params.locale);
  const tool = (searchParams.tool ?? "antigravity") as ToolId;
  return <BuildClient tool={tool} presetId={searchParams.preset ?? "manual"} />;
}
