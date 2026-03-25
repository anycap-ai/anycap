package command

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/zalando/go-keyring"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/auth"
	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/testutil/mockserver"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestMain(m *testing.M) {
	keyring.MockInit()
	auth.BrowserLauncher = func(url string) error { return nil }
	os.Exit(m.Run())
}

func TestLoginDeviceCodeFlow(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"login", "--headless"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("login --headless failed: %v\nstderr: %s", err, stderr.String())
	}

	// Verify credential was saved as OAuth type
	cred := cliconfig.LoadCredential()
	if cred == nil {
		t.Fatal("expected credential, got nil")
	}
	if cred.Type != cliconfig.CredentialTypeOAuth {
		t.Fatalf("expected OAuth credential, got %s", cred.Type)
	}
	if !strings.HasPrefix(cred.Token(), "mock-at-") {
		t.Fatalf("expected mock-at-... access token, got %q", cred.Token())
	}
	if !strings.HasPrefix(cred.RefreshToken, "mock-rt-") {
		t.Fatalf("expected mock-rt-... refresh token, got %q", cred.RefreshToken)
	}
	if cred.ExpiresAt == nil {
		t.Fatal("expected ExpiresAt to be set")
	}

	// Verify output mentions success
	output := stderr.String()
	if !strings.Contains(output, "dev@anycap.ai") {
		t.Fatalf("expected email in output, got: %s", output)
	}
	if !strings.Contains(output, "Credential saved") {
		t.Fatalf("expected save confirmation, got: %s", output)
	}
}

func TestLoginWithToken(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader("sk-test-token-12345\n"),
	})
	cmd.SetArgs([]string{"login", "--with-token"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("login --with-token failed: %v\nstderr: %s", err, stderr.String())
	}

	// Verify saved as API Key type
	cred := cliconfig.LoadCredential()
	if cred == nil {
		t.Fatal("expected credential, got nil")
	}
	if cred.Type != cliconfig.CredentialTypeAPIKey {
		t.Fatalf("expected API Key credential, got %s", cred.Type)
	}
	if cred.Token() != "sk-test-token-12345" {
		t.Fatalf("expected sk-test-token-12345, got %q", cred.Token())
	}
}

func TestLogout(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-old-key")); err != nil {
		t.Fatalf("setup: save credential: %v", err)
	}
	if got := cliconfig.LoadCredential(); got == nil {
		t.Fatal("setup: expected credential")
	}

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"logout"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("logout failed: %v", err)
	}

	if got := cliconfig.LoadCredential(); got != nil {
		t.Fatalf("expected nil credential after logout, got %+v", got)
	}

	if !strings.Contains(stderr.String(), "Logged out") {
		t.Fatalf("expected logout message, got: %s", stderr.String())
	}
}

func TestLoginThenStatusWithAuth(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	// Step 1: Login
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    &bytes.Buffer{},
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"login", "--headless"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("login failed: %v\nstderr: %s", err, stderr.String())
	}

	// Step 2: Run status (should include auth header now)
	stdout := &bytes.Buffer{}
	cmd2 := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd2.SetArgs([]string{"status"})

	if err := cmd2.Execute(); err != nil {
		t.Fatalf("status failed: %v", err)
	}

	if !strings.Contains(stdout.String(), "anycap-mock-server") {
		t.Fatalf("expected mock server status, got: %s", stdout.String())
	}
}

func TestLoginAlreadyLoggedIn(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	// Pre-save a credential
	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-existing-key")); err != nil {
		t.Fatalf("setup: save credential: %v", err)
	}

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"login", "--headless"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("login should succeed (exit 0) when already logged in: %v", err)
	}

	output := stderr.String()
	if !strings.Contains(output, "Already logged in") {
		t.Fatalf("expected 'Already logged in' message, got: %s", output)
	}

	// Credential should NOT be overwritten
	cred := cliconfig.LoadCredential()
	if cred == nil || cred.Token() != "sk-existing-key" {
		t.Fatalf("expected original credential preserved, got %+v", cred)
	}
}

func TestLoginWithTokenOverridesExisting(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	if err := cliconfig.SaveCredential(cliconfig.NewAPIKeyCredential("sk-old-key")); err != nil {
		t.Fatalf("setup: save credential: %v", err)
	}

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader("sk-new-token\n"),
	})
	cmd.SetArgs([]string{"login", "--with-token"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("login --with-token failed: %v", err)
	}

	cred := cliconfig.LoadCredential()
	if cred == nil || cred.Token() != "sk-new-token" {
		t.Fatalf("expected sk-new-token, got %+v", cred)
	}
}

func Test401ReturnsAuthError(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(`{"error":"unauthorized"}`))
	}))
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"status"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for 401 response")
	}

	errMsg := err.Error()
	if !strings.Contains(errMsg, "anycap login") {
		t.Fatalf("expected error to mention 'anycap login', got: %s", errMsg)
	}
}

func TestCredentialSetKey(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"credentials", "set-key", "sk-direct-key-123"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("credential set-key failed: %v", err)
	}

	cred := cliconfig.LoadCredential()
	if cred == nil || cred.Token() != "sk-direct-key-123" {
		t.Fatalf("expected sk-direct-key-123, got %+v", cred)
	}
	if cred.Type != cliconfig.CredentialTypeAPIKey {
		t.Fatalf("expected API Key type, got %s", cred.Type)
	}

	if !strings.Contains(stderr.String(), "API Key saved") {
		t.Fatalf("expected save confirmation, got: %s", stderr.String())
	}
}

