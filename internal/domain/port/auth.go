package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type Auth0Client interface {
	BuildLoginURL(ctx context.Context, state string) (string, error)
	ExchangeCode(ctx context.Context, code string) (model.AuthUser, error)
}

type LoginService interface {
	Init(ctx context.Context) (model.LoginInitResult, error)
	Callback(ctx context.Context, code string) (model.LoginCallbackResult, error)
}
