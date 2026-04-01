package billingevents

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeReceiptRepo struct {
	createdReceipts []model.PaymentEventReceipt
	created         bool
	markedProcessed []string
	markedIgnored   []string
	markedFailed    []string
}

func (f *fakeReceiptRepo) CreateIfAbsent(_ context.Context, receipt model.PaymentEventReceipt) (bool, error) {
	f.createdReceipts = append(f.createdReceipts, receipt)
	return f.created, nil
}

func (f *fakeReceiptRepo) GetByEventKey(_ context.Context, _ string) (*model.PaymentEventReceipt, error) {
	return nil, nil
}

func (f *fakeReceiptRepo) MarkProcessed(_ context.Context, eventKey string, _ time.Time) error {
	f.markedProcessed = append(f.markedProcessed, eventKey)
	return nil
}

func (f *fakeReceiptRepo) MarkIgnored(_ context.Context, eventKey, _ string, _ time.Time) error {
	f.markedIgnored = append(f.markedIgnored, eventKey)
	return nil
}

func (f *fakeReceiptRepo) MarkFailed(_ context.Context, eventKey, _ string, _ time.Time) error {
	f.markedFailed = append(f.markedFailed, eventKey)
	return nil
}

func TestService_Process_AcceptsCreditsGranted(t *testing.T) {
	repo := &fakeReceiptRepo{created: true}
	service := NewService(repo, Config{BizID: "anycap", Now: fixedNow})

	result, err := service.Process(context.Background(), model.PaymentInboundEvent{
		Type:   model.PaymentEventTypeCreditsGranted,
		BizID:  "anycap",
		UserID: 456,
		Data: mustMarshalRaw(t, map[string]any{
			"credit_reward": map[string]any{
				"id": 555,
			},
		}),
	})
	if err != nil {
		t.Fatalf("Process() error = %v", err)
	}
	if result.Status != model.PaymentEventReceiptStatusProcessed {
		t.Fatalf("expected processed result, got %+v", result)
	}
	if result.EventKey != "credits_granted:biz:anycap:reward:555" {
		t.Fatalf("unexpected event key: %+v", result)
	}
	if len(repo.createdReceipts) != 1 || repo.createdReceipts[0].RewardID != 555 {
		t.Fatalf("unexpected created receipts: %+v", repo.createdReceipts)
	}
	if len(repo.markedProcessed) != 1 || repo.markedProcessed[0] != result.EventKey {
		t.Fatalf("unexpected processed marks: %+v", repo.markedProcessed)
	}
}

func TestService_Process_AcceptsPaymentFailed(t *testing.T) {
	repo := &fakeReceiptRepo{created: true}
	service := NewService(repo, Config{BizID: "anycap", Now: fixedNow})

	result, err := service.Process(context.Background(), model.PaymentInboundEvent{
		Type:   model.PaymentEventTypePaymentFailed,
		BizID:  "anycap",
		UserID: 456,
		Data: mustMarshalRaw(t, map[string]any{
			"session_id": "cs_test_123",
		}),
	})
	if err != nil {
		t.Fatalf("Process() error = %v", err)
	}
	if result.EventKey != "payment_failed:biz:anycap:session:cs_test_123" {
		t.Fatalf("unexpected event key: %+v", result)
	}
	if len(repo.createdReceipts) != 1 || repo.createdReceipts[0].SessionID != "cs_test_123" {
		t.Fatalf("unexpected created receipts: %+v", repo.createdReceipts)
	}
}

func TestService_Process_IgnoresUnsupportedEventType(t *testing.T) {
	repo := &fakeReceiptRepo{created: true}
	service := NewService(repo, Config{BizID: "anycap", Now: fixedNow})

	result, err := service.Process(context.Background(), model.PaymentInboundEvent{
		Type:  "subscription_created",
		BizID: "anycap",
	})
	if err != nil {
		t.Fatalf("Process() error = %v", err)
	}
	if result.Status != model.PaymentEventReceiptStatusIgnored {
		t.Fatalf("expected ignored result, got %+v", result)
	}
	if len(repo.createdReceipts) != 0 {
		t.Fatalf("expected no receipts for unsupported event, got %+v", repo.createdReceipts)
	}
}

func TestService_Process_IgnoresMismatchedBizID(t *testing.T) {
	repo := &fakeReceiptRepo{created: true}
	service := NewService(repo, Config{BizID: "anycap", Now: fixedNow})

	result, err := service.Process(context.Background(), model.PaymentInboundEvent{
		Type:  model.PaymentEventTypeCreditsGranted,
		BizID: "other-biz",
		Data: mustMarshalRaw(t, map[string]any{
			"credit_reward": map[string]any{"id": 555},
		}),
	})
	if err != nil {
		t.Fatalf("Process() error = %v", err)
	}
	if result.Status != model.PaymentEventReceiptStatusIgnored {
		t.Fatalf("expected ignored result, got %+v", result)
	}
	if len(repo.createdReceipts) != 0 {
		t.Fatalf("expected no receipt for mismatched biz id, got %+v", repo.createdReceipts)
	}
}

func TestService_Process_DeduplicatesExistingEvent(t *testing.T) {
	repo := &fakeReceiptRepo{created: false}
	service := NewService(repo, Config{BizID: "anycap", Now: fixedNow})

	result, err := service.Process(context.Background(), model.PaymentInboundEvent{
		Type:  model.PaymentEventTypeCreditsGranted,
		BizID: "anycap",
		Data: mustMarshalRaw(t, map[string]any{
			"credit_reward": map[string]any{"id": 555},
		}),
	})
	if err != nil {
		t.Fatalf("Process() error = %v", err)
	}
	if !result.Duplicate {
		t.Fatalf("expected duplicate result, got %+v", result)
	}
	if len(repo.markedProcessed) != 0 {
		t.Fatalf("did not expect processed mark for duplicate, got %+v", repo.markedProcessed)
	}
}

func fixedNow() time.Time {
	return time.Date(2026, 4, 1, 12, 0, 0, 0, time.UTC)
}

func mustMarshalRaw(t *testing.T, value any) json.RawMessage {
	t.Helper()
	raw, err := json.Marshal(value)
	if err != nil {
		t.Fatalf("json.Marshal() error = %v", err)
	}
	return raw
}
