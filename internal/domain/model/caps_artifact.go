package model

import "time"

type CapsArtifactStatus string

const (
	CapsArtifactStatusPending CapsArtifactStatus = "pending"
	CapsArtifactStatusReady   CapsArtifactStatus = "ready"
	CapsArtifactStatusFailed  CapsArtifactStatus = "failed"
)

type CapsArtifactMediaType string

const (
	CapsArtifactMediaTypeImage CapsArtifactMediaType = "image"
	CapsArtifactMediaTypeVideo CapsArtifactMediaType = "video"
	CapsArtifactMediaTypeMusic CapsArtifactMediaType = "music"
	CapsArtifactMediaTypeAudio CapsArtifactMediaType = "audio"
)

type CapsArtifact struct {
	ID              int64
	ExternalID      string
	SpaceID         int64
	Provider        string
	ProviderTaskID  string
	Capability      string
	MediaType       CapsArtifactMediaType
	Position        int
	Status          CapsArtifactStatus
	SourceURL       string
	SourceMIME      *string
	SourceSize      *int64
	StorageObjectID *int64
	ErrorCode       *string
	ErrorMessage    *string
	CreatedBy       string
	CreatedAt       time.Time
	ReadyAt         *time.Time
}
