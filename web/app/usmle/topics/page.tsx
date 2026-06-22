"use client";

import { useEffect, useState } from "react";

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

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  learning: "Learning",
  reviewed: "Reviewed",
  confident: "Confident",
};

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usmle/topics")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setTopics(d.topics))
      .catch((e) => setError(String(e.message || e)));
  }, []);

  const systems = topics?.filter((t) => t.parentId === null) ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Topic coverage</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          The Step 1 taxonomy. Status editing + weighted coverage % arrive in P2.
        </p>
      </header>

      {error && (
        <div className="rounded-md border p-4 text-sm" style={{ borderColor: "var(--color-border)" }}>
          <p style={{ color: "var(--color-danger)" }}>Couldn’t load topics: {error}</p>
          <p className="mt-1" style={{ color: "var(--color-muted)" }}>
            Expected during local dev (no D1 binding). Create the DB, run migrations, then{" "}
            <code>POST /api/usmle/seed</code>.
          </p>
        </div>
      )}

      {!topics && !error && <p className="text-sm" style={{ color: "var(--color-muted)" }}>Loading…</p>}

      {systems.map((sys) => {
        const children = topics!.filter((t) => t.parentId === sys.id);
        return (
          <section key={sys.id}>
            <div className="flex items-baseline justify-between border-b pb-1" style={{ borderColor: "var(--color-border)" }}>
              <h2 className="text-sm font-semibold">{sys.name}</h2>
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                {sys.organSystem}{sys.examWeight ? ` · ~${sys.examWeight}%` : ""}
              </span>
            </div>
            <ul className="mt-2 space-y-1">
              {children.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>{STATUS_LABEL[c.status] ?? c.status}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
