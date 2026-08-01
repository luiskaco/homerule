import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPresetsByTool } from "@/lib/presets";
import { getItemsByCategory } from "@/lib/manifest";
import { getCatalogSkills } from "@/lib/skill-catalog";

export default async function HomePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Home");
  const tNav = await getTranslations("Nav");

  const stackCount = getPresetsByTool("antigravity").filter((p) => p.id !== "manual").length;
  const agentCount = getItemsByCategory("agent").filter((i) => i.tool === "claude-code").length;
  const skillCount = getCatalogSkills().length;

  const modes = [
    {
      id: "antigravity-solo",
      // El eyebrow reusa la etiqueta del nav para que la sección sea reconocible.
      eyebrow: tNav("antigravitySolo"),
      title: t("modeAntigravityTitle"),
      description: t("modeAntigravityDescription"),
      href: "/antigravity",
      cta: t("modeAntigravityCta"),
      cardClass: "card-vibrant-purple border-t-2 border-t-violet-500",
      accentClass: "text-violet-400 group-hover:text-violet-300",
      badgeClass: "bg-violet-500/10 text-violet-300 border border-violet-500/30",
      bullets: [
        t("modeAntigravityBullet1", { count: stackCount }),
        t("modeAntigravityBullet2"),
        t("modeAntigravityBullet3"),
      ],
    },
    {
      id: "claude-solo",
      eyebrow: tNav("claudeSolo"),
      title: t("modeClaudeTitle"),
      description: t("modeClaudeDescription"),
      href: "/agents",
      cta: t("modeClaudeCta"),
      cardClass: "card-vibrant-amber border-t-2 border-t-amber-500",
      accentClass: "text-amber-400 group-hover:text-amber-300",
      badgeClass: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
      bullets: [
        t("modeClaudeBullet1", { count: agentCount }),
        t("modeClaudeBullet2"),
        t("modeClaudeBullet3"),
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-8 sm:p-12 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-cyan-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start gap-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-bold tracking-wide text-violet-300 ring-1 ring-inset ring-violet-500/30 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-ping" />
            {t("badge")}
          </div>

          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl sm:leading-tight">
            {t("titleStart")} <span className="text-gradient-purple">{t("titleAccent")}</span>
          </h1>

          <p className="max-w-2xl text-base text-slate-300 leading-relaxed sm:text-lg">{t("intro")}</p>

          <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-1.5 border border-slate-800">
              <span className="text-emerald-400">✓</span> {t("statStacks", { count: stackCount })}
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-1.5 border border-slate-800">
              <span className="text-cyan-400">✓</span> {t("statSkills", { count: skillCount })}
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-1.5 border border-slate-800">
              <span className="text-violet-400">✓</span> {t("statAgents", { count: agentCount })}
            </div>
          </div>
        </div>
      </section>

      {/* Los 2 modos de uso — Antigravity y Claude Code son independientes */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-violet-400">⚡</span> {t("modesTitle")}
          </h2>
          <p className="text-sm text-slate-400">{t("modesSubtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {modes.map((mode) => (
            <Link
              key={mode.id}
              href={mode.href}
              className={`group flex flex-col justify-between rounded-2xl p-6 shadow-xl ${mode.cardClass}`}
            >
              <div>
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${mode.badgeClass}`}>
                  {mode.eyebrow}
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{mode.title}</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{mode.description}</p>

                <ul className="mt-4 flex flex-col gap-1.5 text-xs text-slate-400">
                  {mode.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className={mode.accentClass}>▸</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`mt-6 flex items-center text-xs font-bold ${mode.accentClass}`}>
                {mode.cta}
                <span className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Skills & Prompts — transversal a los dos modos */}
      <section className="rounded-2xl border border-pink-500/20 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 font-bold border border-pink-500/30">
              ✨
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t("skillsTitle")}</h3>
              <p className="mt-1 max-w-xl text-sm text-slate-300 leading-relaxed">{t("skillsBody")}</p>
            </div>
          </div>
          <Link
            href="/mejores-skill"
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-pink-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-600/30 transition-all hover:bg-pink-500 hover:scale-105"
          >
            {t("skillsCta")}
          </Link>
        </div>
      </section>

      {/* Bitácora */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>📝</span> {t("changelogTitle")}
            </h3>
            <p className="text-sm text-slate-300">{t("changelogBody")}</p>
          </div>
          <Link
            href="/changelog"
            className="shrink-0 self-start rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 transition-colors hover:border-violet-500/50 hover:text-violet-300 sm:self-auto"
          >
            {t("changelogCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
