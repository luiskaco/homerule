"use client";

import { useState } from "react";
import type { PromptTemplate } from "@/lib/prompt-templates";

export default function PromptTemplateCard({ template }: { template: PromptTemplate }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(template.template);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = template.template;
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
    <div className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{template.title}</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {template.whenToUse}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {template.skillRefs.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs dark:border-neutral-700"
          >
            {skill}
          </span>
        ))}
      </div>

      <pre className="mt-4 whitespace-pre-wrap break-words rounded-md bg-neutral-100 p-3 font-mono text-xs leading-relaxed text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
        {template.template}
      </pre>
    </div>
  );
}
