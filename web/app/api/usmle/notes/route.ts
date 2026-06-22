import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { isAuthorized, newId } from "@/lib/usmle/ids";

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

// List notes (newest first). Pass ?topicId=... to scope to one topic.
// ?meta=1 omits the (potentially large) body for a lightweight index.
export async function GET(req: NextRequest) {
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const url = new URL(req.url);
  const topicId = url.searchParams.get("topicId");
  const metaOnly = url.searchParams.get("meta") === "1";

  const cols = metaOnly
    ? "id, topic_id, title, '' AS body, source, created_at, updated_at"
    : "id, topic_id, title, body, source, created_at, updated_at";
  const where = topicId ? "WHERE topic_id = ?" : "";
  const stmt = db.prepare(`SELECT ${cols} FROM study_notes ${where} ORDER BY updated_at DESC`);
  const { results } = await (topicId ? stmt.bind(topicId) : stmt).all<NoteRow>();

  const notes = results.map((r) => ({
    id: r.id,
    topicId: r.topic_id,
    title: r.title,
    body: r.body,
    source: r.source,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
  return NextResponse.json({ notes }, { headers: { "Cache-Control": "no-store" } });
}

// Create a note.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as {
    topicId?: string | null;
    title?: string;
    body?: string;
    source?: string;
  };
  if (!body.title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

  const id = newId("note");
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO study_notes (id, topic_id, title, body, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, body.topicId || null, body.title.trim(), body.body ?? "", body.source === "ai" ? "ai" : "manual", now, now)
    .run();

  return NextResponse.json({ id }, { headers: { "Cache-Control": "no-store" } });
}
