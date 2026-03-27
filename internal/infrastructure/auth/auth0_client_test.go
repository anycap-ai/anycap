package auth

import (
	"context"
	"io"
	"net/http"
	"net/url"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestAuth0Stub_BuildLoginURL(t *testing.T) {
	client := NewStubClient("https://auth.anycap.local/authorize", nil)

	loginURL, err := client.BuildLoginURL(context.Background(), "state-123", "http://127.0.0.1:14565/callback")
	if err != nil {
		t.Fatalf("BuildLoginURL() error = %v", err)
	}
	if !strings.Contains(loginURL, "state=state-123") {
		t.Fatalf("expected state in login URL, got %q", loginURL)
	}
}

func TestAuth0Stub_ExchangeCode(t *testing.T) {
	client := NewStubClient("https://auth.anycap.local/authorize", map[string]model.AuthUser{
		"code-123": {UserID: "user-123", Email: "user@example.com"},
	})

	user, err := client.ExchangeCode(context.Background(), "code-123", "http://127.0.0.1:14565/callback")
	if err != nil {
		t.Fatalf("ExchangeCode() error = %v", err)
	}
	if user.UserID != "user-123" {
		t.Fatalf("expected user-123, got %q", user.UserID)
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req)
}

func TestAuth0Client_BuildLoginURL(t *testing.T) {
	client := NewClient(ClientConfig{
		Issuer:       "https://example.auth0.com/",
		Audience:     "https://api.anycap.local",
		ClientID:     "client-123",
		ClientSecret: "secret-123",
		RedirectURL:  "https://anycap.local/auth/callback",
	}, nil)

	loginURL, err := client.BuildLoginURL(context.Background(), "state-123", "http://127.0.0.1:14565/callback")
	if err != nil {
		t.Fatalf("BuildLoginURL() error = %v", err)
	}

	parsed, err := url.Parse(loginURL)
	if err != nil {
		t.Fatalf("parse login url: %v", err)
	}
	if parsed.Path != "/authorize" {
		t.Fatalf("expected /authorize path, got %q", parsed.Path)
	}
	query := parsed.Query()
	if query.Get("client_id") != "client-123" {
		t.Fatalf("expected client_id, got %q", query.Get("client_id"))
	}
	if query.Get("redirect_uri") != "http://127.0.0.1:14565/callback" {
		t.Fatalf("expected redirect_uri, got %q", query.Get("redirect_uri"))
	}
	if query.Get("state") != "state-123" {
		t.Fatalf("expected state, got %q", query.Get("state"))
	}
	if query.Get("response_type") != "code" {
		t.Fatalf("expected response_type=code, got %q", query.Get("response_type"))
	}
	if query.Get("audience") != "https://api.anycap.local" {
		t.Fatalf("expected audience, got %q", query.Get("audience"))
	}
	if query.Get("scope") != "openid profile email" {
		t.Fatalf("expected scope, got %q", query.Get("scope"))
	}
	if query.Get("prompt") != "login" {
		t.Fatalf("expected prompt=login, got %q", query.Get("prompt"))
	}
}

func TestAuth0Client_ExchangeCode(t *testing.T) {
	httpClient := &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			switch req.URL.Path {
			case "/oauth/token":
				body, _ := io.ReadAll(req.Body)
				if !strings.Contains(string(body), `"grant_type":"authorization_code"`) {
					t.Fatalf("expected authorization_code grant, got %s", string(body))
				}
				return &http.Response{
					StatusCode: http.StatusOK,
					Header:     make(http.Header),
					Body:       io.NopCloser(strings.NewReader(`{"access_token":"access-123","token_type":"Bearer"}`)),
				}, nil
			case "/userinfo":
				if got := req.Header.Get("Authorization"); got != "Bearer access-123" {
					t.Fatalf("expected bearer access-123, got %q", got)
				}
				return &http.Response{
					StatusCode: http.StatusOK,
					Header:     make(http.Header),
					Body:       io.NopCloser(strings.NewReader(`{"sub":"auth0|user-123","email":"user@example.com","name":"Demo User"}`)),
				}, nil
			default:
				t.Fatalf("unexpected request path %q", req.URL.Path)
				return nil, nil
			}
		}),
	}

	client := NewClient(ClientConfig{
		Issuer:       "https://example.auth0.com/",
		ClientID:     "client-123",
		ClientSecret: "secret-123",
		RedirectURL:  "https://anycap.local/auth/callback",
	}, httpClient)

	user, err := client.ExchangeCode(context.Background(), "code-123", "http://127.0.0.1:14565/callback")
	if err != nil {
		t.Fatalf("ExchangeCode() error = %v", err)
	}
	if user.UserID != "auth0|user-123" {
		t.Fatalf("expected auth0|user-123, got %q", user.UserID)
	}
	if user.Email != "user@example.com" {
		t.Fatalf("expected user@example.com, got %q", user.Email)
	}
}

