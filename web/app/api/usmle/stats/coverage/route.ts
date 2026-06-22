import { NextResponse } from "next/server";
import { getDB, DB_UNAVAILABLE } from "@/lib/usmle/db";
import { computeCoverage, type TopicRow, type CardStatRow } from "@/lib/usmle/coverage";

export const runtime = "edge";

// Per-organ-system coverage (status-based) + card stats, plus overall weighted
// coverage and a weakness ranking. Powers the topic-tracker dashboard.
export async function GET() {
  const db = getDB();
  if (!db) return NextResponse.json(DB_UNAVAILABLE, { status: 503 });

  const now = new Date().toISOString();

  const [topics, cardStats] = await Promise.all([
    db
      .prepare(
        `SELECT t.id, t.parent_id, t.name, t.organ_system, t.exam_weight, p.status
           FROM topics t LEFT JOIN topic_progress p ON p.topic_id = t.id`
      )
      .all<TopicRow>(),
    db
      .prepare(
        `SELECT COALESCE(t.parent_id, t.id) AS node,
                CASE WHEN s.due <= ? THEN 1 ELSE 0 END AS due,
                CASE WHEN s.state = 'review' THEN 1 ELSE 0 END AS mature
           FROM cards c
           JOIN topics t ON t.id = c.topic_id
           JOIN card_srs s ON s.card_id = c.id
          WHERE c.suspended = 0`
      )
      .bind(now)
      .all<CardStatRow>(),
  ]);

  const report = computeCoverage(topics.results, cardStats.results);
  return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
}
