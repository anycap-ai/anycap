CREATE TABLE IF NOT EXISTS caps_artifacts (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	external_id TEXT NOT NULL UNIQUE,
	space_id BIGINT NOT NULL,
	provider TEXT NOT NULL,
	provider_task_id TEXT,
	capability TEXT NOT NULL,
	media_type TEXT NOT NULL,
	position INT NOT NULL DEFAULT 0,
	status TEXT NOT NULL,
	source_url TEXT NOT NULL,
	source_mime TEXT,
	source_size BIGINT,
	storage_object_id BIGINT,
	error_code TEXT,
	error_message TEXT,
	created_by TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	ready_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_caps_artifacts_space_id
	ON caps_artifacts (space_id);

CREATE INDEX IF NOT EXISTS idx_caps_artifacts_provider_task_id
	ON caps_artifacts (provider, provider_task_id);
