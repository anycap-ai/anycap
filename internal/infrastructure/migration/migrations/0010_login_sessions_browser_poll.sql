ALTER TABLE login_sessions
    ADD COLUMN IF NOT EXISTS browser_token TEXT NULL UNIQUE,
    ADD COLUMN IF NOT EXISTS poll_token TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_login_sessions_browser_token ON login_sessions (browser_token);
