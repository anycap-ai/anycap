package model

import "time"

type CapsTaskArtifactRole string

type CapsTaskArtifactSourceKind string

const (
	CapsTaskArtifactRoleInput  CapsTaskArtifactRole = "input"
	CapsTaskArtifactRoleOutput CapsTaskArtifactRole = "output"
)

const (
	CapsTaskArtifactSourceKindAnyCapUpload CapsTaskArtifactSourceKind = "anycap_upload"
	CapsTaskArtifactSourceKindExternalURL  CapsTaskArtifactSourceKind = "external_url"
	CapsTaskArtifactSourceKindProviderURL  CapsTaskArtifactSourceKind = "provider_url"
)

type CapsTaskArtifact struct {
	ID              int64                      `json:"id"`
	TaskID          int64                      `json:"task_id"`
	Role            CapsTaskArtifactRole       `json:"role"`
	Position        int                        `json:"position"`
	StorageObjectID *int64                     `json:"storage_object_id,omitempty"`
	SourceKind      CapsTaskArtifactSourceKind `json:"source_kind"`
	SourceURL       *string                    `json:"source_url,omitempty"`
	CreatedAt       time.Time                  `json:"created_at"`
}
