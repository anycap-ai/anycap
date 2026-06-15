package port

import (
	"context"
	"errors"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

var ErrLoginUserCodeConflict = errors.New("login user code conflict")

type LoginSessionRepo interface {
	// CreateSession returns ErrLoginUserCodeConflict only when a device user_code
	// violates the login session user-code uniqueness constraint.
	CreateSession(ctx context.Context, session model.LoginSession) error
	GetByID(ctx context.Context, sessionID string) (model.LoginSession, error)
	GetByUserCode(ctx context.Context, userCode string) (model.LoginSession, error)
	GetByBrowserToken(ctx context.Context, browserToken string) (model.LoginSession, error)
	MarkCompleted(ctx context.Context, sessionID, apiKeyID string, completedAt time.Time) error
	MarkVerified(ctx context.Context, sessionID string, authUser model.AuthUser, verifiedAt time.Time) error
	MarkPolled(ctx context.Context, sessionID string, polledAt time.Time) error
}
