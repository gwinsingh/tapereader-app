// Converts reviewed study-note JSON (from gen-notes.mjs) into idempotent SQL for
// `wrangler d1 execute usmle_db --remote --file=...`. Inserts into study_notes.
// Deterministic id = note_<sha1(topicId|title)[0:16]> so re-running is a no-op
// (INSERT OR IGNORE). Editing a title yields a new row; the old one remains.
//
// Usage: node scripts/notes-to-sql.mjs /tmp/usmle-notes.json > /tmp/usmle-notes.sql

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2];
if (!file) { console.error("usage: node notes-to-sql.mjs <notes.json>"); process.exit(1); }

const esc = (s) => String(s).replace(/'/g, "''");
const hash = (s) => createHash("sha1").update(s).digest("hex").slice(0, 16);

const notes = JSON.parse(readFileSync(file, "utf8"));
const now = new Date().toISOString();
const out = [];

for (const n of notes) {
  const topic = n.topicId ? `'${esc(n.topicId)}'` : "NULL";
  const id = `note_${hash((n.topicId || "") + "|" + n.title)}`;
  out.push(
    `INSERT OR IGNORE INTO study_notes (id, topic_id, title, body, source, created_at, updated_at) ` +
      `VALUES ('${id}', ${topic}, '${esc(n.title)}', '${esc(n.body)}', '${esc(n.source || "ai")}', '${now}', '${now}');`
  );
}

process.stdout.write(out.join("\n") + "\n");
process.stderr.write(`${notes.length} notes → ${out.length} statements\n`);
