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
