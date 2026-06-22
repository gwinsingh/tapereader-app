import Link from "next/link";
import TodayPanel from "@/components/usmle/TodayPanel";

const PHASES: { phase: string; window: string; theme: string; active?: boolean; done?: boolean }[] = [
  { phase: "P0 · Foundation", window: "late Jun – early Jul", theme: "Scaffolding, topic taxonomy, DB", done: true },
  { phase: "P1 · Flashcards MVP", window: "Jul", theme: "FSRS engine, manual + AI cards, review UI", done: true },
  { phase: "P2 · Topic Tracker", window: "Jul – Aug", theme: "Coverage % + weakness analytics", done: true },
  { phase: "P3 · Richer cards", window: "Aug", theme: "Cloze + tagging (Anki import dropped)", done: true },
  { phase: "P4 · Gap-fill & readiness", window: "Sep", theme: "Study planner, NBME score logging", active: true },
  { phase: "P5 · Practice (stretch)", window: "Sep – Oct", theme: "Vignettes, exam simulator" },
];

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
    >
      {children}
    </div>
  );
}

export default function UsmleDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">USMLE Step 1 Prep</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Topic coverage + spaced-repetition flashcards. Exam target: mid–late October 2026.
        </p>
      </header>

      <TodayPanel />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>
            Flashcards
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            FSRS spaced repetition with manual + AI card generation. Review due cards, build decks, generate from a topic or a missed concept.
          </p>
          <Link
            href="/usmle/cards"
            className="mt-3 inline-block text-sm font-medium hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            Open flashcards →
          </Link>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>
            Topic coverage
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            The full Step 1 taxonomy with per-topic status, exam-weighted coverage %, and a “where to focus” weakness view.
          </p>
          <Link
            href="/usmle/topics"
            className="mt-3 inline-block text-sm font-medium hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            View topics →
          </Link>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
          Roadmap
        </h2>
        <div className="space-y-2">
          {PHASES.map((p) => (
            <div
              key={p.phase}
              className="flex flex-col rounded-md border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              style={{
                borderColor: p.active ? "var(--color-accent)" : "var(--color-border)",
                backgroundColor: "var(--color-panel)",
              }}
            >
              <div>
                <span className="text-sm font-medium">{p.phase}</span>
                {p.active && (
                  <span
                    className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                    style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
                  >
                    current
                  </span>
                )}
                {p.done && (
                  <span className="ml-2 text-[11px]" style={{ color: "var(--stat-green)" }}>✓ done</span>
                )}
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>{p.theme}</p>
              </div>
              <span className="mt-1 text-xs sm:mt-0" style={{ color: "var(--color-muted)" }}>{p.window}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
