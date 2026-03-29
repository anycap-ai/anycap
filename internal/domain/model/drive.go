package model

import "time"

type DriveNodeKind string

const (
	DriveNodeKindFolder DriveNodeKind = "folder"
	DriveNodeKindFile   DriveNodeKind = "file"
)

type DriveShareStatus string

const (
	DriveShareStatusActive  DriveShareStatus = "active"
	DriveShareStatusRevoked DriveShareStatus = "revoked"
)

type DriveNode struct {
	ID              int64         `json:"id"`
	SpaceID         int64         `json:"space_id"`
	ParentID        *int64        `json:"parent_id,omitempty"`
	Kind            DriveNodeKind `json:"kind"`
	Name            string        `json:"name"`
	StorageObjectID *int64        `json:"storage_object_id,omitempty"`
	Size            *int64        `json:"size,omitempty"`
	MIME            *string       `json:"mime,omitempty"`
	EdgeVersion     int64         `json:"edge_version"`
	CreatedBy       string        `json:"created_by"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
	DeletedAt       *time.Time    `json:"deleted_at,omitempty"`
}

type DriveShareLink struct {
	ID           int64            `json:"id"`
	NodeID       int64            `json:"node_id"`
	Token        string           `json:"token"`
	Status       DriveShareStatus `json:"status"`
	ExpiresAt    *time.Time       `json:"expires_at,omitempty"`
	PasswordHash *string          `json:"password_hash,omitempty"`
	PasswordSalt *string          `json:"password_salt,omitempty"`
	EdgeVersion  int64            `json:"edge_version"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
}

type CreateDriveFolderInput struct {
	SpaceID   int64
	ParentID  *int64
	Name      string
	CreatedBy string
}

type CreateDriveFileInput struct {
	SpaceID   int64
	ParentID  *int64
	Name      string
	CreatedBy string
	MIME      *string
	Size      *int64
}

type UpdateDriveNodeInput struct {
	ID           int64
	SpaceID      int64
	Name         *string
	ParentID     *int64
	UpdateParent bool
}

type ListDriveNodesFilter struct {
	SpaceID  int64
	ParentID *int64
}

type AttachDriveNodeStorageInput struct {
	NodeID          int64
	SpaceID         int64
	StorageObjectID int64
	Size            int64
	MIME            string
}

type DriveFilePresignResult struct {
	UploadSessionID int64  `json:"upload_session_id"`
	FileID          int64  `json:"file_id"`
	UploadURL       string `json:"upload_url"`
	ObjectURL       string `json:"object_url"`
	ObjectKey       string `json:"object_key"`
	ExpiresIn       int    `json:"expires_in"`
}

type DriveShareView struct {
	NodeID      int64      `json:"node_id"`
	Token       string     `json:"token"`
	URL         string     `json:"url"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	HasPassword bool       `json:"has_password"`
	Status      string     `json:"status"`
}
