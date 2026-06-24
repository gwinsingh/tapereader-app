import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";

export const runtime = "edge";

interface CustomRow {
  id: string;
  deck_id: string;
  topic_id: string | null;
  type: string;
  front: string;
  back: string;
  extra: string | null;
  tags: string;
  due: string;
  state: string;
  bookmarked: number;
}

// Builds a targeted study session from filters (deckId, tag, topicId, bookmarked).
// mode=due (default) → only cards due now; mode=cram → all matching, ignore schedule.
// Suspended cards are always excluded. Grading still updates FSRS in both modes.
export async function GET(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const p = req.nextUrl.searchParams;
  const mode = p.get("mode") === "cram" ? "cram" : "due";

  const where = ["c.suspended = 0"];
  const binds: unknown[] = [];
  if (mode === "due") { where.push("s.due <= ?"); binds.push(new Date().toISOString()); }
  if (p.get("deckId")) { where.push("c.deck_id = ?"); binds.push(p.get("deckId")); }
  if (p.get("topicId")) { where.push("c.topic_id = ?"); binds.push(p.get("topicId")); }
  if (p.get("tag")) { where.push("c.tags LIKE ?"); binds.push(`%"${p.get("tag")}"%`); }
  if (p.get("bookmarked") === "1") where.push("c.bookmarked = 1");
  if (p.get("state")) { where.push("s.state = ?"); binds.push(p.get("state")); }
  if (p.get("q")) { where.push("(c.front LIKE ? OR c.back LIKE ?)"); binds.push(`%${p.get("q")}%`, `%${p.get("q")}%`); }

  // Cram presents cards due-first then the rest; due-mode is strictly by due date.
  const order = mode === "cram" ? "s.due ASC, c.id" : "s.due ASC";

  const { results } = await db
    .prepare(
      `SELECT c.id, c.deck_id, c.topic_id, c.type, c.front, c.back, c.extra, c.tags,
              s.due, s.state, c.bookmarked
         FROM cards c JOIN card_srs s ON s.card_id = c.id
        WHERE ${where.join(" AND ")}
        ORDER BY ${order}
        LIMIT 500`
    )
    .bind(...binds)
    .all<CustomRow>();

  const cards = results.map((r) => ({
    id: r.id,
    deckId: r.deck_id,
    topicId: r.topic_id,
    type: r.type,
    front: r.front,
    back: r.back,
    extra: r.extra,
    tags: JSON.parse(r.tags || "[]") as string[],
    state: r.state,
    bookmarked: !!r.bookmarked,
  }));

  return NextResponse.json({ cards, total: cards.length, mode }, { headers: { "Cache-Control": "no-store" } });
}
