package audio

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

type fakeAudioClient struct {
	req    model.GenerateAudioRequest
	route  model.RouteBinding
	result model.InvocationResult[model.GenerateAudioResult]
}

func (f *fakeAudioClient) GenerateAudio(_ context.Context, req model.GenerateAudioRequest, route model.RouteBinding) (model.InvocationResult[model.GenerateAudioResult], error) {
	f.req = req
	f.route = route
	return f.result, nil
}

type fakeUploadResolver struct {
	calls [][]string
}

func (f *fakeUploadResolver) ResolveReferenceURLs(_ context.Context, urls []string) ([]string, error) {
	f.calls = append(f.calls, append([]string(nil), urls...))
	resolved := make([]string, len(urls))
	for i, raw := range urls {
		resolved[i] = "https://resolved.test/" + raw
	}
	return resolved, nil
}

type fakeArtifactPublisher struct {
	req model.ArtifactPublishRequest
	err error
}

type fakeUsageWriter struct {
	events []model.UsageEventRecord
	runs   []model.ProviderRunRecord
}

func (f *fakeUsageWriter) InsertUsageEvent(_ context.Context, event model.UsageEventRecord) error {
	f.events = append(f.events, event)
	return nil
}

func (f *fakeUsageWriter) InsertProviderRun(_ context.Context, run model.ProviderRunRecord) error {
	f.runs = append(f.runs, run)
	return nil
}

func (f *fakeArtifactPublisher) Publish(_ context.Context, req model.ArtifactPublishRequest) (model.ArtifactPublishResult, error) {
	f.req = req
	if f.err != nil {
		return model.ArtifactPublishResult{}, f.err
	}
	return model.ArtifactPublishResult{Outputs: []model.Artifact{{Type: "audio", URL: "/v1/artifacts/art_audio_1", MIMEType: "audio/mpeg"}}}, nil
}

func audioTestCatalog() *nexushub.CatalogStub {
	return nexushub.NewCatalogStubWith([]model.ModelSpec{{
		ModelID:    "doubao-seed-audio-1-0",
		Capability: model.CapabilityAudio,
		Status:     "active",
		Operations: map[model.Operation]model.OperationSpec{
			model.OperationGenerate: {Routes: []model.RouteBinding{
				{RouteType: model.RouteTypeScheduler, AbilityKey: "doubao-seed-audio-1-0", GenType: "audio", AlgoType: "txt_2_audio", Mode: model.ModeTextToAudio, Priority: 100, Enabled: true},
				{RouteType: model.RouteTypeScheduler, AbilityKey: "doubao-seed-audio-1-0", GenType: "audio", AlgoType: "audio_2_audio", Mode: model.ModeAudioToAudio, Priority: 100, Enabled: true},
				{RouteType: model.RouteTypeScheduler, AbilityKey: "doubao-seed-audio-1-0", GenType: "audio", AlgoType: "image_2_audio", Mode: model.ModeImageToAudio, Priority: 100, Enabled: true},
			}},
		},
	}})
}

func successfulAudioInvocation() model.InvocationResult[model.GenerateAudioResult] {
	return model.InvocationResult[model.GenerateAudioResult]{
		Value: model.GenerateAudioResult{
			ID: "atomic_audio_1", Status: "success", Model: "doubao-seed-audio-1-0", CreditCost: 2,
			Usage: map[string]any{"audio_second": 10.5},
			Outputs: []model.AudioArtifact{{
				Artifact:                model.Artifact{Type: "audio", URL: "https://provider.test/output.mp3", MIMEType: "audio/mpeg"},
				DurationSeconds:         10.5,
				OriginalDurationSeconds: 11,
				SizeBytes:               84524,
			}},
		},
		Meta: model.InvocationMeta{TaskID: "atomic_audio_1", ProviderStatus: "success", Stage: model.InvocationStageDecodeResult},
	}
}

