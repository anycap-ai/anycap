package auth

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type IdentityTokenVerifier interface {
	VerifyIdentityToken(ctx context.Context, rawToken string) (model.AuthUser, error)
}

type IdentityTokenAuthenticator struct {
	verifier IdentityTokenVerifier
	users    port.UserProvisioner
	now      func() time.Time
}

func NewIdentityTokenAuthenticator(verifier IdentityTokenVerifier, users port.UserProvisioner, now func() time.Time) *IdentityTokenAuthenticator {
	if now == nil {
		now = time.Now
	}
	return &IdentityTokenAuthenticator{
		verifier: verifier,
		users:    users,
		now:      now,
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

	user, _, err := a.users.FindOrCreateByAuthIdentity(ctx, "auth0", authUser, a.now().UTC())
	if err != nil {
		return model.Principal{}, err
	}

	return model.Principal{
		UserID:         user.ID,
		AuthType:       "auth0_jwt",
		Scopes:         []string{"image.generate", "image.read", "system.read"},
		ExternalUserID: authUser.UserID,
		Email:          user.Email,
		Name:           user.Name,
		Picture:        user.AvatarURL,
	}, nil
}

var _ port.IdentityTokenAuthenticator = (*IdentityTokenAuthenticator)(nil)
