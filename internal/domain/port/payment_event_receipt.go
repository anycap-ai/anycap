package port

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type PaymentEventReceiptRepo interface {
	CreateIfAbsent(ctx context.Context, receipt model.PaymentEventReceipt) (bool, error)
	GetByEventKey(ctx context.Context, eventKey string) (*model.PaymentEventReceipt, error)
	MarkProcessed(ctx context.Context, eventKey string, processedAt time.Time) error
	MarkIgnored(ctx context.Context, eventKey, reason string, processedAt time.Time) error
	MarkFailed(ctx context.Context, eventKey, reason string, processedAt time.Time) error
}
