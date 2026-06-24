-- USMLE Step 1 prep app — flashcard bookmarks (flashcards iteration 1).
-- A per-card star the student can toggle during review or from the Card Browser,
-- and filter/study by later. Apply with:
--   npx wrangler d1 migrations apply usmle_db            (remote)
--   npx wrangler d1 migrations apply usmle_db --local    (local dev)

ALTER TABLE cards ADD COLUMN bookmarked INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_cards_bookmarked ON cards(bookmarked);
