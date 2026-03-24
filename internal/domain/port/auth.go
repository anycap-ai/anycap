package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type AuthProvider interface {
	BuildLoginURL(ctx context.Context, state string) (string, error)
}

type LoginService interface {
	Init(ctx context.Context) (model.LoginInitResult, error)
}
