package system

import (
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestService_Status(t *testing.T) {
	service := NewService("anycap-server", "test", buildinfo.Info{
		Version: "dev",
		Commit:  "abc123",
		Date:    "2026-03-24T00:00:00Z",
	})

	status := service.Status()
	if status.Name != "anycap-server" {
		t.Fatalf("expected anycap-server, got %s", status.Name)
	}
	if status.Version != "dev" {
		t.Fatalf("expected version dev, got %s", status.Version)
	}
	if status.Status != "ok" {
		t.Fatalf("expected status ok, got %s", status.Status)
	}
}
