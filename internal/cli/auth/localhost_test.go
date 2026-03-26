package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

func TestLocalhostFlow_UsesFixedCallbackPort(t *testing.T) {
	oldLauncher := BrowserLauncher
	BrowserLauncher = func(string) error { return nil }
	defer func() { BrowserLauncher = oldLauncher }()

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v1/auth/login":
			var req map[string]any
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				t.Fatalf("decode login request: %v", err)
			}
			if got := int(req["redirect_port"].(float64)); got != localhostCallbackPort {
				t.Fatalf("expected fixed redirect_port %d, got %d", localhostCallbackPort, got)
			}
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{
				"login_session_id": "lsn-1",
				"authorize_url":    "http://example.invalid/auth",
				"state":            "state-1",
			}})
		case "/v1/auth/callback":
			_ = json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{
				"api_key":    "ak-test",
				"api_key_id": "key-test",
				"user":       map[string]any{"email": "dev@anycap.ai"},
			}})
		default:
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
	}))
	defer ts.Close()

	BrowserLauncher = func(string) error {
		go func() {
			deadline := time.Now().Add(2 * time.Second)
			for time.Now().Before(deadline) {
				conn, err := net.Dial("tcp", fmt.Sprintf("127.0.0.1:%d", localhostCallbackPort))
				if err == nil {
					_, _ = io.WriteString(conn, "GET /callback?code=code-1&state=state-1 HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n")
					_ = conn.Close()
					return
				}
				time.Sleep(10 * time.Millisecond)
			}
		}()
		return nil
	}

	client := httpclient.New(ts.URL)
	cred, email, err := LocalhostFlow(context.Background(), client, &bytes.Buffer{})
	if err != nil {
		t.Fatalf("LocalhostFlow() error = %v", err)
	}
	if cred == nil || cred.Type != cliconfig.CredentialTypeAPIKey || cred.Token() != "ak-test" {
		t.Fatalf("unexpected credential: %+v", cred)
	}
	if email != "dev@anycap.ai" {
		t.Fatalf("expected email dev@anycap.ai, got %q", email)
	}
}

func TestLocalhostFlow_FailsWhenFixedPortIsUnavailable(t *testing.T) {
	oldLauncher := BrowserLauncher
	BrowserLauncher = func(string) error { return nil }
	defer func() { BrowserLauncher = oldLauncher }()

	occupied, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", localhostCallbackPort))
	if err != nil {
		t.Fatalf("occupy fixed port: %v", err)
	}
	defer occupied.Close()

	client := httpclient.New("http://127.0.0.1:1")

	_, _, err = LocalhostFlow(context.Background(), client, &bytes.Buffer{})
	if err == nil {
		t.Fatal("expected error when fixed port is unavailable")
	}
	if !strings.Contains(err.Error(), "14565") {
		t.Fatalf("expected fixed port in error, got %v", err)
	}
	if !strings.Contains(strings.ToLower(err.Error()), "headless") {
		t.Fatalf("expected headless hint in error, got %v", err)
	}
}
