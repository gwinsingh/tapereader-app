import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { getSettings } from "@/lib/usmle/settings";

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

const SELECT = `SELECT c.id, c.deck_id, c.topic_id, c.type, c.front, c.back, c.extra, c.tags, s.due, s.state, c.bookmarked
                  FROM cards c JOIN card_srs s ON s.card_id = c.id`;

function mapRow(r: QueueRow) {
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
}

// The paced daily review queue. Splits due cards into three pools so spaced
// repetition actually works instead of dumping every new card at once:
//   1. urgent (learning + relearning) — always served, never capped.
//   2. review-state — served up to (maxReviewsPerDay − reviews already done today).
//   3. new — served up to (newPerDay − new cards already introduced today).
// "Today" counts come from review_log (state = pre-review state). dayStart lets
// the client send its local midnight; falls back to UTC midnight.
// Optional ?deckId scopes the pools to one deck.
export async function GET(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const deckId = req.nextUrl.searchParams.get("deckId");
  const dayStartParam = req.nextUrl.searchParams.get("dayStart");
  const now = new Date().toISOString();
  const dayStart = dayStartParam || new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString();

  const settings = await getSettings(db);

  // How much of today's allowance is already spent.
  const newDoneToday =
    (await db.prepare(`SELECT COUNT(*) AS n FROM review_log WHERE state = 'new' AND reviewed_at >= ?`).bind(dayStart).first<{ n: number }>())?.n ?? 0;
  const reviewsDoneToday =
    (await db.prepare(`SELECT COUNT(*) AS n FROM review_log WHERE state = 'review' AND reviewed_at >= ?`).bind(dayStart).first<{ n: number }>())?.n ?? 0;

  const newLimit = Math.max(0, settings.newPerDay - newDoneToday);
  const reviewLimit = settings.maxReviewsPerDay <= 0 ? 100000 : Math.max(0, settings.maxReviewsPerDay - reviewsDoneToday);

  const deckFilter = deckId ? " AND c.deck_id = ?" : "";
  const deckBind = deckId ? [deckId] : [];

  // Pool 1: urgent (learning/relearning) — always.
  const urgent = (
    await db
      .prepare(`${SELECT} WHERE c.suspended = 0 AND s.due <= ? AND s.state IN ('learning','relearning')${deckFilter} ORDER BY s.due ASC LIMIT 500`)
      .bind(now, ...deckBind)
      .all<QueueRow>()
  ).results;

  // Pool 2: review-state — capped by remaining review allowance.
  const review =
    reviewLimit > 0
      ? (
          await db
            .prepare(`${SELECT} WHERE c.suspended = 0 AND s.due <= ? AND s.state = 'review'${deckFilter} ORDER BY s.due ASC LIMIT ?`)
            .bind(now, ...deckBind, reviewLimit)
            .all<QueueRow>()
        ).results
      : [];

  // Pool 3: new — gated by remaining new allowance.
  const fresh =
    newLimit > 0
      ? (
          await db
            .prepare(`${SELECT} WHERE c.suspended = 0 AND s.due <= ? AND s.state = 'new'${deckFilter} ORDER BY s.due ASC, c.created_at ASC LIMIT ?`)
            .bind(now, ...deckBind, newLimit)
            .all<QueueRow>()
        ).results
      : [];

  // Time-sensitive first (urgent + review), new material last.
  const cards = [...urgent, ...review, ...fresh].map(mapRow);

  const counts = { new: 0, learning: 0, review: 0, relearning: 0 };
  for (const c of cards) if (c.state in counts) counts[c.state as keyof typeof counts]++;

  const pacing = {
    newPerDay: settings.newPerDay,
    newDoneToday,
    newServed: fresh.length,
    newRemaining: newLimit,
    maxReviewsPerDay: settings.maxReviewsPerDay,
    reviewsDoneToday,
    reviewsServed: urgent.length + review.length,
  };

  return NextResponse.json({ cards, counts, due: cards.length, pacing }, { headers: { "Cache-Control": "no-store" } });
}
