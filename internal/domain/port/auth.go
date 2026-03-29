package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type Auth0Client interface {
	BuildLoginURL(ctx context.Context, state, redirectURI string) (string, error)
}

type IdentityTokenAuthenticator interface {
	AuthenticateIdentityToken(ctx context.Context, rawToken string) (model.Principal, error)
}

type LoginService interface {
	Init(ctx context.Context, method string) (model.LoginInitResult, error)
	Poll(ctx context.Context, sessionID, pollToken string) (model.LoginPollResult, error)
}
