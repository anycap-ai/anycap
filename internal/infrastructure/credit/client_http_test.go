package credit

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

func TestHTTPClient_GetBalance(t *testing.T) {
	httpClient := &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			if req.URL.Path != "/api/v1/credit/balance/get" {
				t.Fatalf("unexpected request path %q", req.URL.Path)
			}
			if got := req.Header.Get("X-Biz-Token"); got != "biz-token-123" {
				t.Fatalf("expected X-Biz-Token header, got %q", got)
			}
			body, _ := io.ReadAll(req.Body)
			if !strings.Contains(string(body), `"user_id":2000000001`) {
				t.Fatalf("expected numeric user_id in request body, got %s", string(body))
			}
			return &http.Response{
				StatusCode: http.StatusOK,
				Header:     make(http.Header),
				Body:       io.NopCloser(strings.NewReader(`{"code":0,"message":"success","data":{"credit_cent_balance":350}}`)),
			}, nil
		}),
	}

	client := NewHTTPClient(config.CreditConfig{
		BaseURL:  "https://credit.example.com",
		BizToken: "biz-token-123",
		Timeout:  5 * time.Second,
	}, httpClient)

	balance, err := client.GetBalance(context.Background(), "2000000001")
	if err != nil {
		t.Fatalf("GetBalance() error = %v", err)
	}
	if balance.Available != 3 {
		t.Fatalf("expected available credits 3, got %d", balance.Available)
	}
}

func TestHTTPClient_GetBalanceInsufficient(t *testing.T) {
	httpClient := &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusOK,
				Header:     make(http.Header),
				Body:       io.NopCloser(strings.NewReader(`{"code":2001,"message":"insufficient credits","data":{}}`)),
			}, nil
		}),
	}

	client := NewHTTPClient(config.CreditConfig{
		BaseURL:  "https://credit.example.com",
		BizToken: "biz-token-123",
		Timeout:  5 * time.Second,
	}, httpClient)

	_, err := client.GetBalance(context.Background(), "2000000001")
	if err != model.ErrInsufficientCredit {
		t.Fatalf("expected ErrInsufficientCredit, got %v", err)
	}
}

func TestHTTPClient_Deduct(t *testing.T) {
	httpClient := &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			if req.URL.Path != "/api/v1/credit/consume" {
				t.Fatalf("unexpected request path %q", req.URL.Path)
			}
			if got := req.Header.Get("X-Biz-Token"); got != "biz-token-123" {
				t.Fatalf("expected X-Biz-Token header, got %q", got)
			}
			body, _ := io.ReadAll(req.Body)
			text := string(body)
			if !strings.Contains(text, `"user_id":2000000001`) {
				t.Fatalf("expected numeric user_id in request body, got %s", text)
			}
			if !strings.Contains(text, `"credit_cent_amount":200`) {
				t.Fatalf("expected credit_cent_amount 200, got %s", text)
			}
			if !strings.Contains(text, `"source_id":"anycap-image-generate-req-123"`) {
				t.Fatalf("expected source_id derived from request id, got %s", text)
			}
			return &http.Response{
				StatusCode: http.StatusOK,
				Header:     make(http.Header),
				Body:       io.NopCloser(strings.NewReader(`{"code":0,"message":"success","data":{}}`)),
			}, nil
		}),
	}

	client := NewHTTPClient(config.CreditConfig{
		BaseURL:  "https://credit.example.com",
		BizToken: "biz-token-123",
		Timeout:  5 * time.Second,
	}, httpClient)

	if err := client.Deduct(context.Background(), "2000000001", 2, "image.generate", "req-123"); err != nil {
		t.Fatalf("Deduct() error = %v", err)
	}
}

func TestHTTPClient_DeductInsufficient(t *testing.T) {
	httpClient := &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusOK,
				Header:     make(http.Header),
				Body:       io.NopCloser(strings.NewReader(`{"code":2001,"message":"insufficient credits","data":{}}`)),
			}, nil
		}),
	}

	client := NewHTTPClient(config.CreditConfig{
		BaseURL:  "https://credit.example.com",
		BizToken: "biz-token-123",
		Timeout:  5 * time.Second,
	}, httpClient)

	if err := client.Deduct(context.Background(), "2000000001", 1, "image.generate", "req-123"); err != model.ErrInsufficientCredit {
		t.Fatalf("expected ErrInsufficientCredit, got %v", err)
	}
}
