CREATE TABLE IF NOT EXISTS call_logs (
    request_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    api_key_id TEXT NULL,
    capability TEXT NOT NULL,
    model TEXT NULL,
    status TEXT NOT NULL,
    latency_ms BIGINT NOT NULL DEFAULT 0,
    credit_cost BIGINT NOT NULL DEFAULT 0,
    error_code TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
