-- USMLE Step 1 prep app — initial schema (P0)
-- D1 / SQLite. Apply with:
--   npx wrangler d1 migrations apply usmle_db            (remote)
--   npx wrangler d1 migrations apply usmle_db --local    (local dev)

-- ---------------------------------------------------------------------------
-- Topic taxonomy (organ systems + First-Aid-level subtopics). Self-referencing
-- tree. Seeded from lib/usmle/taxonomy.ts via POST /api/usmle/seed.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topics (
  id            TEXT PRIMARY KEY,        -- stable slug, e.g. "cardiovascular.heart-failure"
  parent_id     TEXT REFERENCES topics(id),
  name          TEXT NOT NULL,
  organ_system  TEXT NOT NULL,           -- NBME organ-system grouping (or "General Principles")
  disciplines   TEXT NOT NULL DEFAULT '[]', -- JSON array: pathology, physiology, ...
  exam_weight   REAL,                    -- relative priority (midpoint % where applicable)
  sort_order    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_topics_parent ON topics(parent_id);
CREATE INDEX IF NOT EXISTS idx_topics_system ON topics(organ_system);

CREATE TABLE IF NOT EXISTS topic_progress (
  topic_id    TEXT PRIMARY KEY REFERENCES topics(id),
  status      TEXT NOT NULL DEFAULT 'not_started', -- not_started | learning | reviewed | confident
  confidence  INTEGER,                  -- 1..5 self-rating
  updated_at  TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- Flashcards + decks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS decks (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  topic_id    TEXT REFERENCES topics(id),
  source      TEXT NOT NULL DEFAULT 'manual', -- manual | ai | imported
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cards (
  id          TEXT PRIMARY KEY,
  deck_id     TEXT NOT NULL REFERENCES decks(id),
  topic_id    TEXT REFERENCES topics(id),
  type        TEXT NOT NULL DEFAULT 'basic',  -- basic | cloze | image_occlusion
  front       TEXT NOT NULL,                  -- markdown
  back        TEXT NOT NULL,                  -- markdown
  extra       TEXT,                           -- mnemonic / source ref (e.g. "Pathoma 3.2")
  tags        TEXT NOT NULL DEFAULT '[]',     -- JSON array
  source      TEXT NOT NULL DEFAULT 'manual', -- manual | ai | imported
  suspended   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cards_deck ON cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_topic ON cards(topic_id);

-- FSRS per-card memory state (1 row per card once it enters scheduling).
CREATE TABLE IF NOT EXISTS card_srs (
  card_id         TEXT PRIMARY KEY REFERENCES cards(id),
  due             TEXT NOT NULL,          -- next review datetime (UTC ISO)
  stability       REAL NOT NULL DEFAULT 0,
  difficulty      REAL NOT NULL DEFAULT 0,
  state           TEXT NOT NULL DEFAULT 'new', -- new | learning | review | relearning
  reps            INTEGER NOT NULL DEFAULT 0,
  lapses          INTEGER NOT NULL DEFAULT 0,
  last_review     TEXT,
  scheduled_days  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_card_srs_due ON card_srs(due);

-- Append-only review history. Never delete — powers FSRS re-optimization + analytics.
CREATE TABLE IF NOT EXISTS review_log (
  id              TEXT PRIMARY KEY,
  card_id         TEXT NOT NULL REFERENCES cards(id),
  rating          INTEGER NOT NULL,       -- 1=Again 2=Hard 3=Good 4=Easy
  state           TEXT NOT NULL,          -- state at review time
  elapsed_days    INTEGER NOT NULL DEFAULT 0,
  scheduled_days  INTEGER NOT NULL DEFAULT 0,
  stability       REAL NOT NULL DEFAULT 0,
  difficulty      REAL NOT NULL DEFAULT 0,
  reviewed_at     TEXT NOT NULL,
  duration_ms     INTEGER
);
CREATE INDEX IF NOT EXISTS idx_review_log_card ON review_log(card_id);
CREATE INDEX IF NOT EXISTS idx_review_log_time ON review_log(reviewed_at);

-- ---------------------------------------------------------------------------
-- Practice-score tracking (UWorld / NBME / self-assessments). Surfaced later;
-- table exists now so history can be logged from day one.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS practice_scores (
  id            TEXT PRIMARY KEY,
  source        TEXT NOT NULL,            -- uworld | nbme | free120 | other
  label         TEXT,                     -- e.g. "NBME 30", "UWorld block 12"
  taken_on      TEXT NOT NULL,            -- date
  pct_correct   REAL,                     -- 0..100
  predicted     TEXT,                     -- pass | fail | null (NBME readiness)
  organ_system  TEXT,                     -- optional, for per-system block scores
  notes         TEXT,
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_scores_source ON practice_scores(source);
CREATE INDEX IF NOT EXISTS idx_scores_date ON practice_scores(taken_on);
