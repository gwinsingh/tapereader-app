import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { isAuthorized } from "@/lib/usmle/ids";
import { cardInsertStatements } from "@/lib/usmle/cards";

export const runtime = "edge";

interface CardListRow {
  id: string;
  deck_id: string;
  deck_name: string;
  topic_id: string | null;
  type: string;
  front: string;
  back: string;
  extra: string | null;
  tags: string;
  source: string;
  suspended: number;
  bookmarked: number;
  created_at: string;
  due: string | null;
  state: string | null;
}

// Browse/search cards with filters. Powers the Card Browser.
// Query params: deckId, tag, q (front/back search), bookmarked=1, suspended=0|1,
// state (new|learning|review|relearning), limit, offset.
export async function GET(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const p = req.nextUrl.searchParams;
  const where: string[] = [];
  const binds: unknown[] = [];
  if (p.get("deckId")) { where.push("c.deck_id = ?"); binds.push(p.get("deckId")); }
  if (p.get("tag")) { where.push("c.tags LIKE ?"); binds.push(`%"${p.get("tag")}"%`); }
  if (p.get("bookmarked") === "1") where.push("c.bookmarked = 1");
  if (p.get("suspended") === "1") where.push("c.suspended = 1");
  else if (p.get("suspended") === "0") where.push("c.suspended = 0");
  if (p.get("state")) { where.push("s.state = ?"); binds.push(p.get("state")); }
  const q = p.get("q");
  if (q) { where.push("(c.front LIKE ? OR c.back LIKE ?)"); binds.push(`%${q}%`, `%${q}%`); }

  const limit = Math.min(Math.max(Number(p.get("limit")) || 500, 1), 1000);
  const offset = Math.max(Number(p.get("offset")) || 0, 0);
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = await db
    .prepare(`SELECT COUNT(*) AS n FROM cards c LEFT JOIN card_srs s ON s.card_id = c.id ${whereSql}`)
    .bind(...binds)
    .first<{ n: number }>();

  const { results } = await db
    .prepare(
      `SELECT c.id, c.deck_id, d.name AS deck_name, c.topic_id, c.type, c.front, c.back,
              c.extra, c.tags, c.source, c.suspended, c.bookmarked, c.created_at, s.due, s.state
         FROM cards c
         JOIN decks d ON d.id = c.deck_id
         LEFT JOIN card_srs s ON s.card_id = c.id
         ${whereSql}
        ORDER BY c.created_at DESC, c.id
        LIMIT ? OFFSET ?`
    )
    .bind(...binds, limit, offset)
    .all<CardListRow>();

  const cards = results.map((r) => ({
    id: r.id,
    deckId: r.deck_id,
    deckName: r.deck_name,
    topicId: r.topic_id,
    type: r.type,
    front: r.front,
    back: r.back,
    extra: r.extra,
    tags: JSON.parse(r.tags || "[]") as string[],
    source: r.source,
    suspended: !!r.suspended,
    bookmarked: !!r.bookmarked,
    state: r.state ?? "new",
    due: r.due,
  }));

  return NextResponse.json(
    { cards, total: total?.n ?? cards.length },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// Create one card (manual authoring). Also creates its SRS row.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    deckId?: string;
    topicId?: string;
    type?: string;
    front?: string;
    back?: string;
    extra?: string;
    tags?: string[];
  };
  if (!body.deckId || !body.front?.trim() || !body.back?.trim())
    return NextResponse.json({ error: "deckId, front, back required" }, { status: 400 });

  await db.batch(
    cardInsertStatements(db, {
      deckId: body.deckId,
      topicId: body.topicId,
      type: body.type,
      front: body.front.trim(),
      back: body.back.trim(),
      extra: body.extra,
      tags: body.tags,
      source: "manual",
    })
  );

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
