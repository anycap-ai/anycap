ALTER TABLE login_sessions
    ADD COLUMN IF NOT EXISTS authorized_user_id BIGINT NULL,
    ADD COLUMN IF NOT EXISTS last_polled_at TIMESTAMPTZ NULL;
