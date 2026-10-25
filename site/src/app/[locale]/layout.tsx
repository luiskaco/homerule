import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import NavMenu from "@/components/NavMenu";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: "Layout" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      // hreflang por idioma — `seo.md § SEO Multi-idioma`.
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function LocaleLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const { locale } = params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const t = await getTranslations("Layout");

  return (
    <html lang={locale} className="dark">
      <body className="flex min-h-screen flex-col bg-slate-950 text-slate-100 relative antialiased selection:bg-violet-500 selection:text-white">
        <NextIntlClientProvider>
          {/* Background Ambient Mesh & Glows */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-ambient-pulse" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] animate-ambient-pulse" style={{ animationDelay: "3s" }} />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] animate-ambient-pulse" style={{ animationDelay: "5s" }} />
            <div className="absolute inset-0 bg-mesh-pattern opacity-40" />
          </div>

          {/* Sticky Glass Header */}
          <header className="sticky top-0 z-50 glass-header">
            <div className="h-0.5 w-full bg-linear-to-r from-violet-500 via-indigo-500 via-pink-500 to-cyan-400" />
            <nav className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
              <Link href="/" className="group flex items-center gap-2.5 text-lg font-bold tracking-tight">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 via-indigo-600 to-pink-500 font-extrabold text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
                  <span className="text-sm font-black tracking-widest">AI</span>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                  </span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-gradient-purple text-base font-black tracking-tight">{t("brand")}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {t("brandTagline")}
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <NavMenu />
                <LocaleSwitcher />
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
            {children}
          </main>

          {/* Footer */}
          <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-8 text-sm text-slate-400 sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="font-medium text-slate-300">{t("footerTagline")}</span>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <Link
                  href="/changelog"
                  className="inline-flex items-center gap-1.5 font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {t("footerChangelog")}
                </Link>
                <span className="text-slate-700">•</span>
                <a
                  href="https://www.skills.sh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {t("footerDirectory")}
                </a>
                <span className="text-slate-700">•</span>
                <span className="text-slate-500">{t("footerTools")}</span>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
