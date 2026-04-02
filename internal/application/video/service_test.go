package video

import (
	"context"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/calllog"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
)

type fakeUsageWriter struct {
	events []model.UsageEventRecord
	runs   []model.ProviderRunRecord
}

type zeroCostNexusClient struct{}

type fakeUploadResolver struct {
	calledWith []string
}

type fakeArtifactPublisher struct {
	err error
}

func (f *fakeUsageWriter) InsertUsageEvent(_ context.Context, event model.UsageEventRecord) error {
	f.events = append(f.events, event)
	return nil
}

func (f *fakeUsageWriter) InsertProviderRun(_ context.Context, run model.ProviderRunRecord) error {
	f.runs = append(f.runs, run)
	return nil
}

func (zeroCostNexusClient) GenerateImage(_ context.Context, _ model.GenerateImageRequest, _ model.RouteBinding) (model.GenerateImageResult, error) {
	panic("unexpected GenerateImage call")
}

func (zeroCostNexusClient) GenerateVideo(_ context.Context, req model.GenerateVideoRequest, _ model.RouteBinding) (model.GenerateVideoResult, error) {
	return model.GenerateVideoResult{
		ID:      "vid-zero-cost",
		Status:  "success",
		Model:   req.Model,
		Outputs: []model.Artifact{{Type: "video", URL: "https://cdn.anycap.local/generated.mp4", MIMEType: "video/mp4"}},
	}, nil
}

func (zeroCostNexusClient) GenerateMusic(_ context.Context, _ model.GenerateMusicRequest, _ model.RouteBinding) (model.GenerateMusicResult, error) {
	panic("unexpected GenerateMusic call")
}

func (zeroCostNexusClient) GetSubmitResult(_ context.Context, _ string) (model.ProviderTaskResult, error) {
	panic("unexpected GetSubmitResult call")
}

func (f *fakeUploadResolver) ResolveReferenceURLs(_ context.Context, urls []string) ([]string, error) {
	f.calledWith = append([]string(nil), urls...)
	return []string{"https://cdn.anycap.local/resolved-frame.png"}, nil
}

func (f *fakeArtifactPublisher) Publish(_ context.Context, _ model.ArtifactPublishRequest) (model.ArtifactPublishResult, error) {
	if f.err != nil {
		return model.ArtifactPublishResult{}, f.err
	}
	return model.ArtifactPublishResult{}, nil
}

func testCatalog() *nexushub.CatalogStub {
	return nexushub.NewCatalogStubWith([]model.ModelSpec{
		{
			ModelID:     "veo-mini",
			Capability:  model.CapabilityVideo,
			DisplayName: "Veo Mini",
			Status:      "active",
			Operations: map[model.Operation]model.OperationSpec{
				model.OperationGenerate: {
					RequestHints: map[string]any{"prompt": map[string]any{"type": "string"}},
					Routes: []model.RouteBinding{{
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "veo-mini",
						GenType:    string(model.CapabilityVideo),
						Mode:       model.ModeTextToVideo,
						AlgoType:   "txt_2_video",
						Priority:   100,
						Enabled:    true,
					}, {
						RouteType:  model.RouteTypeDirect,
						AbilityKey: "veo-mini",
						GenType:    string(model.CapabilityVideo),
						Mode:       model.ModeImageToVideo,
						AlgoType:   "img_2_video",
						Priority:   90,
						Enabled:    true,
					}},
				},
			},
		},
	})
}

func TestGenerateVideo_SuccessPersistsAPIKeyID(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 10}), logs)

	result, err := service.Generate(context.Background(), model.GenerateVideoRequest{
		UserID:    "user-1",
		APIKeyID:  "akid_1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "veo-mini",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if result.Status != "success" {
		t.Fatalf("expected success, got %q", result.Status)
	}

	items, err := logs.ListByUserID(context.Background(), "user-1", 10)
	if err != nil {
		t.Fatalf("ListByUserID() error = %v", err)
	}
	if len(items) != 1 || items[0].APIKeyID != "akid_1" {
		t.Fatalf("expected call log api_key_id akid_1, got %#v", items)
	}
	if items[0].Capability != "video.generate" {
		t.Fatalf("expected video.generate capability, got %#v", items[0])
	}
}

