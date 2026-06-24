"use client";

import { useCallback, useEffect, useState } from "react";
import { useWriteKey } from "./useWriteKey";
import { renderCloze } from "./Cloze";

interface QueueCard {
  id: string;
  type: string;
  front: string;
  back: string;
  extra: string | null;
  tags: string[];
  state: string;
  bookmarked: boolean;
}

interface Pacing {
  newPerDay: number;
  newDoneToday: number;
  newServed: number;
  newRemaining: number;
  maxReviewsPerDay: number;
  reviewsDoneToday: number;
  reviewsServed: number;
}

/** Where a session's cards come from: the global due queue, or a custom filter. */
export type ReviewSource =
  | { kind: "queue"; deckId?: string }
  | { kind: "custom"; query: string; label?: string };

const RATINGS = [
  { value: 1, label: "Again", key: "1", color: "var(--color-danger)" },
  { value: 2, label: "Hard", key: "2", color: "var(--color-warn)" },
  { value: 3, label: "Good", key: "3", color: "var(--color-accent)" },
  { value: 4, label: "Easy", key: "4", color: "var(--stat-green)" },
];

function localDayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function sourceUrl(source: ReviewSource): string {
  if (source.kind === "custom") return `/api/usmle/review/custom?${source.query}`;
  const p = new URLSearchParams();
  if (source.deckId) p.set("deckId", source.deckId);
  p.set("dayStart", localDayStart());
  return `/api/usmle/review/queue?${p.toString()}`;
}

