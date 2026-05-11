CREATE TABLE IF NOT EXISTS anonymous_trial_buckets (
    bucket_key TEXT PRIMARY KEY,
    request_count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL,
    reset_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anonymous_trial_buckets_reset_at
    ON anonymous_trial_buckets (reset_at);
