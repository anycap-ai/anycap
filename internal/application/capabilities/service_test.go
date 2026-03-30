package capabilities

import (
	"context"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/s3store"
)

func newTestService() *Service {
	return NewService(agentplatform.NewStubClient(), s3store.NewStubClient())
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
