package telemetry

import (
	"strings"
	"testing"
)

func TestRedactArgs_PasswordFlagValue(t *testing.T) {
	args := []string{"page", "set", "pg_abc", "--password", "s3cret", "--name", "mysite"}
	got := redactArgs(args)
	want := []string{"page", "set", "pg_abc", "--password", "[REDACTED]", "--name", "mysite"}

	if len(got) != len(want) {
		t.Fatalf("len mismatch: got %d, want %d", len(got), len(want))
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("arg[%d] = %q, want %q", i, got[i], want[i])
		}
	}
}

func TestRedactArgs_PasswordEqualsForm(t *testing.T) {
	args := []string{"drive", "share", "--password=hunter2"}
	got := redactArgs(args)

	if !strings.HasPrefix(got[2], "--password=") || !strings.HasSuffix(got[2], "[REDACTED]") {
		t.Errorf("expected --password=[REDACTED], got %q", got[2])
	}
}

func TestRedactArgs_MultipleSecrets(t *testing.T) {
	args := []string{"--key", "ak-123", "--token", "tok-456", "image", "generate"}
	got := redactArgs(args)

	if got[1] != "[REDACTED]" {
		t.Errorf("--key value should be redacted, got %q", got[1])
	}
	if got[3] != "[REDACTED]" {
		t.Errorf("--token value should be redacted, got %q", got[3])
	}
	if got[4] != "image" || got[5] != "generate" {
		t.Errorf("non-sensitive args should be preserved, got %v", got[4:])
	}
}

func TestRedactArgs_NothingToRedact(t *testing.T) {
	args := []string{"image", "generate", "--model", "seedream-5", "--prompt", "a cat"}
	got := redactArgs(args)

	for i := range args {
		if got[i] != args[i] {
			t.Errorf("arg[%d] = %q, want %q (no redaction expected)", i, got[i], args[i])
		}
	}
}

func TestRedactArgs_Empty(t *testing.T) {
	got := redactArgs(nil)
	if len(got) != 0 {
		t.Errorf("expected empty slice, got %v", got)
	}
}

func TestRedactArgs_CaseInsensitive(t *testing.T) {
	args := []string{"--Password", "secret123"}
	got := redactArgs(args)
	if got[1] != "[REDACTED]" {
		t.Errorf("case-insensitive match failed, got %q", got[1])
	}
}

func TestRedactArgs_SensitiveFlagAtEnd(t *testing.T) {
	// Flag at the end with no following value — should not panic.
	args := []string{"page", "set", "--password"}
	got := redactArgs(args)

	if len(got) != 3 {
		t.Fatalf("expected 3 args, got %d", len(got))
	}
	if got[2] != "--password" {
		t.Errorf("trailing flag should be preserved as-is, got %q", got[2])
	}
}