func TestAuth0Client_ExchangeCodeUnauthorized(t *testing.T) {
	httpClient := &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusUnauthorized,
				Header:     make(http.Header),
				Body:       io.NopCloser(strings.NewReader(`{"error":"access_denied"}`)),
			}, nil
		}),
	}

	client := NewClient(ClientConfig{
		Issuer:       "https://example.auth0.com/",
		ClientID:     "client-123",
		ClientSecret: "secret-123",
		RedirectURL:  "https://anycap.local/auth/callback",
	}, httpClient)

	_, err := client.ExchangeCode(context.Background(), "bad-code", "http://127.0.0.1:14565/callback")
	if err == nil {
		t.Fatal("expected error")
	}
	if err != model.ErrAuthInvalid {
		t.Fatalf("expected ErrAuthInvalid, got %v", err)
	}
}

func TestAuth0Client_StartDeviceFlow(t *testing.T) {
	httpClient := &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			if req.URL.Path != "/oauth/device/code" {
				t.Fatalf("unexpected request path %q", req.URL.Path)
			}
			return &http.Response{
				StatusCode: http.StatusOK,
				Header:     make(http.Header),
				Body: io.NopCloser(strings.NewReader(
					`{"device_code":"dev-code-1","user_code":"ABCD-EFGH","verification_uri":"https://example.auth0.com/activate","expires_in":900,"interval":5}`,
				)),
			}, nil
		}),
	}

	client := NewClient(ClientConfig{
		Issuer:   "https://example.auth0.com/",
		ClientID: "client-123",
		Audience: "https://api.anycap.local",
	}, httpClient)

	result, err := client.StartDeviceFlow(context.Background())
	if err != nil {
		t.Fatalf("StartDeviceFlow() error = %v", err)
	}
	if result.DeviceCode != "dev-code-1" {
		t.Fatalf("expected dev-code-1, got %q", result.DeviceCode)
	}
	if result.UserCode != "ABCD-EFGH" {
		t.Fatalf("expected ABCD-EFGH, got %q", result.UserCode)
	}
}

func TestAuth0Client_PollDeviceFlowPending(t *testing.T) {
	httpClient := &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			if req.URL.Path != "/oauth/token" {
				t.Fatalf("unexpected request path %q", req.URL.Path)
			}
			return &http.Response{
				StatusCode: http.StatusBadRequest,
				Header:     make(http.Header),
				Body:       io.NopCloser(strings.NewReader(`{"error":"authorization_pending"}`)),
			}, nil
		}),
	}

	client := NewClient(ClientConfig{
		Issuer:       "https://example.auth0.com/",
		ClientID:     "client-123",
		ClientSecret: "secret-123",
	}, httpClient)

	result, err := client.PollDeviceFlow(context.Background(), "dev-code-1")
	if err != nil {
		t.Fatalf("PollDeviceFlow() error = %v", err)
	}
	if result.Status != model.LoginSessionStatusPending {
		t.Fatalf("expected pending, got %q", result.Status)
	}
}

func TestAuth0Client_PollDeviceFlowComplete(t *testing.T) {
	httpClient := &http.Client{
		Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
			switch req.URL.Path {
			case "/oauth/token":
				return &http.Response{
					StatusCode: http.StatusOK,
					Header:     make(http.Header),
					Body:       io.NopCloser(strings.NewReader(`{"access_token":"access-123"}`)),
				}, nil
			case "/userinfo":
				return &http.Response{
					StatusCode: http.StatusOK,
					Header:     make(http.Header),
					Body:       io.NopCloser(strings.NewReader(`{"sub":"auth0|user-123","email":"user@example.com","name":"Demo User"}`)),
				}, nil
			default:
				t.Fatalf("unexpected request path %q", req.URL.Path)
				return nil, nil
			}
		}),
	}

	client := NewClient(ClientConfig{
		Issuer:       "https://example.auth0.com/",
		ClientID:     "client-123",
		ClientSecret: "secret-123",
	}, httpClient)

	result, err := client.PollDeviceFlow(context.Background(), "dev-code-1")
	if err != nil {
		t.Fatalf("PollDeviceFlow() error = %v", err)
	}
	if result.Status != model.LoginSessionStatusComplete {
		t.Fatalf("expected complete, got %q", result.Status)
	}
	if result.User.UserID != "auth0|user-123" {
		t.Fatalf("expected auth0|user-123, got %q", result.User.UserID)
	}
}
