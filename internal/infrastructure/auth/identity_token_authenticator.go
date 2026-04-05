package auth

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/open/common-go/logging"
)

type IdentityTokenVerifier interface {
	VerifyIdentityToken(ctx context.Context, rawToken string) (model.AuthUser, error)
}

type IdentityTokenProfileFetcher interface {
	FetchIdentityProfile(ctx context.Context, rawToken string) (model.AuthUser, error)
}

type IdentityTokenAuthenticator struct {
	verifier             IdentityTokenVerifier
	users                port.UserProvisioner
	credit               port.CreditClient
	now                  func() time.Time
	signupRewardDeadline time.Time
}

func NewIdentityTokenAuthenticator(verifier IdentityTokenVerifier, users port.UserProvisioner, credit port.CreditClient, now func() time.Time, signupRewardDeadline time.Time) *IdentityTokenAuthenticator {
	if now == nil {
		now = time.Now
	}
	return &IdentityTokenAuthenticator{
		verifier:             verifier,
		users:                users,
		credit:               credit,
		now:                  now,
		signupRewardDeadline: signupRewardDeadline,
	}
}

func (a *IdentityTokenAuthenticator) AuthenticateIdentityToken(ctx context.Context, rawToken string) (model.Principal, error) {
	if a == nil || a.verifier == nil || a.users == nil {
		return model.Principal{}, model.ErrInternal
	}

	authUser, err := a.verifier.VerifyIdentityToken(ctx, rawToken)
	if err != nil {
		return model.Principal{}, err
	}
	if shouldHydrateAuthProfile(authUser) {
		if fetcher, ok := a.verifier.(IdentityTokenProfileFetcher); ok {
			profile, fetchErr := fetcher.FetchIdentityProfile(ctx, rawToken)
			if fetchErr == nil && profile.UserID == authUser.UserID {
				authUser.Email = firstNonEmpty(profile.Email, authUser.Email)
				authUser.Name = firstNonEmpty(profile.Name, authUser.Name)
				authUser.Picture = firstNonEmpty(profile.Picture, authUser.Picture)
			}
		}
	}

	user, createdUser, err := a.users.FindOrCreateByAuthIdentity(ctx, "auth0", authUser, a.now().UTC())
	if err != nil {
		return model.Principal{}, err
	}
	a.grantSignupReward(ctx, user.ID, createdUser)

	return model.Principal{
		UserID:         user.ID,
		AuthType:       "auth0_jwt",
		CreatedUser:    createdUser,
		Scopes:         []string{"system.read"},
		ExternalUserID: authUser.UserID,
		Email:          user.Email,
		Name:           user.Name,
		Picture:        user.AvatarURL,
	}, nil
}

func (a *IdentityTokenAuthenticator) grantSignupReward(ctx context.Context, userID string, createdUser bool) {
	if !createdUser || a.credit == nil || userID == "" {
		return
	}
	if !a.signupRewardDeadline.IsZero() && a.now().UTC().After(a.signupRewardDeadline.UTC()) {
		return
	}
	if err := a.credit.GrantSignupReward(ctx, userID); err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"flow":    "auth.grant_signup_reward",
			"user_id": userID,
		}).WithError(err).Warn("grant signup reward failed")
	}
}

func shouldHydrateAuthProfile(authUser model.AuthUser) bool {
	return authUser.Email == "" || authUser.Name == "" || authUser.Picture == ""
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}

var _ port.IdentityTokenAuthenticator = (*IdentityTokenAuthenticator)(nil)
