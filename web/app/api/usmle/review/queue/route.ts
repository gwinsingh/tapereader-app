import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";

export const runtime = "edge";

interface QueueRow {
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

// Returns cards due for review now (FSRS due <= now, not suspended), plus a
// state breakdown. New cards have due=now so they appear here too.
// Optional ?deckId filters to one deck.
export async function GET(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const deckId = req.nextUrl.searchParams.get("deckId");
  const now = new Date().toISOString();

  const where = ["c.suspended = 0", "s.due <= ?"];
  const binds: unknown[] = [now];
  if (deckId) { where.push("c.deck_id = ?"); binds.push(deckId); }

  const { results } = await db
    .prepare(
      `SELECT c.id, c.deck_id, c.topic_id, c.type, c.front, c.back, c.extra, c.tags, s.due, s.state, c.bookmarked
         FROM cards c JOIN card_srs s ON s.card_id = c.id
        WHERE ${where.join(" AND ")}
        ORDER BY s.due ASC
        LIMIT 300`
    )
    .bind(...binds)
    .all<QueueRow>();

  const counts = { new: 0, learning: 0, review: 0, relearning: 0 };
  const cards = results.map((r) => {
    if (r.state in counts) counts[r.state as keyof typeof counts]++;
    return {
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
    };
  });

  return NextResponse.json({ cards, counts, due: cards.length }, { headers: { "Cache-Control": "no-store" } });
}
