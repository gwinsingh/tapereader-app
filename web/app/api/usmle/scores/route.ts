import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { isAuthorized, newId } from "@/lib/usmle/ids";

export const runtime = "edge";

const SOURCES = ["uworld", "nbme", "free120", "other"];

interface ScoreRow {
  id: string;
  source: string;
  label: string | null;
  taken_on: string;
  pct_correct: number | null;
  predicted: string | null;
  organ_system: string | null;
  notes: string | null;
}

// List practice scores (newest first) + a small readiness summary.
export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const { results } = await db
    .prepare(
      `SELECT id, source, label, taken_on, pct_correct, predicted, organ_system, notes
         FROM practice_scores ORDER BY taken_on DESC, created_at DESC LIMIT 200`
    )
    .all<ScoreRow>();

  const scores = results.map((r) => ({
    id: r.id,
    source: r.source,
    label: r.label,
    takenOn: r.taken_on,
    pctCorrect: r.pct_correct,
    predicted: r.predicted,
    organSystem: r.organ_system,
    notes: r.notes,
  }));

  const nbme = scores.filter((s) => s.source === "nbme" || s.source === "free120");
  const summary = {
    latestNbme: nbme[0] ?? null,
    latestAny: scores[0] ?? null,
    count: scores.length,
  };

  return NextResponse.json({ scores, summary }, { headers: { "Cache-Control": "no-store" } });
}

// Log a practice score.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    source?: string;
    label?: string;
    takenOn?: string;
    pctCorrect?: number;
    predicted?: string;
    organSystem?: string;
    notes?: string;
  };

  if (!body.source || !SOURCES.includes(body.source))
    return NextResponse.json({ error: "valid source required" }, { status: 400 });
  if (!body.takenOn) return NextResponse.json({ error: "takenOn (date) required" }, { status: 400 });

  const predicted = body.predicted === "pass" || body.predicted === "fail" ? body.predicted : null;

  await db
    .prepare(
      `INSERT INTO practice_scores (id, source, label, taken_on, pct_correct, predicted, organ_system, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      newId("ps"),
      body.source,
      body.label ?? null,
      body.takenOn,
      typeof body.pctCorrect === "number" ? body.pctCorrect : null,
      predicted,
      body.organSystem ?? null,
      body.notes ?? null,
      new Date().toISOString()
    )
    .run();

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
