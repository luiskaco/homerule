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
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight">
              Antigravity Rules Hub
            </Link>
            <div className="flex gap-6 text-sm">
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
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="border-t border-neutral-200 px-6 py-6 text-sm text-neutral-500 dark:border-neutral-800">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
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
