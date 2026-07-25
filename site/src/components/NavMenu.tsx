"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NavLink {
  label: string;
  href: string;
}

interface NavGroup {
  id: string;
  label: string;
  links: NavLink[];
}

const GROUPS: NavGroup[] = [
  {
    id: "antigravity",
    label: "Antigravity (Gemini)",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Stacks", href: "/stacks" },
      { label: "Armar manual", href: "/build?tool=antigravity&preset=manual" },
    ],
  },
  {
    id: "claude-code",
    label: "Claude Code",
    links: [
      { label: "Inicio", href: "/agents" },
      { label: "Subagentes Claude", href: "/subagentes" },
      { label: "Armar manual", href: "/build?tool=claude-code&preset=manual" },
    ],
  },
  {
    id: "skills",
    label: "Skills",
    links: [
      { label: "Catálogo", href: "/mejores-skill" },
      { label: "Por proyecto", href: "/skills-por-proyecto" },
      { label: "Glosario externo", href: "/glosario" },
      { label: "Templates de prompt", href: "/prompts" },
    ],
  },
];

function NavDropdown({
  group,
  open,
  onToggle,
  onClose,
}: {
  group: NavGroup;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

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
        className="flex items-center gap-1 hover:underline"
      >
        {group.label}
        <span aria-hidden="true" className="text-xs text-neutral-400">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 z-10 mt-2 flex min-w-[200px] flex-col gap-0.5 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          {group.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NavMenu() {
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
      {/* Desktop: dropdowns inline */}
      <div className="hidden flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:flex">
        {GROUPS.map((group) => (
          <NavDropdown
            key={group.id}
            group={group}
            open={openMenu === group.id}
            onToggle={() => setOpenMenu((current) => (current === group.id ? null : group.id))}
            onClose={() => setOpenMenu(null)}
          />
        ))}
      </div>

      {/* Mobile: botón hamburguesa */}
      <button
        type="button"
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 sm:hidden dark:border-neutral-700"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          {mobileOpen ? "✕" : "☰"}
        </span>
      </button>

      {/* Mobile: panel colapsable */}
      {mobileOpen && (
        <div className="absolute inset-x-0 top-full z-20 border-b border-neutral-200 bg-white px-4 py-4 shadow-lg sm:hidden dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto flex max-w-5xl flex-col gap-5">
            {GROUPS.map((group) => (
              <div key={group.id}>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {group.label}
                </p>
                <div className="mt-2 flex flex-col">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-2 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
