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
	ID              int64
	SpaceID         int64
	ParentID        *int64
	Kind            DriveNodeKind
	Name            string
	StorageObjectID *int64
	Size            *int64
	MIME            *string
	EdgeVersion     int64
	CreatedBy       string
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
	HasShare        bool
}

type DriveShareLink struct {
	ID           int64
	NodeID       int64
	Token        string
	Status       DriveShareStatus
	ExpiresAt    *time.Time
	PasswordHash *string
	PasswordSalt *string
	EdgeVersion  int64
	CreatedAt    time.Time
	UpdatedAt    time.Time
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
	Name     *string
	Limit    int
	Offset   int
}

type AttachDriveNodeStorageInput struct {
	NodeID          int64
	SpaceID         int64
	StorageObjectID int64
	Size            int64
	MIME            string
}

type DriveFilePresignResult struct {
	UploadSessionID int64
	FileID          int64
	UploadURL       string
	ObjectURL       string
	ObjectKey       string
	ExpiresIn       int
}

type DriveShareView struct {
	NodeID      int64
	Token       string
	URL         string
	ExpiresAt   *time.Time
	HasPassword bool
	Status      string
}

type DriveAccessLinks struct {
	PreviewURL  string
	DownloadURL string
	ExpiresAt   time.Time
}
