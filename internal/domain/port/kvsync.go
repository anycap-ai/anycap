package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type KVSyncJobRepository interface {
	Create(ctx context.Context, job model.KVSyncJob) (*model.KVSyncJob, error)
	GetByID(ctx context.Context, id int64) (*model.KVSyncJob, error)
}

type KVSyncWaiter interface {
	Wait(ctx context.Context, jobIDs []int64) error
}
