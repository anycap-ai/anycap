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

	// Verify credential was saved as API Key type
	cred := cliconfig.LoadCredential()
	if cred == nil {
		t.Fatal("expected credential, got nil")
	}
	if cred.Type != cliconfig.CredentialTypeAPIKey {
		t.Fatalf("expected API key credential, got %s", cred.Type)
	}
	if !strings.HasPrefix(cred.Token(), "mock-ak-") {
		t.Fatalf("expected mock-ak-... api key, got %q", cred.Token())
	}
	if cred.RefreshToken != "" {
		t.Fatalf("expected empty refresh token for api key, got %q", cred.RefreshToken)
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

func TestLoginDeviceCodeNoWaitJSON(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	_ = cliconfig.DeleteCredential()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"login", "--headless", "--no-wait", "--json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("login --headless --no-wait --json failed: %v\nstderr: %s", err, stderr.String())
	}

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("unmarshal stdout json: %v\nstdout: %s", err, stdout.String())
	}
	if got := payload["login_session_id"]; got == "" {
		t.Fatalf("expected login_session_id, got %#v", payload)
	}
	if got := payload["verification_uri"]; got == "" {
		t.Fatalf("expected verification_uri, got %#v", payload)
	}
	if got := payload["user_code"]; got == "" {
		t.Fatalf("expected user_code, got %#v", payload)
	}
	if got := payload["poll_command"]; got == "" {
		t.Fatalf("expected poll_command, got %#v", payload)
	}
	if got := payload["poll_command"]; got != "anycap login poll --session "+payload["login_session_id"].(string)+" --json --wait" {
		t.Fatalf("expected blocking poll_command, got %#v", got)
	}
	if got := payload["next_action_hint"]; got == "" {
		t.Fatalf("expected next_action_hint, got %#v", payload)
	}
	if cred := cliconfig.LoadCredential(); cred != nil {
		t.Fatalf("expected no credential to be saved, got %+v", cred)
	}
	if stderr.Len() != 0 {
		t.Fatalf("expected empty stderr, got %q", stderr.String())
	}
}

func TestLoginNoWaitRequiresHeadless(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	_ = cliconfig.DeleteCredential()

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    &bytes.Buffer{},
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"login", "--no-wait", "--json"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for --no-wait without --headless")
	}
	if !strings.Contains(err.Error(), "--no-wait requires --headless") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestLoginPollPendingJSON(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/auth/device-poll" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		var req map[string]any
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			t.Fatalf("decode request: %v", err)
		}
		if got := req["login_session_id"].(string); got != "lsn-pending" {
			t.Fatalf("expected session lsn-pending, got %q", got)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"status":"pending"}}`))
	}))
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	_ = cliconfig.DeleteCredential()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"login", "poll", "--session", "lsn-pending", "--json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("login poll pending failed: %v\nstderr: %s", err, stderr.String())
	}

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("unmarshal stdout json: %v\nstdout: %s", err, stdout.String())
	}
	if got := payload["status"]; got != "pending" {
		t.Fatalf("expected pending status, got %#v", payload)
	}
	if cred := cliconfig.LoadCredential(); cred != nil {
		t.Fatalf("expected no credential to be saved, got %+v", cred)
	}
}

func TestLoginPollCompleteJSONSavesCredential(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/auth/device-poll" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"status":"complete","api_key":"ak-test","api_key_id":"key-test","user":{"email":"dev@anycap.ai"}}}`))
	}))
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	_ = cliconfig.DeleteCredential()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"login", "poll", "--session", "lsn-complete", "--json"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("login poll complete failed: %v\nstderr: %s", err, stderr.String())
	}

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("unmarshal stdout json: %v\nstdout: %s", err, stdout.String())
	}
	if got := payload["status"]; got != "complete" {
		t.Fatalf("expected complete status, got %#v", payload)
	}
	cred := cliconfig.LoadCredential()
	if cred == nil || cred.Token() != "ak-test" {
		t.Fatalf("expected saved api key ak-test, got %+v", cred)
	}
}

func TestLoginPollWaitBlocksUntilComplete(t *testing.T) {
	ms := mockserver.New()
	ms.RequireDeviceAuthorization()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	_ = cliconfig.DeleteCredential()

	initStdout := &bytes.Buffer{}
	initCmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    initStdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	initCmd.SetArgs([]string{"login", "--headless", "--no-wait", "--json"})
	if err := initCmd.Execute(); err != nil {
		t.Fatalf("headless no-wait init failed: %v", err)
	}

	var initPayload map[string]any
	if err := json.Unmarshal(initStdout.Bytes(), &initPayload); err != nil {
		t.Fatalf("unmarshal init payload: %v", err)
	}
	loginSessionID, _ := initPayload["login_session_id"].(string)
	if loginSessionID == "" {
		t.Fatalf("expected login_session_id in init payload, got %#v", initPayload)
	}

	go func() {
		time.Sleep(150 * time.Millisecond)
		ms.AuthorizeDeviceSession(loginSessionID)
	}()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"login", "poll", "--session", loginSessionID, "--json", "--wait"})

	start := time.Now()
	if err := cmd.Execute(); err != nil {
		t.Fatalf("login poll --wait failed: %v\nstderr: %s", err, stderr.String())
	}
	if elapsed := time.Since(start); elapsed < 150*time.Millisecond {
		t.Fatalf("expected poll --wait to block, only waited %s", elapsed)
	}

	var payload map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &payload); err != nil {
		t.Fatalf("unmarshal stdout json: %v\nstdout: %s", err, stdout.String())
	}
	if got := payload["status"]; got != "complete" {
		t.Fatalf("expected complete status, got %#v", payload)
	}
	cred := cliconfig.LoadCredential()
	if cred == nil || !strings.HasPrefix(cred.Token(), "mock-ak-") {
		t.Fatalf("expected saved mock api key, got %+v", cred)
	}
}

