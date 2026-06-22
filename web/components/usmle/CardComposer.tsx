"use client";

import { useCallback, useEffect, useState } from "react";
import { useWriteKey } from "./useWriteKey";

interface Deck { id: string; name: string; cardCount: number; source: string }
interface Draft { front: string; back: string; type: string; extra?: string; tags: string[]; include: boolean }

const inputStyle = {
  backgroundColor: "var(--color-bg)",
  borderColor: "var(--color-border)",
  color: "var(--color-text)",
} as const;

export default function CardComposer({ onChange }: { onChange?: () => void }) {
  const { key, setKey, ready, writeHeaders } = useWriteKey();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deckId, setDeckId] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Manual card fields
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [extra, setExtra] = useState("");

  // AI generation
  const [topicName, setTopicName] = useState("");
  const [notes, setNotes] = useState("");
  const [missed, setMissed] = useState("");
  const [count, setCount] = useState(12);
  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  const loadDecks = useCallback(() => {
    fetch("/api/usmle/decks")
      .then(async (r) => (r.ok ? r.json() : Promise.reject(new Error((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`))))
      .then((d) => { setDecks(d.decks); if (d.decks[0] && !deckId) setDeckId(d.decks[0].id); })
      .catch((e) => setErr(String(e.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (ready) loadDecks(); }, [ready, loadDecks]);

  function flash(m: string) { setMsg(m); setErr(null); setTimeout(() => setMsg(null), 2500); }

  async function createDeck() {
    if (!newDeckName.trim()) return;
    const r = await fetch("/api/usmle/decks", { method: "POST", headers: writeHeaders(), body: JSON.stringify({ name: newDeckName.trim() }) });
    if (!r.ok) { setErr((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`); return; }
    const { id } = await r.json();
    setNewDeckName(""); flash("Deck created"); loadDecks(); setDeckId(id);
  }

  async function addManual() {
    if (!deckId || !front.trim() || !back.trim()) { setErr("Pick a deck and fill front + back"); return; }
    const r = await fetch("/api/usmle/cards", {
      method: "POST", headers: writeHeaders(),
      body: JSON.stringify({ deckId, front, back, extra: extra || undefined }),
    });
    if (!r.ok) { setErr((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`); return; }
    setFront(""); setBack(""); setExtra(""); flash("Card added"); loadDecks(); onChange?.();
  }

  async function generate() {
    if (!topicName && !notes && !missed) { setErr("Give a topic, notes, or a missed concept"); return; }
    setGenerating(true); setErr(null);
    try {
      const r = await fetch("/api/usmle/ai/generate-cards", {
        method: "POST", headers: writeHeaders(),
        body: JSON.stringify({ topicName: topicName || undefined, notes: notes || undefined, missedConcept: missed || undefined, count }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || `HTTP ${r.status}`);
      setDrafts((d.cards as Omit<Draft, "include">[]).map((c) => ({ ...c, include: true })));
    } catch (e) {
      setErr(String((e as Error).message || e));
    } finally {
      setGenerating(false);
    }
  }

  async function approveDrafts() {
    const chosen = drafts.filter((d) => d.include);
    if (!deckId || chosen.length === 0) { setErr("Pick a deck and keep at least one card"); return; }
    const r = await fetch("/api/usmle/cards/bulk", {
      method: "POST", headers: writeHeaders(),
      body: JSON.stringify({ deckId, source: "ai", cards: chosen }),
    });
    if (!r.ok) { setErr((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`); return; }
    const { inserted } = await r.json();
    setDrafts([]); flash(`Added ${inserted} card${inserted === 1 ? "" : "s"}`); loadDecks(); onChange?.();
  }

  function patchDraft(i: number, patch: Partial<Draft>) {
    setDrafts((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  }

  if (!ready) return null;

  return (
    <div className="space-y-6">
      {/* Write key */}
      {!key && (
        <div className="rounded-md border p-3" style={{ borderColor: "var(--color-warn)" }}>
          <label className="text-xs font-medium" style={{ color: "var(--color-warn)" }}>Write key required to save</label>
          <input
            type="password" placeholder="Paste your WRITE_KEY"
            className="mt-1 w-full rounded border px-2 py-1 text-sm" style={inputStyle}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
      )}

      {msg && <p className="text-sm" style={{ color: "var(--color-accent)" }}>{msg}</p>}
      {err && <p className="text-sm" style={{ color: "var(--color-danger)" }}>{err}</p>}

      {/* Deck selector */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[180px] flex-1">
          <label className="text-xs" style={{ color: "var(--color-muted)" }}>Deck</label>
          <select value={deckId} onChange={(e) => setDeckId(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" style={inputStyle}>
            <option value="">— select —</option>
            {decks.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.cardCount})</option>)}
          </select>
        </div>
        <div className="flex items-end gap-1">
          <input value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} placeholder="New deck name" className="rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          <button onClick={createDeck} className="rounded border px-3 py-1.5 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-accent)" }}>Create</button>
        </div>
      </div>

      {/* AI generation */}
      <div className="rounded-lg border p-4" style={{ borderColor: "var(--color-border)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>Generate with AI</h3>
        <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>Mechanism-focused Step 1 cards. Review before adding — nothing is saved until you approve.</p>
        <div className="mt-3 space-y-2">
          <input value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="Topic (e.g. Cardiovascular → Heart Failure)" className="w-full rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          <input value={missed} onChange={(e) => setMissed(e.target.value)} placeholder="A concept you missed (optional)" className="w-full rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Or paste notes to card (optional)" rows={3} className="w-full rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: "var(--color-muted)" }}>Count</label>
            <input type="number" min={1} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-16 rounded border px-2 py-1 text-sm" style={inputStyle} />
            <button onClick={generate} disabled={generating} className="rounded px-3 py-1.5 text-sm font-medium disabled:opacity-50" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}>
              {generating ? "Generating…" : "Generate"}
            </button>
          </div>
        </div>

        {drafts.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--color-muted)" }}>{drafts.filter((d) => d.include).length} of {drafts.length} selected</span>
              <button onClick={approveDrafts} className="rounded px-3 py-1.5 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}>Add selected to deck</button>
            </div>
            {drafts.map((d, i) => (
              <div key={i} className="rounded border p-2" style={{ borderColor: "var(--color-border)", opacity: d.include ? 1 : 0.45 }}>
                <div className="flex items-start gap-2">
                  <input type="checkbox" checked={d.include} onChange={(e) => patchDraft(i, { include: e.target.checked })} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <textarea value={d.front} onChange={(e) => patchDraft(i, { front: e.target.value })} rows={2} className="w-full rounded border px-2 py-1 text-sm" style={inputStyle} />
                    <textarea value={d.back} onChange={(e) => patchDraft(i, { back: e.target.value })} rows={2} className="w-full rounded border px-2 py-1 text-sm" style={inputStyle} />
                    {d.extra && <p className="text-xs italic" style={{ color: "var(--color-muted)" }}>{d.extra}</p>}
                    {d.tags.length > 0 && <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>{d.tags.join(", ")}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual card */}
      <div className="rounded-lg border p-4" style={{ borderColor: "var(--color-border)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>Add a card manually</h3>
        <div className="mt-3 space-y-2">
          <textarea value={front} onChange={(e) => setFront(e.target.value)} placeholder="Front" rows={2} className="w-full rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Back" rows={2} className="w-full rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Mnemonic / source (optional)" className="w-full rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          <button onClick={addManual} className="rounded px-3 py-1.5 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}>Add card</button>
        </div>
      </div>
    </div>
  );
}
