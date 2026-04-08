CREATE TABLE IF NOT EXISTS im_bind_tokens (
    id BIGSERIAL PRIMARY KEY,
    external_id TEXT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_im_bind_tokens_user_id
    ON im_bind_tokens (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_im_bind_tokens_platform_expires_at
    ON im_bind_tokens (platform, expires_at DESC);

CREATE TABLE IF NOT EXISTS im_bindings (
    id BIGSERIAL PRIMARY KEY,
    external_id TEXT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    platform TEXT NOT NULL,
    bot_id TEXT NOT NULL,
    channel_id TEXT NOT NULL DEFAULT '',
    sender_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_bound_at TIMESTAMPTZ NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_im_bindings_platform_bot_sender
    ON im_bindings (platform, bot_id, sender_id);

CREATE INDEX IF NOT EXISTS idx_im_bindings_user_id
    ON im_bindings (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_im_bindings_active_lookup
    ON im_bindings (platform, bot_id, sender_id, status);

CREATE TABLE IF NOT EXISTS agent_runners (
    id BIGSERIAL PRIMARY KEY,
    external_id TEXT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    fixed_binding_id BIGINT NULL,
    state TEXT NOT NULL,
    last_heartbeat TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runners_user_id
    ON agent_runners (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_runners_state
    ON agent_runners (state, last_heartbeat DESC);

CREATE TABLE IF NOT EXISTS agent_conversations (
    id BIGSERIAL PRIMARY KEY,
    external_id TEXT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    platform TEXT NOT NULL,
    bot_id TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    runner_id BIGINT NOT NULL,
    agent TEXT NOT NULL,
    status TEXT NOT NULL,
    last_session_id BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id
    ON agent_conversations (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_conversations_active_chat
    ON agent_conversations (user_id, platform, bot_id, chat_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS agent_sessions (
    id BIGSERIAL PRIMARY KEY,
    external_id TEXT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    conversation_id BIGINT NULL,
    parent_session_id BIGINT NULL,
    runner_id BIGINT NOT NULL,
    agent TEXT NOT NULL,
    mode TEXT NULL,
    user_message TEXT NULL,
    final_message TEXT NULL,
    status TEXT NULL,
    executor_ref TEXT NULL,
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE agent_sessions ADD COLUMN IF NOT EXISTS conversation_id BIGINT NULL;
ALTER TABLE agent_sessions ADD COLUMN IF NOT EXISTS parent_session_id BIGINT NULL;
ALTER TABLE agent_sessions ADD COLUMN IF NOT EXISTS mode TEXT NULL;
ALTER TABLE agent_sessions ADD COLUMN IF NOT EXISTS user_message TEXT NULL;
ALTER TABLE agent_sessions ADD COLUMN IF NOT EXISTS final_message TEXT NULL;
ALTER TABLE agent_sessions ADD COLUMN IF NOT EXISTS status TEXT NULL;
ALTER TABLE agent_sessions ADD COLUMN IF NOT EXISTS executor_ref TEXT NULL;
ALTER TABLE agent_sessions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NULL;
ALTER TABLE agent_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_agent_sessions_conversation_id
    ON agent_sessions (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_runner_id
    ON agent_sessions (runner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS agent_mailbox_messages (
    id BIGSERIAL PRIMARY KEY,
    external_id TEXT NOT NULL UNIQUE,
    conversation_id BIGINT NOT NULL,
    source_session_id BIGINT NOT NULL,
    source_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    delivered_to_session_id BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_mailbox_messages_conversation_id
    ON agent_mailbox_messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_mailbox_messages_pending
    ON agent_mailbox_messages (conversation_id, delivered_to_session_id, created_at DESC);

CREATE TABLE IF NOT EXISTS agent_tasks (
    id BIGSERIAL PRIMARY KEY,
    external_id TEXT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    runner_id BIGINT NOT NULL,
    session_id BIGINT NULL,
    platform TEXT NOT NULL,
    intent TEXT NOT NULL,
    task_text TEXT NOT NULL,
    workspace_hint TEXT NULL,
    runner_selector TEXT NULL,
    status TEXT NOT NULL,
    error_message TEXT NULL,
    dispatched_at TIMESTAMPTZ NULL,
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_id
    ON agent_tasks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_runner_id
    ON agent_tasks (runner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_status_created_at
    ON agent_tasks (status, created_at DESC);
