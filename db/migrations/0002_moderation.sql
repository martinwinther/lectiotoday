-- Comment moderation
ALTER TABLE comments ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0; -- 0 = visible, 1 = hidden

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  comment_id TEXT NOT NULL,
  quote_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  reporter_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_open ON reports (created_at DESC, comment_id);

-- Simple metrics (daily rollups)
CREATE TABLE IF NOT EXISTS events (
  ymd INTEGER NOT NULL,             -- e.g., 20251017 (UTC)
  quote_id TEXT,                    -- nullable for site-wide events
  event TEXT NOT NULL,              -- view_quote | share | copy_link | post_ok | post_blocked
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ymd, quote_id, event)
);

