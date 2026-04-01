CREATE TABLE IF NOT EXISTS payment_event_receipts (
    event_key TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    biz_id TEXT NOT NULL,
    user_id BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    reward_id BIGINT NULL,
    session_id TEXT NULL,
    last_error TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_event_receipts_status
    ON payment_event_receipts (status);

CREATE INDEX IF NOT EXISTS idx_payment_event_receipts_reward_id
    ON payment_event_receipts (reward_id)
    WHERE reward_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_event_receipts_session_id
    ON payment_event_receipts (session_id)
    WHERE session_id IS NOT NULL;
