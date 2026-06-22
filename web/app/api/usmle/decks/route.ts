import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { newId, isAuthorized } from "@/lib/usmle/ids";

export const runtime = "edge";

interface DeckRow {
  id: string;
  name: string;
  topic_id: string | null;
  source: string;
  created_at: string;
  card_count: number;
}

// List decks with card counts.
export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const { results } = await db
    .prepare(
      `SELECT d.id, d.name, d.topic_id, d.source, d.created_at,
              (SELECT COUNT(*) FROM cards c WHERE c.deck_id = d.id) AS card_count
         FROM decks d ORDER BY d.created_at DESC`
    )
    .all<DeckRow>();

  return NextResponse.json(
    {
      decks: results.map((d) => ({
        id: d.id,
        name: d.name,
        topicId: d.topic_id,
        source: d.source,
        cardCount: Number(d.card_count),
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// Create a deck.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    topicId?: string;
    source?: string;
  };
  if (!body.name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const id = newId("deck");
  await db
    .prepare(`INSERT INTO decks (id, name, topic_id, source, created_at) VALUES (?, ?, ?, ?, ?)`)
    .bind(id, body.name.trim(), body.topicId ?? null, body.source ?? "manual", new Date().toISOString())
    .run();

  return NextResponse.json({ id }, { headers: { "Cache-Control": "no-store" } });
}