func TestLoginPollRequiresSession(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	_ = cliconfig.DeleteCredential()

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    &bytes.Buffer{},
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"login", "poll", "--json"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when session is missing")
	}
}

func TestLoginDeviceCodeNoWaitThenPollAfterAuthorization(t *testing.T) {
	ms := mockserver.New()
	ms.RequireDeviceAuthorization()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	_ = cliconfig.DeleteCredential()

	initStdout := &bytes.Buffer{}
	initStderr := &bytes.Buffer{}
	initCmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    initStdout,
		Stderr:    initStderr,
		Stdin:     strings.NewReader(""),
	})
	initCmd.SetArgs([]string{"login", "--headless", "--no-wait", "--json"})
	if err := initCmd.Execute(); err != nil {
		t.Fatalf("headless no-wait init failed: %v\nstderr: %s", err, initStderr.String())
	}

	var initPayload map[string]any
	if err := json.Unmarshal(initStdout.Bytes(), &initPayload); err != nil {
		t.Fatalf("unmarshal init payload: %v", err)
	}
	loginSessionID, _ := initPayload["login_session_id"].(string)
	if loginSessionID == "" {
		t.Fatalf("expected login_session_id in init payload, got %#v", initPayload)
	}

	pendingStdout := &bytes.Buffer{}
	pendingCmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    pendingStdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	pendingCmd.SetArgs([]string{"login", "poll", "--session", loginSessionID, "--json"})
	if err := pendingCmd.Execute(); err != nil {
		t.Fatalf("poll pending failed: %v", err)
	}

	var pendingPayload map[string]any
	if err := json.Unmarshal(pendingStdout.Bytes(), &pendingPayload); err != nil {
		t.Fatalf("unmarshal pending payload: %v", err)
	}
	if got := pendingPayload["status"]; got != "pending" {
		t.Fatalf("expected pending status, got %#v", pendingPayload)
	}
	if cred := cliconfig.LoadCredential(); cred != nil {
		t.Fatalf("expected no credential after pending poll, got %+v", cred)
	}

	ms.AuthorizeDeviceSession(loginSessionID)

	completeStdout := &bytes.Buffer{}
	completeCmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    completeStdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	completeCmd.SetArgs([]string{"login", "poll", "--session", loginSessionID, "--json"})
	if err := completeCmd.Execute(); err != nil {
		t.Fatalf("poll complete failed: %v", err)
	}

	var completePayload map[string]any
	if err := json.Unmarshal(completeStdout.Bytes(), &completePayload); err != nil {
		t.Fatalf("unmarshal complete payload: %v", err)
	}
	if got := completePayload["status"]; got != "complete" {
		t.Fatalf("expected complete status, got %#v", completePayload)
	}
	cred := cliconfig.LoadCredential()
	if cred == nil || !strings.HasPrefix(cred.Token(), "mock-ak-") {
		t.Fatalf("expected saved mock api key, got %+v", cred)
	}
}

func TestLoginBrowserPollFlow(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("DISPLAY", ":1")
	t.Setenv("CI", "")
	t.Setenv("SSH_CONNECTION", "")
	t.Setenv("SSH_TTY", "")
	if err := cliconfig.DeleteCredential(); err != nil {
		t.Fatalf("clear credential: %v", err)
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
	cmd.SetArgs([]string{"login"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("login failed: %v\nstderr: %s", err, stderr.String())
	}

	cred := cliconfig.LoadCredential()
	if cred == nil {
		t.Fatal("expected credential, got nil")
	}
	if cred.Type != cliconfig.CredentialTypeAPIKey {
		t.Fatalf("expected API key credential, got %s", cred.Type)
	}
	if !strings.HasPrefix(cred.Token(), "mock-ak-") {
		t.Fatalf("expected mock-ak-... api key, got %q", cred.Token())
	}
	if !strings.Contains(stderr.String(), "Credential saved") {
		t.Fatalf("expected save confirmation, got: %s", stderr.String())
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
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

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
		Endpoint:  ts.URL,
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
	if ms.LogoutCalls() != 1 {
		t.Fatalf("expected one server logout call, got %d", ms.LogoutCalls())
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

	refreshToken := ms.SeedRefreshToken("dev@anycap.ai")
	cred := cliconfig.NewOAuthCredential("mock-at-old", refreshToken, time.Now().Add(time.Hour))
	expired := time.Now().Add(-time.Minute)
	cred.ExpiresAt = &expired
	if err := cliconfig.SaveCredential(cred); err != nil {
		t.Fatalf("save expired credential: %v", err)
	}

	oldToken := cred.Token()

	// Run status -- should auto-refresh and succeed
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

	// Verify credential was refreshed
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
