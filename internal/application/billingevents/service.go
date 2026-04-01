package billingevents

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type Config struct {
	BizID string
	Now   func() time.Time
}

type ProcessResult struct {
	EventKey  string
	Status    string
	Duplicate bool
}

type Service struct {
	repo  port.PaymentEventReceiptRepo
	bizID string
	now   func() time.Time
}

func NewService(repo port.PaymentEventReceiptRepo, cfg Config) *Service {
	now := cfg.Now
	if now == nil {
		now = func() time.Time { return time.Now().UTC() }
	}
	return &Service{
		repo:  repo,
		bizID: strings.TrimSpace(cfg.BizID),
		now:   now,
	}
}

func (s *Service) Process(ctx context.Context, event model.PaymentInboundEvent) (ProcessResult, error) {
	if !isSupportedEventType(event.Type) {
		return ProcessResult{Status: model.PaymentEventReceiptStatusIgnored}, nil
	}
	if s.bizID != "" && strings.TrimSpace(event.BizID) != s.bizID {
		return ProcessResult{Status: model.PaymentEventReceiptStatusIgnored}, nil
	}
	eventKey, err := event.EventKey()
	if err != nil {
		return ProcessResult{}, err
	}

	receipt, err := s.buildReceipt(event, eventKey)
	if err != nil {
		return ProcessResult{}, err
	}
	created, err := s.repo.CreateIfAbsent(ctx, receipt)
	if err != nil {
		return ProcessResult{}, err
	}
	if !created {
		return ProcessResult{
			EventKey:  eventKey,
			Status:    receipt.Status,
			Duplicate: true,
		}, nil
	}
	if err := s.repo.MarkProcessed(ctx, eventKey, s.now()); err != nil {
		return ProcessResult{}, err
	}
	return ProcessResult{
		EventKey: eventKey,
		Status:   model.PaymentEventReceiptStatusProcessed,
	}, nil
}

func (s *Service) buildReceipt(event model.PaymentInboundEvent, eventKey string) (model.PaymentEventReceipt, error) {
	receipt := model.PaymentEventReceipt{
		EventKey:  eventKey,
		EventType: event.Type,
		BizID:     strings.TrimSpace(event.BizID),
		UserID:    event.UserID,
		Status:    model.PaymentEventReceiptStatusPending,
		Payload:   event.Data,
		CreatedAt: s.now(),
		UpdatedAt: s.now(),
	}

	switch event.Type {
	case model.PaymentEventTypeCreditsGranted:
		var data model.CreditsGrantedEventData
		if err := unmarshalEventData(event, &data); err != nil {
			return model.PaymentEventReceipt{}, err
		}
		receipt.RewardID = data.CreditReward.ID
	case model.PaymentEventTypePaymentFailed:
		var data model.PaymentFailedEventData
		if err := unmarshalEventData(event, &data); err != nil {
			return model.PaymentEventReceipt{}, err
		}
		receipt.SessionID = strings.TrimSpace(data.SessionID)
	default:
		return model.PaymentEventReceipt{}, fmt.Errorf("unsupported payment event type: %s", event.Type)
	}
	return receipt, nil
}

func isSupportedEventType(eventType string) bool {
	switch eventType {
	case model.PaymentEventTypeCreditsGranted, model.PaymentEventTypePaymentFailed:
		return true
	default:
		return false
	}
}

func unmarshalEventData[T any](event model.PaymentInboundEvent, dest *T) error {
	if err := jsonUnmarshal(event.Data, dest); err != nil {
		return fmt.Errorf("decode %s event data: %w", event.Type, err)
	}
	return nil
}

var jsonUnmarshal = func(data []byte, v any) error {
	return json.Unmarshal(data, v)
}
