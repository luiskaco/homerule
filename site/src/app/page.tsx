import Link from "next/link";
import { getPresetsByTool } from "@/lib/presets";

export default function HomePage() {
  const presets = getPresetsByTool("antigravity");
  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">
          Arrancá tu próximo proyecto en un click
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
          Elegí el stack de tu proyecto nuevo y descargá un ZIP con el{" "}
          <code>GEMINI.md</code> global, las rules y skills de{" "}
          <code>.agents/</code>, y las plantillas SDD de <code>/docs</code> ya
          organizadas — listo para copiar.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {presets.map((preset) => (
          <Link
            key={preset.id}
            href={`/build?tool=antigravity&preset=${preset.id}`}
            className="rounded-lg border border-neutral-200 p-5 transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
          >
            <h2 className="font-semibold">{preset.label}</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {preset.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
        ¿Querés ver qué rules/skills trae cada stack antes de elegir? Mirá la
        página{" "}
        <Link href="/stacks" className="underline">
          Stacks
        </Link>
. ¿Usás{" "}
        <Link href="/agents" className="underline">
          Claude Code
        </Link>{" "}
        de forma individual en vez del híbrido con Antigravity? También hay{" "}
        <Link href="/subagentes" className="underline">
          subagentes
        </Link>{" "}
        (<code>.claude/agents/</code>) listos para descargar.
      </section>

      <section className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="font-semibold">Más skills</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Este catálogo trae empaquetadas las skills que ya usamos en
          nuestros proyectos. Si necesitás algo que no está acá,{" "}
          <a
            href="https://www.skills.sh/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            skills.sh
          </a>{" "}
          es el directorio para buscar e instalar skills de la comunidad.
        </p>
      </section>
    </div>
  );
}
