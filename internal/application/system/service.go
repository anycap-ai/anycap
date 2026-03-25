package system

import (
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

type Service struct {
	name      string
	env       string
	runtime   string
	buildInfo buildinfo.Info
}

func NewService(name, env, runtime string, info buildinfo.Info) *Service {
	return &Service{
		name:      name,
		env:       env,
		runtime:   runtime,
		buildInfo: info,
	}
}

func (s *Service) Status(principal *model.Principal) model.StatusResult {
	return model.StatusResult{
		Service: model.ServiceStatus{
			Name:    s.name,
			Env:     s.env,
			Version: s.buildInfo.Version,
			Commit:  s.buildInfo.Commit,
			BuildAt: s.buildInfo.Date,
			Status:  "ok",
		},
		RuntimeMode: s.runtime,
		User:        principal,
	}
}
