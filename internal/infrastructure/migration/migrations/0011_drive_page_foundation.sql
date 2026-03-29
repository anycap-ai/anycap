CREATE TABLE IF NOT EXISTS spaces (
	id BIGSERIAL PRIMARY KEY,
	owner_user_id TEXT NOT NULL,
	name TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_spaces_owner_user_id_unique ON spaces (owner_user_id);

CREATE TABLE IF NOT EXISTS storage_objects (
	id BIGSERIAL PRIMARY KEY,
	space_id BIGINT NOT NULL,
	bucket TEXT NOT NULL,
	object_key TEXT NOT NULL,
	size BIGINT NOT NULL,
	mime TEXT NOT NULL,
	etag TEXT NOT NULL,
	sha256 TEXT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drive_nodes (
	id BIGSERIAL PRIMARY KEY,
	space_id BIGINT NOT NULL,
	parent_id BIGINT NULL,
	kind TEXT NOT NULL,
	name TEXT NOT NULL,
	storage_object_id BIGINT NULL,
	size BIGINT NULL,
	mime TEXT NULL,
	edge_version BIGINT NOT NULL DEFAULT 1,
	created_by TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_drive_nodes_space_parent ON drive_nodes (space_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_drive_nodes_space_deleted ON drive_nodes (space_id, deleted_at);

CREATE TABLE IF NOT EXISTS drive_share_links (
	id BIGSERIAL PRIMARY KEY,
	node_id BIGINT NOT NULL,
	token TEXT NOT NULL,
	status TEXT NOT NULL,
	expires_at TIMESTAMPTZ NULL,
	password_hash TEXT NULL,
	password_salt TEXT NULL,
	edge_version BIGINT NOT NULL DEFAULT 1,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_drive_share_links_token_unique ON drive_share_links (token);
CREATE UNIQUE INDEX IF NOT EXISTS idx_drive_share_links_node_active_unique ON drive_share_links (node_id) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS page_sites (
	id BIGSERIAL PRIMARY KEY,
	space_id BIGINT NOT NULL,
	name TEXT NOT NULL,
	page_name TEXT NOT NULL,
	current_version_id BIGINT NULL,
	access_mode TEXT NOT NULL,
	password_hash TEXT NULL,
	password_salt TEXT NULL,
	spa_fallback BOOLEAN NOT NULL DEFAULT FALSE,
	edge_version BIGINT NOT NULL DEFAULT 1,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_page_sites_space_id ON page_sites (space_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_sites_page_name_unique ON page_sites (page_name);

CREATE TABLE IF NOT EXISTS page_versions (
	id BIGSERIAL PRIMARY KEY,
	page_id BIGINT NOT NULL,
	version_no BIGINT NOT NULL,
	source_version_id BIGINT NULL,
	status TEXT NOT NULL,
	asset_prefix TEXT NOT NULL,
	created_by TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_page_versions_page_version_unique ON page_versions (page_id, version_no);

CREATE TABLE IF NOT EXISTS page_slug_registry (
	slug TEXT PRIMARY KEY,
	status TEXT NOT NULL,
	page_id BIGINT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_page_slug_registry_slug_unique ON page_slug_registry (slug);

CREATE TABLE IF NOT EXISTS upload_sessions (
	id BIGSERIAL PRIMARY KEY,
	space_id BIGINT NOT NULL,
	target_type TEXT NOT NULL,
	target_id BIGINT NOT NULL,
	object_key TEXT NOT NULL,
	status TEXT NOT NULL,
	expires_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kv_sync_jobs (
	id BIGSERIAL PRIMARY KEY,
	job_type TEXT NOT NULL,
	target_id TEXT NOT NULL,
	edge_version BIGINT NOT NULL,
	payload JSONB NOT NULL DEFAULT '{}'::jsonb,
	status TEXT NOT NULL,
	attempts INT NOT NULL DEFAULT 0,
	max_attempts INT NOT NULL DEFAULT 10,
	next_retry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	locked_by TEXT NULL,
	locked_at TIMESTAMPTZ NULL,
	last_error TEXT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kv_sync_jobs_status_next_retry ON kv_sync_jobs (status, next_retry_at);
