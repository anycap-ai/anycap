package command

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestFeedbackCommand_Success(t *testing.T) {
	var receivedBody map[string]any

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/feedback" || r.Method != http.MethodPost {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		json.NewDecoder(r.Body).Decode(&receivedBody)
		w.Header().Set("X-Request-Id", "req_feedback_123")
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"success","data":{"id":"fb_test_001"}}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.1.0-test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"feedback", "--type", "bug", "-m", "image generate fails"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("feedback: %v", err)
	}

	// Verify request body
	if receivedBody["type"] != "bug" {
		t.Errorf("expected type=bug, got %v", receivedBody["type"])
	}
	if receivedBody["message"] != "image generate fails" {
		t.Errorf("expected message, got %v", receivedBody["message"])
	}
	meta, ok := receivedBody["metadata"].(map[string]any)
	if !ok {
		t.Fatal("missing metadata in request")
	}
	if meta["cli_version"] == "" {
		t.Error("expected non-empty cli_version in metadata")
	}

	// Verify JSON output includes request_id
	var output map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &output); err != nil {
		t.Fatalf("invalid JSON output: %v", err)
	}
	if output["request_id"] != "req_feedback_123" {
		t.Errorf("expected request_id in output, got %v", output["request_id"])
	}
}

func TestFeedbackCommand_WithContext(t *testing.T) {
	var receivedBody map[string]any

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&receivedBody)
		w.Header().Set("X-Request-Id", "req_ctx_456")
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"success","data":{"id":"fb_test_002"}}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{
		"feedback", "--type", "feature", "-m", "need batch gen",
		"--context", `{"max_batch":10}`,
		"--request-id", "req_original_789",
		"--trace-id", "trc_original_789",
		"--diagnostics", `{"task_id":"task_original_789","upstream_request_id":"gateway_original_789","capability":"music.generate","model":"suno-v5","stage":"validate_result","error_code":"UPSTREAM_EMPTY_RESULT","invoked_at":"2026-07-15T01:30:59Z"}`,
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("feedback: %v", err)
	}

	// Verify context was sent as JSON object (not string)
	ctx, ok := receivedBody["context"].(map[string]any)
	if !ok {
		t.Fatalf("expected context as object, got %T: %v", receivedBody["context"], receivedBody["context"])
	}
	if ctx["max_batch"] != float64(10) {
		t.Errorf("expected max_batch=10, got %v", ctx["max_batch"])
	}

	// Verify request_id was forwarded
	if receivedBody["request_id"] != "req_original_789" {
		t.Errorf("expected request_id, got %v", receivedBody["request_id"])
	}
	if receivedBody["trace_id"] != "trc_original_789" {
		t.Errorf("expected trace_id, got %v", receivedBody["trace_id"])
	}
	diagnostics, ok := receivedBody["diagnostics"].(map[string]any)
	if !ok || diagnostics["task_id"] != "task_original_789" || diagnostics["upstream_request_id"] != "gateway_original_789" || diagnostics["capability"] != "music.generate" || diagnostics["stage"] != "validate_result" {
		t.Fatalf("expected structured diagnostics, got %#v", receivedBody["diagnostics"])
	}
}

func TestFeedbackCommand_InvalidType(t *testing.T) {
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Stdout:    &bytes.Buffer{},
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"feedback", "--type", "complaint", "-m", "test"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for invalid type")
	}
}

func TestFeedbackCommand_InvalidContextJSON(t *testing.T) {
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Stdout:    &bytes.Buffer{},
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"feedback", "--type", "bug", "-m", "test", "--context", "not json"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for invalid context JSON")
	}
}

func TestFeedbackCommandRejectsInvalidDiagnosticsStage(t *testing.T) {
	cmd := NewRootCmd(Options{BuildInfo: buildinfo.Info{Version: "dev"}, Stdout: &bytes.Buffer{}, Stderr: &bytes.Buffer{}, Stdin: strings.NewReader("")})
	cmd.SetArgs([]string{"feedback", "--type", "bug", "-m", "test", "--diagnostics", `{"stage":"provider_secret_stage"}`})
	if err := cmd.Execute(); err == nil || !strings.Contains(err.Error(), "invalid stage") {
		t.Fatalf("expected invalid diagnostics stage error, got %v", err)
	}
}

func TestFeedbackCommandRejectsNullDiagnostics(t *testing.T) {
	cmd := NewRootCmd(Options{BuildInfo: buildinfo.Info{Version: "dev"}, Stdout: &bytes.Buffer{}, Stderr: &bytes.Buffer{}, Stdin: strings.NewReader("")})
	cmd.SetArgs([]string{"feedback", "--type", "bug", "-m", "test", "--diagnostics", `null`})
	if err := cmd.Execute(); err == nil || !strings.Contains(err.Error(), "JSON object") {
		t.Fatalf("expected diagnostics object error, got %v", err)
	}
}

func TestFeedbackCommand_RequiresTypeAndMessage(t *testing.T) {
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Stdout:    &bytes.Buffer{},
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"feedback"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for missing required flags")
	}
}

func TestFeedbackCommand_DisabledViaConfig(t *testing.T) {
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)

	dir := filepath.Join(tmpHome, ".anycap")
	if err := os.MkdirAll(dir, 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "config.toml"), []byte("feedback = false\n"), 0644); err != nil {
		t.Fatal(err)
	}

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Stdout:    &bytes.Buffer{},
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"feedback", "--type", "bug", "-m", "test"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when feedback is disabled")
	}
	if !strings.Contains(err.Error(), "feedback is disabled") {
		t.Fatalf("expected 'feedback is disabled' error, got: %v", err)
	}
}

func TestStatusCommand_IncludesRequestID(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Trace-ID", "trace_status_abc")
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"success","data":{"name":"anycap-server"}}`))
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "dev"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"status"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("status: %v", err)
	}

	var output map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &output); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if output["request_id"] != "trace_status_abc" {
		t.Errorf("expected request_id=trace_status_abc, got %v", output["request_id"])
	}
}
