import Link from "next/link";
import SkillCard from "@/components/SkillCard";
import { getCatalogSkills } from "@/lib/skill-catalog";

export default function MejoresSkillPage() {
  const skills = getCatalogSkills();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catálogo de Skills</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Todas las skills en un solo lugar para decidir qué instalar en el
          proyecto que tenés entre manos: para qué sirve cada una, cuándo
          usarla, el comando exacto de instalación y cómo se invoca. ¿Preferís
          verlas agrupadas por tipo de trabajo (SEO, Web, Backend...)?{" "}
          <Link href="/skills-por-proyecto" className="underline">
            Ir a Skills por proyecto
          </Link>
          .
        </p>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Las marcadas <strong className="font-semibold">Del hub</strong> son
          las que ya vienen armadas acá y se pueden bajar juntas desde{" "}
          <Link href="/build" className="underline">
            /build
          </Link>
          . Las <strong className="font-semibold">Externas</strong> son de
          terceros: se instalan aparte, con su propio comando.
        </p>
      </div>

      {/* Índice — saltar directo a la skill */}
      <nav className="flex flex-wrap gap-1.5 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        {skills.map((skill) => (
          <a
            key={skill.id}
            href={`#${skill.label}`}
            className="rounded-full border border-neutral-200 px-2.5 py-0.5 font-mono text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            {skill.label}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-6">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
}
