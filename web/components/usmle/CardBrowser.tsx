"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWriteKey } from "./useWriteKey";
import ReviewSession from "./ReviewSession";

interface Deck { id: string; name: string; cardCount: number }
interface BrowseCard {
  id: string;
  deckId: string;
  deckName: string;
  type: string;
  front: string;
  back: string;
  extra: string | null;
  tags: string[];
  source: string;
  suspended: boolean;
  bookmarked: boolean;
  state: string;
}

const inputStyle = {
  backgroundColor: "var(--color-bg)",
  borderColor: "var(--color-border)",
  color: "var(--color-text)",
} as const;

const STATES = ["new", "learning", "review", "relearning"] as const;

export default function CardBrowser() {
  const { ready, writeHeaders } = useWriteKey();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<BrowseCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // filters
  const [deckId, setDeckId] = useState("");
  const [tag, setTag] = useState("");
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [suspended, setSuspended] = useState(""); // "" all | "0" active | "1" suspended

  const [editing, setEditing] = useState<string | null>(null);
  const [studying, setStudying] = useState(false);

  // Filters → query string (shared shape; the study endpoint ignores `suspended`).
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (deckId) p.set("deckId", deckId);
    if (tag.trim()) p.set("tag", tag.trim());
    if (q.trim()) p.set("q", q.trim());
    if (state) p.set("state", state);
    if (bookmarked) p.set("bookmarked", "1");
    return p;
  }, [deckId, tag, q, state, bookmarked]);

  const listQuery = useMemo(() => {
    const p = new URLSearchParams(query);
    if (suspended) p.set("suspended", suspended);
    return p.toString();
  }, [query, suspended]);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/usmle/cards?${listQuery}`)
      .then(async (r) => { if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`); return r.json(); })
      .then((d) => { setCards(d.cards); setTotal(d.total); setErr(null); })
      .catch((e) => setErr(String(e.message || e)))
      .finally(() => setLoading(false));
  }, [listQuery]);

  useEffect(() => {
    if (!ready) return;
    fetch("/api/usmle/decks").then((r) => r.json()).then((d) => setDecks(d.decks || [])).catch(() => {});
  }, [ready]);

  // Debounced reload on filter change.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [ready, load]);

  const patchCard = useCallback(
    async (id: string, patch: Partial<BrowseCard> & { tagsCsv?: string }) => {
      const body: Record<string, unknown> = {};
      if (patch.front !== undefined) body.front = patch.front;
      if (patch.back !== undefined) body.back = patch.back;
      if (patch.extra !== undefined) body.extra = patch.extra;
      if (patch.tagsCsv !== undefined) body.tags = patch.tagsCsv.split(",").map((t) => t.trim()).filter(Boolean);
      if (patch.bookmarked !== undefined) body.bookmarked = patch.bookmarked;
      if (patch.suspended !== undefined) body.suspended = patch.suspended;
      const r = await fetch(`/api/usmle/cards/${id}`, { method: "PATCH", headers: writeHeaders(), body: JSON.stringify(body) });
      if (!r.ok) { setErr((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`); return false; }
      return true;
    },
    [writeHeaders]
  );

  async function toggleBookmark(c: BrowseCard) {
    setCards((cs) => cs.map((x) => (x.id === c.id ? { ...x, bookmarked: !x.bookmarked } : x)));
    await patchCard(c.id, { bookmarked: !c.bookmarked });
  }
  async function toggleSuspend(c: BrowseCard) {
    setCards((cs) => cs.map((x) => (x.id === c.id ? { ...x, suspended: !x.suspended } : x)));
    await patchCard(c.id, { suspended: !c.suspended });
  }
  async function del(c: BrowseCard) {
    if (!confirm("Delete this card permanently?")) return;
    const r = await fetch(`/api/usmle/cards/${c.id}`, { method: "DELETE", headers: writeHeaders() });
    if (!r.ok) { setErr((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`); return; }
    setCards((cs) => cs.filter((x) => x.id !== c.id));
    setTotal((n) => n - 1);
  }

  function resetFilters() {
    setDeckId(""); setTag(""); setQ(""); setState(""); setBookmarked(false); setSuspended("");
  }

  if (!ready) return null;

  if (studying) {
    const p = new URLSearchParams(query);
    p.set("mode", "cram");
    return (
      <ReviewSession
        source={{ kind: "custom", query: p.toString(), label: "custom study" }}
        onExit={() => { setStudying(false); load(); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {err && <p className="text-sm" style={{ color: "var(--color-danger)" }}>{err}</p>}

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[160px] flex-1">
          <label className="text-xs" style={{ color: "var(--color-muted)" }}>Search</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="front / back text" className="mt-1 w-full rounded border px-2 py-1.5 text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--color-muted)" }}>Deck</label>
          <select value={deckId} onChange={(e) => setDeckId(e.target.value)} className="mt-1 rounded border px-2 py-1.5 text-sm" style={inputStyle}>
            <option value="">All decks</option>
            {decks.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.cardCount})</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--color-muted)" }}>State</label>
          <select value={state} onChange={(e) => setState(e.target.value)} className="mt-1 rounded border px-2 py-1.5 text-sm" style={inputStyle}>
            <option value="">Any state</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--color-muted)" }}>Status</label>
          <select value={suspended} onChange={(e) => setSuspended(e.target.value)} className="mt-1 rounded border px-2 py-1.5 text-sm" style={inputStyle}>
            <option value="">All</option>
            <option value="0">Active</option>
            <option value="1">Suspended</option>
          </select>
        </div>
        <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="tag" className="w-24 rounded border px-2 py-1.5 text-sm" style={inputStyle} />
        <label className="flex items-center gap-1 text-xs" style={{ color: "var(--color-muted)" }}>
          <input type="checkbox" checked={bookmarked} onChange={(e) => setBookmarked(e.target.checked)} /> ★ only
        </label>
        <button onClick={resetFilters} className="rounded border px-2 py-1.5 text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>Reset</button>
      </div>

      {/* Count + study action */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
          {loading ? "Loading…" : `${total} card${total === 1 ? "" : "s"}`}
        </span>
        {total > 0 && (
          <button
            onClick={() => setStudying(true)}
            className="rounded px-3 py-1.5 text-sm font-medium"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}
            title="Study all matching cards now, ignoring the schedule (grades still update FSRS)"
          >
            Study these {total} (cram)
          </button>
        )}
      </div>

      {/* Results */}
      <ul className="space-y-1">
        {cards.map((c) => (
          <li key={c.id} className="rounded border p-2 text-sm" style={{ borderColor: "var(--color-border)", opacity: c.suspended ? 0.55 : 1 }}>
            <div className="flex items-start gap-2">
              <button onClick={() => toggleBookmark(c)} title="Bookmark" className="mt-0.5 text-sm" style={{ color: c.bookmarked ? "var(--color-warn)" : "var(--color-muted)" }}>
                {c.bookmarked ? "★" : "☆"}
              </button>
              <div className="min-w-0 flex-1">
                <button onClick={() => setEditing(editing === c.id ? null : c.id)} className="block w-full truncate text-left" title="Click to edit">
                  {c.front}
                </button>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]" style={{ color: "var(--color-muted)" }}>
                  <span>{c.deckName}</span>
                  <span>· {c.state}</span>
                  {c.suspended && <span>· suspended</span>}
                  {c.tags.length > 0 && <span>· {c.tags.join(", ")}</span>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-[11px]">
                <button onClick={() => toggleSuspend(c)} style={{ color: "var(--color-muted)" }}>{c.suspended ? "unsuspend" : "suspend"}</button>
                <button onClick={() => del(c)} style={{ color: "var(--color-danger)" }}>delete</button>
              </div>
            </div>

            {editing === c.id && (
              <CardEditor card={c} onCancel={() => setEditing(null)} onSave={async (patch) => {
                if (await patchCard(c.id, patch)) {
                  setCards((cs) => cs.map((x) => (x.id === c.id ? {
                    ...x,
                    front: patch.front ?? x.front,
                    back: patch.back ?? x.back,
                    extra: patch.extra ?? x.extra,
                    tags: patch.tagsCsv !== undefined ? patch.tagsCsv.split(",").map((t) => t.trim()).filter(Boolean) : x.tags,
                  } : x)));
                  setEditing(null);
                }
              }} />
            )}
          </li>
        ))}
      </ul>
      {!loading && cards.length === 0 && <p className="text-sm" style={{ color: "var(--color-muted)" }}>No cards match these filters.</p>}
    </div>
  );
}

