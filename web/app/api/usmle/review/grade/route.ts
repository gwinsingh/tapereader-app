import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { isAuthorized, newId } from "@/lib/usmle/ids";
import { grade, isValidRating, type SrsState } from "@/lib/usmle/srs";

export const runtime = "edge";

// Grade a card (1=Again 2=Hard 3=Good 4=Easy): runs FSRS, updates card_srs,
// appends to the append-only review_log. Returns the next due date.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    cardId?: string;
    rating?: number;
    durationMs?: number;
  };
  if (!body.cardId || !isValidRating(body.rating))
    return NextResponse.json({ error: "cardId and rating (1-4) required" }, { status: 400 });

  const current = await db
    .prepare(
      `SELECT due, stability, difficulty, state, reps, lapses, last_review, scheduled_days
         FROM card_srs WHERE card_id = ?`
    )
    .bind(body.cardId)
    .first<SrsState>();

  const now = new Date();
  const { state, log } = grade(current, body.rating, now);

  await db.batch([
    db
      .prepare(
        `INSERT INTO card_srs (card_id, due, stability, difficulty, state, reps, lapses, last_review, scheduled_days)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(card_id) DO UPDATE SET
           due = excluded.due, stability = excluded.stability, difficulty = excluded.difficulty,
           state = excluded.state, reps = excluded.reps, lapses = excluded.lapses,
           last_review = excluded.last_review, scheduled_days = excluded.scheduled_days`
      )
      .bind(body.cardId, state.due, state.stability, state.difficulty, state.state, state.reps, state.lapses, state.last_review, state.scheduled_days),
    db
      .prepare(
        `INSERT INTO review_log (id, card_id, rating, state, elapsed_days, scheduled_days, stability, difficulty, reviewed_at, duration_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(newId("rl"), body.cardId, log.rating, log.state, log.elapsed_days, log.scheduled_days, log.stability, log.difficulty, log.reviewed_at, body.durationMs ?? null),
  ]);

  return NextResponse.json({ due: state.due, state: state.state }, { headers: { "Cache-Control": "no-store" } });
}
