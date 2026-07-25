import Link from "next/link";
import { getItemsByCategory } from "@/lib/manifest";
import { getStacksForSkill } from "@/lib/skill-stacks";

const NO_INSTALL_FALLBACK =
  "Se incluye directamente en el ZIP de /build — no requiere instalación aparte.";

export default function MejoresSkillPage() {
  const skills = getItemsByCategory("skill")
    .filter((i) => i.tool === "antigravity")
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catálogo de Skills</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Qué skill existe, para qué sirve, cómo se instala de forma manual y
          en qué stacks ya viene incluida por defecto. ¿Preferís verlas
          agrupadas por tipo de trabajo (SEO, Web, Backend...) en vez de en
          una lista?{" "}
          <Link href="/skills-por-proyecto" className="underline">
            Ir a Skills por proyecto
          </Link>
          .
        </p>
      </div>

      {/* Mobile: cards apiladas */}
      <div className="flex flex-col gap-3 sm:hidden">
        {skills.map((skill) => {
          const stacks = getStacksForSkill(skill.label);
          return (
            <div
              key={skill.id}
              className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <h2 className="font-mono font-semibold">{skill.label}</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {skill.description || "—"}
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
                Instalación
              </p>
              <code className="mt-1 block break-words rounded bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-900">
                {skill.install || NO_INSTALL_FALLBACK}
              </code>
              {stacks.length > 0 && (
                <>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Aplica a
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {stacks.map((stack) => (
                      <span
                        key={stack.id}
                        className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs dark:border-neutral-700"
                      >
                        {stack.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Para qué sirve</th>
              <th className="px-4 py-3 font-medium">Instalación</th>
              <th className="px-4 py-3 font-medium">Aplica a</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => {
              const stacks = getStacksForSkill(skill.label);
              return (
                <tr
                  key={skill.id}
                  className="border-b border-neutral-100 align-top last:border-0 dark:border-neutral-900"
                >
                  <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap">
                    {skill.label}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                    {skill.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <code className="block max-w-xs break-words rounded bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-900">
                      {skill.install || NO_INSTALL_FALLBACK}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    {stacks.length === 0 ? (
                      <span className="text-neutral-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {stacks.map((stack) => (
                          <span
                            key={stack.id}
                            className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs dark:border-neutral-700"
                          >
                            {stack.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
