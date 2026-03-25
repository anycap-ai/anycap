package http

import "gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

func MapDomainError(err error) (int, dto.Envelope) {
	return dto.MapDomainError(err)
}
