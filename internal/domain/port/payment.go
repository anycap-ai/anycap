package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type PaymentClient interface {
	CreateOrderCheckout(ctx context.Context, input model.OrderCheckoutInput) (model.CheckoutSession, error)
	HandleWebhook(ctx context.Context, payload []byte, signature string) (model.PaymentEvent, error)
}