function CardEditor({
  card,
  onSave,
  onCancel,
}: {
  card: BrowseCard;
  onSave: (patch: { front?: string; back?: string; extra?: string; tagsCsv?: string }) => void;
  onCancel: () => void;
}) {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [extra, setExtra] = useState(card.extra ?? "");
  const [tagsCsv, setTagsCsv] = useState(card.tags.join(", "));
  return (
    <div className="mt-2 space-y-2 border-t pt-2" style={{ borderColor: "var(--color-border)" }}>
      <textarea value={front} onChange={(e) => setFront(e.target.value)} rows={2} className="w-full rounded border px-2 py-1 text-sm" style={inputStyle} />
      <textarea value={back} onChange={(e) => setBack(e.target.value)} rows={2} className="w-full rounded border px-2 py-1 text-sm" style={inputStyle} />
      <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="extra / mnemonic" className="w-full rounded border px-2 py-1 text-sm" style={inputStyle} />
      <input value={tagsCsv} onChange={(e) => setTagsCsv(e.target.value)} placeholder="tags, comma-separated" className="w-full rounded border px-2 py-1 text-sm" style={inputStyle} />
      <div className="flex gap-2">
        <button onClick={() => onSave({ front, back, extra, tagsCsv })} className="rounded px-3 py-1 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}>Save</button>
        <button onClick={onCancel} className="rounded border px-3 py-1 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>Cancel</button>
      </div>
    </div>
  );
}
