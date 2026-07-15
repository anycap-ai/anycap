package httpclient

import (
	"context"
	"errors"
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

func TestClient_APIErrorPreservesInvocationDiagnostics(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Trace-ID", "trc_error_1")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		_, _ = w.Write([]byte(`{"status":"error","error":{"code":"UPSTREAM_EMPTY_RESULT","message":"provider completed without a usable result"},"diagnostics":{"trace_id":"trc_error_1","request_id":"trc_error_1","task_id":"task_error_1","upstream_request_id":"gateway_error_1","stage":"validate_result"}}`))
	}))
	defer server.Close()

	client := New(server.URL, WithTraceID("trc_error_1"))
	_, err := client.Get(context.Background(), "/v1/image/generate")
	var apiErr *APIError
	if !errors.As(err, &apiErr) {
		t.Fatalf("expected APIError, got %v", err)
	}
	if apiErr.TraceID != "trc_error_1" || apiErr.TaskID != "task_error_1" || apiErr.UpstreamRequestID != "gateway_error_1" || apiErr.Stage != "validate_result" {
		t.Fatalf("APIError = %+v", apiErr)
	}
}

func TestClient_UnauthorizedEnvelopePreservesInvocationDiagnostics(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		_, _ = w.Write([]byte(`{"status":"error","error":{"code":"AUTH_INVALID","message":"invalid credentials"},"diagnostics":{"trace_id":"trc_auth","request_id":"req_auth","stage":"prepare"}}`))
	}))
	defer server.Close()

	_, err := New(server.URL).Get(context.Background(), "/v1/image/generate")
	var apiErr *APIError
	if !errors.As(err, &apiErr) {
		t.Fatalf("expected APIError, got %T: %v", err, err)
	}
	if apiErr.StatusCode != http.StatusUnauthorized || apiErr.TraceID != "trc_auth" || apiErr.RequestID != "req_auth" || apiErr.Stage != "prepare" {
		t.Fatalf("APIError = %+v", apiErr)
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
