package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type CallLogRepo interface {
	Insert(ctx context.Context, entry model.CallLog) error
	ListByUserID(ctx context.Context, userID string, limit int) ([]model.CallLog, error)
}
