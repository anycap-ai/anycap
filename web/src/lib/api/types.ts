/** GET /v1/me */
export type User = {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

/** GET /v1/credits/balance */
export type Balance = {
  available: number;
  currency: string;
  credit_cent_balance: number;
};

/** Items inside GET /v1/logs */
export type TimelineItem = {
  type: "capability_call" | "credit_transaction";
  occurred_at: string;
  // capability_call fields
  request_id?: string;
  capability?: string;
  model?: string;
  status?: string;
  credit_cost?: number;
  error_code?: string;
  // credit_transaction fields
  transaction_id?: string;
  transaction_type?: string;
  credit_cent_amount?: number;
  description?: string;
  source_id?: string;
  credit_batch_type?: string;
};

/** GET /v1/logs */
export type LogsResult = {
  items: TimelineItem[];
  next_cursor?: string;
};

/** GET /v1/dashboard/summary */
export type DashboardSummary = {
  user: User;
  balance: Balance;
  recent_activity: TimelineItem[];
  usage_summary?: {
    last_capability: string;
    last_model: string;
    last_occurred_at: string;
  };
  error_summary?: {
    last_error_capability: string;
    last_error_code: string;
    last_error_occurred_at: string;
  };
};

export type DriveNode = {
  id: string;
  space_id: string;
  parent_id?: string | null;
  kind: "folder" | "file";
  name: string;
  size?: number | null;
  mime?: string | null;
  edge_version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type DriveNodeListResult = {
  items: DriveNode[];
  total: number;
};

export type DriveFilePresignResult = {
  upload_session_id: string;
  file_id: string;
  upload_url: string;
  object_url: string;
  object_key: string;
  expires_in: number;
};

export type DriveShareView = {
  node_id: string;
  token: string;
  url: string;
  expires_at?: string | null;
  has_password: boolean;
  status: "active" | "revoked";
};

export type PageAccessMode = "public" | "password" | "private_reserved";

export type PageSite = {
  id: string;
  space_id: string;
  name: string;
  page_name: string;
  current_version_id?: string | null;
  access_mode: PageAccessMode;
  password_hash?: string | null;
  password_salt?: string | null;
  spa_fallback: boolean;
  edge_version: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type PageSiteListResult = {
  items: PageSite[];
  total: number;
};

export type PageVersionStatus =
  | "draft"
  | "uploaded"
  | "verified"
  | "published"
  | "archived";

export type PageVersion = {
  id: string;
  page_id: string;
  version_no: number;
  source_version_id?: string | null;
  status: PageVersionStatus;
  asset_prefix: string;
  created_by: string;
  created_at: string;
};

export type PageVersionListResult = {
  items: PageVersion[];
  total: number;
};

export type PageVersionPresignResult = {
  upload_session_id: string;
  version_id: string;
  asset_path: string;
  upload_url: string;
  object_url: string;
  object_key: string;
  expires_in: number;
};
