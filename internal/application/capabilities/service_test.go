package capabilities

import (
	"bytes"
	"context"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/s3store"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/sirupsen/logrus"
)

func newTestService() *Service {
	return NewService(agentplatform.NewStubClient(), s3store.NewStubClient())
}

func captureLogs(t *testing.T) *bytes.Buffer {
	t.Helper()

	logger := logging.GetLogger()
	originalOut := logger.Out
	originalFormatter := logger.Formatter
	originalLevel := logger.GetLevel()

	var buf bytes.Buffer
	logger.SetOutput(&buf)
	logger.SetFormatter(&logrus.JSONFormatter{})
	logger.SetLevel(logrus.DebugLevel)

	t.Cleanup(func() {
		logger.SetOutput(originalOut)
		logger.SetFormatter(originalFormatter)
		logger.SetLevel(originalLevel)
	})

	return &buf
}

func TestService_ImageRead_ValidationError(t *testing.T) {
	svc := newTestService()

	_, err := svc.ImageRead(context.Background(), model.ImageReadRequest{})
	if err != model.ErrMissingInput {
		t.Errorf("expected ErrMissingInput, got %v", err)
	}
}

func TestService_ImageRead_URL(t *testing.T) {
	svc := newTestService()

	result, err := svc.ImageRead(context.Background(), model.ImageReadRequest{
		URL:         "https://example.com/photo.jpg",
		Instruction: "What is this?",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Content == "" {
		t.Error("expected non-empty content")
	}
	if result.Model != "stub" {
		t.Errorf("expected model=stub, got %s", result.Model)
	}
}

func TestService_ImageRead_Base64(t *testing.T) {
	svc := newTestService()

	result, err := svc.ImageRead(context.Background(), model.ImageReadRequest{
		Data:     "aGVsbG8=",
		MIMEType: "image/png",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Content == "" {
		t.Error("expected non-empty content")
	}
}

func TestService_ImageRead_AmbiguousInput(t *testing.T) {
	svc := newTestService()

	_, err := svc.ImageRead(context.Background(), model.ImageReadRequest{
		URL:      "https://example.com/photo.jpg",
		Data:     "aGVsbG8=",
		MIMEType: "image/png",
	})
	if err != model.ErrAmbiguousInput {
		t.Errorf("expected ErrAmbiguousInput, got %v", err)
	}
}

func TestService_VideoRead_ValidationError(t *testing.T) {
	svc := newTestService()

	_, err := svc.VideoRead(context.Background(), model.VideoReadRequest{})
	if err != model.ErrMissingInput {
		t.Errorf("expected ErrMissingInput, got %v", err)
	}
}

func TestService_VideoRead_Success(t *testing.T) {
	svc := newTestService()

	result, err := svc.VideoRead(context.Background(), model.VideoReadRequest{
		URL:         "https://example.com/video.mp4",
		Instruction: "What happens?",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Content == "" {
		t.Error("expected non-empty content")
	}
	if result.Model != "stub" {
		t.Errorf("expected model=stub, got %s", result.Model)
	}
}

func TestService_Presign_Success(t *testing.T) {
	svc := newTestService()

	result, err := svc.Presign(context.Background(), model.PresignRequest{
		Filename:      "test.png",
		ContentType:   "image/png",
		ContentLength: 1024,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.UploadURL == "" {
		t.Error("expected non-empty upload_url")
	}
	if result.ObjectURL == "" {
		t.Error("expected non-empty object_url")
	}
}

func TestService_Presign_NoStorage(t *testing.T) {
	svc := NewService(agentplatform.NewStubClient(), nil)

	_, err := svc.Presign(context.Background(), model.PresignRequest{
		Filename:      "test.png",
		ContentType:   "image/png",
		ContentLength: 1024,
	})
	if err != model.ErrStorageNotConfigured {
		t.Errorf("expected ErrStorageNotConfigured, got %v", err)
	}
}

func TestService_Presign_LogsMissingStorageWithTraceID(t *testing.T) {
	svc := NewService(agentplatform.NewStubClient(), nil)
	logBuf := captureLogs(t)

	ctx := trace.SetTraceID(context.Background(), "trace-cap-presign-1")
	_, err := svc.Presign(ctx, model.PresignRequest{
		Filename:      "test.png",
		ContentType:   "image/png",
		ContentLength: 1024,
	})
	if err != model.ErrStorageNotConfigured {
		t.Fatalf("expected ErrStorageNotConfigured, got %v", err)
	}

	output := logBuf.String()
	if !strings.Contains(output, `"trace_id":"trace-cap-presign-1"`) {
		t.Fatalf("expected trace_id in logs, got %q", output)
	}
	if !strings.Contains(output, "capabilities object store not configured") {
		t.Fatalf("expected missing storage log, got %q", output)
	}
}

func TestService_Presign_InvalidContentType(t *testing.T) {
	svc := newTestService()

	_, err := svc.Presign(context.Background(), model.PresignRequest{
		Filename:      "test.txt",
		ContentType:   "text/plain",
		ContentLength: 1024,
	})
	if err == nil {
		t.Error("expected error for invalid content_type")
	}
}
