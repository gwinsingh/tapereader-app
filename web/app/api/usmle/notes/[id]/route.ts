import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { isAuthorized } from "@/lib/usmle/ids";

export const runtime = "edge";

interface NoteRow {
  id: string;
  topic_id: string | null;
  title: string;
  body: string;
  source: string;
  created_at: string;
  updated_at: string;
}

// Fetch a single note (full body).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });
  const { id } = await params;

  const row = await db
    .prepare(`SELECT id, topic_id, title, body, source, created_at, updated_at FROM study_notes WHERE id = ?`)
    .bind(id)
    .first<NoteRow>();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(
    {
      note: {
        id: row.id,
        topicId: row.topic_id,
        title: row.title,
        body: row.body,
        source: row.source,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// Update title / body / topic.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });
  const { id } = await params;

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    body?: string;
    topicId?: string | null;
  };

  const sets: string[] = [];
  const values: unknown[] = [];
  if (body.title !== undefined) { sets.push("title = ?"); values.push(body.title); }
  if (body.body !== undefined) { sets.push("body = ?"); values.push(body.body); }
  if (body.topicId !== undefined) { sets.push("topic_id = ?"); values.push(body.topicId || null); }
  if (sets.length === 0) return NextResponse.json({ error: "no fields to update" }, { status: 400 });

  sets.push("updated_at = ?");
  values.push(new Date().toISOString(), id);
  await db.prepare(`UPDATE study_notes SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

// Delete a note.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });
  const { id } = await params;

  await db.prepare(`DELETE FROM study_notes WHERE id = ?`).bind(id).run();
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
