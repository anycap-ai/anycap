package image

import (
	"context"
	"errors"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
)

func TestService_ListModels(t *testing.T) {
	service := NewService(nexushub.NewStubClient(), credit.NewStubClient(nil), apikey.NewMemoryCallLogRepo())

	models, err := service.ListModels(context.Background())
	if err != nil {
		t.Fatalf("ListModels() error = %v", err)
	}
	if len(models) == 0 {
		t.Fatal("expected models")
	}
}

func TestService_GetModelSchema(t *testing.T) {
	service := NewService(nexushub.NewStubClient(), credit.NewStubClient(nil), apikey.NewMemoryCallLogRepo())

	schema, err := service.GetModelSchema(context.Background(), "flux-dev")
	if err != nil {
		t.Fatalf("GetModelSchema() error = %v", err)
	}
	if len(schema) == 0 {
		t.Fatal("expected schema")
	}
}

func TestGenerateImage_InsufficientCredit(t *testing.T) {
	service := NewService(nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 0}), apikey.NewMemoryCallLogRepo())

	_, err := service.Generate(context.Background(), model.GenerateImageRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
	})
	if !errors.Is(err, model.ErrInsufficientCredit) {
		t.Fatalf("expected ErrInsufficientCredit, got %v", err)
	}
}

func TestGenerateImage_DeductIsIdempotent(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 3})
	service := NewService(nexushub.NewStubClient(), creditClient, apikey.NewMemoryCallLogRepo())
	req := model.GenerateImageRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
	}

	if _, err := service.Generate(context.Background(), req); err != nil {
		t.Fatalf("first Generate() error = %v", err)
	}
	if _, err := service.Generate(context.Background(), req); err != nil {
		t.Fatalf("second Generate() error = %v", err)
	}

	balance, err := creditClient.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 2 {
		t.Fatalf("expected balance 2 after idempotent generate, got %d", balance.Available)
	}
}

func TestGenerateImage_Success(t *testing.T) {
	logs := apikey.NewMemoryCallLogRepo()
	service := NewService(nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 2}), logs)

	result, err := service.Generate(context.Background(), model.GenerateImageRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "flux-dev",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if result.Status != "success" {
		t.Fatalf("expected success, got %q", result.Status)
	}
	if logs.Count() != 1 {
		t.Fatalf("expected 1 call log, got %d", logs.Count())
	}
}
