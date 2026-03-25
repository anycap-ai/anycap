package port

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type LoginSessionRepo interface {
	CreateSession(ctx context.Context, session model.LoginSession) error
	GetByID(ctx context.Context, sessionID string) (model.LoginSession, error)
	GetByState(ctx context.Context, state string) (model.LoginSession, error)
	MarkAuthorized(ctx context.Context, sessionID, auth0Subject string, authorizedAt time.Time) error
	MarkCompleted(ctx context.Context, sessionID, apiKeyID string, completedAt time.Time) error
}