func TestGenerateVideo_SuccessPersistsUsageLedger(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	writer := &fakeUsageWriter{}
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 10}), logs)
	service.SetUsageWriter(writer)

	result, err := service.Generate(context.Background(), model.GenerateVideoRequest{
		UserID:    "user-1",
		APIKeyID:  "akid_1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "veo-mini",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if len(writer.events) != 1 {
		t.Fatalf("expected 1 usage event, got %d", len(writer.events))
	}
	if len(writer.runs) != 1 {
		t.Fatalf("expected 1 provider run, got %d", len(writer.runs))
	}
	if writer.events[0].APIKeyID != "akid_1" || writer.events[0].Action != "video.generate" {
		t.Fatalf("unexpected usage event: %#v", writer.events[0])
	}
	if writer.events[0].OccurredAt == (time.Time{}) {
		t.Fatalf("expected occurred_at to be set, got %#v", writer.events[0])
	}
	if writer.runs[0].ProviderTaskID != result.ID || writer.runs[0].UsageEventID != writer.events[0].ID {
		t.Fatalf("unexpected provider run linkage: event=%#v run=%#v", writer.events[0], writer.runs[0])
	}
}

func TestGenerateVideo_ResolvesResourceURL(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	service := NewService(testCatalog(), nexushub.NewStubClient(), credit.NewStubClient(map[string]int64{"user-1": 10}), logs)
	resolver := &fakeUploadResolver{}
	service.SetUploadRefResolver(resolver)

	_, err := service.Generate(context.Background(), model.GenerateVideoRequest{
		UserID:             "user-1",
		APIKeyID:           "akid_1",
		RequestID:          "req-1",
		Prompt:             "paper crane",
		Model:              "veo-mini",
		Mode:               model.ModeImageToVideo,
		ReferenceImageURLs: []string{"https://example.com/frame.png"},
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}

	if len(resolver.calledWith) != 1 || resolver.calledWith[0] != "https://example.com/frame.png" {
		t.Fatalf("expected resolver to receive single resource url, got %#v", resolver.calledWith)
	}
}

func TestGenerateVideo_DoesNotDeductWhenProviderCostMissing(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	writer := &fakeUsageWriter{}
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 10})
	service := NewService(testCatalog(), zeroCostNexusClient{}, creditClient, logs)
	service.SetUsageWriter(writer)

	result, err := service.Generate(context.Background(), model.GenerateVideoRequest{
		UserID:    "user-1",
		APIKeyID:  "akid_1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "veo-mini",
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if result.CreditCost != 0 {
		t.Fatalf("expected zero response credit cost when provider cost missing, got %d", result.CreditCost)
	}

	balance, err := creditClient.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 10 {
		t.Fatalf("expected balance to remain 10 when provider cost missing, got %d", balance.Available)
	}

	transactions, _, err := creditClient.ListTransactions(context.Background(), "user-1", 10, 0)
	if err != nil {
		t.Fatalf("ListTransactions() error = %v", err)
	}
	if len(transactions) != 0 {
		t.Fatalf("expected no credit transactions when provider cost missing, got %#v", transactions)
	}

	items, err := logs.ListByUserID(context.Background(), "user-1", 10)
	if err != nil {
		t.Fatalf("ListByUserID() error = %v", err)
	}
	if len(items) != 1 || items[0].CreditCost != 0 {
		t.Fatalf("expected call log with zero cost, got %#v", items)
	}

	if len(writer.events) != 1 || writer.events[0].FinalCost != 0 || writer.events[0].EstimatedCost != 0 {
		t.Fatalf("expected zero-cost usage event, got %#v", writer.events)
	}
	if len(writer.runs) != 1 || writer.runs[0].ProviderCost != 0 {
		t.Fatalf("expected zero-cost provider run, got %#v", writer.runs)
	}
}

func TestGenerateVideo_PublishFailureDoesNotDeductCredit(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 10})
	service := NewService(testCatalog(), nexushub.NewStubClient(), creditClient, calllog.NewMemoryCallLogRepo())
	service.SetArtifactPublisher(&fakeArtifactPublisher{err: model.ErrUpstreamUnavailable})

	_, err := service.Generate(context.Background(), model.GenerateVideoRequest{
		UserID:    "user-1",
		RequestID: "req-1",
		Prompt:    "paper crane",
		Model:     "veo-mini",
	})
	if !errors.Is(err, model.ErrUpstreamUnavailable) {
		t.Fatalf("expected ErrUpstreamUnavailable, got %v", err)
	}

	balance, err := creditClient.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 10 {
		t.Fatalf("expected credit unchanged after publish failure, got %d", balance.Available)
	}
}
