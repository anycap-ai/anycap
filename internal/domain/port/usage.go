package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type UsageReader interface {
	SummarizeUsageByUser(ctx context.Context, userID string, query model.UsageQuery) (model.UsageSummaryResult, error)
	ListUsageEventsByUser(ctx context.Context, userID string, query model.UsageQuery) (model.UsageEventListResult, error)
	SummarizeUsageByAPIKey(ctx context.Context, userID string, query model.UsageQuery) (map[string]model.APIKeyUsageSummary, error)
}

type UsageWriter interface {
	InsertUsageEvent(ctx context.Context, event model.UsageEventRecord) error
	InsertProviderRun(ctx context.Context, run model.ProviderRunRecord) error
}

type UsageSyncRepository interface {
	ListProviderRunsForSync(ctx context.Context, provider string, limit int) ([]model.ProviderRunRecord, error)
	GetProviderRunByTaskID(ctx context.Context, provider, taskID string) (*model.ProviderRunRecord, error)
	UpdateProviderRunSync(ctx context.Context, update model.ProviderRunSyncUpdate) error
	UpdateUsageEventResult(ctx context.Context, update model.UsageEventResultUpdate) error
}