export default function ReviewSession({
  source = { kind: "queue" },
  onExit,
}: {
  source?: ReviewSource;
  onExit?: () => void;
}) {
  const { writeHeaders, ready } = useWriteKey();
  const isCustom = source.kind === "custom";
  const [cards, setCards] = useState<QueueCard[] | null>(null);
  const [pacing, setPacing] = useState<Pacing | null>(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [showLimits, setShowLimits] = useState(false);

  const url = sourceUrl(source);
  const load = useCallback(() => {
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { setCards(d.cards); setPacing(d.pacing ?? null); setIdx(0); setFlipped(false); })
      .catch((e) => setError(String(e.message || e)));
  }, [url]);

  useEffect(() => { load(); }, [load]);

  const current = cards?.[idx];

  const grade = useCallback(
    async (rating: number) => {
      if (!current) return;
      const durationMs = Date.now() - startedAt;
      try {
        const r = await fetch("/api/usmle/review/grade", {
          method: "POST",
          headers: writeHeaders(),
          body: JSON.stringify({ cardId: current.id, rating, durationMs }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`);
        setReviewed((n) => n + 1);
        setFlipped(false);
        setStartedAt(Date.now());
        setIdx((i) => i + 1);
      } catch (e) {
        setError(String((e as Error).message || e));
      }
    },
    [current, writeHeaders, startedAt]
  );

  const toggleBookmark = useCallback(async () => {
    if (!current) return;
    const next = !current.bookmarked;
    setCards((cs) => (cs ? cs.map((c, i) => (i === idx ? { ...c, bookmarked: next } : c)) : cs));
    try {
      const r = await fetch(`/api/usmle/cards/${current.id}`, {
        method: "PATCH",
        headers: writeHeaders(),
        body: JSON.stringify({ bookmarked: next }),
      });
      if (!r.ok) throw new Error();
    } catch {
      setCards((cs) => (cs ? cs.map((c, i) => (i === idx ? { ...c, bookmarked: !next } : c)) : cs));
    }
  }, [current, idx, writeHeaders]);

  // Keyboard: space/enter to flip, 1-4 to rate once flipped, b to bookmark.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;
      if (e.key === "b" || e.key === "B") { e.preventDefault(); toggleBookmark(); return; }
      if (!flipped && (e.key === " " || e.key === "Enter")) { e.preventDefault(); setFlipped(true); return; }
      if (flipped && ["1", "2", "3", "4"].includes(e.key)) { e.preventDefault(); grade(Number(e.key)); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, flipped, grade, toggleBookmark]);

  const backBtn = onExit && (
    <button onClick={onExit} className="text-xs underline" style={{ color: "var(--color-muted)" }}>← Back to browse</button>
  );

  // Pacing header (queue sessions only): today's new-card progress + limits editor.
  const pacingHeader = !isCustom && pacing && (
    <div className="rounded-md border p-2 text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          New today: <strong style={{ color: "var(--color-text)" }}>{pacing.newDoneToday}/{pacing.newPerDay}</strong>
          {pacing.newPerDay > 0 && pacing.newRemaining === 0 ? " ✓" : ""}
          {" · queued now: "}{pacing.reviewsServed} review + {pacing.newServed} new
        </span>
        <button onClick={() => setShowLimits((s) => !s)} style={{ color: "var(--color-accent)" }}>⚙ limits</button>
      </div>
      {showLimits && (
        <LimitsEditor
          pacing={pacing}
          writeHeaders={writeHeaders}
          onSaved={() => { setShowLimits(false); load(); }}
          onCancel={() => setShowLimits(false)}
        />
      )}
    </div>
  );

  if (error)
    return (
      <div className="rounded-md border p-4 text-sm" style={{ borderColor: "var(--color-border)" }}>
        <p style={{ color: "var(--color-danger)" }}>{error}</p>
        <p className="mt-1" style={{ color: "var(--color-muted)" }}>
          A database error usually means the D1 binding isn’t available (e.g. running under <code>next dev</code> instead of <code>wrangler pages dev</code>, or not deployed yet).
        </p>
        <div className="mt-2 flex gap-3">
          <button onClick={() => { setError(null); load(); }} className="text-xs underline" style={{ color: "var(--color-accent)" }}>Retry</button>
          {backBtn}
        </div>
      </div>
    );

  if (!ready || cards === null) return <p className="text-sm" style={{ color: "var(--color-muted)" }}>Loading…</p>;

  if (cards.length === 0)
    return (
      <div className="space-y-3">
        {pacingHeader}
        <div className="space-y-2 text-sm" style={{ color: "var(--color-muted)" }}>
          <p>
            {isCustom
              ? "No cards match this study filter."
              : pacing && pacing.newRemaining === 0 && pacing.newPerDay > 0
              ? `All caught up — you've hit today's new-card goal (${pacing.newPerDay}). Reviews will surface as they come due.`
              : "Nothing due right now."}{" "}
            {reviewed > 0 && `Reviewed ${reviewed} this session. `}🎉
          </p>
          {backBtn}
        </div>
      </div>
    );

  if (!current)
    return (
      <div className="space-y-3">
        {pacingHeader}
        <div className="space-y-2 text-sm">
          <p style={{ color: "var(--color-accent)" }}>Session complete — reviewed {reviewed} card{reviewed === 1 ? "" : "s"}.</p>
          <div className="flex gap-3">
            <button onClick={load} className="text-xs underline" style={{ color: "var(--color-accent)" }}>{isCustom ? "Restart" : "Load more"}</button>
            {backBtn}
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      {pacingHeader}
      <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-muted)" }}>
        <span>
          {idx + 1} / {cards.length}{isCustom ? "" : " queued"} · reviewed {reviewed}
          {isCustom && source.label ? ` · ${source.label}` : ""}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleBookmark}
            title="Bookmark (b)"
            className="text-sm"
            style={{ color: current.bookmarked ? "var(--color-warn)" : "var(--color-muted)" }}
          >
            {current.bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
          </button>
          <span>{current.state}</span>
          {backBtn}
        </div>
      </div>

      <div
        className="min-h-[180px] cursor-pointer rounded-lg border p-5"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-panel)" }}
        onClick={() => !flipped && setFlipped(true)}
      >
        {current.type === "cloze" ? (
          <p className="text-base">{renderCloze(current.front, flipped)}</p>
        ) : (
          <p className="whitespace-pre-wrap text-base">{current.front}</p>
        )}
        {flipped && (
          <>
            {current.type === "cloze" ? (
              current.back ? (
                <>
                  <hr className="my-4" style={{ borderColor: "var(--color-border)" }} />
                  <p className="whitespace-pre-wrap text-base">{current.back}</p>
                </>
              ) : null
            ) : (
              <>
                <hr className="my-4" style={{ borderColor: "var(--color-border)" }} />
                <p className="whitespace-pre-wrap text-base">{current.back}</p>
              </>
            )}
            {current.extra && (
              <p className="mt-3 text-sm italic" style={{ color: "var(--color-muted)" }}>{current.extra}</p>
            )}
            {current.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {current.tags.map((t) => (
                  <span key={t} className="rounded px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-muted)" }}>{t}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {!flipped ? (
        <button
          onClick={() => setFlipped(true)}
          className="w-full rounded-md py-2.5 text-sm font-medium"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Show answer <span className="opacity-70">(space)</span>
        </button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => grade(r.value)}
              className="rounded-md py-2.5 text-sm font-medium"
              style={{ backgroundColor: "var(--color-panel)", border: `1px solid ${r.color}`, color: r.color }}
            >
              {r.label}<br /><span className="text-[10px] opacity-70">{r.key}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LimitsEditor({
  pacing,
  writeHeaders,
  onSaved,
  onCancel,
}: {
  pacing: Pacing;
  writeHeaders: () => HeadersInit;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [newPerDay, setNewPerDay] = useState(pacing.newPerDay);
  const [maxReviews, setMaxReviews] = useState(pacing.maxReviewsPerDay);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/usmle/settings", {
        method: "PATCH",
        headers: writeHeaders(),
        body: JSON.stringify({ newPerDay, maxReviewsPerDay: maxReviews }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const fieldStyle = { backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)", color: "var(--color-text)" } as const;
  return (
    <div className="mt-2 flex flex-wrap items-end gap-3 border-t pt-2" style={{ borderColor: "var(--color-border)" }}>
      <label className="flex flex-col">
        New cards / day
        <input type="number" min={0} max={1000} value={newPerDay} onChange={(e) => setNewPerDay(Number(e.target.value))} className="mt-0.5 w-24 rounded border px-2 py-1" style={fieldStyle} />
      </label>
      <label className="flex flex-col">
        Max reviews / day <span className="opacity-60">(0 = ∞)</span>
        <input type="number" min={0} max={10000} value={maxReviews} onChange={(e) => setMaxReviews(Number(e.target.value))} className="mt-0.5 w-24 rounded border px-2 py-1" style={fieldStyle} />
      </label>
      <button onClick={save} disabled={saving} className="rounded px-3 py-1 font-medium disabled:opacity-50" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}>
        {saving ? "Saving…" : "Save"}
      </button>
      <button onClick={onCancel} className="rounded border px-3 py-1" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>Cancel</button>
    </div>
  );
}
