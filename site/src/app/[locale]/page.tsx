import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getItemsByCategory } from "@/lib/manifest";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await props.params;
  return { alternates: localeAlternates(locale, "") };
}

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("Home");

  const ruleCount = getItemsByCategory("rule").length + 1;
  const skillCount = getItemsByCategory("skill").filter((i) => i.tool === "antigravity").length;
  const agentCount = getItemsByCategory("agent").filter((i) => i.tool === "claude-code").length;

  const steps = [
    {
      id: "install",
      step: t("step1Eyebrow"),
      title: t("step1Title"),
      body: t("step1Body"),
      cta: t("step1Cta"),
      href: "/instalar",
    },
    {
      id: "project",
      step: t("step2Eyebrow"),
      title: t("step2Title"),
      body: t("step2Body"),
      cta: t("step2Cta"),
      href: "/proyecto-nuevo",
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-linear-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl sm:p-12">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-cyan-600/20 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start gap-5">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-300">{t("badge")}</p>
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl sm:leading-tight">
            {t("titleStart")} <span className="text-gradient-purple">{t("titleAccent")}</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{t("intro")}</p>
          <ul className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-400">
            {[t("statRules", { count: ruleCount }), t("statSkills", { count: skillCount }), t("statAgents", { count: agentCount })].map((stat) => (
              <li key={stat} className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5">
                {stat}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-violet-500/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-violet-300">{step.step}</p>
              <h2 className="mt-2 text-xl font-bold text-white">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.body}</p>
            </div>
            <span className="mt-6 text-sm font-bold text-violet-300 group-hover:text-violet-200">
              {step.cta}
              <span aria-hidden="true" className="ml-1.5 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-white">{t("catalogTitle")}</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-400">{t("catalogBody")}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/catalogo" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:text-white">
            {t("catalogCta")}
          </Link>
          <Link href="/mejores-skill" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:text-white">
            {t("skillsCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
