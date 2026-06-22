"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWriteKey } from "./useWriteKey";
import Markdown from "./Markdown";

interface Topic { id: string; parentId: string | null; name: string; organSystem: string; disciplines: string[] }
interface NoteMeta { id: string; topicId: string | null; title: string; source: string; updatedAt: string }
interface Note extends NoteMeta { body: string }

const inputStyle = {
  backgroundColor: "var(--color-bg)",
  borderColor: "var(--color-border)",
  color: "var(--color-text)",
} as const;

const BLANK_TEMPLATE = `## Overview

## Mechanism

## Buzzwords & classic associations

## Rapid review

| Feature | Key point |
| --- | --- |
|  |  |
`;

export default function StudyNotes() {
  const { ready, writeHeaders } = useWriteKey();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // generation
  const [genTopicId, setGenTopicId] = useState("");
  const [focus, setFocus] = useState("");
  const [generating, setGenerating] = useState(false);

  // editor (open when non-null)
  const [draft, setDraft] = useState<{ id: string | null; topicId: string; title: string; body: string; source: string } | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("preview");
  const [saving, setSaving] = useState(false);

  // viewer
  const [viewing, setViewing] = useState<Note | null>(null);

  const topicName = useCallback(
    (id: string | null) => {
      if (!id) return null;
      const t = topics.find((x) => x.id === id);
      if (!t) return id;
      if (!t.parentId) return t.name;
      const parent = topics.find((x) => x.id === t.parentId);
      return parent ? `${parent.name} → ${t.name}` : t.name;
    },
    [topics]
  );

  const topicGroups = useMemo(() => {
    const roots = topics.filter((t) => !t.parentId);
    return roots.map((r) => ({ root: r, children: topics.filter((t) => t.parentId === r.id) }));
  }, [topics]);

  const loadNotes = useCallback(() => {
    fetch("/api/usmle/notes?meta=1")
      .then((r) => r.json())
      .then((d) => setNotes(d.notes || []))
      .catch((e) => setErr(String(e.message || e)));
  }, []);

  useEffect(() => {
    if (!ready) return;
    fetch("/api/usmle/topics").then((r) => r.json()).then((d) => setTopics(d.topics || [])).catch(() => {});
    loadNotes();
  }, [ready, loadNotes]);

  function flash(m: string) { setMsg(m); setErr(null); setTimeout(() => setMsg(null), 2500); }

  async function generate() {
    const t = topics.find((x) => x.id === genTopicId);
    if (!t && !focus.trim()) { setErr("Pick a topic or enter a focus"); return; }
    setGenerating(true); setErr(null);
    try {
      const r = await fetch("/api/usmle/ai/generate-note", {
        method: "POST", headers: writeHeaders(),
        body: JSON.stringify({
          topicName: t ? topicName(t.id) : undefined,
          disciplines: t?.disciplines,
          focus: focus.trim() || undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || `HTTP ${r.status}`);
      setViewing(null);
      setDraft({ id: null, topicId: genTopicId, title: d.note.title, body: d.note.body, source: "ai" });
      setTab("preview");
    } catch (e) {
      setErr(String((e as Error).message || e));
    } finally {
      setGenerating(false);
    }
  }

  function newBlank() {
    setViewing(null);
    setDraft({ id: null, topicId: genTopicId, title: "", body: BLANK_TEMPLATE, source: "manual" });
    setTab("edit");
  }

  async function openNote(id: string) {
    setErr(null);
    const r = await fetch(`/api/usmle/notes/${id}`);
    const d = await r.json();
    if (!r.ok) { setErr(d?.error || `HTTP ${r.status}`); return; }
    setDraft(null);
    setViewing(d.note);
  }

  async function save() {
    if (!draft) return;
    if (!draft.title.trim()) { setErr("Give the note a title"); return; }
    setSaving(true); setErr(null);
    try {
      const payload = { topicId: draft.topicId || null, title: draft.title.trim(), body: draft.body, source: draft.source };
      const r = draft.id
        ? await fetch(`/api/usmle/notes/${draft.id}`, { method: "PATCH", headers: writeHeaders(), body: JSON.stringify(payload) })
        : await fetch("/api/usmle/notes", { method: "POST", headers: writeHeaders(), body: JSON.stringify(payload) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error || `HTTP ${r.status}`);
      flash("Saved");
      setDraft(null);
      loadNotes();
    } catch (e) {
      setErr(String((e as Error).message || e));
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this note?")) return;
    const r = await fetch(`/api/usmle/notes/${id}`, { method: "DELETE", headers: writeHeaders() });
    if (!r.ok) { setErr((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`); return; }
    setViewing(null); setDraft(null); flash("Deleted"); loadNotes();
  }

  function editViewing() {
    if (!viewing) return;
    setDraft({ id: viewing.id, topicId: viewing.topicId || "", title: viewing.title, body: viewing.body, source: viewing.source });
    setViewing(null);
    setTab("edit");
  }

  if (!ready) return null;

  const topicSelect = (value: string, onChange: (v: string) => void, allowNone = true) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded border px-2 py-1.5 text-sm" style={inputStyle}>
      {allowNone && <option value="">— no topic —</option>}
      {topicGroups.map((g) => (
        <optgroup key={g.root.id} label={g.root.name}>
          <option value={g.root.id}>{g.root.name} (overview)</option>
          {g.children.map((c) => <option key={c.id} value={c.id}>{`  ${c.name}`}</option>)}
        </optgroup>
      ))}
    </select>
  );

  return (
    <div className="space-y-6">
      {msg && <p className="text-sm" style={{ color: "var(--color-accent)" }}>{msg}</p>}
      {err && <p className="text-sm" style={{ color: "var(--color-danger)" }}>{err}</p>}

      {/* Generate / create */}
      <div className="rounded-lg border p-4" style={{ borderColor: "var(--color-border)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>Generate a study note with AI</h3>
        <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>
          First-Aid–aligned, high-yield revision summary. Review &amp; edit before saving — nothing is stored until you save.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="flex flex-col">
            <label className="text-xs" style={{ color: "var(--color-muted)" }}>Topic</label>
            <div className="mt-1">{topicSelect(genTopicId, setGenTopicId)}</div>
          </div>
          <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Optional focus (e.g. murmurs & maneuvers)" className="min-w-[220px] flex-1 rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          <button onClick={generate} disabled={generating} className="rounded px-3 py-1.5 text-sm font-medium disabled:opacity-50" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}>
            {generating ? "Generating…" : "Generate"}
          </button>
          <button onClick={newBlank} className="rounded border px-3 py-1.5 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-accent)" }}>
            New blank note
          </button>
        </div>
      </div>

      {/* Editor */}
      {draft && (
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Note title" className="min-w-[200px] flex-1 rounded border px-2 py-1.5 text-sm font-semibold" style={inputStyle} />
            {topicSelect(draft.topicId, (v) => setDraft({ ...draft, topicId: v }))}
            <div className="flex gap-1 rounded border p-0.5" style={{ borderColor: "var(--color-border)" }}>
              {(["edit", "preview"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className="rounded px-2 py-0.5 text-xs capitalize"
                  style={tab === t ? { backgroundColor: "var(--color-accent)", color: "var(--color-bg)" } : { color: "var(--color-muted)" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            {tab === "edit" ? (
              <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={22} className="w-full rounded border px-3 py-2 font-mono text-xs" style={inputStyle} />
            ) : (
              <div className="rounded border p-3" style={{ borderColor: "var(--color-border)" }}><Markdown>{draft.body}</Markdown></div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={save} disabled={saving} className="rounded px-3 py-1.5 text-sm font-medium disabled:opacity-50" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}>
              {saving ? "Saving…" : draft.id ? "Save changes" : "Save note"}
            </button>
            <button onClick={() => setDraft(null)} className="rounded border px-3 py-1.5 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>Cancel</button>
            {draft.id && <button onClick={() => del(draft.id!)} className="ml-auto rounded border px-3 py-1.5 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-danger)" }}>Delete</button>}
          </div>
        </div>
      )}

      {/* Viewer */}
      {viewing && (
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">{viewing.title}</h2>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                {topicName(viewing.topicId) || "No topic"} · {viewing.source === "ai" ? "AI-generated" : "manual"}
              </p>
            </div>
            <div className="flex gap-1">
              <button onClick={editViewing} className="rounded border px-3 py-1.5 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-accent)" }}>Edit</button>
              <button onClick={() => del(viewing.id)} className="rounded border px-3 py-1.5 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-danger)" }}>Delete</button>
              <button onClick={() => setViewing(null)} className="rounded border px-3 py-1.5 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>Close</button>
            </div>
          </div>
          <div className="mt-3"><Markdown>{viewing.body}</Markdown></div>
        </div>
      )}

      {/* Index */}
      <div>
        <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--color-muted)" }}>
          Your notes ({notes.length})
        </h3>
        {notes.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>No notes yet — generate one above.</p>
        ) : (
          <ul className="space-y-1">
            {notes.map((n) => (
              <li key={n.id}>
                <button onClick={() => openNote(n.id)} className="flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm hover:opacity-80" style={{ borderColor: "var(--color-border)" }}>
                  <span>
                    <span className="font-medium">{n.title}</span>
                    {n.topicId && <span className="ml-2 text-xs" style={{ color: "var(--color-muted)" }}>{topicName(n.topicId)}</span>}
                  </span>
                  <span className="text-[10px] uppercase" style={{ color: "var(--color-muted)" }}>{n.source}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
