import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { isAuthorized } from "@/lib/usmle/ids";

export const runtime = "edge";

// Edit a card's content, retag, or suspend/unsuspend it.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });
  const { id } = await params;

  const body = (await req.json().catch(() => ({}))) as {
    front?: string;
    back?: string;
    extra?: string;
    tags?: string[];
    suspended?: boolean;
    bookmarked?: boolean;
  };

  const sets: string[] = [];
  const values: unknown[] = [];
  if (body.front !== undefined) { sets.push("front = ?"); values.push(body.front); }
  if (body.back !== undefined) { sets.push("back = ?"); values.push(body.back); }
  if (body.extra !== undefined) { sets.push("extra = ?"); values.push(body.extra); }
  if (body.tags !== undefined) { sets.push("tags = ?"); values.push(JSON.stringify(body.tags)); }
  if (body.suspended !== undefined) { sets.push("suspended = ?"); values.push(body.suspended ? 1 : 0); }
  if (body.bookmarked !== undefined) { sets.push("bookmarked = ?"); values.push(body.bookmarked ? 1 : 0); }

  if (sets.length === 0) return NextResponse.json({ error: "no fields to update" }, { status: 400 });

  values.push(id);
  await db.prepare(`UPDATE cards SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

// Delete a card and its scheduling state + review history (used from the Browser).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });
  const { id } = await params;

  await db.batch([
    db.prepare(`DELETE FROM review_log WHERE card_id = ?`).bind(id),
    db.prepare(`DELETE FROM card_srs WHERE card_id = ?`).bind(id),
    db.prepare(`DELETE FROM cards WHERE id = ?`).bind(id),
  ]);

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
