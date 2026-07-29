import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Wrappers locale-aware de las APIs de navegación de Next.
 * Importar `Link` / `usePathname` desde acá y no de `next/link` /
 * `next/navigation`, para que el prefijo de idioma se mantenga solo.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
