import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { isAuthorized } from "@/lib/usmle/ids";
import { cardInsertStatements } from "@/lib/usmle/cards";

export const runtime = "edge";

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
