package port

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type AnonymousTrialStore interface {
	ConsumeAnonymousTrial(ctx context.Context, key string, now time.Time, limit int, window time.Duration) (model.AnonymousTrialState, error)
}
