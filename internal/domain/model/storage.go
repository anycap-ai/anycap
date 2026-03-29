package model

import "time"

type UploadTargetType string

const (
	UploadTargetTypeDrive UploadTargetType = "drive"
	UploadTargetTypePage  UploadTargetType = "page"
)

type UploadSessionStatus string

const (
	UploadSessionStatusPending   UploadSessionStatus = "pending"
	UploadSessionStatusCompleted UploadSessionStatus = "completed"
	UploadSessionStatusExpired   UploadSessionStatus = "expired"
)

type UploadSession struct {
	ID         int64
	SpaceID    int64
	TargetType UploadTargetType
	TargetID   int64
	ObjectKey  string
	Status     UploadSessionStatus
	ExpiresAt  time.Time
	CreatedAt  time.Time
}

type StorageObject struct {
	ID        int64
	SpaceID   int64
	Bucket    string
	ObjectKey string
	Size      int64
	MIME      string
	ETag      string
	SHA256    *string
	CreatedAt time.Time
}

type StorageObjectHead struct {
	Size int64  `json:"size"`
	MIME string `json:"mime"`
	ETag string `json:"etag"`
}
