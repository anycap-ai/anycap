CREATE TABLE IF NOT EXISTS login_sessions (
    id TEXT PRIMARY KEY,
    flow_type TEXT NOT NULL,
    state TEXT NULL UNIQUE,
    code_verifier TEXT NULL,
    redirect_uri TEXT NULL,
    device_code TEXT NULL UNIQUE,
    user_code TEXT NULL UNIQUE,
    auth0_subject TEXT NULL,
    api_key_id TEXT NULL,
    status TEXT NOT NULL,
    authorized_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_sessions_state ON login_sessions (state);
CREATE INDEX IF NOT EXISTS idx_login_sessions_user_code ON login_sessions (user_code);
CREATE INDEX IF NOT EXISTS idx_login_sessions_status ON login_sessions (status);

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_name = 'login_sessions'
			AND column_name = 'device_code'
	) THEN
		EXECUTE 'CREATE INDEX IF NOT EXISTS idx_login_sessions_device_code ON login_sessions (device_code)';
	END IF;
END $$;
