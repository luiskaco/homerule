import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // `manifest.json` es todo el catálogo y `BuildClient` lo pide por fetch
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
    ];
  },
};

export default withNextIntl(nextConfig);
