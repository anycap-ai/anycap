package apikey

import (
	"context"
	"testing"
	"time"
)

func TestMemoryService_CreateAPIKeyWithTTL_ReissuesExpiredCLIKey(t *testing.T) {
	service := NewMemoryService()

	first, err := service.CreateAPIKeyWithTTL(context.Background(), "user-123", "cli", time.Nanosecond)
	if err != nil {
		t.Fatalf("CreateAPIKeyWithTTL() error = %v", err)
	}

	time.Sleep(2 * time.Millisecond)

	second, err := service.CreateAPIKeyWithTTL(context.Background(), "user-123", "cli", 7*24*time.Hour)
	if err != nil {
		t.Fatalf("CreateAPIKeyWithTTL() second error = %v", err)
	}

	if first.APIKey.ID == second.APIKey.ID {
		t.Fatalf("expected a new key after expiry, got same id %q", first.APIKey.ID)
	}
	if second.APIKey.ExpiresAt == nil {
		t.Fatal("expected new key to have expires_at")
	}
}
