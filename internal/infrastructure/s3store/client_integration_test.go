package s3store

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/joho/godotenv"
)

// TestIntegration_PresignAndUpload verifies the full presign -> upload -> read flow
// against a real S3-compatible backend. Skipped when S3 env vars are not set.
//
// Run with: go test -v -run TestIntegration ./internal/infrastructure/s3store/
func TestIntegration_PresignAndUpload(t *testing.T) {
	// Load .env from project root
	_ = godotenv.Load("../../../.env")

	cfg := config.Load().S3
	if !cfg.Enabled() {
		t.Skip("S3 not configured (set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET)")
	}

	ctx := context.Background()
	client, err := NewClient(ctx, cfg)
	if err != nil {
		t.Fatalf("NewClient: %v", err)
	}

	// Step 1: Generate presigned PUT URL
	req := model.PresignRequest{
		Filename:    "integration-test.txt",
		ContentType: "text/plain",
	}
	result, err := client.PresignPut(ctx, req)
	if err != nil {
		t.Fatalf("PresignPut: %v", err)
	}

	t.Logf("upload_url: %s", result.UploadURL[:80]+"...")
	t.Logf("object_url: %s", result.ObjectURL)
	t.Logf("expires_in: %d", result.ExpiresIn)

	if result.UploadURL == "" {
		t.Fatal("empty upload_url")
	}
	if result.ObjectURL == "" {
		t.Fatal("empty object_url")
	}

	// Register cleanup to delete the uploaded object after the test
	t.Cleanup(func() {
		if err := client.Delete(context.Background(), result.ObjectKey); err != nil {
			t.Logf("cleanup: failed to delete %s: %v", result.ObjectKey, err)
		} else {
			t.Logf("cleanup: deleted %s", result.ObjectKey)
		}
	})

	// Step 2: Upload a test file via presigned PUT
	testContent := fmt.Sprintf("AnyCap S3 integration test at %s", time.Now().UTC().Format(time.RFC3339))
	putReq, err := http.NewRequestWithContext(ctx, http.MethodPut, result.UploadURL, bytes.NewReader([]byte(testContent)))
	if err != nil {
		t.Fatalf("create PUT request: %v", err)
	}
	putReq.Header.Set("Content-Type", "text/plain")

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

	// Step 3: Verify the object is readable via public URL
	if os.Getenv("S3_PUBLIC_URL") == "" {
		t.Log("S3_PUBLIC_URL not set, skipping public read verification")
		return
	}

	getResp, err := http.Get(result.ObjectURL)
	if err != nil {
		t.Logf("GET object_url failed (DNS may not be configured yet): %v", err)
		t.Log("skipping public read verification")
		return
	}
	defer getResp.Body.Close()

	if getResp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(getResp.Body)
		t.Logf("GET object_url returned %d (public access may not be enabled): %s", getResp.StatusCode, string(body))
		return
	}

	readBody, _ := io.ReadAll(getResp.Body)
	if string(readBody) != testContent {
		t.Errorf("content mismatch:\n  got:  %s\n  want: %s", string(readBody), testContent)
	}

	t.Logf("public read: OK (%d bytes)", len(readBody))
}
