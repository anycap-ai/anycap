package auth

import (
	"context"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	userstore "gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/user"
)

type fakeIdentityTokenVerifier struct {
	authUser model.AuthUser
	profile  model.AuthUser
	err      error
}

type fakeSignupRewardCreditClient struct {
	grants []string
}

func (f *fakeIdentityTokenVerifier) VerifyIdentityToken(_ context.Context, _ string) (model.AuthUser, error) {
	if f.err != nil {
		return model.AuthUser{}, f.err
	}
	return f.authUser, nil
}

func (f *fakeIdentityTokenVerifier) FetchIdentityProfile(_ context.Context, _ string) (model.AuthUser, error) {
	if f.err != nil {
		return model.AuthUser{}, f.err
	}
	return f.profile, nil
}

func (f *fakeSignupRewardCreditClient) GetBalance(_ context.Context, _ string) (model.Balance, error) {
	return model.Balance{}, nil
}

func (f *fakeSignupRewardCreditClient) Deduct(_ context.Context, _ string, _ int64, _, _ string) error {
	return nil
}

func (f *fakeSignupRewardCreditClient) GrantSignupReward(_ context.Context, userID string) error {
	f.grants = append(f.grants, userID)
	return nil
}

func (f *fakeSignupRewardCreditClient) ListTransactions(_ context.Context, _ string, _, _ int) ([]model.CreditTransaction, int, error) {
	return nil, 0, nil
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
	}, users, nil, func() time.Time {
		return time.Date(2026, 3, 27, 9, 0, 0, 0, time.UTC)
	}, time.Time{})

	principal, err := authenticator.AuthenticateIdentityToken(context.Background(), "jwt-token")
	if err != nil {
		t.Fatalf("AuthenticateIdentityToken() error = %v", err)
	}
	if principal.UserID == "" || principal.AuthType != "auth0_jwt" {
		t.Fatalf("unexpected principal: %#v", principal)
	}
	if len(principal.Scopes) != 1 || principal.Scopes[0] != "system.read" {
		t.Fatalf("expected only system.read scope, got %#v", principal.Scopes)
	}
	if principal.ExternalUserID != "auth0|demo-user" || principal.Email != "demo@example.com" || principal.Name != "Demo User" {
		t.Fatalf("expected hydrated profile in principal, got %#v", principal)
	}
}

func TestIdentityTokenAuthenticator_PropagatesVerifierError(t *testing.T) {
	authenticator := NewIdentityTokenAuthenticator(&fakeIdentityTokenVerifier{
		err: errors.New("boom"),
	}, userstore.NewMemoryProvisioner(), nil, nil, time.Time{})

	if _, err := authenticator.AuthenticateIdentityToken(context.Background(), "jwt-token"); err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestIdentityTokenAuthenticator_HydratesMissingProfileFromFetcher(t *testing.T) {
	users := userstore.NewMemoryProvisioner()
	authenticator := NewIdentityTokenAuthenticator(&fakeIdentityTokenVerifier{
		authUser: model.AuthUser{
			UserID: "auth0|demo-user",
		},
		profile: model.AuthUser{
			UserID:  "auth0|demo-user",
			Email:   "demo@example.com",
			Name:    "Demo User",
			Picture: "https://cdn.example.com/avatar.png",
		},
	}, users, nil, func() time.Time {
		return time.Date(2026, 3, 27, 9, 0, 0, 0, time.UTC)
	}, time.Time{})

	principal, err := authenticator.AuthenticateIdentityToken(context.Background(), "jwt-token")
	if err != nil {
		t.Fatalf("AuthenticateIdentityToken() error = %v", err)
	}
	if principal.Email != "demo@example.com" || principal.Name != "Demo User" {
		t.Fatalf("expected hydrated profile from fetcher, got %#v", principal)
	}
}

func TestIdentityTokenAuthenticator_GrantsSignupRewardForNewUserOnly(t *testing.T) {
	users := userstore.NewMemoryProvisioner()
	credit := &fakeSignupRewardCreditClient{}
	authenticator := NewIdentityTokenAuthenticator(&fakeIdentityTokenVerifier{
		authUser: model.AuthUser{
			UserID: "auth0|demo-user",
			Email:  "demo@example.com",
			Name:   "Demo User",
		},
	}, users, credit, func() time.Time {
		return time.Date(2026, 4, 6, 9, 0, 0, 0, time.UTC)
	}, time.Date(2026, 4, 10, 23, 59, 59, 0, time.UTC))

	first, err := authenticator.AuthenticateIdentityToken(context.Background(), "jwt-token")
	if err != nil {
		t.Fatalf("first AuthenticateIdentityToken() error = %v", err)
	}
	if !first.CreatedUser {
		t.Fatalf("expected first principal to be marked as created user, got %#v", first)
	}

	second, err := authenticator.AuthenticateIdentityToken(context.Background(), "jwt-token")
	if err != nil {
		t.Fatalf("second AuthenticateIdentityToken() error = %v", err)
	}
	if second.CreatedUser {
		t.Fatalf("expected second principal to be existing user, got %#v", second)
	}

	if len(credit.grants) != 1 || credit.grants[0] != first.UserID {
		t.Fatalf("expected exactly one signup reward grant for %q, got %#v", first.UserID, credit.grants)
	}
}

var _ port.CreditClient = (*fakeSignupRewardCreditClient)(nil)
