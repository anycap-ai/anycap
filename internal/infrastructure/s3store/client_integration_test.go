package s3store

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"

	"github.com/joho/godotenv"
)

// TestIntegration_PresignAndUpload verifies the full presign -> upload -> read flow
// against a real S3-compatible backend. Skipped when S3 env vars are not set.
//
// Run with: go test -v -run TestIntegration ./internal/infrastructure/s3store/
func TestIntegration_PresignAndUpload(t *testing.T) {
	// Load .env from project root
	_ = godotenv.Load("../../../.env")

	cfg := config.Load().CloudS3
	if !cfg.Enabled() {
		t.Skip("S3 not configured (set ANYCAP_CLOUD_S3_ENDPOINT, ANYCAP_CLOUD_S3_ACCESS_KEY_ID, ANYCAP_CLOUD_S3_SECRET_ACCESS_KEY, ANYCAP_CLOUD_S3_BUCKET)")
	}

	ctx := context.Background()
	client, err := NewClient(ctx, cfg)
	if err != nil {
		t.Fatalf("NewClient: %v", err)
	}

	// Step 1: Generate presigned PUT URL
	testContent := fmt.Sprintf("AnyCap S3 integration test at %s", time.Now().UTC().Format(time.RFC3339))
	objectKey := fmt.Sprintf("integration/%d/test.png", time.Now().UTC().UnixNano())
	result, err := client.PresignPutObject(ctx, objectKey, "image/png", int64(len(testContent)))
	if err != nil {
		t.Fatalf("PresignPutObject: %v", err)
	}

	t.Logf("upload_url: %s", result.UploadURL[:80]+"...")
	t.Logf("object_key: %s", result.ObjectKey)
	t.Logf("expires_in: %d", result.ExpiresIn)

	if result.UploadURL == "" {
		t.Fatal("empty upload_url")
	}
	if result.ObjectKey == "" {
		t.Fatal("empty object_key")
	}

	// Register cleanup to delete the uploaded object after the test
	t.Cleanup(func() {
		if err := client.DeleteObject(context.Background(), result.ObjectKey); err != nil {
			t.Logf("cleanup: failed to delete %s: %v", result.ObjectKey, err)
		} else {
			t.Logf("cleanup: deleted %s", result.ObjectKey)
		}
	})

	// Step 2: Upload a test file via presigned PUT
	putReq, err := http.NewRequestWithContext(ctx, http.MethodPut, result.UploadURL, bytes.NewReader([]byte(testContent)))
	if err != nil {
		t.Fatalf("create PUT request: %v", err)
	}
	putReq.Header.Set("Content-Type", "image/png")
	putReq.ContentLength = int64(len(testContent))

	resp, err := http.DefaultClient.Do(putReq)
	if err != nil {
		t.Fatalf("PUT upload: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("PUT upload returned %d: %s", resp.StatusCode, string(body))
	}
	t.Logf("upload: %d OK", resp.StatusCode)

	// Step 3: Verify the object is readable via presigned GET URL
	downloadURL, err := client.PresignGetObject(ctx, result.ObjectKey, time.Minute)
	if err != nil {
		t.Fatalf("PresignGetObject: %v", err)
	}

	getResp, err := http.Get(downloadURL)
	if err != nil {
		t.Fatalf("GET presigned url: %v", err)
	}
	defer getResp.Body.Close()
	if getResp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(getResp.Body)
		t.Fatalf("GET presigned url returned %d: %s", getResp.StatusCode, string(body))
	}

	readBody, _ := io.ReadAll(getResp.Body)
	if string(readBody) != testContent {
		t.Errorf("content mismatch:\n  got:  %s\n  want: %s", string(readBody), testContent)
	}

	t.Logf("public read: OK (%d bytes)", len(readBody))
}
