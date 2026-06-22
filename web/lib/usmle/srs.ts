// FSRS spaced-repetition wrapper. Bridges our D1 `card_srs` rows (ISO strings +
// text state) to ts-fsrs Card objects, schedules a review, and returns the rows
// to persist back. The FSRS math lives in ts-fsrs (pure, edge-safe) — we only
// translate at the boundary. See docs/usmle-prep-app/master-plan.md §8.2.
import { fsrs, createEmptyCard, State, type Card, type Grade } from "ts-fsrs";

// Default desired retention ~0.90 (raise as the exam nears). One scheduler instance.
const scheduler = fsrs({ request_retention: 0.9 });

const STATE_TO_TEXT: Record<number, string> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
};
const TEXT_TO_STATE: Record<string, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

/** Shape of a `card_srs` row (also what we write back). */
export interface SrsState {
  due: string;
  stability: number;
  difficulty: number;
  state: string;
  reps: number;
  lapses: number;
  last_review: string | null;
  scheduled_days: number;
}

/** A `review_log` row (minus id/card_id, which the route fills in). */
export interface SrsLog {
  rating: number;
  state: string;
  elapsed_days: number;
  scheduled_days: number;
  stability: number;
  difficulty: number;
  reviewed_at: string;
}

function toFsrsCard(s: SrsState | null, now: Date): Card {
  if (!s) return createEmptyCard(now);
  return {
    due: new Date(s.due),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: 0,
    scheduled_days: s.scheduled_days,
    learning_steps: 0,
    reps: s.reps,
    lapses: s.lapses,
    state: TEXT_TO_STATE[s.state] ?? State.New,
    last_review: s.last_review ? new Date(s.last_review) : undefined,
  };
}

function fromFsrsCard(c: Card): SrsState {
  return {
    due: c.due.toISOString(),
    stability: c.stability,
    difficulty: c.difficulty,
    state: STATE_TO_TEXT[c.state] ?? "new",
    reps: c.reps,
    lapses: c.lapses,
    last_review: c.last_review ? c.last_review.toISOString() : null,
    scheduled_days: c.scheduled_days,
  };
}

/** A fresh `card_srs` row for a brand-new card (due now). */
export function newCardState(now = new Date()): SrsState {
  return fromFsrsCard(createEmptyCard(now));
}

/** Valid 1..4 ratings (Again/Hard/Good/Easy). 0 (Manual) is not user-gradeable. */
export function isValidRating(r: unknown): r is 1 | 2 | 3 | 4 {
  return r === 1 || r === 2 || r === 3 || r === 4;
}

/** Grade a card: returns the new SRS state to persist + the review-log row. */
export function grade(
  current: SrsState | null,
  rating: 1 | 2 | 3 | 4,
  now = new Date()
): { state: SrsState; log: SrsLog } {
  const { card, log } = scheduler.next(toFsrsCard(current, now), now, rating as Grade);
  return {
    state: fromFsrsCard(card),
    log: {
      rating: log.rating,
      state: STATE_TO_TEXT[log.state] ?? "new",
      elapsed_days: log.elapsed_days,
      scheduled_days: log.scheduled_days,
      stability: log.stability,
      difficulty: log.difficulty,
      reviewed_at: now.toISOString(),
    },
  };
}
