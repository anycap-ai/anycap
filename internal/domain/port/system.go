package port

import "gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

type SystemService interface {
	Status(principal *model.Principal) model.StatusResult
}
