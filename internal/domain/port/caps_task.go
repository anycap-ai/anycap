package port

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type CapsTaskRepository interface {
	Create(ctx context.Context, input model.CapsTask) (*model.CapsTask, error)
	UpdateStatus(ctx context.Context, id int64, status model.CapsTaskStatus, resultMeta map[string]any, completedAt *time.Time) error
}
