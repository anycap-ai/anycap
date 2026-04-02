package httpclient

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClient_UsesTraceHeaderAndReadsTraceIDResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.Header.Get("X-Trace-ID"); got != "trc_cli_123" {
			t.Fatalf("expected X-Trace-ID trc_cli_123, got %q", got)
		}
		w.Header().Set("X-Trace-ID", "srv_trace_456")
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"ok":true}}`))
	}))
	defer server.Close()

	client := New(server.URL, WithVersion("test"), WithTraceID("trc_cli_123"))

	resp, err := client.Get(context.Background(), "/v1/status")
	if err != nil {
		t.Fatalf("Get() error = %v", err)
	}
	if resp.RequestID != "srv_trace_456" {
		t.Fatalf("expected RequestID srv_trace_456, got %q", resp.RequestID)
	}
}

func TestClient_FallsBackToLegacyRequestIDHeader(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Request-Id", "req_legacy_123")
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"ok":true}}`))
	}))
	defer server.Close()

	client := New(server.URL, WithVersion("test"), WithTraceID("trc_cli_123"))

	resp, err := client.Get(context.Background(), "/v1/status")
	if err != nil {
		t.Fatalf("Get() error = %v", err)
	}
	if resp.RequestID != "req_legacy_123" {
		t.Fatalf("expected legacy RequestID req_legacy_123, got %q", resp.RequestID)
	}
}
