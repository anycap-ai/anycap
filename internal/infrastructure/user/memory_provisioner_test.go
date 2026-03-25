package userstore

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestMemoryProvisioner_AssignsUserIDInReservedRange(t *testing.T) {
	provisioner := NewMemoryProvisioner()

	user, created, err := provisioner.FindOrCreateByAuthIdentity(context.Background(), "auth0", model.AuthUser{
		UserID:  "auth0|abc123",
		Email:   "user@example.com",
		Name:    "Demo User",
		Picture: "https://example.com/avatar.png",
	}, time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("FindOrCreateByAuthIdentity() error = %v", err)
	}
	if !created {
		t.Fatal("expected first identity lookup to create a local user")
	}
	if user.ID != "2000000000" {
		t.Fatalf("expected first reserved user id 2000000000, got %q", user.ID)
	}
	if user.Status != model.UserStatusActive {
		t.Fatalf("expected active status, got %q", user.Status)
	}
}

func TestMemoryProvisioner_ReusesIdentityMapping(t *testing.T) {
	provisioner := NewMemoryProvisioner()
	now := time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC)

	first, createdFirst, err := provisioner.FindOrCreateByAuthIdentity(context.Background(), "auth0", model.AuthUser{
		UserID: "auth0|abc123",
		Email:  "first@example.com",
		Name:   "First Name",
	}, now)
	if err != nil {
		t.Fatalf("first FindOrCreateByAuthIdentity() error = %v", err)
	}
	if !createdFirst {
		t.Fatal("expected first lookup to create user")
	}

	second, createdSecond, err := provisioner.FindOrCreateByAuthIdentity(context.Background(), "auth0", model.AuthUser{
		UserID: "auth0|abc123",
		Email:  "updated@example.com",
		Name:   "Updated Name",
	}, now.Add(time.Minute))
	if err != nil {
		t.Fatalf("second FindOrCreateByAuthIdentity() error = %v", err)
	}
	if createdSecond {
		t.Fatal("expected second lookup to reuse existing user")
	}

	if first.ID != second.ID {
		t.Fatalf("expected same local user id, got %q and %q", first.ID, second.ID)
	}
	if second.Email != "updated@example.com" {
		t.Fatalf("expected updated email, got %q", second.Email)
	}
}
