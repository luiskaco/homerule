"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_LABELS, routing } from "@/i18n/routing";

/** Cambia de idioma manteniendo la ruta actual. */
export default function LocaleSwitcher() {
  const t = useTranslations("Layout");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-800 bg-slate-900 p-0.5">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-label={`${t("languageLabel")}: ${LOCALE_LABELS[l]}`}
          aria-current={l === locale ? "true" : undefined}
          // Conserva el query de la página al cambiar de idioma.
          onClick={() => router.replace(`${pathname}${window.location.search}`, { locale: l })}
          className={`rounded-md px-2 py-1 text-xs font-bold uppercase transition-colors ${
            l === locale
              ? "bg-violet-600/20 text-violet-300"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
