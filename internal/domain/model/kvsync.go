package model

import (
	"encoding/json"
	"time"
)

type KVSyncJobStatus string

const (
	KVSyncJobStatusPending    KVSyncJobStatus = "pending"
	KVSyncJobStatusProcessing KVSyncJobStatus = "processing"
	KVSyncJobStatusDone       KVSyncJobStatus = "done"
	KVSyncJobStatusObsolete   KVSyncJobStatus = "obsolete"
	KVSyncJobStatusFailed     KVSyncJobStatus = "failed"
	KVSyncJobStatusDead       KVSyncJobStatus = "dead"
)

const (
	KVSyncJobTypeDriveFileMetaSync        = "drive_file_meta_sync"
	KVSyncJobTypeDriveDirChildrenSync     = "drive_dir_children_sync"
	KVSyncJobTypeDriveDirMetaSync         = "drive_dir_meta_sync"
	KVSyncJobTypeDriveShareSync           = "drive_share_sync"
	KVSyncJobTypeDriveDirTreeDelete       = "dir_tree_delete"
	KVSyncJobTypePageHostSync             = "page_host_sync"
	KVSyncJobTypePageHostDelete           = "page_host_delete"
	KVSyncJobDefaultMaxAttempts           = 10
	KVSyncJobDefaultBackoffSeconds    int = 1
)

type KVSyncDriveFileMetaPayload struct {
	SpaceID   int64  `json:"space_id"`
	FileID    int64  `json:"file_id"`
	ParentID  *int64 `json:"parent_id,omitempty"`
	Name      string `json:"name"`
	ObjectKey string `json:"object_key"`
	MIME      string `json:"mime"`
	Size      int64  `json:"size"`
	ETag      string `json:"etag"`
}

type KVSyncDriveDirChildrenPayload struct {
	SpaceID int64 `json:"space_id"`
	DirID   int64 `json:"dir_id"`
}

type KVSyncDriveDirMetaPayload struct {
	DirID int64 `json:"dir_id"`
}

type KVSyncDriveDirTreeDeletePayload struct {
	RootID  int64   `json:"root_id"`
	DirIDs  []int64 `json:"dir_ids,omitempty"`
	FileIDs []int64 `json:"file_ids,omitempty"`
}

type KVSyncDriveShareAction string

const (
	KVSyncDriveShareActionUpsert KVSyncDriveShareAction = "upsert"
	KVSyncDriveShareActionDelete KVSyncDriveShareAction = "delete"
)

type KVSyncDriveSharePayload struct {
	Action       KVSyncDriveShareAction `json:"action"`
	NodeID       int64                  `json:"node_id"`
	Token        string                 `json:"token"`
	RootNodeID   int64                  `json:"root_node_id"`
	RootNodeKind string                 `json:"root_node_kind"`
	ExpiresAt    *time.Time             `json:"expires_at,omitempty"`
	HasPassword  bool                   `json:"has_password"`
	PasswordHash *string                `json:"password_hash,omitempty"`
	PasswordSalt *string                `json:"password_salt,omitempty"`
}

type KVSyncPageHostDeletePayload struct {
	Hostname string `json:"hostname"`
}

type KVSyncJob struct {
	ID          int64           `json:"id"`
	JobType     string          `json:"job_type"`
	TargetID    string          `json:"target_id"`
	EdgeVersion int64           `json:"edge_version"`
	Payload     json.RawMessage `json:"payload"`
	Status      KVSyncJobStatus `json:"status"`
	Attempts    int             `json:"attempts"`
	MaxAttempts int             `json:"max_attempts"`
	NextRetryAt time.Time       `json:"next_retry_at"`
	LockedBy    *string         `json:"locked_by,omitempty"`
	LockedAt    *time.Time      `json:"locked_at,omitempty"`
	LastError   *string         `json:"last_error,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}
