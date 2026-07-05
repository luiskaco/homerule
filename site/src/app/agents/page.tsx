import Link from "next/link";
import { TOOLS, getPresetsByTool } from "@/lib/presets";

export default function AgentsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Otros agentes</h1>
        <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
          Además de Antigravity/Gemini, empaquetamos memoria, skills y comandos
          nativos para Claude Code, Codex CLI, OpenCode y Cursor — investigado
          contra la documentación oficial de cada uno y el estándar{" "}
          <code>SKILL.md</code> que usa{" "}
          <a
            href="https://www.skills.sh/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            skills.sh
          </a>
          .
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {TOOLS.filter((t) => t.id !== "antigravity").map((tool) => {
          const toolPresets = getPresetsByTool(tool.id);
          const defaultPreset = toolPresets.find((p) => p.id !== "manual") ?? toolPresets[0];
          return (
            <Link
              key={tool.id}
              href={`/build?tool=${tool.id}&preset=${defaultPreset.id}`}
              className="rounded-lg border border-neutral-200 p-5 transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
            >
              <h2 className="font-semibold">{tool.label}</h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {tool.description}
              </p>
              {toolPresets.length > 1 && (
                <p className="mt-3 text-xs text-neutral-400">
                  {toolPresets.length} stacks disponibles
                </p>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
