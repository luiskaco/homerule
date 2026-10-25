"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { PromptTemplate } from "@/lib/prompt-templates";

export default function PromptTemplateCard({ template }: { template: PromptTemplate }) {
  const t = useTranslations("Prompts");
  const [copied, setCopied] = useState(false);

  const title = t(`items.${template.id}.title`);
  const whenToUse = t(`items.${template.id}.whenToUse`);
  const promptText = t(`items.${template.id}.template`);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(promptText);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = promptText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{whenToUse}</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
            copied
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-violet-500/50 hover:text-white"
          }`}
        >
          {copied ? t("copied") : t("copy")}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {template.skillRefs.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-mono text-xs text-violet-300"
          >
            {skill}
          </span>
        ))}
      </div>

      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap wrap-break-word rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs leading-relaxed text-slate-300">
        {promptText}
      </pre>
    </div>
  );
}
