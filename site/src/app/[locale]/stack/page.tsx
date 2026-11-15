import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StackApp } from "@/components/stack/StackApp";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Stack.page" });
  return { title: t("metaTitle"), description: t("metaDescription"), alternates: localeAlternates(locale, "/stack") };
}

export default async function StackPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Stack.page");

  return (
    <div className="flex flex-col gap-8">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-300">{t("intro")}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{t("languageNote")}</p>
      </section>
      <StackApp />
    </div>
  );
}
