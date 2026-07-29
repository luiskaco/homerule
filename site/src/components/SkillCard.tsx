import { useTranslations } from "next-intl";
import type { CatalogSkill } from "@/lib/skill-catalog";

/** Tarjeta de detalle de una skill en el catálogo. */
export default function SkillCard({ skill }: { skill: CatalogSkill }) {
  const t = useTranslations("SkillCard");

  return (
    <section
      id={skill.label}
      className="scroll-mt-20 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700 sm:p-7"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <h2 className="font-mono text-xl font-bold text-white tracking-tight">{skill.label}</h2>
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-semibold border ${
            skill.origin === "hub"
              ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
          }`}
        >
          {skill.origin === "hub" ? t("originHub") : t("originExternal")}
        </span>
        <span className="text-xs text-slate-400 font-medium">{t("byAuthor", { author: skill.author })}</span>
      </div>

      <p className="mt-3 text-sm text-slate-300 leading-relaxed">
        {skill.summary}
      </p>

      {(skill.site || skill.repo) && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
          {skill.site && (
            <a
              href={skill.site}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
            >
              {t("officialSite")}
            </a>
          )}
          {skill.repo && (
            <a
              href={skill.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
            >
              {t("repository")}
            </a>
          )}
        </div>
      )}

      {skill.whatItDoes && (
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t("whatItDoes")}
          </h3>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {skill.whatItDoes}
          </p>
        </div>
      )}

      {skill.whenToUse.length > 0 && (
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t("whenToUse")}
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-slate-300">
            {skill.whenToUse.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {skill.includes && (
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t("includes", { count: skill.includes.length })}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {skill.includes.map((sub) => (
              <div
                key={sub.name}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5"
              >
                <p className="font-mono text-xs font-bold text-violet-300">{sub.name}</p>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {sub.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {skill.install.length > 0 && (
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t("howToInstall")}
          </h3>
          <div className="mt-3 flex flex-col gap-3">
            {skill.install.map((step) => (
              <div key={step.tool}>
                <p className="text-xs font-semibold text-slate-300">{step.tool}</p>
                <pre className="mt-1.5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-xs text-emerald-400">
                  <code>{step.command}</code>
                </pre>
                {step.note && (
                  <p className="mt-1 text-xs text-slate-400">{step.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {skill.usage.length > 0 && (
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t("howToUse")}
          </h3>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-slate-300">
            {skill.usage.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {skill.stacks.length > 0 && (
        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t("includedInStacks")}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {skill.stacks.map((stack) => (
              <span
                key={stack.id}
                className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-200"
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

