package config

import (
	"os"
	"testing"
)

func TestSaveAndLoadAgentDaemonFeishuCredentials(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	cred := AgentDaemonFeishuCredentials{
		AppID:     "cli_appid",
		AppSecret: "app_secret",
	}
	if err := SaveAgentDaemonFeishuCredentials(cred); err != nil {
		t.Fatalf("SaveAgentDaemonFeishuCredentials() error = %v", err)
	}

	got, err := LoadAgentDaemonFeishuCredentials()
	if err != nil {
		t.Fatalf("LoadAgentDaemonFeishuCredentials() error = %v", err)
	}
	if got == nil {
		t.Fatal("expected credentials, got nil")
	}
	if got.AppID != "cli_appid" {
		t.Fatalf("expected app id cli_appid, got %q", got.AppID)
	}
	if got.AppSecret != "app_secret" {
		t.Fatalf("expected app secret app_secret, got %q", got.AppSecret)
	}

	path, err := AgentDaemonFeishuCredentialsPath()
	if err != nil {
		t.Fatalf("AgentDaemonFeishuCredentialsPath() error = %v", err)
	}
	info, err := os.Stat(path)
	if err != nil {
		t.Fatalf("expected credential file to exist: %v", err)
	}
	if perm := info.Mode().Perm(); perm != 0o600 {
		t.Fatalf("expected file mode 0600, got %04o", perm)
	}
}
