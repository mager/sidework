CREATE TABLE IF NOT EXISTS sidework_accounts (
  github_id BIGINT PRIMARY KEY CHECK (github_id > 0),
  login TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'approved')),
  email_updates BOOLEAN NOT NULL DEFAULT FALSE,
  updates_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
