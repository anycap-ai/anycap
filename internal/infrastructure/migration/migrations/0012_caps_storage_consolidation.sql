CREATE UNIQUE INDEX IF NOT EXISTS idx_storage_objects_space_bucket_object_key_unique
ON storage_objects (space_id, bucket, object_key);

CREATE TABLE IF NOT EXISTS caps_uploads (
	id BIGSERIAL PRIMARY KEY,
	space_id BIGINT NOT NULL REFERENCES spaces(id),
	object_key TEXT NOT NULL,
	filename TEXT NOT NULL,
	mime TEXT NOT NULL,
	size BIGINT NOT NULL,
	sha256 TEXT,
	status TEXT NOT NULL DEFAULT 'pending',
	expires_at TIMESTAMPTZ NOT NULL,
	last_used_at TIMESTAMPTZ,
	use_count BIGINT NOT NULL DEFAULT 0,
	created_by TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_caps_uploads_space_id ON caps_uploads (space_id);
CREATE INDEX IF NOT EXISTS idx_caps_uploads_created_by ON caps_uploads (created_by);
CREATE INDEX IF NOT EXISTS idx_caps_uploads_space_sha256 ON caps_uploads (space_id, sha256);

CREATE TABLE IF NOT EXISTS caps_tasks (
	id BIGSERIAL PRIMARY KEY,
	space_id BIGINT NOT NULL REFERENCES spaces(id),
	capability TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'pending',
	request_meta JSONB,
	result_meta JSONB,
	created_by TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_caps_tasks_space_id ON caps_tasks (space_id);
CREATE INDEX IF NOT EXISTS idx_caps_tasks_created_by ON caps_tasks (created_by);

CREATE TABLE IF NOT EXISTS caps_task_artifacts (
	id BIGSERIAL PRIMARY KEY,
	task_id BIGINT NOT NULL REFERENCES caps_tasks(id),
	role TEXT NOT NULL,
	position INT NOT NULL DEFAULT 0,
	storage_object_id BIGINT REFERENCES storage_objects(id),
	source_kind TEXT NOT NULL,
	source_url TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_caps_task_artifacts_task_id ON caps_task_artifacts (task_id);
