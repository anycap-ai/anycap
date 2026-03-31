package cap

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

// verboseWriter returns cmd.ErrOrStderr() if --verbose is set, nil otherwise.
func verboseWriter(cmd *cobra.Command) io.Writer {
	v, _ := cmd.Flags().GetBool("verbose")
	if v {
		return cmd.ErrOrStderr()
	}
	return nil
}

// uploadResult contains the public URL after a successful presign + upload.
type uploadResult struct {
	ObjectURL string
}

// uploadFile presigns and uploads a local file to AnyCap storage.
// If verboseLog is non-nil, debug info (URLs, sizes) is written to it.
//
// Flow:
//  1. POST /v1/capabilities/presign -> {upload_url, object_url}
//  2. PUT upload_url (direct to storage, raw file content)
//  3. Return object_url for use in subsequent API calls
func uploadFile(ctx context.Context, client *httpclient.Client, filePath string, verboseLog io.Writer) (*uploadResult, error) {
	filename := filepath.Base(filePath)
	contentType := detectContentType(filePath)

	// Stat file to get exact size for presign request.
	stat, err := os.Stat(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to stat file: %w", err)
	}
	fileSHA256, err := computeFileSHA256(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to hash file: %w", err)
	}

	// Step 1: Get presigned upload URL from AnyCap server
	resp, err := client.PostJSON(ctx, api.PresignPath, map[string]any{
		"filename":       filename,
		"content_type":   contentType,
		"content_length": stat.Size(),
		"sha256":         fileSHA256,
	})
	if err != nil {
		return nil, fmt.Errorf("presign failed: %w", err)
	}

	var presign struct {
		Data struct {
			UploadURL string `json:"upload_url"`
			ObjectURL string `json:"object_url"`
			Reused    bool   `json:"reused"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp.Body, &presign); err != nil {
		return nil, fmt.Errorf("failed to parse presign response: %w", err)
	}
	if strings.TrimSpace(presign.Data.ObjectURL) == "" {
		return nil, fmt.Errorf("presign response missing object_url")
	}

	if verboseLog != nil {
		fmt.Fprintf(verboseLog, "[upload] file=%s size=%d content_type=%s\n", filename, stat.Size(), contentType)
		fmt.Fprintf(verboseLog, "[upload] sha256=%s\n", fileSHA256)
		fmt.Fprintf(verboseLog, "[upload] reused=%t\n", presign.Data.Reused)
		fmt.Fprintf(verboseLog, "[upload] object_url=%s\n", presign.Data.ObjectURL)
		if !presign.Data.Reused {
			fmt.Fprintf(verboseLog, "[upload] upload_url=%s\n", presign.Data.UploadURL)
		}
	}

	if presign.Data.Reused {
		return &uploadResult{ObjectURL: presign.Data.ObjectURL}, nil
	}
	if strings.TrimSpace(presign.Data.UploadURL) == "" {
		return nil, fmt.Errorf("presign response missing upload_url")
	}

	// Step 2: Upload file content directly to storage (S3/R2/etc.)
	f, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer f.Close()

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, presign.Data.UploadURL, f)
	if err != nil {
		return nil, fmt.Errorf("failed to create upload request: %w", err)
	}
	req.Header.Set("Content-Type", contentType)
	req.ContentLength = stat.Size()

	// Use a client that does not follow redirects to prevent SSRF.
	uploadClient := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	uploadResp, err := uploadClient.Do(req)
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

func computeFileSHA256(filePath string) (string, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer f.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, f); err != nil {
		return "", err
	}
	return hex.EncodeToString(hash.Sum(nil)), nil
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
