import { NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";

export const runtime = "edge";

interface TopicRow {
  id: string;
  parent_id: string | null;
  name: string;
  organ_system: string;
  disciplines: string;
  exam_weight: number | null;
  sort_order: number;
  status: string | null;
  confidence: number | null;
}

// Returns the full topic taxonomy joined with progress, ordered by sort_order.
// Powers the topic tracker and overall coverage %.
export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const { results } = await db
    .prepare(
      `SELECT t.id, t.parent_id, t.name, t.organ_system, t.disciplines,
              t.exam_weight, t.sort_order, p.status, p.confidence
         FROM topics t
         LEFT JOIN topic_progress p ON p.topic_id = t.id
        ORDER BY t.sort_order`
    )
    .all<TopicRow>();

  const topics = results.map((r) => ({
    id: r.id,
    parentId: r.parent_id,
    name: r.name,
    organSystem: r.organ_system,
    disciplines: JSON.parse(r.disciplines || "[]") as string[],
    examWeight: r.exam_weight,
    status: r.status ?? "not_started",
    confidence: r.confidence,
  }));

  return NextResponse.json({ topics }, { headers: { "Cache-Control": "no-store" } });
}
