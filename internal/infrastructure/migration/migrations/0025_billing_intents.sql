CREATE TABLE IF NOT EXISTS billing_intents (
    id TEXT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    api_key_id TEXT NULL,
    provider TEXT NOT NULL,
    capability TEXT NOT NULL,
    trace_id TEXT NOT NULL,
    provider_task_id TEXT NULL,
    credit_cost BIGINT NOT NULL DEFAULT 0,
    billing_status TEXT NOT NULL,
    provider_status TEXT NULL,
    deduct_source_id TEXT NOT NULL,
    last_error TEXT NULL,
    recovery_attempts INTEGER NOT NULL DEFAULT 0,
    next_retry_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deducted_at TIMESTAMPTZ NULL,
    released_at TIMESTAMPTZ NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_intents_provider_trace
    ON billing_intents (provider, trace_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_intents_deduct_source_id
    ON billing_intents (deduct_source_id);

CREATE INDEX IF NOT EXISTS idx_billing_intents_recovery_scan
    ON billing_intents (billing_status, next_retry_at, created_at);

CREATE INDEX IF NOT EXISTS idx_billing_intents_provider_task_id
    ON billing_intents (provider, provider_task_id);
