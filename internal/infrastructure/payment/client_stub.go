package payment

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type StubClient struct{}

func NewStubClient() *StubClient {
	return &StubClient{}
}

func (c *StubClient) CreateOrderCheckout(_ context.Context, _ model.OrderCheckoutInput) (model.CheckoutSession, error) {
	return model.CheckoutSession{}, model.ErrNotConfigured("payment service is not configured")
}

func (c *StubClient) HandleWebhook(_ context.Context, _ []byte, _ string) (model.PaymentEvent, error) {
	return model.PaymentEvent{}, model.ErrNotConfigured("payment webhook is not implemented")
}
