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

func TestMemoryProvisioner_MigratesVerifiedPasswordIdentityByEmail(t *testing.T) {
	provisioner := NewMemoryProvisioner()
	now := time.Date(2026, 4, 27, 10, 0, 0, 0, time.UTC)

	first, createdFirst, err := provisioner.FindOrCreateByAuthIdentity(context.Background(), "auth0", model.AuthUser{
		UserID:        "auth0|old-password-user",
		Email:         "user@example.com",
		EmailVerified: true,
		Name:          "Old User",
	}, now)
	if err != nil {
		t.Fatalf("first FindOrCreateByAuthIdentity() error = %v", err)
	}
	if !createdFirst {
		t.Fatal("expected first lookup to create user")
	}

	second, createdSecond, err := provisioner.FindOrCreateByAuthIdentity(context.Background(), "auth0", model.AuthUser{
		UserID:        "auth0|new-password-user",
		Email:         "user@example.com",
		EmailVerified: true,
		Name:          "New User",
	}, now.Add(time.Minute))
	if err != nil {
		t.Fatalf("second FindOrCreateByAuthIdentity() error = %v", err)
	}
	if createdSecond {
		t.Fatal("expected migrated password identity to reuse existing user")
	}
	if second.ID != first.ID {
		t.Fatalf("expected same user after migration, got %q and %q", first.ID, second.ID)
	}

	third, createdThird, err := provisioner.FindOrCreateByAuthIdentity(context.Background(), "auth0", model.AuthUser{
		UserID:        "auth0|new-password-user",
		Email:         "user@example.com",
		EmailVerified: true,
	}, now.Add(2*time.Minute))
	if err != nil {
		t.Fatalf("third FindOrCreateByAuthIdentity() error = %v", err)
	}
	if createdThird || third.ID != first.ID {
		t.Fatalf("expected new subject to be persisted on same user, created=%v user=%#v", createdThird, third)
	}
}

func TestMemoryProvisioner_DoesNotMigratePasswordIdentityFromGoogleEmail(t *testing.T) {
	provisioner := NewMemoryProvisioner()
	now := time.Date(2026, 4, 27, 10, 0, 0, 0, time.UTC)

	googleUser, createdGoogle, err := provisioner.FindOrCreateByAuthIdentity(context.Background(), "auth0", model.AuthUser{
		UserID:        "google-oauth2|google-user",
		Email:         "user@example.com",
		EmailVerified: true,
		Name:          "Google User",
	}, now)
	if err != nil {
		t.Fatalf("google FindOrCreateByAuthIdentity() error = %v", err)
	}
	if !createdGoogle {
		t.Fatal("expected google lookup to create user")
	}

	passwordUser, createdPassword, err := provisioner.FindOrCreateByAuthIdentity(context.Background(), "auth0", model.AuthUser{
		UserID:        "auth0|password-user",
		Email:         "user@example.com",
		EmailVerified: true,
		Name:          "Password User",
	}, now.Add(time.Minute))
	if err != nil {
		t.Fatalf("password FindOrCreateByAuthIdentity() error = %v", err)
	}
	if !createdPassword {
		t.Fatal("expected password lookup to create a separate user")
	}
	if passwordUser.ID == googleUser.ID {
		t.Fatalf("expected google and password identities with same email to remain separate users, got %q", passwordUser.ID)
	}
}
