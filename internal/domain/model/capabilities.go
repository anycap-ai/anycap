package model

import (
	"errors"
	"fmt"
	"strings"
)

// Upload size limits per content type category.
const (
	MaxImageUploadSize int64 = 20 * 1024 * 1024  // 20 MB
	MaxVideoUploadSize int64 = 200 * 1024 * 1024 // 200 MB
)

// allowedContentTypes is the explicit set of MIME types accepted for upload.
// SVG is intentionally excluded (XSS risk via embedded scripts).
var allowedContentTypes = map[string]bool{
	"image/jpeg":      true,
	"image/png":       true,
	"image/gif":       true,
	"image/webp":      true,
	"video/mp4":       true,
	"video/webm":      true,
	"video/quicktime": true,
}

var (
	ErrMissingInput          = errors.New("either url or data must be provided")
	ErrAmbiguousInput        = errors.New("provide either url or data, not both")
	ErrMissingMIME           = errors.New("mime_type is required when data is provided")
	ErrStorageNotConfigured  = errors.New("object storage is not configured")
	ErrInvalidContentType    = errors.New("content_type is not allowed")
	ErrInvalidFilename       = errors.New("filename contains invalid characters")
	ErrContentLengthRequired = errors.New("content_length must be positive")
	ErrFileTooLarge          = errors.New("file exceeds maximum upload size")
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

// Usage holds token usage information from the upstream LLM call.
type Usage struct {
	InputTokens      int `json:"input_tokens"`
	OutputTokens     int `json:"output_tokens"`
	TotalTokens      int `json:"total_tokens"`
	CacheReadTokens  int `json:"cache_read_tokens"`
	CacheWriteTokens int `json:"cache_write_tokens"`
}

// UnderstandResult is the response from image understand or video read.
type UnderstandResult struct {
	Content    string `json:"content"`
	Model      string `json:"model"`
	Usage      Usage  `json:"usage"`
	DurationMs int64  `json:"duration_ms"`
}

// PresignRequest asks the server to generate a presigned PUT URL.
type PresignRequest struct {
	Filename      string `json:"filename"`
	ContentType   string `json:"content_type"`
	ContentLength int64  `json:"content_length"`
}

func (r PresignRequest) Validate() error {
	if r.Filename == "" {
		return errors.New("filename is required")
	}
	// Reject path separators and traversal sequences to prevent key manipulation.
	if strings.ContainsAny(r.Filename, "/\\") || r.Filename == "." || r.Filename == ".." || strings.Contains(r.Filename, "..") {
		return ErrInvalidFilename
	}
	if r.ContentType == "" {
		return errors.New("content_type is required")
	}
	if !allowedContentTypes[r.ContentType] {
		return fmt.Errorf("%w: %s", ErrInvalidContentType, r.ContentType)
	}
	if r.ContentLength <= 0 {
		return ErrContentLengthRequired
	}
	maxSize := maxUploadSize(r.ContentType)
	if r.ContentLength > maxSize {
		return fmt.Errorf("%w: %d bytes exceeds %d byte limit for %s",
			ErrFileTooLarge, r.ContentLength, maxSize, r.ContentType)
	}
	return nil
}

func maxUploadSize(ct string) int64 {
	if strings.HasPrefix(ct, "video/") {
		return MaxVideoUploadSize
	}
	return MaxImageUploadSize
}

// PresignResult contains the presigned upload URL and the public object URL.
type PresignResult struct {
	UploadURL string `json:"upload_url"`
	ObjectURL string `json:"object_url"`
	ObjectKey string `json:"object_key,omitempty"` // internal use, not exposed to clients
	ExpiresIn int    `json:"expires_in"`
}
