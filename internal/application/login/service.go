package login

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type Service struct {
	authProvider   port.AuthProvider
	stateGenerator func() string
}

func NewService(authProvider port.AuthProvider, stateGenerator func() string) *Service {
	if stateGenerator == nil {
		stateGenerator = func() string {
			return "state-" + time.Now().UTC().Format("20060102150405")
		}
	}

	return &Service{
		authProvider:   authProvider,
		stateGenerator: stateGenerator,
	}
}

func (s *Service) Init(ctx context.Context) (model.LoginInitResult, error) {
	state := s.stateGenerator()
	authURL, err := s.authProvider.BuildLoginURL(ctx, state)
	if err != nil {
		return model.LoginInitResult{}, err
	}

	return model.LoginInitResult{
		AuthURL: authURL,
		State:   state,
	}, nil
}
