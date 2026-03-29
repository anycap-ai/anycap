-- Residual login-session cleanup after browser_poll/device-code unification.
-- These legacy columns are no longer used by application code.
DROP INDEX IF EXISTS idx_login_sessions_device_code;

ALTER TABLE login_sessions
	DROP COLUMN IF EXISTS code_verifier,
	DROP COLUMN IF EXISTS redirect_uri,
	DROP COLUMN IF EXISTS device_code;
