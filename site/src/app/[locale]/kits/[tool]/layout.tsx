import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import KitHeader from "@/components/KitHeader";
import { routing } from "@/i18n/routing";
import { KIT_TOOLS, isToolId } from "@/lib/kit";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => KIT_TOOLS.map((tool) => ({ locale, tool })));
}

export default async function KitLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; tool: string }>;
}) {
  const { locale, tool } = await props.params;
  if (!isToolId(tool)) notFound();
  setRequestLocale(locale);

  return (
    <div className="flex flex-col gap-8">
      <KitHeader tool={tool} />
      {props.children}
    </div>
  );
}
