"use client";

import { useCallback, useEffect, useState } from "react";
import { useWriteKey } from "@/components/usmle/useWriteKey";

interface Score {
  id: string;
  source: string;
  label: string | null;
  takenOn: string;
  pctCorrect: number | null;
  predicted: string | null;
  organSystem: string | null;
  notes: string | null;
}

const SOURCES = [
  { value: "nbme", label: "NBME self-assessment" },
  { value: "free120", label: "Free 120" },
  { value: "uworld", label: "UWorld" },
  { value: "other", label: "Other" },
];
const inputStyle = { backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)", color: "var(--color-text)" } as const;
const today = () => new Date().toISOString().slice(0, 10);

export default function ScoresPage() {
  const { ready, writeHeaders } = useWriteKey();
  const [scores, setScores] = useState<Score[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [source, setSource] = useState("nbme");
  const [label, setLabel] = useState("");
  const [takenOn, setTakenOn] = useState(today());
  const [pctCorrect, setPctCorrect] = useState("");
  const [predicted, setPredicted] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(() => {
    fetch("/api/usmle/scores")
      .then(async (r) => { if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`); return r.json(); })
      .then((d) => setScores(d.scores))
      .catch((e) => setError(String(e.message || e)));
  }, []);

  useEffect(() => { if (ready) load(); }, [ready, load]);

  async function submit() {
    setError(null);
    const r = await fetch("/api/usmle/scores", {
      method: "POST",
      headers: writeHeaders(),
      body: JSON.stringify({
        source, label: label || undefined, takenOn,
        pctCorrect: pctCorrect ? Number(pctCorrect) : undefined,
        predicted: predicted || undefined,
        notes: notes || undefined,
      }),
    });
    if (!r.ok) { setError((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`); return; }
    setLabel(""); setPctCorrect(""); setPredicted(""); setNotes("");
    setMsg("Logged"); setTimeout(() => setMsg(null), 2000);
    load();
  }

  const showsPredicted = source === "nbme" || source === "free120";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Practice scores</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Log UWorld blocks and NBME / Free 120 self-assessments. NBME scores are the best readiness signal.
        </p>
      </header>

      {error && <p className="text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>}
      {msg && <p className="text-sm" style={{ color: "var(--color-accent)" }}>{msg}</p>}

      <div className="rounded-lg border p-4" style={{ borderColor: "var(--color-border)" }}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs" style={{ color: "var(--color-muted)" }}>Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" style={inputStyle}>
              {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs" style={{ color: "var(--color-muted)" }}>Label (e.g. NBME 31)</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs" style={{ color: "var(--color-muted)" }}>Date</label>
            <input type="date" value={takenOn} onChange={(e) => setTakenOn(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs" style={{ color: "var(--color-muted)" }}>% correct</label>
            <input type="number" min={0} max={100} value={pctCorrect} onChange={(e) => setPctCorrect(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          </div>
          {showsPredicted && (
            <div>
              <label className="text-xs" style={{ color: "var(--color-muted)" }}>Predicted outcome</label>
              <select value={predicted} onChange={(e) => setPredicted(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" style={inputStyle}>
                <option value="">—</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="text-xs" style={{ color: "var(--color-muted)" }}>Notes</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" style={inputStyle} />
          </div>
        </div>
        <button onClick={submit} className="mt-3 rounded px-3 py-1.5 text-sm font-medium" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-bg)" }}>Log score</button>
      </div>

      {scores && scores.length > 0 && (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--color-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--color-muted)" }}>
                {["Date", "Source", "Label", "%", "Predicted", "Notes"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                  <td className="px-3 py-2">{s.takenOn}</td>
                  <td className="px-3 py-2 uppercase text-xs">{s.source}</td>
                  <td className="px-3 py-2">{s.label || "—"}</td>
                  <td className="px-3 py-2">{s.pctCorrect != null ? `${s.pctCorrect}%` : "—"}</td>
                  <td className="px-3 py-2" style={{ color: s.predicted === "pass" ? "var(--stat-green)" : s.predicted === "fail" ? "var(--color-danger)" : "var(--color-muted)" }}>{s.predicted || "—"}</td>
                  <td className="px-3 py-2" style={{ color: "var(--color-muted)" }}>{s.notes || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {scores && scores.length === 0 && <p className="text-sm" style={{ color: "var(--color-muted)" }}>No scores logged yet.</p>}
    </div>
  );
}
