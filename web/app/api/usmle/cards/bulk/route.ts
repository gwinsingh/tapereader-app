import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { isAuthorized } from "@/lib/usmle/ids";
import { cardInsertStatements, type NewCard } from "@/lib/usmle/cards";

export const runtime = "edge";

// Accept a batch of approved cards (from the AI generation review queue, or
// any import path) into a deck. Each card gets an SRS row.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    deckId?: string;
    topicId?: string;
    source?: string;
    cards?: Array<{ front?: string; back?: string; type?: string; extra?: string; tags?: string[] }>;
  };
  if (!body.deckId || !Array.isArray(body.cards) || body.cards.length === 0)
    return NextResponse.json({ error: "deckId and non-empty cards required" }, { status: 400 });

  const statements = body.cards
    .filter((c) => c.front?.trim() && c.back?.trim())
    .flatMap((c) =>
      cardInsertStatements(db, {
        deckId: body.deckId!,
        topicId: body.topicId,
        type: c.type,
        front: c.front!.trim(),
        back: c.back!.trim(),
        extra: c.extra,
        tags: c.tags,
        source: body.source ?? "ai",
      } satisfies NewCard)
    );

  if (statements.length === 0) return NextResponse.json({ error: "no valid cards" }, { status: 400 });

  await db.batch(statements);
  return NextResponse.json({ inserted: statements.length / 2 }, { headers: { "Cache-Control": "no-store" } });
}
