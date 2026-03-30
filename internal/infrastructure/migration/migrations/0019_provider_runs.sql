CREATE TABLE IF NOT EXISTS provider_runs (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    provider_task_id TEXT NOT NULL,
    usage_event_id TEXT NOT NULL REFERENCES usage_events(id) ON DELETE CASCADE,
    auth_mode TEXT NOT NULL,
    ability_key TEXT NULL,
    provider_status TEXT NOT NULL,
    provider_usage JSONB NOT NULL DEFAULT '{}'::jsonb,
    provider_cost BIGINT NOT NULL DEFAULT 0,
    raw_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ NULL,
    last_synced_at TIMESTAMPTZ NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_runs_provider_task_id
    ON provider_runs (provider, provider_task_id);

CREATE INDEX IF NOT EXISTS idx_provider_runs_usage_event_id
    ON provider_runs (usage_event_id);
