package auth

import (
	"context"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	userstore "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/user"
)

type fakeIdentityTokenVerifier struct {
	authUser model.AuthUser
	err      error
}

func (f *fakeIdentityTokenVerifier) VerifyIdentityToken(_ context.Context, _ string) (model.AuthUser, error) {
	if f.err != nil {
		return model.AuthUser{}, f.err
	}
	return f.authUser, nil
}

func TestIdentityTokenAuthenticator_AuthenticateIdentityToken(t *testing.T) {
	users := userstore.NewMemoryProvisioner()
	authenticator := NewIdentityTokenAuthenticator(&fakeIdentityTokenVerifier{
		authUser: model.AuthUser{
			UserID:  "auth0|demo-user",
			Email:   "demo@example.com",
			Name:    "Demo User",
			Picture: "https://cdn.example.com/avatar.png",
		},
	}, users, func() time.Time {
		return time.Date(2026, 3, 27, 9, 0, 0, 0, time.UTC)
	})

	principal, err := authenticator.AuthenticateIdentityToken(context.Background(), "jwt-token")
	if err != nil {
		t.Fatalf("AuthenticateIdentityToken() error = %v", err)
	}
	if principal.UserID == "" || principal.AuthType != "auth0_jwt" {
		t.Fatalf("unexpected principal: %#v", principal)
	}
	if principal.ExternalUserID != "auth0|demo-user" || principal.Email != "demo@example.com" || principal.Name != "Demo User" {
		t.Fatalf("expected hydrated profile in principal, got %#v", principal)
	}
}

func TestIdentityTokenAuthenticator_PropagatesVerifierError(t *testing.T) {
	authenticator := NewIdentityTokenAuthenticator(&fakeIdentityTokenVerifier{
		err: errors.New("boom"),
	}, userstore.NewMemoryProvisioner(), nil)

	if _, err := authenticator.AuthenticateIdentityToken(context.Background(), "jwt-token"); err == nil {
		t.Fatal("expected error, got nil")
	}
}
