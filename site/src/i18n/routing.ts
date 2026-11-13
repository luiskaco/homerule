import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  // La primera vista es en inglés para todos: `/` redirige a `/en` sin mirar el
  // idioma del navegador. El español queda a un clic en el selector de idioma.
  defaultLocale: "en",
  localeDetection: false,
  // Prefijo siempre explícito en la URL.
  // Requerido por `.agents/rules/ui-ux.md § i18n` y `seo.md § SEO Multi-idioma`.
  localePrefix: "always",
});

export const LOCALE_LABELS: Record<(typeof routing.locales)[number], string> = {
  en: "English",
  es: "Español",
};
