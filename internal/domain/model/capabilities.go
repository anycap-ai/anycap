package model

import (
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
)

// Upload size limits per content type category.
const (
	MaxImageUploadSize int64 = 20 * 1024 * 1024  // 20 MB
	MaxVideoUploadSize int64 = 200 * 1024 * 1024 // 200 MB
	MaxAudioUploadSize int64 = 50 * 1024 * 1024  // 50 MB
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
	"audio/mpeg":      true,
	"audio/wav":       true,
	"audio/ogg":       true,
	"audio/flac":      true,
	"audio/webm":      true,
	"audio/mp4":       true,
	"audio/x-wav":     true,
}

// MaxImagesPerRequest is the maximum number of images allowed in a single multi-image request.
const MaxImagesPerRequest = 10

var (
	ErrMissingInput                      = errors.New("either url or data must be provided")
	ErrAmbiguousInput                    = errors.New("provide either url or data, not both")
	ErrMissingMIME                       = errors.New("mime_type is required when data is provided")
	ErrTooManyImages                     = fmt.Errorf("request exceeds maximum of %d images", MaxImagesPerRequest)
	ErrCapabilitiesProviderNotConfigured = errors.New("capabilities provider is not configured")
	ErrStorageNotConfigured              = errors.New("object storage is not configured")
	ErrInvalidContentType                = errors.New("content_type is not allowed")
	ErrInvalidFilename                   = errors.New("filename contains invalid characters")
	ErrInvalidSHA256                     = errors.New("sha256 must be a 64-character hex string")
	ErrContentLengthRequired             = errors.New("content_length must be positive")
	ErrFileTooLarge                      = errors.New("file exceeds maximum upload size")
	ErrUploadReferenceInvalid            = errors.New("upload reference is invalid")
	ErrUploadReferenceForbidden          = errors.New("upload reference is forbidden")
	ErrUploadReferenceNotFound           = errors.New("upload reference not found")
	ErrUploadObjectNotFound              = errors.New("upload object not found")
)

// MediaInput represents a single image in a multi-image request.
type MediaInput struct {
	URL      string `json:"url,omitempty"`
	Data     string `json:"data,omitempty"`
	MIMEType string `json:"mime_type,omitempty"`
}

func (m MediaInput) Validate() error {
	hasURL := m.URL != ""
	hasData := m.Data != ""

	if !hasURL && !hasData {
		return ErrMissingInput
	}
	if hasURL && hasData {
		return ErrAmbiguousInput
	}
	if hasData && m.MIMEType == "" {
		return ErrMissingMIME
	}
	return nil
}

// ImageReadRequest represents a request to analyze one or more images.
// Either the top-level url/data fields (single-image shorthand) or the images
// list must be provided, but not both.
type ImageReadRequest struct {
	URL         string       `json:"url,omitempty"`
	Data        string       `json:"data,omitempty"`
	MIMEType    string       `json:"mime_type,omitempty"`
	Images      []MediaInput `json:"images,omitempty"`
	Instruction string       `json:"instruction,omitempty"`
	Model       string       `json:"model,omitempty"`
}

func (r ImageReadRequest) Validate() error {
	hasSingle := r.URL != "" || r.Data != ""
	hasMulti := len(r.Images) > 0

	// Mutually exclusive: single-image fields vs images list.
	if hasSingle && hasMulti {
		return ErrAmbiguousInput
	}

	if hasMulti {
		if len(r.Images) > MaxImagesPerRequest {
			return ErrTooManyImages
		}
		for i := range r.Images {
			if err := r.Images[i].Validate(); err != nil {
				return fmt.Errorf("images[%d]: %w", i, err)
			}
		}
		return nil
	}

	// Single-image validation.
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

// AudioReadRequest represents a request to analyze audio.
type AudioReadRequest struct {
	URL         string `json:"url,omitempty"`
	Instruction string `json:"instruction,omitempty"`
	Model       string `json:"model,omitempty"`
}

func (r AudioReadRequest) Validate() error {
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

// UnderstandResult is the response from image read or video read.
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
	SHA256        string `json:"sha256,omitempty"`
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
	if trimmedSHA256 := strings.TrimSpace(r.SHA256); trimmedSHA256 != "" {
		if len(trimmedSHA256) != 64 {
			return ErrInvalidSHA256
		}
		if _, err := hex.DecodeString(strings.ToLower(trimmedSHA256)); err != nil {
			return ErrInvalidSHA256
		}
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
	if strings.HasPrefix(ct, "audio/") {
		return MaxAudioUploadSize
	}
	return MaxImageUploadSize
}

// PresignResult contains the presigned upload URL and the public object URL.
type PresignResult struct {
	UploadURL string `json:"upload_url"`
	ObjectURL string `json:"object_url"`
	ObjectKey string `json:"object_key,omitempty"` // internal use, not exposed to clients
	ExpiresIn int    `json:"expires_in"`
	Reused    bool   `json:"reused,omitempty"`
}
