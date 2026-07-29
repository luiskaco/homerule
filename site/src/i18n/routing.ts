import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  // Prefijo siempre explícito en la URL — `/` redirige a `/es`.
  // Requerido por `.agents/rules/ui-ux.md § i18n` y `seo.md § SEO Multi-idioma`.
  localePrefix: "always",
});

export const LOCALE_LABELS: Record<(typeof routing.locales)[number], string> = {
  es: "Español",
  en: "English",
};
