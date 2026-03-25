package login

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type Service struct {
	authClient     port.Auth0Client
	apiKeys        port.APIKeyService
	stateGenerator func() string
}

func NewService(authClient port.Auth0Client, apiKeys port.APIKeyService, stateGenerator func() string) *Service {
	if stateGenerator == nil {
		stateGenerator = func() string {
			return "state-" + time.Now().UTC().Format("20060102150405")
		}
	}

	return &Service{
		authClient:     authClient,
		apiKeys:        apiKeys,
		stateGenerator: stateGenerator,
	}
}

func (s *Service) Init(ctx context.Context) (model.LoginInitResult, error) {
	if s == nil || s.authClient == nil {
		return model.LoginInitResult{}, model.ErrAuthProviderNotConfigured
	}

	state := s.stateGenerator()
	authURL, err := s.authClient.BuildLoginURL(ctx, state)
	if err != nil {
		return model.LoginInitResult{}, err
	}

	return model.LoginInitResult{
		AuthURL: authURL,
		State:   state,
	}, nil
}

func (s *Service) Callback(ctx context.Context, code string) (model.LoginCallbackResult, error) {
	if code == "" {
		return model.LoginCallbackResult{}, model.ErrInvalidParam
	}
	if s == nil || s.authClient == nil {
		return model.LoginCallbackResult{}, model.ErrAuthProviderNotConfigured
	}
	if s.apiKeys == nil {
		return model.LoginCallbackResult{}, model.ErrInternal
	}

	user, err := s.authClient.ExchangeCode(ctx, code)
	if err != nil {
		return model.LoginCallbackResult{}, err
	}

	created, err := s.apiKeys.CreateAPIKey(ctx, user.UserID, "cli")
	if err != nil {
		return model.LoginCallbackResult{}, err
	}

	return model.LoginCallbackResult{
		UserID:   user.UserID,
		APIKeyID: created.APIKey.ID,
		APIKey:   created.RawKey,
		User:     &user,
	}, nil
}
