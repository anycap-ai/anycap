package command

import (
	"bytes"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/zalando/go-keyring"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/auth"
	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/testutil/mockserver"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestMain(m *testing.M) {
	// Use in-memory keyring backend for all tests
	keyring.MockInit()
	// Suppress browser opening in all tests
	auth.BrowserLauncher = func(url string) error { return nil }
	os.Exit(m.Run())
}

func TestLoginDeviceCodeFlow(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	// Use temp HOME so credentials don't pollute real home
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

	// Verify credential was saved (reads from keyring mock)
	cred := cliconfig.LoadCredential()
	if !strings.HasPrefix(cred, "sk-mock-") {
		t.Fatalf("expected sk-mock-... credential, got %q", cred)
	}

	// Verify output mentions success
	output := stderr.String()
	if !strings.Contains(output, "dev@anycap.ai") {
		t.Fatalf("expected email in output, got: %s", output)
	}
	if !strings.Contains(output, "API Key saved") {
		t.Fatalf("expected save confirmation, got: %s", output)
	}

	t.Logf("Login succeeded. API key: %s", cred)
	t.Logf("stderr output:\n%s", output)
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

	// Verify credential was saved (reads from keyring mock)
	cred := cliconfig.LoadCredential()
	if cred != "sk-test-token-12345" {
		t.Fatalf("expected sk-test-token-12345, got %q", cred)
	}
}

func TestLogout(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	// Save a credential via the public API (goes to mock keyring)
	if err := cliconfig.SaveCredential("sk-old-key"); err != nil {
		t.Fatalf("setup: save credential: %v", err)
	}
	if got := cliconfig.LoadCredential(); got != "sk-old-key" {
		t.Fatalf("setup: expected sk-old-key, got %q", got)
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

	// Verify credential is gone from all backends
	if got := cliconfig.LoadCredential(); got != "" {
		t.Fatalf("expected empty credential after logout, got %q", got)
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
