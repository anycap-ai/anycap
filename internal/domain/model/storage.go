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
	ID         int64               `json:"id"`
	SpaceID    int64               `json:"space_id"`
	TargetType UploadTargetType    `json:"target_type"`
	TargetID   int64               `json:"target_id"`
	ObjectKey  string              `json:"object_key"`
	Status     UploadSessionStatus `json:"status"`
	ExpiresAt  time.Time           `json:"expires_at"`
	CreatedAt  time.Time           `json:"created_at"`
}

type StorageObject struct {
	ID        int64     `json:"id"`
	SpaceID   int64     `json:"space_id"`
	Bucket    string    `json:"bucket"`
	ObjectKey string    `json:"object_key"`
	Size      int64     `json:"size"`
	MIME      string    `json:"mime"`
	ETag      string    `json:"etag"`
	SHA256    *string   `json:"sha256,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type StorageObjectHead struct {
	Size int64  `json:"size"`
	MIME string `json:"mime"`
	ETag string `json:"etag"`
}
