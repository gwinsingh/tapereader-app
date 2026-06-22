import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { isAuthorized } from "@/lib/usmle/ids";

export const runtime = "edge";

const STATUSES = ["not_started", "learning", "reviewed", "confident"];

// Update a topic's coverage status and/or self-rated confidence (1..5).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });
  const { id } = await params;

  const body = (await req.json().catch(() => ({}))) as { status?: string; confidence?: number | null };

  if (body.status !== undefined && !STATUSES.includes(body.status))
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  if (body.status === undefined && body.confidence === undefined)
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });

  const now = new Date().toISOString();
  // Seed creates a row per topic, so this UPDATE is the normal path. COALESCE
  // leaves untouched fields as-is. Fall back to INSERT if the row is missing.
  const res = await db
    .prepare(
      `UPDATE topic_progress
          SET status = COALESCE(?, status),
              confidence = COALESCE(?, confidence),
              updated_at = ?
        WHERE topic_id = ?`
    )
    .bind(body.status ?? null, body.confidence ?? null, now, id)
    .run();

  if (Number(res.meta?.changes ?? 0) === 0) {
    await db
      .prepare(`INSERT INTO topic_progress (topic_id, status, confidence, updated_at) VALUES (?, ?, ?, ?)`)
      .bind(id, body.status ?? "not_started", body.confidence ?? null, now)
      .run();
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
