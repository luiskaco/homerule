import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // `manifest.json` es todo el catálogo y la vista previa del catálogo lo pide por fetch
        // desde el browser, siempre con la misma URL. Sin esto queda cacheado y
        // el sitio sigue mostrando el catálogo viejo después de un deploy —
        // pasó con los subagentes: la página mostraba 6 cuando ya eran 8.
        //
        // `no-cache` no significa "no cachear": significa revalidar antes de
        // usar. Como el archivo pesa ~1 MB pero cambia poco, el browser recibe
        // un 304 vacío mientras no cambie, y solo re-descarga cuando cambió.
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
      {
        // Lo mismo para los kits globales y el instalador que bajan los ZIPs de /instalar.
        source: "/global-kit/:file*",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
    ];
  },
  // Rutas de los kits por proyecto, previas al kit global (ADR-024, ADR-039).
  // Corren antes del proxy de next-intl, así que la versión sin idioma
  // (/antigravity) hace un salto más: proxy → /es/antigravity → destino.
  async redirects() {
    const locale = "/:locale(es|en)";
    return [
      { source: `${locale}/antigravity`, destination: "/:locale/instalar", permanent: true },
      { source: `${locale}/agents`, destination: "/:locale/instalar", permanent: true },
      { source: `${locale}/stacks`, destination: "/:locale/catalogo", permanent: true },
      { source: `${locale}/subagentes`, destination: "/:locale/catalogo", permanent: true },
      { source: `${locale}/kits/:tool/stacks`, destination: "/:locale/catalogo", permanent: true },
      { source: `${locale}/kits/:tool/subagentes`, destination: "/:locale/catalogo", permanent: true },
      { source: `${locale}/kits/:path*`, destination: "/:locale/instalar", permanent: true },
      { source: `${locale}/kits`, destination: "/:locale/instalar", permanent: true },
      { source: `${locale}/build`, destination: "/:locale/instalar", permanent: true },
      { source: `${locale}/plantillas`, destination: "/:locale/proyecto-nuevo", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
