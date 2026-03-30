CREATE INDEX IF NOT EXISTS idx_provider_runs_sync_queue
    ON provider_runs (provider, last_synced_at, submitted_at);
