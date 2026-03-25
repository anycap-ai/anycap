package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type Auth0Client interface {
	BuildLoginURL(ctx context.Context, state, redirectURI string) (string, error)
	ExchangeCode(ctx context.Context, code, redirectURI string) (model.AuthUser, error)
	StartDeviceFlow(ctx context.Context) (model.DeviceAuthorization, error)
	PollDeviceFlow(ctx context.Context, deviceCode string) (model.DeviceAuthorizationStatus, error)
}

type LoginService interface {
	Init(ctx context.Context, method string, redirectPort int) (model.LoginInitResult, error)
	Callback(ctx context.Context, sessionID, code, state, redirectURI string) (model.LoginCallbackResult, error)
	Poll(ctx context.Context, sessionID string) (model.LoginPollResult, error)
}
