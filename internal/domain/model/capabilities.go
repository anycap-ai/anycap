package model

import "errors"

var (
	ErrMissingInput         = errors.New("either url or data must be provided")
	ErrAmbiguousInput       = errors.New("provide either url or data, not both")
	ErrMissingMIME          = errors.New("mime_type is required when data is provided")
	ErrStorageNotConfigured = errors.New("object storage is not configured")
)

// ImageUnderstandRequest represents a request to analyze an image.
type ImageUnderstandRequest struct {
	URL         string `json:"url,omitempty"`
	Data        string `json:"data,omitempty"`
	MIMEType    string `json:"mime_type,omitempty"`
	Instruction string `json:"instruction,omitempty"`
	Model       string `json:"model,omitempty"`
}

func (r ImageUnderstandRequest) Validate() error {
	hasURL := r.URL != ""
	hasData := r.Data != ""

	if !hasURL && !hasData {
		return ErrMissingInput
	}
	if hasURL && hasData {
		return ErrAmbiguousInput
	}
	if hasData && r.MIMEType == "" {
		return ErrMissingMIME
	}

	return nil
}

// VideoReadRequest represents a request to analyze a video.
type VideoReadRequest struct {
	URL         string `json:"url,omitempty"`
	Instruction string `json:"instruction,omitempty"`
	Model       string `json:"model,omitempty"`
}

func (r VideoReadRequest) Validate() error {
	if r.URL == "" {
		return ErrMissingInput
	}

	return nil
}

// UnderstandResult is the response from image understand or video read.
type UnderstandResult struct {
	Content    string `json:"content"`
	Model      string `json:"model"`
	DurationMs int64  `json:"duration_ms"`
}

// PresignRequest asks the server to generate a presigned PUT URL.
type PresignRequest struct {
	Filename    string `json:"filename"`
	ContentType string `json:"content_type"`
}

func (r PresignRequest) Validate() error {
	if r.Filename == "" {
		return errors.New("filename is required")
	}
	if r.ContentType == "" {
		return errors.New("content_type is required")
	}
	if !isAllowedContentType(r.ContentType) {
		return errors.New("content_type must be image/* or video/*")
	}

	return nil
}

func isAllowedContentType(ct string) bool {
	return len(ct) > 6 && (ct[:6] == "image/" || ct[:6] == "video/")
}

// PresignResult contains the presigned upload URL and the public object URL.
type PresignResult struct {
	UploadURL string `json:"upload_url"`
	ObjectURL string `json:"object_url"`
	ObjectKey string `json:"object_key,omitempty"` // internal use, not exposed to clients
	ExpiresIn int    `json:"expires_in"`
}
