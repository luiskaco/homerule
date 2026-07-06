import Link from "next/link";
import { getPresetsByTool } from "@/lib/presets";
import { getItem } from "@/lib/manifest";

const CATEGORY_LABEL: Record<string, string> = {
  global: "Global",
  rule: "Rule",
  skill: "Skill",
  template: "Plantilla SDD",
  database: "DB",
  command: "Comando",
};

export default function StacksPage() {
  const presets = getPresetsByTool("antigravity");
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stacks — Antigravity</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Referencia de solo lectura — qué rules y skills están asociadas a
          cada stack. Para cambiar una asociación hay que editar{" "}
          <code>site/src/lib/presets.ts</code> en el repo. Para Claude Code,
          Codex, OpenCode y Cursor mirá{" "}
          <Link href="/agents" className="underline">
            Otros agentes
          </Link>
          .
        </p>
      </div>

      {presets.map((preset) => {
        const items = preset.itemIds
          .map((id) => getItem(id))
          .filter((i): i is NonNullable<typeof i> => Boolean(i))
          .filter((i) => i.category !== "global" && i.category !== "template");

        return (
          <section
            key={preset.id}
            className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div>
                <h2 className="font-semibold">{preset.label}</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {preset.description}
                </p>
              </div>
              <Link
                href={`/build?tool=antigravity&preset=${preset.id}`}
                className="self-start whitespace-nowrap rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900 sm:self-auto"
              >
                Armar este stack →
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item.id}
                  title={item.description}
                  className="rounded-full border border-neutral-200 px-3 py-1 text-xs dark:border-neutral-700"
                >
                  <span className="text-neutral-400">
                    {CATEGORY_LABEL[item.category]}
                  </span>{" "}
                  {item.label.replace(/\.md$/, "")}
                </span>
              ))}
            </div>

            {preset.externalTools.length > 0 && (
              <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Herramientas externas (no van en el ZIP)
                </h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {preset.externalTools.map((tool) => (
                    <li key={tool.name} className="text-sm">
                      <span className="font-medium">{tool.name}</span>
                      <code className="ml-2 inline-block break-all rounded bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-900">
                        {tool.installCommand}
                      </code>
                      {tool.note && (
                        <p className="mt-1 text-xs text-neutral-500">{tool.note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
