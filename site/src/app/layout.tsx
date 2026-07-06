import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antigravity Rules Hub",
  description:
    "Catálogo descargable de rules, skills y plantillas SDD para arrancar proyectos con el workflow dual-AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <nav className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Link href="/" className="font-semibold tracking-tight">
              Antigravity Rules Hub
            </Link>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link href="/" className="hover:underline">
                Antigravity
              </Link>
              <Link href="/agents" className="hover:underline">
                Otros agentes
              </Link>
              <Link href="/stacks" className="hover:underline">
                Stacks
              </Link>
              <Link href="/build?tool=antigravity&preset=manual" className="hover:underline">
                Armar manual
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        <footer className="border-t border-neutral-200 px-4 py-6 text-sm text-neutral-500 dark:border-neutral-800 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Antigravity Rules Hub</span>
            <a
              href="https://www.skills.sh/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Más skills en skills.sh ↗
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
