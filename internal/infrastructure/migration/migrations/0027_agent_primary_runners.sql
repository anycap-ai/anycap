CREATE TABLE IF NOT EXISTS agent_primary_runners (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    platform TEXT NOT NULL,
    runner_id BIGINT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_primary_runners_user_platform
    ON agent_primary_runners (user_id, platform);

CREATE INDEX IF NOT EXISTS idx_agent_primary_runners_runner_id
    ON agent_primary_runners (runner_id, updated_at DESC);
