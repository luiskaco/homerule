import Link from "next/link";
import { EXTERNAL_SKILLS } from "@/lib/external-skills";

export default function GlosarioPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Glosario de skills externas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Skills de terceros que valen la pena y que{" "}
          <strong className="font-semibold">no</strong> viajan en el ZIP de{" "}
          <Link href="/build" className="underline">
            /build
          </Link>
          : se instalan aparte con su propio comando. Acá está qué hace cada
          una, cuándo conviene usarla y cómo se instala. Para las skills
          propias del hub, andá al{" "}
          <Link href="/mejores-skill" className="underline">
            Catálogo de Skills
          </Link>
          .
        </p>
      </div>

      {EXTERNAL_SKILLS.map((skill) => (
        <section
          key={skill.id}
          className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800 sm:p-6"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-mono text-lg font-semibold">{skill.label}</h2>
            <span className="text-xs text-neutral-500">por {skill.author}</span>
          </div>

          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {skill.summary}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a
              href={skill.site}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Sitio oficial ↗
            </a>
            <a
              href={skill.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Repositorio ↗
            </a>
          </div>

          <div className="mt-5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Para qué sirve
            </h3>
            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {skill.whatItDoes}
            </p>
          </div>

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

          <div className="mt-5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Cómo se instala
            </h3>
            <div className="mt-2 flex flex-col gap-3">
              {skill.install.map((step) => (
                <div key={step.tool}>
                  <p className="text-xs font-medium text-neutral-500">
                    {step.tool}
                  </p>
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
        </section>
      ))}
    </div>
  );
}
