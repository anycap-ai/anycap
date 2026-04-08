package runner

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClientRegisterUsesBearerAuth(t *testing.T) {
	var authHeader string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader = r.Header.Get("Authorization")
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	client := NewClient(ClientConfig{
		BaseURL: server.URL,
		Token:   "runner-token",
	})

	err := client.Register(context.Background(), RegisterRequest{
		Name:     "mac-mini",
		Platform: "feishu",
	})
	if err != nil {
		t.Fatalf("Register() error = %v", err)
	}
	if authHeader != "Bearer runner-token" {
		t.Fatalf("expected bearer auth, got %q", authHeader)
	}
}

func TestClientUpdateTaskUsesIdempotencyKey(t *testing.T) {
	var (
		authHeader        string
		idempotencyHeader string
		payload           TaskUpdateRequest
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader = r.Header.Get("Authorization")
		idempotencyHeader = r.Header.Get("X-Idempotency-Key")
		defer r.Body.Close()
		body, err := io.ReadAll(r.Body)
		if err != nil {
			t.Fatalf("ReadAll() error = %v", err)
		}
		if err := json.Unmarshal(body, &payload); err != nil {
			t.Fatalf("json.Unmarshal() error = %v", err)
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	client := NewClient(ClientConfig{
		BaseURL: server.URL,
		Token:   "runner-token",
	})

	err := client.UpdateTask(context.Background(), "run_123", "agt_456", TaskUpdateRequest{
		Status:       "running",
		ErrorMessage: "",
	}, "idem-001")
	if err != nil {
		t.Fatalf("UpdateTask() error = %v", err)
	}
	if authHeader != "Bearer runner-token" {
		t.Fatalf("expected bearer auth, got %q", authHeader)
	}
	if idempotencyHeader != "idem-001" {
		t.Fatalf("expected idempotency key idem-001, got %q", idempotencyHeader)
	}
	if payload.Status != "running" {
		t.Fatalf("unexpected payload %+v", payload)
	}
}

func TestClientNextTaskUsesBearerAuthAndPath(t *testing.T) {
	var (
		authHeader string
		path       string
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader = r.Header.Get("Authorization")
		path = r.URL.Path
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"id":"agt_123","runner_id":"run_123","user_id":"u_123","platform":"feishu","intent":"execute_task","task_text":"fix parser panic","status":"dispatched","created_at":"2026-04-08T12:00:00Z","updated_at":"2026-04-08T12:00:00Z"}}`))
	}))
	defer server.Close()

	client := NewClient(ClientConfig{
		BaseURL: server.URL,
		Token:   "runner-token",
	})

	task, err := client.NextTask(context.Background(), "run_123")
	if err != nil {
		t.Fatalf("NextTask() error = %v", err)
	}
	if authHeader != "Bearer runner-token" {
		t.Fatalf("expected bearer auth, got %q", authHeader)
	}
	if path != "/v1/agent/runners/run_123/tasks/next" {
		t.Fatalf("unexpected request path %q", path)
	}
	if task == nil || task.ID != "agt_123" {
		t.Fatalf("unexpected task %+v", task)
	}
}

func TestClientNextSessionUsesBearerAuthAndPath(t *testing.T) {
	var (
		authHeader string
		path       string
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader = r.Header.Get("Authorization")
		path = r.URL.Path
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"id":"ags_123","conversation_id":"agc_123","runner_id":"run_123","user_id":"u_123","agent":"codex","mode":"continue","status":"created","created_at":"2026-04-08T12:00:00Z","updated_at":"2026-04-08T12:00:00Z"}}`))
	}))
	defer server.Close()

	client := NewClient(ClientConfig{
		BaseURL: server.URL,
		Token:   "runner-token",
	})

	session, err := client.NextSession(context.Background(), "run_123")
	if err != nil {
		t.Fatalf("NextSession() error = %v", err)
	}
	if authHeader != "Bearer runner-token" {
		t.Fatalf("expected bearer auth, got %q", authHeader)
	}
	if path != "/v1/agent/runners/run_123/sessions/next" {
		t.Fatalf("unexpected request path %q", path)
	}
	if session == nil || session.ID != "ags_123" {
		t.Fatalf("unexpected session %+v", session)
	}
}

func TestClientGetSessionUsesBearerAuthAndPath(t *testing.T) {
	var (
		authHeader string
		path       string
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader = r.Header.Get("Authorization")
		path = r.URL.Path
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"success","data":{"id":"ags_123","conversation_id":"agc_123","runner_id":"run_123","user_id":"u_123","agent":"codex","mode":"continue","status":"interrupted","created_at":"2026-04-08T12:00:00Z","updated_at":"2026-04-08T12:00:00Z"}}`))
	}))
	defer server.Close()

	client := NewClient(ClientConfig{
		BaseURL: server.URL,
		Token:   "runner-token",
	})

	session, err := client.GetSession(context.Background(), "run_123", "ags_123")
	if err != nil {
		t.Fatalf("GetSession() error = %v", err)
	}
	if authHeader != "Bearer runner-token" {
		t.Fatalf("expected bearer auth, got %q", authHeader)
	}
	if path != "/v1/agent/runners/run_123/sessions/ags_123" {
		t.Fatalf("unexpected request path %q", path)
	}
	if session == nil || session.ID != "ags_123" || session.Status != "interrupted" {
		t.Fatalf("unexpected session %+v", session)
	}
}
