package model

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

const (
	PaymentEventTypeCreditsGranted = "credits_granted"
	PaymentEventTypePaymentFailed  = "payment_failed"
)

const (
	PaymentEventReceiptStatusPending   = "pending"
	PaymentEventReceiptStatusProcessed = "processed"
	PaymentEventReceiptStatusIgnored   = "ignored"
	PaymentEventReceiptStatusFailed    = "failed"
)

type PaymentInboundEvent struct {
	Type      string          `json:"type"`
	UserID    int64           `json:"user_id"`
	BizID     string          `json:"biz_id"`
	Timestamp time.Time       `json:"timestamp"`
	Data      json.RawMessage `json:"data"`
}

type PaymentFailedEventData struct {
	SessionID string `json:"session_id"`
}

type CreditsGrantedEventData struct {
	CreditReward struct {
		ID int64 `json:"id"`
	} `json:"credit_reward"`
}

type PaymentEventReceipt struct {
	EventKey    string          `json:"event_key"`
	EventType   string          `json:"event_type"`
	BizID       string          `json:"biz_id"`
	UserID      int64           `json:"user_id"`
	Status      string          `json:"status"`
	Payload     json.RawMessage `json:"payload"`
	RewardID    int64           `json:"reward_id,omitempty"`
	SessionID   string          `json:"session_id,omitempty"`
	LastError   string          `json:"last_error,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	ProcessedAt *time.Time      `json:"processed_at,omitempty"`
}

func (e PaymentInboundEvent) EventKey() (string, error) {
	bizID := strings.TrimSpace(e.BizID)
	if bizID == "" {
		return "", fmt.Errorf("payment event biz_id is required")
	}

	switch e.Type {
	case PaymentEventTypeCreditsGranted:
		var data CreditsGrantedEventData
		if err := json.Unmarshal(e.Data, &data); err != nil {
			return "", fmt.Errorf("decode credits_granted event data: %w", err)
		}
		if data.CreditReward.ID <= 0 {
			return "", fmt.Errorf("credits_granted event reward id is required")
		}
		return fmt.Sprintf("%s:biz:%s:reward:%d", PaymentEventTypeCreditsGranted, bizID, data.CreditReward.ID), nil
	case PaymentEventTypePaymentFailed:
		var data PaymentFailedEventData
		if err := json.Unmarshal(e.Data, &data); err != nil {
			return "", fmt.Errorf("decode payment_failed event data: %w", err)
		}
		if strings.TrimSpace(data.SessionID) == "" {
			return "", fmt.Errorf("payment_failed event session_id is required")
		}
		return fmt.Sprintf("%s:biz:%s:session:%s", PaymentEventTypePaymentFailed, bizID, strings.TrimSpace(data.SessionID)), nil
	default:
		return "", fmt.Errorf("unsupported payment event type: %s", e.Type)
	}
}
