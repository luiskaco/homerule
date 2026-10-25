"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { ToolId } from "@/lib/manifest";
import {
  KIT_SECTIONS,
  KIT_TOOLS,
  LAST_TOOL_EVENT,
  LAST_TOOL_KEY,
  TOOL_THEME,
  kitHref,
  sectionFromPathname,
} from "@/lib/kit";

/**
 * Cabecera común de las páginas del kit: selector de tool + pestañas de
 * sección. Todo son links (rastreables, funcionan sin JS); el selector conserva
 * la sección actual y, en el armador, el preset.
 */
export default function KitHeader({ tool, preset }: { tool: ToolId; preset?: string }) {
  const t = useTranslations("Kit");
  const tools = useTranslations("Tools");
  const pathname = usePathname();
  const section = sectionFromPathname(pathname) ?? "presets";
  const theme = TOOL_THEME[tool];

  // El link "Kits" del nav lleva al último tool elegido.
  useEffect(() => {
    try {
      localStorage.setItem(LAST_TOOL_KEY, tool);
    } catch {
      // Storage bloqueado (modo privado, etc.): igual avisa al nav por el evento.
    }
    window.dispatchEvent(new CustomEvent<ToolId>(LAST_TOOL_EVENT, { detail: tool }));
  }, [tool]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span id="kit-tool-label" className="text-sm font-medium text-slate-400">
          {t("toolLabel")}
        </span>
        <div
          role="group"
          aria-labelledby="kit-tool-label"
          className="inline-flex max-w-full rounded-xl border border-slate-800 bg-slate-900/80 p-1"
        >
          {KIT_TOOLS.map((id) => {
            const active = id === tool;
            return (
              <Link
                key={id}
                href={kitHref(id, section, preset)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold sm:px-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${TOOL_THEME[id].focus} ${
                  active ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-100"
                }`}
              >
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${active ? TOOL_THEME[id].dot : "bg-slate-600"}`} />
                {tools(`${id}.label`)}
              </Link>
            );
          })}
        </div>
      </div>

      <nav aria-label={t("sectionsLabel")} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-1 border-b border-slate-800">
          {KIT_SECTIONS.map((id) => {
            const active = id === section;
            return (
              <li key={id}>
                <Link
                  href={kitHref(tool, id, preset)}
                  aria-current={active ? "page" : undefined}
                  className={`-mb-px block whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 ${theme.focus} ${
                    active ? theme.tabActive : "border-transparent text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {t(`tabs.${id}`)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
