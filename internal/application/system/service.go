package system

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

type Service struct {
	name      string
	env       string
	runtime   string
	buildInfo buildinfo.Info
	features  map[string]bool
	apiKeys   port.APIKeyService
}

func NewService(name, env, runtime string, info buildinfo.Info, apiKeys port.APIKeyService) *Service {
	return &Service{
		name:      name,
		env:       env,
		runtime:   runtime,
		buildInfo: info,
		apiKeys:   apiKeys,
	}
}

// SetFeatures configures the feature flags reported in status.
func (s *Service) SetFeatures(features map[string]bool) {
	s.features = features
}

func (s *Service) Status(principal *model.Principal) model.StatusResult {
	return model.StatusResult{
		Service: model.ServiceStatus{
			Name:     s.name,
			Env:      s.env,
			Version:  s.buildInfo.Version,
			Commit:   s.buildInfo.Commit,
			BuildAt:  s.buildInfo.Date,
			Status:   "ok",
			Features: s.features,
		},
		RuntimeMode: s.runtime,
		User:        principal,
	}
}

func (s *Service) Logout(ctx context.Context, principal *model.Principal) error {
	if principal == nil || principal.APIKeyID == "" {
		return model.ErrAuthInvalid
	}
	if s.apiKeys == nil {
		return model.ErrInternal
	}
	return s.apiKeys.RevokeAPIKey(ctx, principal.APIKeyID)
}
