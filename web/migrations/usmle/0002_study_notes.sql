-- USMLE Step 1 prep app — study notes (P3 follow-on).
-- Per-topic theory/revision summaries (markdown), authored manually or generated
-- by Claude (First-Aid-aligned). Apply with:
--   npx wrangler d1 migrations apply usmle_db            (remote)
--   npx wrangler d1 migrations apply usmle_db --local    (local dev)

CREATE TABLE IF NOT EXISTS study_notes (
  id          TEXT PRIMARY KEY,
  topic_id    TEXT REFERENCES topics(id),   -- top-level node or leaf; nullable for cross-cutting notes
  title       TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',      -- markdown
  source      TEXT NOT NULL DEFAULT 'manual', -- manual | ai
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_study_notes_topic ON study_notes(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_notes_updated ON study_notes(updated_at);
