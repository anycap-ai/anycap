package usage

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeUsageSyncRepo struct {
	pending         []model.ProviderRunRecord
	runs            map[string]model.ProviderRunRecord
	providerUpdates []model.ProviderRunSyncUpdate
	eventUpdates    []model.UsageEventResultUpdate
}

func (f *fakeUsageSyncRepo) ListProviderRunsForSync(_ context.Context, _ string, limit int) ([]model.ProviderRunRecord, error) {
	result := append([]model.ProviderRunRecord(nil), f.pending...)
	if limit > 0 && len(result) > limit {
		result = result[:limit]
	}
	return result, nil
}

func (f *fakeUsageSyncRepo) GetProviderRunByTaskID(_ context.Context, provider, taskID string) (*model.ProviderRunRecord, error) {
	key := provider + ":" + taskID
	run, ok := f.runs[key]
	if !ok {
		return nil, nil
	}
	copy := run
	return &copy, nil
}

func (f *fakeUsageSyncRepo) UpdateProviderRunSync(_ context.Context, update model.ProviderRunSyncUpdate) error {
	f.providerUpdates = append(f.providerUpdates, update)
	return nil
}

func (f *fakeUsageSyncRepo) UpdateUsageEventResult(_ context.Context, update model.UsageEventResultUpdate) error {
	f.eventUpdates = append(f.eventUpdates, update)
	return nil
}

type fakeNexusHubClient struct {
	results map[string]model.ProviderTaskResult
	called  []string
}

func (f *fakeNexusHubClient) GetSubmitResult(_ context.Context, taskID string) (model.ProviderTaskResult, error) {
	f.called = append(f.called, taskID)
	return f.results[taskID], nil
}

func (f *fakeNexusHubClient) GenerateImage(context.Context, model.GenerateImageRequest, model.RouteBinding) (model.InvocationResult[model.GenerateImageResult], error) {
	panic("unexpected GenerateImage call")
}

func (f *fakeNexusHubClient) GenerateVideo(context.Context, model.GenerateVideoRequest, model.RouteBinding) (model.InvocationResult[model.GenerateVideoResult], error) {
	panic("unexpected GenerateVideo call")
}

func (f *fakeNexusHubClient) GenerateMusic(context.Context, model.GenerateMusicRequest, model.RouteBinding) (model.InvocationResult[model.GenerateMusicResult], error) {
	panic("unexpected GenerateMusic call")
}

func (f *fakeNexusHubClient) GetTaskIDByTrace(context.Context, string, string) (string, error) {
	panic("unexpected GetTaskIDByTrace call")
}

func TestService_SyncProviderRunByTaskID(t *testing.T) {
	repo := &fakeUsageSyncRepo{
		runs: map[string]model.ProviderRunRecord{
			"nexushub:task_1": {
				ID:             "prun_1",
				Provider:       "nexushub",
				ProviderTaskID: "task_1",
				UsageEventID:   "uevt_1",
				ProviderStatus: "processing",
				ProviderCost:   1,
			},
		},
	}
	nexus := &fakeNexusHubClient{
		results: map[string]model.ProviderTaskResult{
			"task_1": {
				TaskID:       "task_1",
				Status:       "failed",
				Usage:        map[string]any{"images": 1},
				CreditCost:   4,
				ErrorCode:    5005,
				ErrorMessage: "validation failed",
				RawResult:    map[string]any{"nexus_cost": 0.12},
			},
		},
	}
	service := NewService(repo, nexus)
	service.now = func() time.Time { return time.Date(2026, 3, 30, 13, 0, 0, 0, time.UTC) }

	err := service.SyncProviderRunByTaskID(context.Background(), "task_1")
	if err != nil {
		t.Fatalf("SyncProviderRunByTaskID() error = %v", err)
	}
	if len(repo.providerUpdates) != 1 {
		t.Fatalf("expected 1 provider update, got %d", len(repo.providerUpdates))
	}
	if repo.providerUpdates[0].ProviderStatus != "failed" || repo.providerUpdates[0].ProviderCost != 4 {
		t.Fatalf("unexpected provider update: %+v", repo.providerUpdates[0])
	}
	if repo.providerUpdates[0].FinishedAt == nil {
		t.Fatalf("expected finished_at to be set, got %+v", repo.providerUpdates[0])
	}
	if len(repo.eventUpdates) != 1 {
		t.Fatalf("expected 1 event update, got %d", len(repo.eventUpdates))
	}
	if repo.eventUpdates[0].Status != "failed" || repo.eventUpdates[0].FinalCost != 4 {
		t.Fatalf("unexpected event update: %+v", repo.eventUpdates[0])
	}
}

func TestService_SyncPendingRuns_UsesBatchLimit(t *testing.T) {
	repo := &fakeUsageSyncRepo{
		pending: []model.ProviderRunRecord{
			{Provider: "nexushub", ProviderTaskID: "task_1", UsageEventID: "uevt_1"},
			{Provider: "nexushub", ProviderTaskID: "task_2", UsageEventID: "uevt_2"},
			{Provider: "nexushub", ProviderTaskID: "task_3", UsageEventID: "uevt_3"},
		},
		runs: map[string]model.ProviderRunRecord{
			"nexushub:task_1": {Provider: "nexushub", ProviderTaskID: "task_1", UsageEventID: "uevt_1"},
			"nexushub:task_2": {Provider: "nexushub", ProviderTaskID: "task_2", UsageEventID: "uevt_2"},
			"nexushub:task_3": {Provider: "nexushub", ProviderTaskID: "task_3", UsageEventID: "uevt_3"},
		},
	}
	nexus := &fakeNexusHubClient{
		results: map[string]model.ProviderTaskResult{
			"task_1": {TaskID: "task_1", Status: "success", CreditCost: 1},
			"task_2": {TaskID: "task_2", Status: "success", CreditCost: 1},
			"task_3": {TaskID: "task_3", Status: "success", CreditCost: 1},
		},
	}
	service := NewService(repo, nexus)

	n, err := service.SyncPendingRuns(context.Background(), 2)
	if err != nil {
		t.Fatalf("SyncPendingRuns() error = %v", err)
	}
	if n != 2 {
		t.Fatalf("expected synced count 2, got %d", n)
	}
	if len(nexus.called) != 2 || nexus.called[0] != "task_1" || nexus.called[1] != "task_2" {
		t.Fatalf("unexpected synced tasks: %+v", nexus.called)
	}
}
