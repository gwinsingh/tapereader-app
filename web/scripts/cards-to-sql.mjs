// Converts reviewed card-draft JSON (from gen-cards.mjs) into idempotent SQL for
// `wrangler d1 execute usmle_db --remote --file=...`. Creates one deck per entry
// and its cards + initial FSRS card_srs rows (new, due now — mirrors
// lib/usmle/srs.ts newCardState: stability/difficulty/reps/lapses=0, state 'new').
//
// IDs are deterministic so the load is idempotent (INSERT OR IGNORE):
//   deck id  = deck_<slug(name)>
//   card id  = card_<sha1(deckId + front)[0:16]>
// Re-running the same JSON inserts nothing new; editing a card's front yields a
// new id (the old card remains — suspend/delete in-app if unwanted).
//
// Usage: node scripts/cards-to-sql.mjs /tmp/usmle-cards-cardiovascular.json > /tmp/usmle-cards.sql

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const file = process.argv[2];
if (!file) {
  console.error("usage: node cards-to-sql.mjs <drafts.json>");
  process.exit(1);
}

const esc = (s) => String(s).replace(/'/g, "''");
const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
const hash = (s) => createHash("sha1").update(s).digest("hex").slice(0, 16);

const decks = JSON.parse(readFileSync(file, "utf8"));
const now = new Date().toISOString();
const out = [];

for (const deck of decks) {
  const deckId = `deck_${slug(deck.name)}`;
  const topic = deck.topicId ? `'${esc(deck.topicId)}'` : "NULL";
  const source = esc(deck.source || "ai");
  out.push(
    `INSERT OR IGNORE INTO decks (id, name, topic_id, source, created_at) ` +
      `VALUES ('${deckId}', '${esc(deck.name)}', ${topic}, '${source}', '${now}');`
  );
  for (const c of deck.cards) {
    const cardId = `card_${hash(deckId + c.front)}`;
    const type = c.type === "cloze" ? "cloze" : "basic";
    const extra = c.extra ? `'${esc(c.extra)}'` : "NULL";
    const tags = esc(JSON.stringify(Array.isArray(c.tags) ? c.tags : []));
    out.push(
      `INSERT OR IGNORE INTO cards (id, deck_id, topic_id, type, front, back, extra, tags, source, suspended, created_at) ` +
        `VALUES ('${cardId}', '${deckId}', ${topic}, '${type}', '${esc(c.front)}', '${esc(c.back)}', ${extra}, '${tags}', '${source}', 0, '${now}');`
    );
    out.push(
      `INSERT OR IGNORE INTO card_srs (card_id, due, stability, difficulty, state, reps, lapses, last_review, scheduled_days) ` +
        `VALUES ('${cardId}', '${now}', 0, 0, 'new', 0, 0, NULL, 0);`
    );
  }
}

process.stdout.write(out.join("\n") + "\n");
const cards = decks.reduce((n, d) => n + d.cards.length, 0);
process.stderr.write(`${decks.length} decks, ${cards} cards → ${out.length} statements\n`);