func TestCredentialSetKeyRequiresArg(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"credentials", "set-key"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when no key argument provided")
	}
}

func TestCredentialShow(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_API_ENDPOINT", "")
	t.Setenv("ANYCAP_API_KEY", "")

	_ = cliconfig.DeleteCredential()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"credentials", "show"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("credential show failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, "endpoint") {
		t.Fatalf("expected 'endpoint' in output, got: %s", output)
	}
	if !strings.Contains(output, `"authenticated": false`) {
		t.Fatalf("expected authenticated=false, got: %s", output)
	}
}

func TestCredentialShowAuthenticated(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_API_KEY", "sk-from-env")

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"credentials", "show"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("credential show failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, `"authenticated": true`) {
		t.Fatalf("expected authenticated=true, got: %s", output)
	}
	if !strings.Contains(output, "environment") {
		t.Fatalf("expected credential source 'environment', got: %s", output)
	}
	if !strings.Contains(output, "api_key") {
		t.Fatalf("expected credential type 'api_key', got: %s", output)
	}
}

func TestCredentialShowOAuthType(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("ANYCAP_API_KEY", "")

	cred := cliconfig.NewOAuthCredential("at-show", "rt-show", time.Now().Add(time.Hour))
	if err := cliconfig.SaveCredential(cred); err != nil {
		t.Fatalf("setup: save credential: %v", err)
	}

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"credentials", "show"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("credential show failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, "oauth") {
		t.Fatalf("expected credential type 'oauth', got: %s", output)
	}
}

func TestAutoRefreshOnExpiredToken(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	_ = cliconfig.DeleteCredential() // clear shared mock keyring

	// Step 1: Login to get OAuth credential
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    &bytes.Buffer{},
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"login", "--headless"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("login failed: %v\nstderr: %s", err, stderr.String())
	}

	// Step 2: Manually expire the token
	cred := cliconfig.LoadCredential()
	if cred == nil {
		t.Fatal("expected credential after login")
	}
	expired := time.Now().Add(-time.Minute)
	cred.ExpiresAt = &expired
	if err := cliconfig.SaveCredential(cred); err != nil {
		t.Fatalf("save expired credential: %v", err)
	}

	oldToken := cred.Token()

	// Step 3: Run status -- should auto-refresh and succeed
	stdout := &bytes.Buffer{}
	cmd2 := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd2.SetArgs([]string{"status"})

	if err := cmd2.Execute(); err != nil {
		t.Fatalf("status should succeed after auto-refresh: %v", err)
	}

	if !strings.Contains(stdout.String(), "anycap-mock-server") {
		t.Fatalf("expected mock server status, got: %s", stdout.String())
	}

	// Step 4: Verify credential was refreshed
	refreshed := cliconfig.LoadCredential()
	if refreshed == nil {
		t.Fatal("expected refreshed credential")
	}
	if refreshed.Token() == oldToken {
		t.Fatal("expected access token to change after refresh")
	}
	if !strings.HasPrefix(refreshed.Token(), "mock-at-") {
		t.Fatalf("expected new mock-at-... token, got %q", refreshed.Token())
	}
	if !strings.HasPrefix(refreshed.RefreshToken, "mock-rt-") {
		t.Fatalf("expected new mock-rt-... refresh token, got %q", refreshed.RefreshToken)
	}
}

func TestAutoRefreshOn401(t *testing.T) {
	_ = cliconfig.DeleteCredential() // clear shared mock keyring

	// Server that returns 401 on first /v1/status call, then 200 on retry.
	// Also has a working /v1/auth/refresh endpoint.
	callCount := 0
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/v1/auth/refresh" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"status": "success",
				"data": map[string]any{
					"access_token":  "mock-at-refreshed",
					"refresh_token": "mock-rt-refreshed",
					"expires_in":    3600,
				},
			})
			return
		}
		if r.URL.Path == "/v1/status" {
			callCount++
			if callCount == 1 {
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte(`{"error":"token expired"}`))
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"status": "success",
				"data": map[string]any{
					"name":   "anycap-test-server",
					"status": "ok",
				},
			})
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	// Save an OAuth credential with a valid (non-expired) token so pre-flight
	// refresh doesn't trigger -- we want to test the 401 retry path.
	cred := cliconfig.NewOAuthCredential("mock-at-old", "mock-rt-valid", time.Now().Add(time.Hour))
	if err := cliconfig.SaveCredential(cred); err != nil {
		t.Fatalf("save credential: %v", err)
	}

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"status"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("status should succeed after 401 retry: %v", err)
	}

	if !strings.Contains(stdout.String(), "anycap-test-server") {
		t.Fatalf("expected server status, got: %s", stdout.String())
	}

	// Verify credential was updated
	refreshed := cliconfig.LoadCredential()
	if refreshed == nil || refreshed.Token() != "mock-at-refreshed" {
		t.Fatalf("expected refreshed token, got %+v", refreshed)
	}
}
