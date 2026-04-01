package middleware

import (
	"errors"
	"testing"
)

func TestReportError_StoresMessage(t *testing.T) {
	store := &fakeRequestErrorStore{}
	ReportError(store, errors.New("boom"))
	if got := getReportedError(store); got != "boom" {
		t.Fatalf("expected stored error boom, got %q", got)
	}
}

func TestExtractResponseError_ParsesEnvelope(t *testing.T) {
	code, message := extractResponseError([]byte(`{"error":{"code":"INTERNAL_ERROR","message":"boom"}}`))
	if code != "INTERNAL_ERROR" || message != "boom" {
		t.Fatalf("expected INTERNAL_ERROR/boom, got %q/%q", code, message)
	}
}

func TestExtractResponseError_IgnoresInvalidPayload(t *testing.T) {
	code, message := extractResponseError([]byte(`{"status":"ok"}`))
	if code != "" || message != "" {
		t.Fatalf("expected empty error details, got %q/%q", code, message)
	}
}

type fakeRequestErrorStore struct {
	values map[string]any
}

func (s *fakeRequestErrorStore) Set(key string, value any) {
	if s.values == nil {
		s.values = map[string]any{}
	}
	s.values[key] = value
}

func (s *fakeRequestErrorStore) Get(key string) (any, bool) {
	value, ok := s.values[key]
	return value, ok
}
