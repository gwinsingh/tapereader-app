import { NextRequest, NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { flattenTaxonomy } from "@/lib/usmle/taxonomy";

export const runtime = "edge";

// Seeds (idempotent upsert) the topic taxonomy into D1. Re-runnable: existing
// rows are updated, missing ones inserted, and a not_started progress row is
// ensured for each topic. Protected by the shared write key.
export async function POST(req: NextRequest) {
  if (req.headers.get("x-write-key") !== process.env.WRITE_KEY)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const rows = flattenTaxonomy();
  const now = new Date().toISOString();

  const statements = [];
  for (const r of rows) {
    statements.push(
      db
        .prepare(
          `INSERT INTO topics (id, parent_id, name, organ_system, disciplines, exam_weight, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             parent_id = excluded.parent_id,
             name = excluded.name,
             organ_system = excluded.organ_system,
             disciplines = excluded.disciplines,
             exam_weight = excluded.exam_weight,
             sort_order = excluded.sort_order`
        )
        .bind(r.id, r.parent_id, r.name, r.organ_system, r.disciplines, r.exam_weight, r.sort_order)
    );
    statements.push(
      db
        .prepare(
          `INSERT INTO topic_progress (topic_id, status, updated_at)
           VALUES (?, 'not_started', ?)
           ON CONFLICT(topic_id) DO NOTHING`
        )
        .bind(r.id, now)
    );
  }

  await db.batch(statements);

  return NextResponse.json(
    { seeded: rows.length },
    { headers: { "Cache-Control": "no-store" } }
  );
}
