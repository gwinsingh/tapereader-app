// Shared card-insert helpers. Inserting a card also creates its `card_srs`
// row (new, due now) so it immediately enters the review queue.
import type { D1Database, D1PreparedStatement } from "./db";
import { newId } from "./ids";
import { newCardState } from "./srs";

export interface NewCard {
  deckId: string;
  topicId?: string | null;
  type?: string; // basic | cloze
  front: string;
  back: string;
  extra?: string | null;
  tags?: string[];
  source?: string; // manual | ai | imported
}

/** Returns the prepared statements that insert a card + its initial SRS row. */
export function cardInsertStatements(db: D1Database, card: NewCard): D1PreparedStatement[] {
  const id = newId("card");
  const now = new Date().toISOString();
  const srs = newCardState();
  return [
    db
      .prepare(
        `INSERT INTO cards (id, deck_id, topic_id, type, front, back, extra, tags, source, suspended, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`
      )
      .bind(
        id,
        card.deckId,
        card.topicId ?? null,
        card.type === "cloze" ? "cloze" : "basic",
        card.front,
        card.back,
        card.extra ?? null,
        JSON.stringify(card.tags ?? []),
        card.source ?? "manual",
        now
      ),
    db
      .prepare(
        `INSERT INTO card_srs (card_id, due, stability, difficulty, state, reps, lapses, last_review, scheduled_days)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(id, srs.due, srs.stability, srs.difficulty, srs.state, srs.reps, srs.lapses, srs.last_review, srs.scheduled_days),
  ];
}
