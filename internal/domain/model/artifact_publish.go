package model

type ArtifactPublishRequest struct {
	UserID         string
	Capability     string
	MediaType      CapsArtifactMediaType
	Provider       string
	ProviderTaskID string
	Outputs        []Artifact
}

type ArtifactPublishResult struct {
	Outputs []Artifact
}

type ArtifactIngestRequest struct {
	SourceURL       string
	ObjectKey       string
	MediaType       CapsArtifactMediaType
	FilenameHint    string
	ContentTypeHint string
	MaxBytes        int64
}

type ArtifactIngestResult struct {
	ETag string
	MIME string
	Size int64
}

type ArtifactLinkRecord struct {
	ObjectKey          string `json:"object_key"`
	MIME               string `json:"mime"`
	Size               int64  `json:"size"`
	ETag               string `json:"etag"`
	ArtifactExternalID string `json:"artifact_external_id"`
	ExpiresAt          string `json:"expires_at"`
}
