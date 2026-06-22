"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWriteKey } from "@/components/usmle/useWriteKey";

interface Topic {
  id: string;
  parentId: string | null;
  name: string;
  organSystem: string;
  disciplines: string[];
  examWeight: number | null;
  status: string;
  confidence: number | null;
}

interface SystemCoverage {
  nodeId: string;
  name: string;
  examWeight: number | null;
  isWeighted: boolean;
  leafTopics: number;
  coverage: number;
  cards: number;
  due: number;
  mature: number;
  gapScore: number;
}

interface CoverageReport {
  overall: { weightedCoverage: number; simpleCoverage: number; leafTopics: number };
  systems: SystemCoverage[];
  weakest: SystemCoverage[];
}

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not started" },
  { value: "learning", label: "Learning" },
  { value: "reviewed", label: "Reviewed" },
  { value: "confident", label: "Confident" },
];
const STATUS_COLOR: Record<string, string> = {
  not_started: "var(--color-muted)",
  learning: "var(--color-warn)",
  reviewed: "var(--color-accent)",
  confident: "var(--stat-green)",
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

function Bar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="h-full rounded" style={{ width: pct(value), backgroundColor: color || "var(--color-accent)" }} />
    </div>
  );
}

export default function TopicsPage() {
  const { key, ready, writeHeaders } = useWriteKey();
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [coverage, setCoverage] = useState<CoverageReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCoverage = useCallback(() => {
    fetch("/api/usmle/stats/coverage")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCoverage(d))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    fetch("/api/usmle/topics")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setTopics(d.topics))
      .catch((e) => setError(String(e.message || e)));
    loadCoverage();
  }, [loadCoverage]);

  useEffect(() => { if (ready) load(); }, [ready, load]);

  const covByNode = useMemo(() => {
    const m = new Map<string, SystemCoverage>();
    coverage?.systems.forEach((s) => m.set(s.nodeId, s));
    return m;
  }, [coverage]);

  async function setStatus(topicId: string, status: string) {
    // Optimistic local update, then persist + refresh coverage.
    setTopics((ts) => ts?.map((t) => (t.id === topicId ? { ...t, status } : t)) ?? ts);
    try {
      const r = await fetch(`/api/usmle/topics/${topicId}/progress`, {
        method: "PATCH",
        headers: writeHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`);
      loadCoverage();
    } catch (e) {
      setError(String((e as Error).message || e));
      load(); // resync on failure
    }
  }

  const systems = topics?.filter((t) => t.parentId === null) ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Topic coverage</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Mark each subtopic as you study it. Coverage is weighted by exam priority.
        </p>
      </header>

      {error && (
        <div className="rounded-md border p-4 text-sm" style={{ borderColor: "var(--color-border)" }}>
          <p style={{ color: "var(--color-danger)" }}>{error}</p>
          <p className="mt-1" style={{ color: "var(--color-muted)" }}>
            DB errors mean the D1 binding isn’t set up locally; a 401 means the write key isn’t set (set it in Flashcards → Build).
          </p>
        </div>
      )}

      {!key && ready && (
        <p className="rounded-md border p-3 text-xs" style={{ borderColor: "var(--color-warn)", color: "var(--color-warn)" }}>
          Set your write key in Flashcards → Build to edit topic status.
        </p>
      )}

      {/* Coverage summary */}
      {coverage && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4 sm:col-span-1" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
            <div className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>Weighted coverage</div>
            <div className="mt-1 text-3xl font-bold" style={{ color: "var(--color-accent)" }}>{pct(coverage.overall.weightedCoverage)}</div>
            <div className="mt-2"><Bar value={coverage.overall.weightedCoverage} /></div>
            <div className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
              Unweighted: {pct(coverage.overall.simpleCoverage)} across {coverage.overall.leafTopics} subtopics
            </div>
          </div>

          <div className="rounded-lg border p-4 sm:col-span-2" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}>
            <div className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>Where to focus (highest priority × lowest coverage)</div>
            <ul className="mt-2 space-y-2">
              {coverage.weakest.map((s) => (
                <li key={s.nodeId} className="flex items-center gap-3 text-sm">
                  <span className="w-44 truncate">{s.name}</span>
                  <span className="flex-1"><Bar value={s.coverage} color={STATUS_COLOR.learning} /></span>
                  <span className="w-10 text-right text-xs" style={{ color: "var(--color-muted)" }}>{pct(s.coverage)}</span>
                  <span className="w-14 text-right text-[11px]" style={{ color: "var(--color-muted)" }}>~{s.examWeight}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!topics && !error && <p className="text-sm" style={{ color: "var(--color-muted)" }}>Loading…</p>}

      {/* Editable tree */}
      {systems.map((sys) => {
        const children = topics!.filter((t) => t.parentId === sys.id);
        const cov = covByNode.get(sys.id);
        return (
          <section key={sys.id}>
            <div className="border-b pb-1" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">{sys.name}</h2>
                <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                  {sys.examWeight ? `~${sys.examWeight}% · ` : "foundational · "}
                  {cov ? `${pct(cov.coverage)} covered` : ""}
                  {cov && cov.cards > 0 ? ` · ${cov.cards} cards (${cov.due} due)` : ""}
                </span>
              </div>
              {cov && <div className="mt-1"><Bar value={cov.coverage} /></div>}
            </div>
            <ul className="mt-2 space-y-1">
              {children.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[c.status] }} />
                    {c.name}
                  </span>
                  <select
                    value={c.status}
                    disabled={!key}
                    onChange={(e) => setStatus(c.id, e.target.value)}
                    className="rounded border px-1.5 py-0.5 text-xs"
                    style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)", color: STATUS_COLOR[c.status] }}
                  >
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
