package model

import "time"

type CapsUploadStatus string

const (
	CapsUploadStatusPending  CapsUploadStatus = "pending"
	CapsUploadStatusUploaded CapsUploadStatus = "uploaded"
	CapsUploadStatusExpired  CapsUploadStatus = "expired"
)

type CapsUpload struct {
	ID         int64            `json:"id"`
	SpaceID    int64            `json:"space_id"`
	ObjectKey  string           `json:"object_key"`
	Filename   string           `json:"filename"`
	MIME       string           `json:"mime"`
	Size       int64            `json:"size"`
	SHA256     *string          `json:"sha256,omitempty"`
	Status     CapsUploadStatus `json:"status"`
	ExpiresAt  time.Time        `json:"expires_at"`
	LastUsedAt *time.Time       `json:"last_used_at,omitempty"`
	UseCount   int64            `json:"use_count"`
	CreatedBy  string           `json:"created_by"`
	CreatedAt  time.Time        `json:"created_at"`
}
