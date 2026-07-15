package agentplatform

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/trace"
)

func TestImageReadCapturesDistinctUpstreamRequestID(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.Header.Get("X-Trace-ID"); got != "trc_read_1" {
			t.Fatalf("X-Trace-ID = %q, want trc_read_1", got)
		}
		w.Header().Set("X-Request-ID", "gateway_req_1")
		_ = json.NewEncoder(w).Encode(map[string]any{"content": "recognized", "model": "gemini"})
	}))
	defer srv.Close()

	client := NewClient(config.AgentPlatformConfig{BaseURL: srv.URL})
	ctx := trace.SetTraceID(t.Context(), "trc_read_1")
	result, err := client.ImageRead(ctx, model.ImageReadRequest{URL: "https://example.com/image.png"})
	if err != nil {
		t.Fatalf("ImageRead() error = %v", err)
	}
	if result.Meta.UpstreamRequestID != "gateway_req_1" || result.Meta.Stage != model.InvocationStageDecodeResult {
		t.Fatalf("metadata = %+v", result.Meta)
	}
	if result.Value.Content != "recognized" {
		t.Fatalf("result = %+v", result.Value)
	}
}

func TestImageReadCapturesDistinctRequestIDWhenTraceHeaderEchoesLocalTrace(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Trace-ID", "trc_local")
		w.Header().Set("X-Request-ID", "gateway_distinct")
		_ = json.NewEncoder(w).Encode(map[string]any{"content": "recognized", "model": "gemini"})
	}))
	defer srv.Close()

	result, err := NewClient(config.AgentPlatformConfig{BaseURL: srv.URL}).ImageRead(trace.SetTraceID(t.Context(), "trc_local"), model.ImageReadRequest{URL: "https://example.com/image.png"})
	if err != nil {
		t.Fatal(err)
	}
	if result.Meta.UpstreamRequestID != "gateway_distinct" {
		t.Fatalf("upstream request id = %q", result.Meta.UpstreamRequestID)
	}
}

func TestImageReadBodyReadFailureUsesDecodeResultStage(t *testing.T) {
	client := NewClient(config.AgentPlatformConfig{BaseURL: "http://agent.invalid"})
	client.http.Transport = roundTripFunc(func(*http.Request) (*http.Response, error) {
		header := make(http.Header)
		header.Set("X-Request-ID", "gateway_read_fail")
		return &http.Response{StatusCode: http.StatusOK, Header: header, Body: failingReadCloser{}}, nil
	})
	_, err := client.ImageRead(trace.SetTraceID(t.Context(), "trc_read_fail"), model.ImageReadRequest{URL: "https://example.com/image.png"})
	meta, ok := model.InvocationMetaFromError(err)
	if !ok || meta.Stage != model.InvocationStageDecodeResult || meta.UpstreamRequestID != "gateway_read_fail" {
		t.Fatalf("metadata = %+v, found = %v, error = %v", meta, ok, err)
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) { return f(req) }

type failingReadCloser struct{}

func (failingReadCloser) Read([]byte) (int, error) { return 0, io.ErrUnexpectedEOF }
func (failingReadCloser) Close() error             { return nil }

func TestImageReadOmitsUpstreamRequestIDEqualToTrace(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Trace-ID", "trc_same")
		_ = json.NewEncoder(w).Encode(map[string]any{"content": "recognized", "model": "gemini"})
	}))
	defer srv.Close()

	client := NewClient(config.AgentPlatformConfig{BaseURL: srv.URL})
	result, err := client.ImageRead(trace.SetTraceID(t.Context(), "trc_same"), model.ImageReadRequest{URL: "https://example.com/image.png"})
	if err != nil {
		t.Fatal(err)
	}
	if result.Meta.UpstreamRequestID != "" {
		t.Fatalf("upstream request id = %q, want omitted", result.Meta.UpstreamRequestID)
	}
}

func TestImageReadDecodeErrorPreservesUpstreamRequestID(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Request-Id", "gateway_bad_json")
		_, _ = w.Write([]byte(`{bad-json`))
	}))
	defer srv.Close()

	client := NewClient(config.AgentPlatformConfig{BaseURL: srv.URL})
	_, err := client.ImageRead(trace.SetTraceID(t.Context(), "trc_bad_json"), model.ImageReadRequest{URL: "https://example.com/image.png"})
	if err == nil {
		t.Fatal("expected decode error")
	}
	meta, ok := model.InvocationMetaFromError(err)
	if !ok || meta.UpstreamRequestID != "gateway_bad_json" || meta.Stage != model.InvocationStageDecodeResult {
		t.Fatalf("metadata = %+v, found = %v", meta, ok)
	}
}

func TestImageReadDeadlineIsSubmitTimeout(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("expired context must not reach the server")
	}))
	defer srv.Close()

	client := NewClient(config.AgentPlatformConfig{BaseURL: srv.URL})
	ctx, cancel := context.WithDeadline(t.Context(), time.Now().Add(-time.Second))
	defer cancel()
	_, err := client.ImageRead(ctx, model.ImageReadRequest{URL: "https://example.com/image.png"})
	var invocationErr *model.InvocationError
	if !errors.As(err, &invocationErr) {
		t.Fatalf("expected invocation error, got %v", err)
	}
	if invocationErr.Code != model.InvocationErrorCodeUpstreamTimeout || invocationErr.Meta.Stage != model.InvocationStageSubmit {
		t.Fatalf("invocation error = %+v", invocationErr)
	}
}
