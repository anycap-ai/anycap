CREATE TABLE IF NOT EXISTS agent_conversation_followups (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    platform_message_id TEXT NOT NULL DEFAULT '',
    thread_id TEXT NOT NULL DEFAULT '',
    root_id TEXT NOT NULL DEFAULT '',
    parent_id TEXT NOT NULL DEFAULT '',
    payload TEXT NOT NULL,
    delivered_to_session_id BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_conversation_followups_pending
    ON agent_conversation_followups (conversation_id, delivered_to_session_id, created_at ASC, id ASC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_conversation_followups_message
    ON agent_conversation_followups (conversation_id, platform_message_id)
    WHERE platform_message_id <> '';
