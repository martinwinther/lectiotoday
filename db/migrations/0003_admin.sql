-- Soft delete for comments
ALTER TABLE comments ADD COLUMN deleted_at INTEGER;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_comments_quote_created ON comments(quote_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_deleted ON comments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_comments_hidden ON comments(hidden);

-- Reports rollup convenience (if not already present)
CREATE INDEX IF NOT EXISTS idx_reports_comment ON reports(comment_id);

-- Optional audit trail
CREATE TABLE IF NOT EXISTS admin_actions (
  id TEXT PRIMARY KEY,
  admin_hash TEXT NOT NULL,
  action TEXT NOT NULL,         -- hide|unhide|delete|restore|purge
  comment_id TEXT NOT NULL,
  quote_id TEXT NOT NULL,
  meta TEXT,
  created_at INTEGER NOT NULL
);

