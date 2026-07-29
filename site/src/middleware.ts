import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Todas las rutas excepto /api, /trpc, internos de Next y archivos con punto
  // (favicon.ico, manifest.json, etc.).
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