func TestGenerateAudioResolvesReferencesAndPreservesMetadataAfterPublishing(t *testing.T) {
	client := &fakeAudioClient{result: successfulAudioInvocation()}
	resolver := &fakeUploadResolver{}
	publisher := &fakeArtifactPublisher{}
	service := NewService(audioTestCatalog(), client, credit.NewStubClient(map[string]int64{"user-1": 5}), calllog.NewMemoryCallLogRepo())
	service.SetUploadRefResolver(resolver)
	service.SetArtifactPublisher(publisher)

	result, err := service.Generate(context.Background(), model.GenerateAudioRequest{
		UserID:             "user-1",
		APIKeyID:           "akid_1",
		RequestID:          "req-audio-1",
		Prompt:             "make this sound warmer",
		Model:              "doubao-seed-audio-1-0",
		Mode:               model.ModeAudioToAudio,
		ReferenceAudioURLs: []string{"anycap://upload/upl_1"},
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if len(resolver.calls) != 1 || client.req.ReferenceAudioURLs[0] != "https://resolved.test/anycap://upload/upl_1" {
		t.Fatalf("reference was not resolved before provider invocation: calls=%+v req=%+v", resolver.calls, client.req)
	}
	if client.route.RouteType != model.RouteTypeScheduler || client.route.AlgoType != "audio_2_audio" {
		t.Fatalf("unexpected selected route: %+v", client.route)
	}
	if publisher.req.Capability != "audio.generate" || publisher.req.MediaType != model.CapsArtifactMediaTypeAudio || len(publisher.req.Outputs) != 1 {
		t.Fatalf("unexpected artifact publish request: %+v", publisher.req)
	}
	if len(result.Value.Outputs) != 1 {
		t.Fatalf("outputs = %+v", result.Value.Outputs)
	}
	output := result.Value.Outputs[0]
	if output.URL != "/v1/artifacts/art_audio_1" || output.DurationSeconds != 10.5 || output.OriginalDurationSeconds != 11 || output.SizeBytes != 84524 {
		t.Fatalf("published output lost audio metadata: %+v", output)
	}
}

func TestGenerateAudioResolvesImageReference(t *testing.T) {
	client := &fakeAudioClient{result: successfulAudioInvocation()}
	resolver := &fakeUploadResolver{}
	service := NewService(audioTestCatalog(), client, credit.NewStubClient(map[string]int64{"user-1": 5}), calllog.NewMemoryCallLogRepo())
	service.SetUploadRefResolver(resolver)

	_, err := service.Generate(context.Background(), model.GenerateAudioRequest{
		UserID: "user-1", RequestID: "req-audio-image", Prompt: "soundscape", Model: "doubao-seed-audio-1-0",
		Mode: model.ModeImageToAudio, ReferenceImageURLs: []string{"anycap://upload/upl_img"},
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if client.req.ReferenceImageURLs[0] != "https://resolved.test/anycap://upload/upl_img" || client.route.AlgoType != "image_2_audio" {
		t.Fatalf("image reference or route was not resolved: req=%+v route=%+v", client.req, client.route)
	}
}

func TestGenerateAudioPublishFailureDoesNotDeductCredit(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 5})
	client := &fakeAudioClient{result: successfulAudioInvocation()}
	service := NewService(audioTestCatalog(), client, creditClient, calllog.NewMemoryCallLogRepo())
	service.SetArtifactPublisher(&fakeArtifactPublisher{err: model.ErrUpstreamUnavailable})

	_, err := service.Generate(context.Background(), model.GenerateAudioRequest{
		UserID: "user-1", RequestID: "req-audio-publish", Prompt: "rain", Model: "doubao-seed-audio-1-0", Mode: model.ModeTextToAudio,
	})
	if !errors.Is(err, model.ErrUpstreamUnavailable) {
		t.Fatalf("error = %v, want ErrUpstreamUnavailable", err)
	}
	meta, ok := model.InvocationMetaFromError(err)
	if !ok || meta.TaskID != "atomic_audio_1" || meta.Stage != model.InvocationStagePublish {
		t.Fatalf("invocation metadata = %+v, found=%v", meta, ok)
	}
	balance, balanceErr := creditClient.GetBalance(context.Background(), "user-1")
	if balanceErr != nil || balance.Available != 5 {
		t.Fatalf("credit changed after publish failure: balance=%+v err=%v", balance, balanceErr)
	}
}

func TestGenerateAudioRejectsUnresolvedUploadReference(t *testing.T) {
	client := &fakeAudioClient{result: successfulAudioInvocation()}
	service := NewService(audioTestCatalog(), client, credit.NewStubClient(map[string]int64{"user-1": 5}), calllog.NewMemoryCallLogRepo())

	_, err := service.Generate(context.Background(), model.GenerateAudioRequest{
		UserID: "user-1", RequestID: "req-audio-unresolved", Prompt: "warm sound", Model: "doubao-seed-audio-1-0",
		Mode: model.ModeAudioToAudio, ReferenceAudioURLs: []string{"anycap://upload/upl_1"},
	})
	if !errors.Is(err, model.ErrUploadReferenceInvalid) {
		t.Fatalf("error = %v, want ErrUploadReferenceInvalid", err)
	}
	if client.req.Model != "" {
		t.Fatalf("provider received unresolved upload reference: %+v", client.req)
	}
}

func TestGenerateAudioRejectsEmptyProviderOutput(t *testing.T) {
	invocation := successfulAudioInvocation()
	invocation.Value.Outputs = nil
	client := &fakeAudioClient{result: invocation}
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 5})
	service := NewService(audioTestCatalog(), client, creditClient, calllog.NewMemoryCallLogRepo())

	_, err := service.Generate(context.Background(), model.GenerateAudioRequest{
		UserID: "user-1", RequestID: "req-audio-empty", Prompt: "rain", Model: "doubao-seed-audio-1-0", Mode: model.ModeTextToAudio,
	})
	var invocationErr *model.InvocationError
	if !errors.As(err, &invocationErr) || invocationErr.Code != model.InvocationErrorCodeUpstreamEmptyResult {
		t.Fatalf("error = %v, want UPSTREAM_EMPTY_RESULT", err)
	}
	balance, balanceErr := creditClient.GetBalance(context.Background(), "user-1")
	if balanceErr != nil || balance.Available != 5 {
		t.Fatalf("credit changed after empty output: balance=%+v err=%v", balance, balanceErr)
	}
}

