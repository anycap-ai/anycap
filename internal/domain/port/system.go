package port

import "gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

type SystemService interface {
	Status() model.ServiceStatus
}
