package command

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
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

func TestStatusCommand_IncludesRequestID(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Request-Id", "req_status_abc")
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
	if output["request_id"] != "req_status_abc" {
		t.Errorf("expected request_id=req_status_abc, got %v", output["request_id"])
	}
}