func TestGenerateAudioPersistsUsageAndCallLog(t *testing.T) {
	logs := calllog.NewMemoryCallLogRepo()
	usage := &fakeUsageWriter{}
	client := &fakeAudioClient{result: successfulAudioInvocation()}
	service := NewService(audioTestCatalog(), client, credit.NewStubClient(map[string]int64{"user-1": 5}), logs)
	service.SetUsageWriter(usage)

	result, err := service.Generate(context.Background(), model.GenerateAudioRequest{
		UserID: "user-1", APIKeyID: "akid_1", RequestID: "req-audio-ledger", Prompt: "rain", Model: "doubao-seed-audio-1-0", Mode: model.ModeTextToAudio,
	})
	if err != nil {
		t.Fatalf("Generate() error = %v", err)
	}
	if len(usage.events) != 1 || len(usage.runs) != 1 {
		t.Fatalf("usage writes = events:%d runs:%d", len(usage.events), len(usage.runs))
	}
	if usage.events[0].Action != "audio.generate" || usage.events[0].APIKeyID != "akid_1" || usage.events[0].OccurredAt == (time.Time{}) {
		t.Fatalf("unexpected usage event: %+v", usage.events[0])
	}
	if usage.runs[0].ProviderTaskID != result.Value.ID || usage.runs[0].UsageEventID != usage.events[0].ID || usage.runs[0].ProviderCost != 2 {
		t.Fatalf("unexpected provider run: %+v", usage.runs[0])
	}
	items, listErr := logs.ListByUserID(context.Background(), "user-1", 10)
	if listErr != nil || len(items) != 1 || items[0].Capability != "audio.generate" || items[0].APIKeyID != "akid_1" {
		t.Fatalf("unexpected call logs: items=%+v err=%v", items, listErr)
	}
}
