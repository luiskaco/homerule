"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";

interface NavLink {
  /** Clave del namespace `Nav` en messages/*.json. */
  labelKey: string;
  href: string;
}

type NavEntry =
  | { id: string; labelKey: string; href: string }
  | { id: string; labelKey: string; links: NavLink[] };

const ENTRIES: NavEntry[] = [
  {
    id: "antigravity-solo",
    labelKey: "antigravitySolo",
    links: [
      { labelKey: "presetsByStack", href: "/antigravity" },
      { labelKey: "rulesAndSkillsByStack", href: "/stacks" },
      { labelKey: "subagents", href: "/subagentes" },
      { labelKey: "buildCustom", href: "/build?tool=antigravity&preset=manual" },
    ],
  },
  {
    id: "claude-solo",
    labelKey: "claudeSolo",
    links: [
      { labelKey: "presetsByStack", href: "/agents" },
      { labelKey: "subagents", href: "/subagentes" },
      { labelKey: "buildCustom", href: "/build?tool=claude-code&preset=manual" },
    ],
  },
  {
    id: "skills",
    labelKey: "skillsPrompts",
    links: [
      { labelKey: "skillCatalog", href: "/mejores-skill" },
      { labelKey: "promptTemplates", href: "/prompts" },
    ],
  },
  {
    id: "doc-templates",
    labelKey: "docTemplates",
    href: "/plantillas",
  },
  {
    id: "changelog",
    labelKey: "changelog",
    href: "/changelog",
  },
];

function NavDropdown({
  labelKey,
  links,
  open,
  onToggle,
  onClose,
  currentPathname,
}: {
  labelKey: string;
  links: NavLink[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  currentPathname: string;
}) {
  const t = useTranslations("Nav");
  const ref = useRef<HTMLDivElement>(null);
  const isGroupActive = links.some((l) => l.href === currentPathname);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
          isGroupActive || open
            ? "bg-slate-800/80 text-violet-300 ring-1 ring-violet-500/30"
            : "text-slate-300 hover:bg-slate-900 hover:text-white"
        }`}
      >
        {t(labelKey)}
        <span
          aria-hidden="true"
          className={`text-xs transition-transform duration-200 text-slate-400 ${open ? "rotate-180 text-violet-400" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 sm:left-0 z-50 mt-2 flex min-w-[220px] flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {links.map((link) => {
            const isActive = currentPathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={onClose}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <span>{t(link.labelKey)}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-violet-400"></span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NavMenu() {
  const t = useTranslations("Nav");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop: dropdowns y links directos inline */}
      <div className="hidden items-center gap-1.5 text-sm sm:flex">
        {ENTRIES.map((entry) =>
          "href" in entry ? (
            <Link
              key={entry.id}
              href={entry.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                pathname === entry.href
                  ? "bg-slate-800/80 text-violet-300 ring-1 ring-violet-500/30"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {t(entry.labelKey)}
            </Link>
          ) : (
            <NavDropdown
              key={entry.id}
              labelKey={entry.labelKey}
              links={entry.links}
              open={openMenu === entry.id}
              onToggle={() => setOpenMenu((current) => (current === entry.id ? null : entry.id))}
              onClose={() => setOpenMenu(null)}
              currentPathname={pathname}
            />
          )
        )}
      </div>

      {/* Mobile: hamburguesa */}
      <button
        type="button"
        aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white sm:hidden"
      >
        <span aria-hidden="true" className="text-base leading-none">
          {mobileOpen ? "✕" : "☰"}
        </span>
      </button>

      {/* Mobile: panel desplegable */}
      {mobileOpen && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-slate-800 bg-slate-950/95 px-4 py-5 shadow-2xl backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            {ENTRIES.map((entry) => {
              if ("href" in entry) {
                return (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      pathname === entry.href ? "text-violet-300" : "text-violet-400 hover:text-violet-300"
                    }`}
                  >
                    {t(entry.labelKey)}
                  </Link>
                );
              }
              return (
                <div key={entry.id}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                    {t(entry.labelKey)}
                  </p>
                  <div className="mt-2 flex flex-col gap-1">
                    {entry.links.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-violet-600/20 text-violet-300 font-semibold"
                              : "text-slate-300 hover:bg-slate-900 hover:text-white"
                          }`}
                        >
                          {t(link.labelKey)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

