package capabilities

import (
	"bytes"
	"context"
	"errors"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/agentplatform"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/calllog"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/credit"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/s3store"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/sirupsen/logrus"
)

type fakeCapabilitiesProvider struct {
	imageResult model.UnderstandResult
	videoResult model.UnderstandResult
	audioResult model.UnderstandResult
	imageErr    error
	videoErr    error
	audioErr    error
}

type fakeCapabilitiesBillingCoordinator struct {
	intents         []model.CreateBillingIntentInput
	providerSuccess []model.RecordBillingProviderSuccessInput
	uncertain       []string
	deducted        []string
}

func (f *fakeCapabilitiesProvider) ImageRead(_ context.Context, _ model.ImageReadRequest) (model.UnderstandResult, error) {
	if f.imageErr != nil {
		return model.UnderstandResult{}, f.imageErr
	}
	if f.imageResult.Content != "" {
		return f.imageResult, nil
	}
	return agentplatform.NewStubClient().ImageRead(context.Background(), model.ImageReadRequest{
		URL: "https://example.com/fallback-image.jpg",
	})
}

func (f *fakeCapabilitiesProvider) VideoRead(_ context.Context, _ model.VideoReadRequest) (model.UnderstandResult, error) {
	if f.videoErr != nil {
		return model.UnderstandResult{}, f.videoErr
	}
	if f.videoResult.Content != "" {
		return f.videoResult, nil
	}
	return agentplatform.NewStubClient().VideoRead(context.Background(), model.VideoReadRequest{
		URL: "https://example.com/fallback-video.mp4",
	})
}

func (f *fakeCapabilitiesProvider) AudioRead(_ context.Context, _ model.AudioReadRequest) (model.UnderstandResult, error) {
	if f.audioErr != nil {
		return model.UnderstandResult{}, f.audioErr
	}
	if f.audioResult.Content != "" {
		return f.audioResult, nil
	}
	return agentplatform.NewStubClient().AudioRead(context.Background(), model.AudioReadRequest{
		URL: "https://example.com/fallback-audio.mp3",
	})
}

func (f *fakeCapabilitiesBillingCoordinator) CreateOrGetIntent(_ context.Context, input model.CreateBillingIntentInput) (model.BillingIntent, error) {
	f.intents = append(f.intents, input)
	return model.BillingIntent{
		Provider:       input.Provider,
		TraceID:        input.TraceID,
		DeductSourceID: "anycap-image-read-" + input.TraceID,
		CreditCost:     input.CreditCost,
	}, nil
}

func (f *fakeCapabilitiesBillingCoordinator) RecordProviderSuccess(_ context.Context, input model.RecordBillingProviderSuccessInput) error {
	f.providerSuccess = append(f.providerSuccess, input)
	return nil
}

func (f *fakeCapabilitiesBillingCoordinator) RecordProviderFailure(_ context.Context, _, _, _, _ string) error {
	return nil
}

func (f *fakeCapabilitiesBillingCoordinator) MarkUncertain(_ context.Context, _, traceID, _ string) error {
	f.uncertain = append(f.uncertain, traceID)
	return nil
}

func (f *fakeCapabilitiesBillingCoordinator) MarkLookupNotReady(_ context.Context, intent model.BillingIntent, _ string) error {
	f.uncertain = append(f.uncertain, intent.TraceID)
	return nil
}

func (f *fakeCapabilitiesBillingCoordinator) MarkDeducted(_ context.Context, _, traceID string) error {
	f.deducted = append(f.deducted, traceID)
	return nil
}

