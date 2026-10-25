import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/**
 * Dominio público. Va como `metadataBase` en el layout: sin él, Next resuelve el
 * canonical y el hreflang contra la URL de cada deploy (preview incluido).
 */
export const SITE_URL = "https://make-rule-ia.vercel.app";

/**
 * `alternates` de una página: canonical en su idioma y hreflang hacia la misma
 * ruta en cada idioma (`seo.md § SEO Multi-idioma`). Va en el `generateMetadata`
 * de cada página porque el layout no conoce la ruta: si lo declarara él, todas
 * las páginas dirían que su alternativa es la home.
 *
 * `path` es la ruta sin prefijo de idioma: `""` para la home, `/plantillas`, etc.
 */
export function localeAlternates(locale: string, path: string): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${routing.defaultLocale}${path}`,
    },
  };
}
