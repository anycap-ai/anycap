package model

import (
	"encoding/json"
	"testing"
)

func TestBuildPaymentEventKey_CreditsGranted(t *testing.T) {
	event := PaymentInboundEvent{
		Type:  PaymentEventTypeCreditsGranted,
		BizID: "anycap",
		Data: mustMarshalJSON(t, map[string]any{
			"credit_reward": map[string]any{
				"id": 555,
			},
		}),
	}

	key, err := event.EventKey()
	if err != nil {
		t.Fatalf("EventKey() error = %v", err)
	}
	if key != "credits_granted:biz:anycap:reward:555" {
		t.Fatalf("expected credits_granted key, got %q", key)
	}
}

func TestBuildPaymentEventKey_PaymentFailed(t *testing.T) {
	event := PaymentInboundEvent{
		Type:  PaymentEventTypePaymentFailed,
		BizID: "anycap",
		Data: mustMarshalJSON(t, map[string]any{
			"session_id": "cs_test_123",
		}),
	}

	key, err := event.EventKey()
	if err != nil {
		t.Fatalf("EventKey() error = %v", err)
	}
	if key != "payment_failed:biz:anycap:session:cs_test_123" {
		t.Fatalf("expected payment_failed key, got %q", key)
	}
}

func TestBuildPaymentEventKey_RejectsUnsupportedEventType(t *testing.T) {
	event := PaymentInboundEvent{
		Type:  "subscription_created",
		BizID: "anycap",
		Data:  mustMarshalJSON(t, map[string]any{"invoice": map[string]any{"id": 101}}),
	}

	_, err := event.EventKey()
	if err == nil {
		t.Fatal("expected EventKey() to reject unsupported event type")
	}
}

func mustMarshalJSON(t *testing.T, value any) json.RawMessage {
	t.Helper()
	raw, err := json.Marshal(value)
	if err != nil {
		t.Fatalf("json.Marshal() error = %v", err)
	}
	return raw
}
