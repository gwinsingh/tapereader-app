"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Weak { nodeId: string; name: string; coverage: number; examWeight: number | null }
interface Today {
  due: number | null;
  weightedCoverage: number | null;
  weakest: Weak[];
  latestNbme: { label: string | null; pctCorrect: number | null; predicted: string | null; takenOn: string } | null;
  unavailable: boolean;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default function TodayPanel() {
  const [t, setT] = useState<Today | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const get = (u: string) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      const dayStart = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString(); })();
      const [queue, cov, scores] = await Promise.all([
        get(`/api/usmle/review/queue?dayStart=${encodeURIComponent(dayStart)}`),
        get("/api/usmle/stats/coverage"),
        get("/api/usmle/scores"),
      ]);
      if (cancelled) return;
      const unavailable = !queue && !cov && !scores;
      setT({
        due: queue?.due ?? null,
        weightedCoverage: cov?.overall?.weightedCoverage ?? null,
        weakest: (cov?.weakest ?? []).slice(0, 3),
        latestNbme: scores?.summary?.latestNbme ?? null,
        unavailable,
      });
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (!t) return null;

  return (
    <div className="rounded-lg border p-5" style={{ borderColor: "var(--color-accent)", backgroundColor: "var(--color-panel)" }}>
      <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>Today</h2>

      {t.unavailable ? (
        <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
          Connect the database to see your daily plan (due cards, focus topics, readiness).
        </p>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Link href="/usmle/cards" className="block">
            <div className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>{t.due ?? "—"}</div>
            <div className="text-xs" style={{ color: "var(--color-muted)" }}>cards to review today →</div>
          </Link>

          <Link href="/usmle/topics" className="block">
            <div className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
              {t.weightedCoverage != null ? pct(t.weightedCoverage) : "—"}
            </div>
            <div className="text-xs" style={{ color: "var(--color-muted)" }}>exam-weighted coverage →</div>
            {t.weakest.length > 0 && (
              <div className="mt-1 text-[11px]" style={{ color: "var(--color-muted)" }}>
                focus: {t.weakest.map((w) => w.name).join(", ")}
              </div>
            )}
          </Link>

          <Link href="/usmle/scores" className="block">
            <div className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
              {t.latestNbme?.pctCorrect != null ? `${t.latestNbme.pctCorrect}%` : "—"}
            </div>
            <div className="text-xs" style={{ color: "var(--color-muted)" }}>
              {t.latestNbme ? `latest ${t.latestNbme.label || "NBME"}${t.latestNbme.predicted ? ` · ${t.latestNbme.predicted}` : ""} →` : "log a practice score →"}
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
