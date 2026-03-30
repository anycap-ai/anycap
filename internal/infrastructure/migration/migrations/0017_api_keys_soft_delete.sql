ALTER TABLE api_keys
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_api_keys_user_deleted
    ON api_keys (user_id, deleted_at);
