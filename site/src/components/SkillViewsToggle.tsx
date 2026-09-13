"use client";

import { useState, type ReactNode } from "react";

type View = "flat" | "byProject";

/**
 * Alterna entre las dos vistas del catálogo (lista plana / agrupada por tipo de
 * trabajo). Las dos llegan ya renderizadas desde el server component: se
 * ocultan con `hidden` en vez de montarse al cambiar de pestaña, así el HTML
 * estático conserva las dos y la página sigue siendo indexable completa.
 */
export default function SkillViewsToggle({
  flatLabel,
  byProjectLabel,
  flatView,
  byProjectView,
}: {
  flatLabel: string;
  byProjectLabel: string;
  flatView: ReactNode;
  byProjectView: ReactNode;
}) {
  const [view, setView] = useState<View>("flat");

  const tab = (value: View, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={view === value}
      aria-controls={`skills-panel-${value}`}
      id={`skills-tab-${value}`}
      onClick={() => setView(value)}
      className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
        view === value
          ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
          : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div role="tablist" className="flex flex-wrap gap-2">
        {tab("flat", flatLabel)}
        {tab("byProject", byProjectLabel)}
      </div>

      <div role="tabpanel" id="skills-panel-flat" aria-labelledby="skills-tab-flat" hidden={view !== "flat"}>
        {flatView}
      </div>
      <div
        role="tabpanel"
        id="skills-panel-byProject"
        aria-labelledby="skills-tab-byProject"
        hidden={view !== "byProject"}
      >
        {byProjectView}
      </div>
    </>
  );
}
