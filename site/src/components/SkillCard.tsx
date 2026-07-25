import type { CatalogSkill } from "@/lib/skill-catalog";

/** Tarjeta de detalle de una skill en el catálogo. */
export default function SkillCard({ skill }: { skill: CatalogSkill }) {
  return (
    <section
      id={skill.label}
      className="scroll-mt-6 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-mono text-lg font-semibold">{skill.label}</h2>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs ${
            skill.origin === "hub"
              ? "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
              : "border-amber-400/60 text-amber-700 dark:text-amber-400"
          }`}
        >
          {skill.origin === "hub" ? "Del hub" : "Externa"}
        </span>
        <span className="text-xs text-neutral-500">por {skill.author}</span>
      </div>

      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        {skill.summary}
      </p>

      {(skill.site || skill.repo) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {skill.site && (
            <a
              href={skill.site}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Sitio oficial ↗
            </a>
          )}
          {skill.repo && (
            <a
              href={skill.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Repositorio ↗
            </a>
          )}
        </div>
      )}

      {skill.whatItDoes && (
        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Para qué sirve
          </h3>
          <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            {skill.whatItDoes}
          </p>
        </div>
      )}

      {skill.whenToUse.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Cuándo usarla
          </h3>
          <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-5 text-sm text-neutral-600 dark:text-neutral-400">
            {skill.whenToUse.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {skill.includes && (
        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Qué incluye ({skill.includes.length} skills)
          </h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {skill.includes.map((sub) => (
              <div
                key={sub.name}
                className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <p className="font-mono text-sm font-semibold">{sub.name}</p>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {sub.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {skill.install.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Cómo se instala
          </h3>
          <div className="mt-2 flex flex-col gap-3">
            {skill.install.map((step) => (
              <div key={step.tool}>
                <p className="text-xs font-medium text-neutral-500">{step.tool}</p>
                <pre className="mt-1 overflow-x-auto rounded bg-neutral-100 px-3 py-2 text-xs dark:bg-neutral-900">
                  <code>{step.command}</code>
                </pre>
                {step.note && (
                  <p className="mt-1 text-xs text-neutral-500">{step.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {skill.usage.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Cómo se usa
          </h3>
          <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-5 text-sm text-neutral-600 dark:text-neutral-400">
            {skill.usage.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {skill.notes && (
        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            A tener en cuenta
          </h3>
          <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-5 text-sm text-neutral-600 dark:text-neutral-400">
            {skill.notes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {skill.stacks.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Ya incluida en estos stacks de /build
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skill.stacks.map((stack) => (
              <span
                key={stack.id}
                className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs dark:border-neutral-700"
              >
                {stack.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
