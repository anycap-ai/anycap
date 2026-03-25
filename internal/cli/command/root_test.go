package command

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"
)

func TestRootHelpIncludesCoreCommands(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"--help"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute help: %v", err)
	}

	output := stdout.String()
	for _, expected := range []string{"login", "logout", "status", "image"} {
		if !strings.Contains(output, expected) {
			t.Fatalf("expected %q in help output: %s", expected, output)
		}
	}
}

func TestStatusCommandCallsServer(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/status" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"name":"anycap-server"}}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"status"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute status: %v", err)
	}

	if !strings.Contains(stdout.String(), `"anycap-server"`) {
		t.Fatalf("expected status payload, got %s", stdout.String())
	}
}

func TestImageModelsCommandCallsServer(t *testing.T) {
	feature.Set(feature.ImageModels, true)
	t.Cleanup(feature.Reset)

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/image/models" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":[{"id":"test-image-model","capability":"image"}]}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "models"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute image models: %v", err)
	}

	if !strings.Contains(stdout.String(), `"test-image-model"`) {
		t.Fatalf("expected model payload, got %s", stdout.String())
	}
}

func TestDisabledFeaturesHiddenFromHelp(t *testing.T) {
	feature.Reset()
	t.Cleanup(feature.Reset)

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "--help"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute: %v", err)
	}

	output := stdout.String()
	// image understand should be visible (default on)
	if !strings.Contains(output, "understand") {
		t.Fatalf("expected 'understand' in image help, got: %s", output)
	}
	// image generate and models should be hidden (default off)
	if strings.Contains(output, "generate") {
		t.Fatalf("'generate' should be hidden when feature is disabled, got: %s", output)
	}
	if strings.Contains(output, "models") {
		t.Fatalf("'models' should be hidden when feature is disabled, got: %s", output)
	}
}

func TestEnabledFeaturesVisibleInHelp(t *testing.T) {
	feature.Set(feature.ImageGenerate, true)
	feature.Set(feature.ImageModels, true)
	t.Cleanup(feature.Reset)

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "--help"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute: %v", err)
	}

	output := stdout.String()
	for _, expected := range []string{"understand", "generate", "models"} {
		if !strings.Contains(output, expected) {
			t.Fatalf("expected %q in image help when feature enabled, got: %s", expected, output)
		}
	}
}
