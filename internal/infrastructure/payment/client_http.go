package payment

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/userid"
)

type HTTPClient struct {
	baseURL    string
	bizToken   string
	httpClient *http.Client
}

func NewHTTPClient(cfg config.PaymentConfig, httpClient *http.Client) *HTTPClient {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: cfg.Timeout}
	}
	return &HTTPClient{
		baseURL:    strings.TrimRight(cfg.BaseURL, "/"),
		bizToken:   cfg.BizToken,
		httpClient: httpClient,
	}
}

func (c *HTTPClient) CreateOrderCheckout(ctx context.Context, input model.OrderCheckoutInput) (model.CheckoutSession, error) {
	numericUserID, err := userid.Parse(input.UserID)
	if err != nil {
		return model.CheckoutSession{}, model.ErrInternal
	}
	quantity := input.Quantity
	if quantity <= 0 {
		quantity = 1
	}

	var resp envelope[map[string]any]
	if err := c.post(ctx, "/api/v1/order/checkout", map[string]any{
		"user_id":     numericUserID,
		"price_id":    input.PriceID,
		"quantity":    quantity,
		"success_url": input.SuccessURL,
		"cancel_url":  input.CancelURL,
	}, &resp); err != nil {
		return model.CheckoutSession{}, err
	}
	if resp.Code != 0 {
		return model.CheckoutSession{}, model.ErrBillingUncertain
	}

	session := model.CheckoutSession{}
	if rawID, ok := resp.Data["id"].(string); ok {
		session.ID = rawID
	}
	for _, key := range []string{"url", "checkout_url"} {
		if rawURL, ok := resp.Data[key].(string); ok && rawURL != "" {
			session.URL = rawURL
			break
		}
	}
	if session.URL == "" {
		return model.CheckoutSession{}, model.ErrBillingUncertain
	}
	return session, nil
}

func (c *HTTPClient) HandleWebhook(_ context.Context, _ []byte, _ string) (model.PaymentEvent, error) {
	return model.PaymentEvent{}, model.ErrNotConfigured("payment webhook is not implemented")
}

type envelope[T any] struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}

func (c *HTTPClient) post(ctx context.Context, path string, payload any, dest any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return model.ErrInternal
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(body))
	if err != nil {
		return model.ErrInternal
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Biz-Token", c.bizToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return model.ErrBillingUncertain
	}
	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(dest); err != nil {
		return model.ErrBillingUncertain
	}
	return nil
}
