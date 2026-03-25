package command

import (
	"bytes"
	"encoding/json"
	"os"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func newTestCmd(t *testing.T) (*bytes.Buffer, *bytes.Buffer, func(args ...string) error) {
	t.Helper()
	t.Setenv("HOME", t.TempDir())

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	return stdout, stderr, func(args ...string) error {
		stdout.Reset()
		stderr.Reset()
		cmd := NewRootCmd(Options{
			BuildInfo: buildinfo.Info{Version: "dev"},
			Stdout:    stdout,
			Stderr:    stderr,
			Stdin:     strings.NewReader(""),
		})
		cmd.SetArgs(args)
		return cmd.Execute()
	}
}

func TestConfigHelp_MentionsKeysCmd(t *testing.T) {
	stdout, _, run := newTestCmd(t)

	if err := run("config", "--help"); err != nil {
		t.Fatalf("config --help: %v", err)
	}

	if !strings.Contains(stdout.String(), "keys") {
		t.Error("help should mention 'keys' subcommand")
	}
}

func TestConfigKeys_ReturnsJSON(t *testing.T) {
	stdout, _, run := newTestCmd(t)

	if err := run("config", "keys"); err != nil {
		t.Fatalf("config keys: %v", err)
	}

	var keys []map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &keys); err != nil {
		t.Fatalf("invalid JSON: %v\n%s", err, stdout.String())
	}
	if len(keys) < 2 {
		t.Fatalf("expected at least 2 keys, got %d", len(keys))
	}
	// Verify structure
	for _, k := range keys {
		for _, field := range []string{"name", "type", "default", "description"} {
			if _, ok := k[field]; !ok {
				t.Errorf("key missing field %q: %v", field, k)
			}
		}
	}
}

func TestConfigSetAndGet(t *testing.T) {
	stdout, _, run := newTestCmd(t)

	// Set endpoint
	if err := run("config", "set", "endpoint", "http://test:9999"); err != nil {
		t.Fatalf("config set: %v", err)
	}
	var setResult map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &setResult); err != nil {
		t.Fatalf("set: invalid JSON: %v", err)
	}
	if setResult["key"] != "endpoint" || setResult["value"] != "http://test:9999" {
		t.Fatalf("unexpected set output: %v", setResult)
	}

	// Get endpoint
	if err := run("config", "get", "endpoint"); err != nil {
		t.Fatalf("config get: %v", err)
	}
	var getResult map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &getResult); err != nil {
		t.Fatalf("get: invalid JSON: %v", err)
	}
	if getResult["value"] != "http://test:9999" {
		t.Fatalf("expected http://test:9999, got %v", getResult["value"])
	}
}

func TestConfigSetBool(t *testing.T) {
	stdout, _, run := newTestCmd(t)

	if err := run("config", "set", "auto_update", "false"); err != nil {
		t.Fatalf("config set: %v", err)
	}

	if err := run("config", "get", "auto_update"); err != nil {
		t.Fatalf("config get: %v", err)
	}
	var result map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["value"] != false {
		t.Fatalf("expected false, got %v", result["value"])
	}
}

func TestConfigUnset(t *testing.T) {
	stdout, _, run := newTestCmd(t)

	// Set then unset
	if err := run("config", "set", "endpoint", "http://temp:1111"); err != nil {
		t.Fatal(err)
	}
	if err := run("config", "unset", "endpoint"); err != nil {
		t.Fatal(err)
	}

	// Unset returns JSON with default
	var unsetResult map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &unsetResult); err != nil {
		t.Fatalf("unset: invalid JSON: %v", err)
	}
	if unsetResult["key"] != "endpoint" {
		t.Fatalf("expected key=endpoint, got %v", unsetResult["key"])
	}
	if _, ok := unsetResult["default"]; !ok {
		t.Fatal("expected 'default' field in unset output")
	}

	// Get should return default
	if err := run("config", "get", "endpoint"); err != nil {
		t.Fatal(err)
	}
	var getResult map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &getResult); err != nil {
		t.Fatal(err)
	}
	if getResult["value"] == "http://temp:1111" {
		t.Fatal("value should have been reset after unset")
	}
}

func TestConfigShow(t *testing.T) {
	stdout, _, run := newTestCmd(t)

	if err := run("config", "show"); err != nil {
		t.Fatalf("config show: %v", err)
	}

	var result struct {
		ConfigPath string                    `json:"config_path"`
		Values     map[string]map[string]any `json:"values"`
	}
	if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
		t.Fatalf("invalid JSON: %v\n%s", err, stdout.String())
	}

	if result.ConfigPath == "" {
		t.Error("missing config_path in show output")
	}

	for _, key := range []string{"endpoint", "auto_update"} {
		entry, ok := result.Values[key]
		if !ok {
			t.Errorf("missing %q in show output", key)
			continue
		}
		if _, ok := entry["value"]; !ok {
			t.Errorf("missing 'value' for %q", key)
		}
		if _, ok := entry["source"]; !ok {
			t.Errorf("missing 'source' for %q", key)
		}
	}

	if result.Values["endpoint"]["source"] != "default" {
		t.Errorf("expected source=default, got %v", result.Values["endpoint"]["source"])
	}
}

func TestConfigShow_AfterSet(t *testing.T) {
	stdout, _, run := newTestCmd(t)

	if err := run("config", "set", "endpoint", "http://custom:8080"); err != nil {
		t.Fatal(err)
	}

	if err := run("config", "show"); err != nil {
		t.Fatal(err)
	}

	var result struct {
		Values map[string]map[string]any `json:"values"`
	}
	if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	if result.Values["endpoint"]["source"] != "config" {
		t.Errorf("expected source=config, got %v", result.Values["endpoint"]["source"])
	}
	if result.Values["endpoint"]["value"] != "http://custom:8080" {
		t.Errorf("expected http://custom:8080, got %v", result.Values["endpoint"]["value"])
	}
}

func TestConfigSet_UnknownKey(t *testing.T) {
	_, _, run := newTestCmd(t)

	err := run("config", "set", "nonexistent", "value")
	if err == nil {
		t.Fatal("expected error for unknown key")
	}
}

func TestConfigSet_InvalidBool(t *testing.T) {
	_, _, run := newTestCmd(t)

	err := run("config", "set", "auto_update", "maybe")
	if err == nil {
		t.Fatal("expected error for invalid bool value")
	}
}

func TestConfigGet_UnknownKey(t *testing.T) {
	_, _, run := newTestCmd(t)

	err := run("config", "get", "nonexistent")
	if err == nil {
		t.Fatal("expected error for unknown key")
	}
}

func TestRootHelpIncludesConfig(t *testing.T) {
	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"--help"})

	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(stdout.String(), "config") {
		t.Error("root help missing config command")
	}
}

func TestConfigSet_PersistsToDisk(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	_, _, run := newTestCmd(t)
	os.Setenv("HOME", tmpHome)

	if err := run("config", "set", "endpoint", "http://persist:7777"); err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile(tmpHome + "/.anycap/config.toml")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(data), "http://persist:7777") {
		t.Fatalf("expected endpoint in file, got:\n%s", data)
	}
}
