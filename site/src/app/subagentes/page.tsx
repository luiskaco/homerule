import Link from "next/link";
import { getItemsByCategory } from "@/lib/manifest";
import { getPreset } from "@/lib/presets";

export default function SubagentesPage() {
  const agents = getItemsByCategory("agent").filter((i) => i.tool === "claude-code");
  const preset = getPreset("claude-code", "manual")!;

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Subagentes para Claude Code</h1>
        <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
          Un kit independiente de <code>.claude/agents/*.md</code> — pensado
          para Claude Code en solitario, no como adaptación del workflow
          híbrido con Gemini/Antigravity. Cada archivo corre en su propio
          contexto aislado, con sus propias tools permitidas, y se invoca por
          nombre o porque su <code>description</code> matchea la tarea.
        </p>
      </section>

      <section className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
        <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">
          ¿Qué es un subagente acá?
        </h2>
        <p className="mt-2">
          Un archivo <code>.md</code> con frontmatter (<code>name</code>,{" "}
          <code>description</code>, <code>tools</code>, <code>model</code>) en{" "}
          <code>.claude/agents/</code>. Claude Code lo delega vía Task tool
          cuando la tarea calza con su <code>description</code>, o cuando se
          invoca explícitamente por nombre. A diferencia de las skills, corre
          en contexto propio — no ensucia la conversación principal — y puede
          tener tools restringidas (ej. un auditor de solo lectura que no
          puede usar Edit).
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Los 6 agentes del kit</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
            >
              <h3 className="font-mono font-semibold">
                {agent.label.replace(/\.md$/, "")}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {agent.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="font-semibold">Descargar</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Los 6 agentes son iguales para cualquier stack — se incluyen por
          default en cualquier preset de Claude Code en <code>/build</code>.
          También podés armar el ZIP a mano y elegir solo los que quieras.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/build?tool=claude-code&preset=${preset.id}`}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Armar ZIP para Claude Code →
          </Link>
          <Link
            href="/agents"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Ver el resto de Otros agentes
          </Link>
        </div>
      </section>
    </div>
  );
}
