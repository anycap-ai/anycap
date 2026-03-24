package cap

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

// uploadResult contains the public URL after a successful presign + upload.
type uploadResult struct {
	ObjectURL string
}

// uploadFile presigns and uploads a local file to AnyCap storage.
//
// Flow:
//  1. POST /v1/capabilities/presign -> {upload_url, object_url}
//  2. PUT upload_url (direct to storage, raw file content)
//  3. Return object_url for use in subsequent API calls
func uploadFile(ctx context.Context, client *httpclient.Client, filePath string, stderr io.Writer) (*uploadResult, error) {
	filename := filepath.Base(filePath)
	contentType := detectContentType(filePath)

	// Step 1: Get presigned upload URL from AnyCap server
	resp, err := client.PostJSON(ctx, "/v1/capabilities/presign", map[string]any{
		"filename":     filename,
		"content_type": contentType,
	})
	if err != nil {
		return nil, fmt.Errorf("presign failed: %w", err)
	}

	var presign struct {
		Data struct {
			UploadURL string `json:"upload_url"`
			ObjectURL string `json:"object_url"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp, &presign); err != nil {
		return nil, fmt.Errorf("failed to parse presign response: %w", err)
	}

	// Step 2: Upload file content directly to storage (S3/R2/etc.)
	f, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer f.Close()

	stat, err := f.Stat()
	if err != nil {
		return nil, fmt.Errorf("failed to stat file: %w", err)
	}

	fmt.Fprintf(stderr, "Uploading %s (%d bytes)...\n", filename, stat.Size())

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, presign.Data.UploadURL, f)
	if err != nil {
		return nil, fmt.Errorf("failed to create upload request: %w", err)
	}
	req.Header.Set("Content-Type", contentType)
	req.ContentLength = stat.Size()

	uploadResp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("upload failed: %w", err)
	}
	defer uploadResp.Body.Close()

	if uploadResp.StatusCode >= 400 {
		body, _ := io.ReadAll(uploadResp.Body)
		return nil, fmt.Errorf("upload failed with status %d: %s", uploadResp.StatusCode, strings.TrimSpace(string(body)))
	}

	return &uploadResult{ObjectURL: presign.Data.ObjectURL}, nil
}

// detectContentType guesses MIME type from file extension.
func detectContentType(path string) string {
	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	// Images
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".bmp":
		return "image/bmp"
	case ".svg":
		return "image/svg+xml"
	case ".tiff", ".tif":
		return "image/tiff"
	// Videos
	case ".mp4":
		return "video/mp4"
	case ".webm":
		return "video/webm"
	case ".mov":
		return "video/quicktime"
	case ".avi":
		return "video/x-msvideo"
	case ".mkv":
		return "video/x-matroska"
	default:
		return "application/octet-stream"
	}
}
