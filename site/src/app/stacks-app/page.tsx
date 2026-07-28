import Link from "next/link";
import { getPresetsByTool } from "@/lib/presets";
import { getItem } from "@/lib/manifest";

export default function StacksAppPage() {
  const presets = getPresetsByTool("antigravity").filter((p) => p.id !== "manual");

  const badgeCategoryColors: Record<string, string> = {
    rule: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-300",
    skill: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-900/50 dark:bg-pink-950/40 dark:text-pink-300",
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Header */}
      <section className="rounded-2xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 p-8 text-white shadow-lg">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-400/20 px-3 py-1 text-xs font-semibold text-violet-200 ring-1 ring-violet-400/30">
          ⚙️ Stacks de Aplicaciones
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Stacks recomendados para <span className="bg-gradient-to-r from-amber-300 to-pink-400 bg-clip-text text-transparent">crear aplicaciones</span>
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300 leading-relaxed text-sm">
          Desglose detallado de las tecnologías, arquitectura, reglas de código (rules) y habilidades (skills) que se activan para cada tipo de aplicación.
        </p>
      </section>

      {/* Grid de Stacks */}
      <div className="grid gap-6 sm:grid-cols-2">
        {presets.map((preset, idx) => {
          const items = preset.itemIds
            .map((id) => getItem(id))
            .filter((i): i is NonNullable<typeof i> => Boolean(i))
            .filter((i) => i.category === "rule" || i.category === "skill");

          const rules = items.filter((i) => i.category === "rule");
          const skills = items.filter((i) => i.category === "skill");

          const borderAccentColors = [
            "border-t-violet-500",
            "border-t-indigo-500",
            "border-t-pink-500",
            "border-t-emerald-500",
            "border-t-cyan-500",
            "border-t-amber-500",
            "border-t-purple-500",
          ];

          return (
            <div
              key={preset.id}
              className={`flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm border-t-4 ${borderAccentColors[idx % borderAccentColors.length]} transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{preset.label}</h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {preset.id}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-slate-300">
                  {preset.description}
                </p>

                {/* Rules asignadas */}
                <div className="mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Rules de Arquitectura ({rules.length})
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {rules.map((rule) => (
                      <span
                        key={rule.id}
                        className={`rounded-md border px-2 py-0.5 font-mono text-xs ${badgeCategoryColors.rule}`}
                      >
                        {rule.label.replace(/\.md$/, "")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills asignadas */}
                <div className="mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                    Skills Activas ({skills.length})
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <span
                          key={skill.id}
                          className={`rounded-md border px-2 py-0.5 font-mono text-xs ${badgeCategoryColors.skill}`}
                        >
                          {skill.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Ninguna skill requerida por defecto</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {preset.externalTools.length} herramienta(s) externa(s)
                </span>
                <Link
                  href={`/build?tool=antigravity&preset=${preset.id}`}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Usar Stack →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
