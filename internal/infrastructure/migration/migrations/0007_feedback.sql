CREATE TABLE IF NOT EXISTS feedback (
    id          TEXT PRIMARY KEY,
    user_id     BIGINT,
    type        TEXT NOT NULL,
    message     TEXT NOT NULL,
    context     JSONB,
    request_id  TEXT,
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_request_id ON feedback(request_id) WHERE request_id IS NOT NULL;
