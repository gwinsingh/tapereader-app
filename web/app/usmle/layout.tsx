import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/trade-journal/ThemeToggle";
import PCTBodyStyle from "@/components/trade-journal/PCTBodyStyle";

export const metadata: Metadata = {
  title: "USMLE Step 1 Prep",
  description: "Topic coverage tracking and spaced-repetition flashcards for USMLE Step 1.",
};

export default function UsmleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PCTBodyStyle />
      <div
        className="min-h-screen"
        style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <div
            className="flex items-center justify-between border-b py-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center gap-4">
              <Link href="/usmle" className="font-mono text-sm font-bold" style={{ color: "var(--color-accent)" }}>
                Step 1 Prep
              </Link>
              <nav className="flex gap-3 text-xs" style={{ color: "var(--color-muted)" }}>
                <Link href="/usmle" className="hover:underline">Dashboard</Link>
                <Link href="/usmle/cards" className="hover:underline">Flashcards</Link>
                <Link href="/usmle/notes" className="hover:underline">Notes</Link>
                <Link href="/usmle/topics" className="hover:underline">Topics</Link>
                <Link href="/usmle/scores" className="hover:underline">Scores</Link>
              </nav>
            </div>
            <ThemeToggle />
          </div>
          <div className="py-6">{children}</div>
        </div>
      </div>
    </>
  );
}
