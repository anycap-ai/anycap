export type Env = {
	EDGE_KV: KVNamespace;
	ANYCAP_CLOUD_R2: R2Bucket;
	CDN_HOST?: string;
	DRIVE_HOST?: string;
	PAGE_HOST_SUFFIX?: string;
	DRIVE_STATIC_ASSET_CACHE_TTL_SECONDS?: string;
	PAGE_STATIC_ASSET_CACHE_TTL_SECONDS?: string;
	DRIVE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS?: string;
	DRIVE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS?: string;
	PAGE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS?: string;
	PAGE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS?: string;
	DRIVE_PASSWORD_SESSION_TTL_SECONDS?: string;
	PAGE_PASSWORD_SESSION_TTL_SECONDS?: string;
	ANYCAP_PASSWORD_PEPPER?: string;
	EDGE_SESSION_SECRET?: string;
};

export type DriveShareRecord = {
	root_node_id: number;
	root_node_kind: "file" | "folder";
	expires_at?: string | null;
	has_password?: boolean;
	password_hash?: string | null;
	password_salt?: string | null;
	edge_version?: number;
};

export type DriveDirMetaRecord = {
	dir_id: number;
	parent_id?: number | null;
	space_id: number;
	name: string;
	edge_version?: number;
	updated_at?: string;
};

export type DriveDirChildrenRecord = {
	dir_id: number;
	space_id: number;
	items: Array<{
		id: number;
		kind: "file" | "folder";
		name: string;
		parent_id?: number | null;
		size?: number | null;
		mime?: string | null;
		edge_version?: number;
		updated_at?: string;
	}>;
	edge_version?: number;
	updated_at?: string;
};

export type DriveFileRecord = {
	id: number;
	parent_id?: number | null;
	space_id: number;
	name: string;
	object_key: string;
	mime?: string | null;
	size?: number | null;
	etag?: string | null;
	edge_version?: number;
	updated_at?: string;
};

export type PageHostRecord = {
	page_id: number;
	space_id: number;
	current_version_id: number;
	asset_prefix: string;
	spa_fallback: boolean;
	access_mode: "public" | "password" | "private_reserved";
	password_hash?: string | null;
	password_salt?: string | null;
	edge_version?: number;
	updated_at?: string;
};
