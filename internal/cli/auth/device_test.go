package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

func TestDeviceInit_ReturnsStructuredResult(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/auth/device-code" {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{
			"login_session_id": "lsn-123",
			"user_code":        "ABCDEFGH",
			"verification_uri": "https://anycap.ai/auth/device",
			"interval":         5,
			"expires_in":       900,
		}})
	}))
	defer ts.Close()

	client := httpclient.New(ts.URL)

	result, err := DeviceInit(context.Background(), client)
	if err != nil {
		t.Fatalf("DeviceInit() error = %v", err)
	}
	if result.LoginSessionID != "lsn-123" {
		t.Fatalf("expected login_session_id lsn-123, got %q", result.LoginSessionID)
	}
	if result.UserCode != "ABCDEFGH" {
		t.Fatalf("expected user_code ABCDEFGH, got %q", result.UserCode)
	}
	if result.VerificationURI != "https://anycap.ai/auth/device" {
		t.Fatalf("expected verification_uri, got %q", result.VerificationURI)
	}
	if result.Interval != 5 || result.ExpiresIn != 900 {
		t.Fatalf("unexpected timing fields: %+v", result)
	}
}

func TestDevicePoll_ReturnsStructuredResult(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/auth/device-poll" {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		var req map[string]any
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			t.Fatalf("decode poll request: %v", err)
		}
		if got := req["login_session_id"].(string); got != "lsn-123" {
			t.Fatalf("expected login_session_id lsn-123, got %q", got)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{
			"status":     "complete",
			"api_key":    "ak-test",
			"api_key_id": "key-test",
			"user":       map[string]any{"id": "u_abc123", "email": "dev@anycap.ai", "name": "Dev User"},
		}})
	}))
	defer ts.Close()

	client := httpclient.New(ts.URL)

	result, err := DevicePoll(context.Background(), client, "lsn-123")
	if err != nil {
		t.Fatalf("DevicePoll() error = %v", err)
	}
	if result.Status != "complete" {
		t.Fatalf("expected status complete, got %q", result.Status)
	}
	if result.APIKey != "ak-test" {
		t.Fatalf("expected api key ak-test, got %q", result.APIKey)
	}
	if result.User == nil || result.User.Email != "dev@anycap.ai" {
		t.Fatalf("expected user email dev@anycap.ai, got %+v", result.User)
	}
	if result.User.ID != "u_abc123" {
		t.Fatalf("expected user id u_abc123, got %q", result.User.ID)
	}
}

func TestDevicePoll_UserIDPreservedThroughRemarshal(t *testing.T) {
	// Verify that DevicePollResult preserves user ID through the
	// marshal -> parseTokenResponseFull round-trip used in DeviceFlow.
	poll := DevicePollResult{
		Status:   "complete",
		APIKey:   "ak-test",
		APIKeyID: "key-test",
		User: &struct {
			ID    string `json:"id"`
			Email string `json:"email"`
			Name  string `json:"name"`
		}{
			ID:    "u_abc123",
			Email: "dev@anycap.ai",
			Name:  "Dev User",
		},
	}

	body, err := json.Marshal(map[string]any{"data": poll})
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	result, err := ParseTokenResponseFull(body)
	if err != nil {
		t.Fatalf("parseTokenResponseFull: %v", err)
	}
	if result.UserID != "u_abc123" {
		t.Fatalf("expected UserID u_abc123 after re-marshal, got %q", result.UserID)
	}
}

func TestDeviceFlow_UsesInitAndPollHelpers(t *testing.T) {
	oldLauncher := BrowserLauncher
	openedURL := ""
	BrowserLauncher = func(url string) error {
		openedURL = url
		return nil
	}
	defer func() { BrowserLauncher = oldLauncher }()

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v1/auth/device-code":
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{
				"login_session_id": "lsn-123",
				"user_code":        "ABCDEFGH",
				"verification_uri": "https://anycap.ai/auth/device",
				"interval":         0,
				"expires_in":       60,
			}})
		case "/v1/auth/device-poll":
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{
				"status":     "complete",
				"api_key":    "ak-test",
				"api_key_id": "key-test",
				"user":       map[string]any{"email": "dev@anycap.ai"},
			}})
		default:
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
	}))
	defer ts.Close()

	client := httpclient.New(ts.URL)
	stderr := &bytes.Buffer{}

	cred, email, err := DeviceFlow(context.Background(), client, stderr)
	if err != nil {
		t.Fatalf("DeviceFlow() error = %v", err)
	}
	if cred == nil || cred.Type != cliconfig.CredentialTypeAPIKey || cred.Token() != "ak-test" {
		t.Fatalf("unexpected credential: %+v", cred)
	}
	if email != "dev@anycap.ai" {
		t.Fatalf("expected email dev@anycap.ai, got %q", email)
	}
	if openedURL != "https://anycap.ai/auth/device" {
		t.Fatalf("expected browser open url, got %q", openedURL)
	}
	if !strings.Contains(stderr.String(), "ABCDEFGH") {
		t.Fatalf("expected user code in stderr, got %q", stderr.String())
	}
}
