package payment

import (
	"context"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req)
}

func TestHTTPClient_CreateOrderCheckout(t *testing.T) {
	var capturedBody string
	httpClient := &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			if req.Method != http.MethodPost {
				t.Fatalf("expected POST, got %s", req.Method)
			}
			if req.URL.String() != "https://payment.example.com/api/v1/order/checkout" {
				t.Fatalf("unexpected url: %s", req.URL.String())
			}
			if req.Header.Get("X-Biz-Token") != "biz-token" {
				t.Fatalf("expected biz token header, got %q", req.Header.Get("X-Biz-Token"))
			}
			body, err := io.ReadAll(req.Body)
			if err != nil {
				t.Fatalf("ReadAll() error = %v", err)
			}
			capturedBody = string(body)
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(`{"code":0,"message":"success","data":{"url":"https://checkout.stripe.test/session/cs_123","id":"cs_123"}}`)),
				Header:     make(http.Header),
			}, nil
		}),
		Timeout: 5 * time.Second,
	}

	client := NewHTTPClient(config.PaymentConfig{
		BaseURL:  "https://payment.example.com",
		BizToken: "biz-token",
		Timeout:  5 * time.Second,
	}, httpClient)

	result, err := client.CreateOrderCheckout(context.Background(), model.OrderCheckoutInput{
		UserID:         "2000000001",
		PriceID:        "price_2000",
		Quantity:       2,
		SuccessURL:     "https://anycap.ai/dashboard/billing?checkout=success",
		CancelURL:      "https://anycap.ai/dashboard/buy-credits?checkout=cancel",
		IdempotencyKey: "checkout-123",
	})
	if err != nil {
		t.Fatalf("CreateOrderCheckout() error = %v", err)
	}
	if result.URL != "https://checkout.stripe.test/session/cs_123" || result.ID != "cs_123" {
		t.Fatalf("unexpected result: %+v", result)
	}
	if !strings.Contains(capturedBody, `"user_id":2000000001`) {
		t.Fatalf("expected numeric user_id in payload, got %s", capturedBody)
	}
	if !strings.Contains(capturedBody, `"price_id":"price_2000"`) {
		t.Fatalf("expected price_id in payload, got %s", capturedBody)
	}
	if !strings.Contains(capturedBody, `"quantity":2`) {
		t.Fatalf("expected quantity in payload, got %s", capturedBody)
	}
}
