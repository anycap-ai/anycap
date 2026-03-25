package system

import (
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestService_Status(t *testing.T) {
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{
		Version: "dev",
		Commit:  "abc123",
		Date:    "2026-03-24T00:00:00Z",
	})

	status := service.Status(nil)
	if status.Service.Name != "anycap-server" {
		t.Fatalf("expected anycap-server, got %s", status.Service.Name)
	}
	if status.Service.Version != "dev" {
		t.Fatalf("expected version dev, got %s", status.Service.Version)
	}
	if status.Service.Status != "ok" {
		t.Fatalf("expected status ok, got %s", status.Service.Status)
	}
}
