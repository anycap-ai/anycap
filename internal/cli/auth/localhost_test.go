package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

func TestBrowserPollFlow_OpensBrowserURLAndPollsForCredential(t *testing.T) {
	oldLauncher := BrowserLauncher
	openedURL := ""
	BrowserLauncher = func(url string) error {
		openedURL = url
		return nil
	}
	defer func() { BrowserLauncher = oldLauncher }()

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v1/auth/login":
			var req map[string]any
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				t.Fatalf("decode login request: %v", err)
			}
			if got := req["method"].(string); got != "browser_poll" {
				t.Fatalf("expected method browser_poll, got %q", got)
			}
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{
				"login_session_id": "lsn-1",
				"browser_url":      "https://anycap.ai/auth/login?browser_token=bt-1&cli=1",
				"poll_token":       "pt-1",
				"interval":         0,
				"expires_in":       300,
			}})
		case "/v1/auth/poll":
			var req map[string]any
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				t.Fatalf("decode poll request: %v", err)
			}
			if got := req["poll_token"].(string); got != "pt-1" {
				t.Fatalf("expected poll_token pt-1, got %q", got)
			}
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
	cred, email, err := BrowserPollFlow(context.Background(), client, &bytes.Buffer{})
	if err != nil {
		t.Fatalf("BrowserPollFlow() error = %v", err)
	}
	if cred == nil || cred.Type != cliconfig.CredentialTypeAPIKey || cred.Token() != "ak-test" {
		t.Fatalf("unexpected credential: %+v", cred)
	}
	if email != "dev@anycap.ai" {
		t.Fatalf("expected email dev@anycap.ai, got %q", email)
	}
	if openedURL != "https://anycap.ai/auth/login?browser_token=bt-1&cli=1" {
		t.Fatalf("expected browser url to be opened, got %q", openedURL)
	}
}

func TestBrowserPollFlow_PrintsBrowserURLWhenOpenFails(t *testing.T) {
	oldLauncher := BrowserLauncher
	BrowserLauncher = func(string) error { return errors.New("open failed") }
	defer func() { BrowserLauncher = oldLauncher }()
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v1/auth/login":
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{
				"login_session_id": "lsn-1",
				"browser_url":      "https://anycap.ai/auth/login?browser_token=bt-1&cli=1",
				"poll_token":       "pt-1",
				"interval":         0,
				"expires_in":       1,
			}})
		case "/v1/auth/poll":
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{
				"status": "expired",
			}})
		default:
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
	}))
	defer ts.Close()

	stderr := &bytes.Buffer{}
	client := httpclient.New(ts.URL)

	_, _, err := BrowserPollFlow(context.Background(), client, stderr)
	if err == nil {
		t.Fatal("expected error when poll expires")
	}
	if !strings.Contains(stderr.String(), "https://anycap.ai/auth/login?browser_token=bt-1&cli=1") {
		t.Fatalf("expected browser url in stderr, got %q", stderr.String())
	}
}
