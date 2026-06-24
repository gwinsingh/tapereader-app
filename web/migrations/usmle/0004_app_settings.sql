-- USMLE Step 1 prep app — app settings (flashcard daily pacing).
-- Single-user key/value store. Holds the daily new-card and review caps used to
-- pace the review queue so cards introduce gradually instead of all at once.
-- Apply with:
--   npx wrangler d1 migrations apply usmle_db            (remote)
--   npx wrangler d1 migrations apply usmle_db --local    (local dev)

CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
