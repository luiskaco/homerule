"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { buildProjectZip, downloadBlob, type ProjectFile } from "@/lib/zip";

export interface TemplateOption {
  /** Nombre del archivo en `docs/`, por ejemplo `01_PRD.md`. */
  file: string;
  description: string;
  content: string;
  fixed: boolean;
}

/** `CLAUDE.md` del proyecto: solo importa AGENTS.md; las reglas generales están en el kit global. */
const CLAUDE_MD = "@AGENTS.md\n";

export default function NewProjectDownload({ templates, agentsMd }: { templates: TemplateOption[]; agentsMd: string }) {
  const t = useTranslations("NewProject");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(templates.filter((tpl) => tpl.fixed).map((tpl) => tpl.file)));
  const [state, setState] = useState<"idle" | "working" | "error">("idle");

  function toggle(file: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(file)) next.delete(file);
      else next.add(file);
      return next;
    });
  }

  async function handleDownload() {
    setState("working");
    try {
      const files: ProjectFile[] = [
        { path: "AGENTS.md", content: agentsMd },
        { path: "CLAUDE.md", content: CLAUDE_MD },
        ...templates.filter((tpl) => selected.has(tpl.file)).map((tpl) => ({ path: `docs/${tpl.file}`, content: tpl.content })),
      ];
      downloadBlob(await buildProjectZip(files), "proyecto-nuevo.zip");
      setState("idle");
    } catch {
      setState("error");
    }
  }

  const groups = [
    { title: t("fixedTitle"), items: templates.filter((tpl) => tpl.fixed) },
    { title: t("optionalTitle"), items: templates.filter((tpl) => !tpl.fixed) },
  ];

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">{t("rootTitle")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="font-mono text-sm font-semibold text-white">AGENTS.md</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{t("agentsMd")}</p>
          </li>
          <li className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="font-mono text-sm font-semibold text-white">CLAUDE.md</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{t("claudeMd")}</p>
          </li>
        </ul>
      </section>

      {groups.map((group) => (
        <fieldset key={group.title} className="flex flex-col gap-3">
          <legend className="text-lg font-semibold text-white">{group.title}</legend>
          <ul className="grid gap-3 sm:grid-cols-2">
            {group.items.map((tpl) => (
              <li key={tpl.file}>
                <label
                  className={`flex h-full gap-3 rounded-xl border bg-slate-900/60 p-4 transition-colors ${
                    selected.has(tpl.file) ? "border-violet-500/50" : "border-slate-800 hover:border-slate-700"
                  } ${tpl.fixed ? "cursor-default" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(tpl.file)}
                    disabled={tpl.fixed}
                    onChange={() => toggle(tpl.file)}
                    className="mt-1 h-4 w-4 shrink-0 accent-violet-500"
                  />
                  <span>
                    <span className="block font-mono text-sm font-semibold text-white">docs/{tpl.file}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-400">{tpl.description}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ))}

      <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-slate-400">{t("downloadBody", { count: selected.size + 2 })}</p>
        <div className="flex shrink-0 flex-col gap-1 sm:items-end">
          <button
            type="button"
            onClick={handleDownload}
            disabled={state === "working"}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 disabled:opacity-60"
          >
            {state === "working" ? t("generating") : t("download")}
          </button>
          <p role="status" className="min-h-5 text-xs text-rose-300">
            {state === "error" ? t("downloadError") : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
