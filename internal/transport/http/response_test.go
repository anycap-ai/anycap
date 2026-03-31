package http

import (
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestMapDomainError(t *testing.T) {
	status, payload := MapDomainError(model.ErrAuthInvalid)
	if status != 401 {
		t.Fatalf("expected 401, got %d", status)
	}
	if payload.Error.Code != "AUTH_INVALID" {
		t.Fatalf("expected AUTH_INVALID, got %q", payload.Error.Code)
	}
}

func TestMapDomainError_UpstreamUnavailable(t *testing.T) {
	status, payload := MapDomainError(model.ErrUpstreamUnavailable)
	if status != 503 {
		t.Fatalf("expected 503, got %d", status)
	}
	if payload.Error.Code != "UPSTREAM_UNAVAILABLE" {
		t.Fatalf("expected UPSTREAM_UNAVAILABLE, got %q", payload.Error.Code)
	}
}
