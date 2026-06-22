// Emits idempotent seed SQL for the topic taxonomy (stdout), generated from
// lib/usmle/taxonomy.ts so it never drifts from the app's canonical tree.
// Usage: node scripts/gen-seed.mjs > /tmp/usmle-seed.sql
//   then: wrangler d1 execute usmle_db --remote --file=/tmp/usmle-seed.sql
// (Mirrors POST /api/usmle/seed; used to seed via wrangler without an HTTP call.)
import { flattenTaxonomy } from "../lib/usmle/taxonomy.ts";

const now = new Date().toISOString();
const esc = (s) => String(s).replace(/'/g, "''");
const out = [];

for (const r of flattenTaxonomy()) {
  const parent = r.parent_id === null ? "NULL" : `'${esc(r.parent_id)}'`;
  const weight = r.exam_weight === null ? "NULL" : r.exam_weight;
  out.push(
    `INSERT INTO topics (id,parent_id,name,organ_system,disciplines,exam_weight,sort_order) ` +
      `VALUES ('${esc(r.id)}',${parent},'${esc(r.name)}','${esc(r.organ_system)}','${esc(r.disciplines)}',${weight},${r.sort_order}) ` +
      `ON CONFLICT(id) DO UPDATE SET parent_id=excluded.parent_id,name=excluded.name,organ_system=excluded.organ_system,disciplines=excluded.disciplines,exam_weight=excluded.exam_weight,sort_order=excluded.sort_order;`
  );
  out.push(
    `INSERT INTO topic_progress (topic_id,status,updated_at) ` +
      `VALUES ('${esc(r.id)}','not_started','${now}') ON CONFLICT(topic_id) DO NOTHING;`
  );
}

process.stdout.write(out.join("\n") + "\n");
