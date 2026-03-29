ALTER TABLE login_sessions
    ADD COLUMN IF NOT EXISTS user_code_expires_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS auth_user_email TEXT NULL,
    ADD COLUMN IF NOT EXISTS auth_user_name TEXT NULL,
    ADD COLUMN IF NOT EXISTS auth_user_picture TEXT NULL;