func newTestService() *Service {
	svc := NewService(agentplatform.NewStubClient(), s3store.NewStubClient())
	svc.SetCreditClient(credit.NewStubClient(map[string]int64{"user-1": 20}))
	svc.SetCallLogRepo(calllog.NewMemoryCallLogRepo())
	return svc
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

	result, err := svc.ImageRead(middleware.ContextWithUserID(context.Background(), "user-1"), model.ImageReadRequest{
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

	result, err := svc.ImageRead(middleware.ContextWithUserID(context.Background(), "user-1"), model.ImageReadRequest{
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

	result, err := svc.VideoRead(middleware.ContextWithUserID(context.Background(), "user-1"), model.VideoReadRequest{
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

func TestService_ImageRead_DeductsFixedCreditOnSuccess(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 20})
	logRepo := calllog.NewMemoryCallLogRepo()
	svc := NewService(agentplatform.NewStubClient(), s3store.NewStubClient())
	svc.SetCreditClient(creditClient)
	svc.SetCallLogRepo(logRepo)

	ctx := trace.SetTraceID(middleware.ContextWithUserID(context.Background(), "user-1"), "req-image-read-1")
	result, err := svc.ImageRead(ctx, model.ImageReadRequest{
		URL: "https://example.com/photo.jpg",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Content == "" {
		t.Fatal("expected non-empty result")
	}
	if result.CreditCost != 5 {
		t.Fatalf("expected CreditCost 5, got %d", result.CreditCost)
	}

	balance, err := creditClient.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 15 {
		t.Fatalf("expected remaining balance 15, got %d", balance.Available)
	}

	items, err := logRepo.ListByUserID(context.Background(), "user-1", 10)
	if err != nil {
		t.Fatalf("ListByUserID() error = %v", err)
	}
	if len(items) != 1 || items[0].Capability != "image.read" || items[0].CreditCost != 5 {
		t.Fatalf("unexpected call logs: %#v", items)
	}
}

func TestService_ImageRead_UsesBillingCoordinatorSourceID(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 20})
	logRepo := calllog.NewMemoryCallLogRepo()
	billingCoord := &fakeCapabilitiesBillingCoordinator{}
	svc := NewService(agentplatform.NewStubClient(), s3store.NewStubClient())
	svc.SetCreditClient(creditClient)
	svc.SetCallLogRepo(logRepo)
	svc.SetBillingCoordinator(billingCoord)

	ctx := trace.SetTraceID(middleware.ContextWithUserID(context.Background(), "user-1"), "req-image-read-billing-1")
	_, err := svc.ImageRead(ctx, model.ImageReadRequest{
		URL: "https://example.com/photo.jpg",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(billingCoord.intents) == 0 || billingCoord.intents[0].Provider != model.BillingProviderAgentPlatform {
		t.Fatalf("expected agentplatform billing intent, got %+v", billingCoord.intents)
	}
	if len(billingCoord.providerSuccess) == 0 || billingCoord.providerSuccess[0].ProviderStatus != "success" {
		t.Fatalf("expected provider success record, got %+v", billingCoord.providerSuccess)
	}
	if len(billingCoord.deducted) != 1 || billingCoord.deducted[0] != "req-image-read-billing-1" {
		t.Fatalf("expected deducted trace req-image-read-billing-1, got %+v", billingCoord.deducted)
	}

	transactions, _, err := creditClient.ListTransactions(context.Background(), "user-1", 10, 0)
	if err != nil {
		t.Fatalf("ListTransactions() error = %v", err)
	}
	if len(transactions) != 1 || transactions[0].SourceID != "anycap-image-read-req-image-read-billing-1" {
		t.Fatalf("expected persisted read billing source id, got %#v", transactions)
	}
}

func TestService_VideoRead_DoesNotDeductOnProviderFailure(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 20})
	logRepo := calllog.NewMemoryCallLogRepo()
	svc := NewService(&fakeCapabilitiesProvider{videoErr: errors.New("upstream failed")}, s3store.NewStubClient())
	svc.SetCreditClient(creditClient)
	svc.SetCallLogRepo(logRepo)

	ctx := middleware.ContextWithUserID(context.Background(), "user-1")
	_, err := svc.VideoRead(ctx, model.VideoReadRequest{
		URL: "https://example.com/video.mp4",
	})
	if err == nil {
		t.Fatal("expected provider failure")
	}

	balance, err := creditClient.GetBalance(context.Background(), "user-1")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 20 {
		t.Fatalf("expected balance unchanged, got %d", balance.Available)
	}

	items, err := logRepo.ListByUserID(context.Background(), "user-1", 10)
	if err != nil {
		t.Fatalf("ListByUserID() error = %v", err)
	}
	if len(items) != 0 {
		t.Fatalf("expected no call logs, got %#v", items)
	}
}

func TestService_AudioRead_RejectsInsufficientCreditBeforeInvoke(t *testing.T) {
	creditClient := credit.NewStubClient(map[string]int64{"user-1": 9})
	svc := NewService(&fakeCapabilitiesProvider{
		audioResult: model.UnderstandResult{
			Content: "should not be returned",
			Model:   "fake",
		},
	}, s3store.NewStubClient())
	svc.SetCreditClient(creditClient)

	ctx := middleware.ContextWithUserID(context.Background(), "user-1")
	_, err := svc.AudioRead(ctx, model.AudioReadRequest{
		URL: "https://example.com/audio.mp3",
	})
	if err != model.ErrInsufficientCredit {
		t.Fatalf("expected ErrInsufficientCredit, got %v", err)
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
