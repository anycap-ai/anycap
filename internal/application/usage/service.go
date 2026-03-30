package usage

import (
	"context"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

const providerNexusHub = "nexushub"

type Service struct {
	repo  port.UsageSyncRepository
	nexus port.NexusHubClient
	now   func() time.Time
}

func NewService(repo port.UsageSyncRepository, nexus port.NexusHubClient) *Service {
	return &Service{
		repo:  repo,
		nexus: nexus,
		now: func() time.Time {
			return time.Now().UTC()
		},
	}
}

func (s *Service) SyncPendingRuns(ctx context.Context, limit int) (int, error) {
	runs, err := s.repo.ListProviderRunsForSync(ctx, providerNexusHub, limit)
	if err != nil {
		return 0, err
	}
	var synced int
	for _, run := range runs {
		if err := s.SyncProviderRunByTaskID(ctx, run.ProviderTaskID); err != nil {
			return synced, err
		}
		synced++
	}
	return synced, nil
}

func (s *Service) SyncProviderRunByTaskID(ctx context.Context, taskID string) error {
	run, err := s.repo.GetProviderRunByTaskID(ctx, providerNexusHub, taskID)
	if err != nil {
		return err
	}
	if run == nil {
		return nil
	}

	result, err := s.nexus.GetSubmitResult(ctx, taskID)
	if err != nil {
		return err
	}

	syncedAt := s.now()
	var finishedAt *time.Time
	if isTerminalStatus(result.Status) {
		finishedAt = &syncedAt
	}

	finalCost := run.ProviderCost
	if result.CreditCost > 0 {
		finalCost = result.CreditCost
	}

	if err := s.repo.UpdateProviderRunSync(ctx, model.ProviderRunSyncUpdate{
		Provider:       providerNexusHub,
		ProviderTaskID: taskID,
		ProviderStatus: result.Status,
		ProviderUsage:  result.Usage,
		ProviderCost:   finalCost,
		RawResult:      result.RawResult,
		FinishedAt:     finishedAt,
		LastSyncedAt:   syncedAt,
	}); err != nil {
		return err
	}

	return s.repo.UpdateUsageEventResult(ctx, model.UsageEventResultUpdate{
		ID:          run.UsageEventID,
		Status:      result.Status,
		FinalCost:   finalCost,
		CompletedAt: finishedAt,
	})
}

func isTerminalStatus(status string) bool {
	switch status {
	case "success", "failed", "canceled":
		return true
	default:
		return false
	}
}
