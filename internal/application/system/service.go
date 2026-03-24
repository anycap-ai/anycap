package system

import (
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

type Service struct {
	name      string
	env       string
	buildInfo buildinfo.Info
}

func NewService(name, env string, info buildinfo.Info) *Service {
	return &Service{
		name:      name,
		env:       env,
		buildInfo: info,
	}
}

func (s *Service) Status() model.ServiceStatus {
	return model.ServiceStatus{
		Name:    s.name,
		Env:     s.env,
		Version: s.buildInfo.Version,
		Commit:  s.buildInfo.Commit,
		BuildAt: s.buildInfo.Date,
		Status:  "ok",
	}
}
