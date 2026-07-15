package nexushub

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestResultPoller_Resolve_InlinePayload(t *testing.T) {
	// When the submit response already carries a resp_payload, resolve must
	// return it unchanged without hitting get_submit_result.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Errorf("unexpected request to %s; inline payload must not poll", r.URL.Path)
	}))
	defer srv.Close()

	p := newResultPoller(srv.Client(), srv.URL, "tok", time.Millisecond, 0)
	submitted := submitAtomicProcessResponse{
		TaskID:      "atomic_inline",
		RespPayload: `{"resources":[]}`,
	}
	got, err := p.resolve(context.Background(), "web.search", "k", submitted)
	if err != nil {
		t.Fatalf("resolve error: %v", err)
	}
	if got.RespPayload != submitted.RespPayload {
		t.Errorf("resp_payload = %q, want unchanged", got.RespPayload)
	}
}

func TestResultPoller_Resolve_NoTaskID(t *testing.T) {
	// Empty payload AND empty task id: nothing to poll, return as-is.
	p := newResultPoller(http.DefaultClient, "http://unused", "tok", time.Millisecond, 0)
	got, err := p.resolve(context.Background(), "web.search", "k", submitAtomicProcessResponse{})
	if err != nil {
		t.Fatalf("resolve error: %v", err)
	}
	if got.RespPayload != "" || got.TaskID != "" {
		t.Errorf("expected empty response, got %+v", got)
	}
}

func TestResultPoller_Resolve_PollsUntilReady(t *testing.T) {
	var pollCount int
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet || !strings.HasPrefix(r.URL.Path, getSubmitResultPath) {
			t.Errorf("unexpected request %s %s", r.Method, r.URL.Path)
			return
		}
		if r.Header.Get("X-Token") != "tok" {
			t.Errorf("X-Token = %q, want tok", r.Header.Get("X-Token"))
		}
		pollCount++
		resp := map[string]any{
			"base":    map[string]any{"code": 0, "message": "success"},
			"task_id": "atomic_poll",
			"status":  "succeed",
		}
		if pollCount >= 3 {
			resp["resp_payload"] = `{"resources":[{"meta_data":{"data":{"ok":true}}}]}`
		} else {
			resp["resp_payload"] = ""
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := newResultPoller(srv.Client(), srv.URL, "tok", time.Millisecond, 0)
	submitted := submitAtomicProcessResponse{TaskID: "atomic_poll", RespPayload: ""}
	got, err := p.resolve(context.Background(), "web.crawl", "k", submitted)
	if err != nil {
		t.Fatalf("resolve error: %v", err)
	}
	if pollCount != 3 {
		t.Errorf("pollCount = %d, want 3", pollCount)
	}
	if !strings.Contains(got.RespPayload, `"ok":true`) {
		t.Errorf("unexpected resp_payload: %q", got.RespPayload)
	}
}

func TestResultPoller_ResolveRetainsSubmittedTaskIDWhenPollOmitsIt(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"base":         map[string]any{"code": 0, "message": "success"},
			"status":       "succeed",
			"resp_payload": `{"resources":[]}`,
		})
	}))
	defer srv.Close()

	p := newResultPoller(srv.Client(), srv.URL, "tok", time.Millisecond, 1)
	got, err := p.resolve(context.Background(), "music.generate", "k", submitAtomicProcessResponse{TaskID: "atomic_retained"})
	if err != nil {
		t.Fatalf("resolve error: %v", err)
	}
	if got.TaskID != "atomic_retained" {
		t.Fatalf("task id = %q, want atomic_retained", got.TaskID)
	}
}

func TestResultPoller_Resolve_TerminalFailure(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := map[string]any{
			"base":     map[string]any{"code": 0, "message": "success"},
			"task_id":  "atomic_fail",
			"status":   "failed",
			"err_code": 5005,
			"err_msg":  "bad input",
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := newResultPoller(srv.Client(), srv.URL, "tok", time.Millisecond, 0)
	_, err := p.resolve(context.Background(), "web.search", "k", submitAtomicProcessResponse{TaskID: "atomic_fail"})
	if err == nil {
		t.Fatal("expected error for failed task")
	}
	if !strings.Contains(err.Error(), "bad input") {
		t.Errorf("unexpected error: %v", err)
	}
	meta, ok := model.InvocationMetaFromError(err)
	if !ok || meta.TaskID != "atomic_fail" || meta.Stage != model.InvocationStagePoll {
		t.Fatalf("diagnostics = %+v, found = %v", meta, ok)
	}
}

func TestResultPoller_Resolve_ExhaustsAttempts(t *testing.T) {
	var pollCount int
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		pollCount++
		_ = json.NewEncoder(w).Encode(map[string]any{
			"base":         map[string]any{"code": 0, "message": "success"},
			"task_id":      "atomic_never",
			"status":       "succeed",
			"resp_payload": "",
		})
	}))
	defer srv.Close()

	p := newResultPoller(srv.Client(), srv.URL, "tok", time.Millisecond, 3)
	_, err := p.resolve(context.Background(), "web.search", "k", submitAtomicProcessResponse{TaskID: "atomic_never"})
	if err == nil {
		t.Fatal("expected error after exhausting attempts")
	}
	if pollCount != 3 {
		t.Errorf("pollCount = %d, want 3", pollCount)
	}
	if !strings.Contains(err.Error(), "not ready") {
		t.Errorf("unexpected error: %v", err)
	}
	var invocationErr *model.InvocationError
	if !errors.As(err, &invocationErr) {
		t.Fatal("expected typed invocation error")
	}
	if invocationErr.Code != model.InvocationErrorCodeUpstreamTimeout || invocationErr.Meta.TaskID != "atomic_never" || invocationErr.Meta.Stage != model.InvocationStagePoll {
		t.Fatalf("invocation error = %+v", invocationErr)
	}
}

func TestResultPoller_Resolve_ContextCanceled(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"base":         map[string]any{"code": 0, "message": "success"},
			"task_id":      "atomic_ctx",
			"status":       "succeed",
			"resp_payload": "",
		})
	}))
	defer srv.Close()

	ctx, cancel := context.WithCancel(context.Background())
	// Long interval so the cancel happens during the wait, not the request.
	p := newResultPoller(srv.Client(), srv.URL, "tok", time.Hour, 0)
	cancel()
	_, err := p.resolve(ctx, "web.search", "k", submitAtomicProcessResponse{TaskID: "atomic_ctx"})
	if err == nil {
		t.Fatal("expected context cancellation error")
	}
}
