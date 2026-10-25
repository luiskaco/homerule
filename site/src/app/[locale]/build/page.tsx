import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BuildClient from "@/components/BuildClient";
import KitHeader from "@/components/KitHeader";
import { isToolId } from "@/lib/kit";
import { getPreset } from "@/lib/presets";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Kit" });
  return { title: t("buildMetaTitle"), alternates: localeAlternates(locale, "/build") };
}

export default async function BuildPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tool?: string; preset?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(locale);

  // Un `?tool=` desconocido cae en Antigravity en vez de romper el armador.
  const tool = isToolId(searchParams.tool) ? searchParams.tool : "antigravity";
  const preset = getPreset(tool, searchParams.preset ?? "manual") ? searchParams.preset! : "manual";

  return (
    <div className="flex flex-col gap-8">
      <KitHeader tool={tool} preset={preset} />
      {/* El key reinicia la selección al cambiar de tool o preset: BuildClient la
          inicializa con useState y, sin remount, arrastraría la del tool anterior. */}
      <BuildClient key={`${tool}:${preset}`} tool={tool} presetId={preset} />
    </div>
  );
}
