package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type PaymentClient interface {
	CreateTopUpSession(ctx context.Context, userID, planID, idempotencyKey string) (model.CheckoutSession, error)
	CreateSubscriptionSession(ctx context.Context, userID, planID, idempotencyKey string) (model.CheckoutSession, error)
	HandleWebhook(ctx context.Context, payload []byte, signature string) (model.PaymentEvent, error)
}
