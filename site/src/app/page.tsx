import Link from "next/link";
import { getPresetsByTool } from "@/lib/presets";

export default function HomePage() {
  const presets = getPresetsByTool("antigravity");
  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 text-white shadow-xl shadow-indigo-950/20">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-3.5 py-1 text-xs font-semibold tracking-wide text-violet-300 ring-1 ring-inset ring-violet-500/40">
          🚀 Workflow Dual-AI
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Arrancá tu próximo proyecto <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">en un click</span>
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300 leading-relaxed">
          Elegí el stack de tu proyecto nuevo y descargá un ZIP con el{" "}
          <code className="rounded bg-indigo-900/80 px-1.5 py-0.5 font-mono text-sm font-semibold text-amber-300">GEMINI.md</code> global, las rules y skills de{" "}
          <code className="rounded bg-indigo-900/80 px-1.5 py-0.5 font-mono text-sm font-semibold text-cyan-300">.agents/</code>, y las plantillas SDD de <code className="rounded bg-indigo-900/80 px-1.5 py-0.5 font-mono text-sm font-semibold text-pink-300">/docs</code> ya
          organizadas — listo para copiar.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        {presets.map((preset, idx) => {
          const colorClasses = [
            "card-vibrant-purple border-l-4 border-l-violet-600 dark:border-l-violet-500",
            "card-vibrant-emerald border-l-4 border-l-emerald-600 dark:border-l-emerald-500",
            "card-vibrant-amber border-l-4 border-l-amber-500 dark:border-l-amber-400",
          ];
          const badgeColors = [
            "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
            "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
          ];

          return (
            <Link
              key={preset.id}
              href={`/build?tool=antigravity&preset=${preset.id}`}
              className={`group flex flex-col justify-between rounded-xl p-6 shadow-sm ${colorClasses[idx % colorClasses.length]}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                    {preset.label}
                  </h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColors[idx % badgeColors.length]}`}>
                    Preset
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed dark:text-slate-300">
                  {preset.description}
                </p>
              </div>
              <div className="mt-5 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Usar este preset <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-6 text-sm text-slate-700 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-slate-300">
        <h3 className="font-bold text-indigo-900 dark:text-indigo-200">¿Querés explorar antes de elegir?</h3>
        <p className="mt-1.5 leading-relaxed">
          Mirá la página{" "}
          <Link href="/stacks" className="font-semibold text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            Stacks
          </Link>
          . Si usás{" "}
          <Link href="/agents" className="font-semibold text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            Claude Code
          </Link>{" "}
          de forma individual en vez del híbrido con Antigravity, también hay{" "}
          <Link href="/subagentes" className="font-semibold text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            subagentes
          </Link>{" "}
          (<code>.claude/agents/</code>) listos para descargar.
        </p>
      </section>

      <section className="rounded-xl border-2 border-pink-100 bg-gradient-to-br from-white to-pink-50/30 p-6 shadow-sm dark:border-pink-950/50 dark:from-slate-900 dark:to-pink-950/10">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-xs text-white">✨</span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Más skills disponibles</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-slate-300">
          Este catálogo trae empaquetadas las skills que ya usamos en
          nuestros proyectos. Si necesitás algo que no está acá,{" "}
          <a
            href="https://www.skills.sh/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-pink-600 underline hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
          >
            skills.sh
          </a>{" "}
          es el directorio oficial para buscar e instalar skills de la comunidad.
        </p>
      </section>
    </div>
  );
}
