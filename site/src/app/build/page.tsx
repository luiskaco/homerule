import BuildClient from "@/components/BuildClient";
import type { ToolId } from "@/lib/manifest";

export default function BuildPage({
  searchParams,
}: {
  searchParams: { tool?: string; preset?: string };
}) {
  const tool = (searchParams.tool ?? "antigravity") as ToolId;
  return <BuildClient tool={tool} presetId={searchParams.preset ?? "manual"} />;
}
