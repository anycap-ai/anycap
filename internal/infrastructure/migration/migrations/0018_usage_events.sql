CREATE TABLE IF NOT EXISTS usage_events (
    id TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    api_key_id TEXT NULL,
    product_area TEXT NOT NULL,
    action TEXT NOT NULL,
    provider TEXT NOT NULL,
    request_id TEXT NULL,
    status TEXT NOT NULL,
    estimated_cost BIGINT NOT NULL DEFAULT 0,
    final_cost BIGINT NOT NULL DEFAULT 0,
    quantity BIGINT NOT NULL DEFAULT 0,
    unit TEXT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_occurred_at
    ON usage_events (user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_events_api_key_occurred_at
    ON usage_events (api_key_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_events_provider_request
    ON usage_events (provider, request_id);
