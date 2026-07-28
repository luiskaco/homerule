import type { Metadata } from "next";
import Link from "next/link";
import NavMenu from "@/components/NavMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Rules Hub",
  description:
    "Catálogo descargable de rules, skills y plantillas SDD para arrancar proyectos con el workflow dual-AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-indigo-100 bg-white/95 dark:border-indigo-950 dark:bg-slate-900/95">
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-pink-500 via-amber-400 to-emerald-400" />
          <nav className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 font-extrabold text-white shadow-md shadow-indigo-500/20">
                AI
              </span>
              <span className="text-gradient-purple font-extrabold">Rules Hub</span>
            </Link>
            <NavMenu />
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        <footer className="border-t border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              AI Rules Hub — Impulsando tu workflow de IA
            </span>
            <a
              href="https://www.skills.sh/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              Más skills en skills.sh ↗
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
