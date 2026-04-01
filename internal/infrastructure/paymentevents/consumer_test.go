package paymentevents

import (
	"context"
	"testing"

	rmq "github.com/apache/rocketmq-clients/golang/v5"
	"gitlab.knoffice.tech/engineering/anycap/internal/application/billingevents"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeEventProcessor struct {
	lastEvent model.PaymentInboundEvent
	result    billingevents.ProcessResult
	err       error
}

func (f *fakeEventProcessor) Process(ctx context.Context, event model.PaymentInboundEvent) (billingevents.ProcessResult, error) {
	f.lastEvent = event
	return f.result, f.err
}

func TestDecodeEventEnvelope_ValidJSON(t *testing.T) {
	event, err := DecodeEventEnvelope([]byte(`{
		"type":"credits_granted",
		"user_id":456,
		"biz_id":"anycap",
		"timestamp":"2026-04-01T10:00:00Z",
		"data":{"credit_reward":{"id":555}}
	}`))
	if err != nil {
		t.Fatalf("DecodeEventEnvelope() error = %v", err)
	}
	if event.Type != model.PaymentEventTypeCreditsGranted || event.BizID != "anycap" || event.UserID != 456 {
		t.Fatalf("unexpected decoded event: %+v", event)
	}
}

func TestDecodeEventEnvelope_InvalidJSON(t *testing.T) {
	_, err := DecodeEventEnvelope([]byte(`{"type":"credits_granted"`))
	if err == nil {
		t.Fatal("expected DecodeEventEnvelope() to reject invalid JSON")
	}
}

func TestMessageHandler_HandleMessage_ProcessesEvent(t *testing.T) {
	processor := &fakeEventProcessor{
		result: billingevents.ProcessResult{
			EventKey: "credits_granted:biz:anycap:reward:555",
			Status:   model.PaymentEventReceiptStatusProcessed,
		},
	}
	handler := NewMessageHandler(processor)

	result, err := handler.HandleMessage(context.Background(), []byte(`{
		"type":"credits_granted",
		"user_id":456,
		"biz_id":"anycap",
		"timestamp":"2026-04-01T10:00:00Z",
		"data":{"credit_reward":{"id":555}}
	}`))
	if err != nil {
		t.Fatalf("HandleMessage() error = %v", err)
	}
	if result.EventKey != "credits_granted:biz:anycap:reward:555" {
		t.Fatalf("unexpected process result: %+v", result)
	}
	if processor.lastEvent.Type != model.PaymentEventTypeCreditsGranted {
		t.Fatalf("unexpected processor event: %+v", processor.lastEvent)
	}
}

func TestBuildSubscriptionExpression_DefaultsToAll(t *testing.T) {
	expr := buildSubscriptionExpression(nil)
	if expr != rmq.SUB_ALL {
		t.Fatalf("expected wildcard subscription expression, got %+v", expr)
	}
}

func TestWorkerConfig_Validate(t *testing.T) {
	cfg := WorkerConfig{
		Endpoint:      "mq.ap-southeast-1.aliyuncs.com:8080",
		Topic:         "payment-events",
		AccessKey:     "ak",
		SecretKey:     "sk",
		ConsumerGroup: "GID-anycap",
	}
	if err := cfg.Validate(); err != nil {
		t.Fatalf("Validate() error = %v", err)
	}
}
