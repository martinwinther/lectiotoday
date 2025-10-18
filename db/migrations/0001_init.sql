-- comments and votes tables

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL,
  parent_id TEXT,
  body TEXT NOT NULL,
  display_name TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  body_hash TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_comments_quote ON comments (quote_id, created_at DESC);

CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  comment_id TEXT NOT NULL,
  voter_hash TEXT NOT NULL,
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_vote ON votes (comment_id, voter_hash);

