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
  const pathname = usePathname();

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
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
  );
}
