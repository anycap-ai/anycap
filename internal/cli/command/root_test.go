package command

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestRootHelpIncludesCoreCommands(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Stdout:    stdout,
		Stderr:    stderr,
	})
	cmd.SetArgs([]string{"--help"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute help: %v", err)
	}

	output := stdout.String()
	for _, expected := range []string{"login", "status", "image"} {
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
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/image/models" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":[{"id":"flux-dev","capability":"image"}]}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    stderr,
	})
	cmd.SetArgs([]string{"image", "models"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute image models: %v", err)
	}

	if !strings.Contains(stdout.String(), `"flux-dev"`) {
		t.Fatalf("expected model payload, got %s", stdout.String())
	}
}
