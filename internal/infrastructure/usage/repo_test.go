package usage

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type fakeUsageDB struct {
	query string
	args  []any
	rows  sqlstore.Rows
}

func (f *fakeUsageDB) ExecContext(_ context.Context, query string, args ...any) (sqlstore.Result, error) {
	f.query = query
	f.args = args
	return fakeResult{rowsAffected: 1}, nil
}

func (f *fakeUsageDB) QueryRowContext(context.Context, string, ...any) sqlstore.Row {
	return fakeRow{}
}

func (f *fakeUsageDB) QueryContext(context.Context, string, ...any) (sqlstore.Rows, error) {
	if f.rows != nil {
		return f.rows, nil
	}
	return fakeRows{}, nil
}

type fakeResult struct {
	rowsAffected int64
}

func (r fakeResult) RowsAffected() (int64, error) { return r.rowsAffected, nil }

type fakeRow struct{}

func (fakeRow) Scan(...any) error { return nil }

type fakeRows struct{}

func (fakeRows) Next() bool        { return false }
func (fakeRows) Scan(...any) error { return nil }
func (fakeRows) Close() error      { return nil }
func (fakeRows) Err() error        { return nil }

type usageRows struct {
	items [][]any
	index int
}

func (r *usageRows) Next() bool {
	return r.index < len(r.items)
}

func (r *usageRows) Scan(dest ...any) error {
	row := r.items[r.index]
	r.index++
	for i := range dest {
		switch target := dest[i].(type) {
		case *string:
			if row[i] == nil {
				*target = ""
				continue
			}
			*target = row[i].(string)
		case *int64:
			*target = row[i].(int64)
		case *time.Time:
			*target = row[i].(time.Time)
		case **time.Time:
			if row[i] == nil {
				*target = nil
				continue
			}
			value := row[i].(time.Time)
			*target = &value
		default:
			return nil
		}
	}
	return nil
}

func (r *usageRows) Close() error { return nil }
func (r *usageRows) Err() error   { return nil }

func TestUsageRepo_InsertUsageEvent(t *testing.T) {
	db := &fakeUsageDB{}
	repo := NewRepo(db)

	err := repo.InsertUsageEvent(context.Background(), model.UsageEventRecord{
		ID:            "uevt_1",
		UserID:        "2000000001",
		APIKeyID:      "akid_1",
		ProductArea:   "capability",
		Action:        "image.generate",
		Provider:      "nexushub",
		RequestID:     "req_1",
		Status:        "success",
		EstimatedCost: 1,
		FinalCost:     1,
		OccurredAt:    time.Date(2026, 3, 30, 12, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("InsertUsageEvent() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected insert query to be executed")
	}
	if got, ok := db.args[1].(int64); !ok || got != 2000000001 {
		t.Fatalf("expected bigint user_id arg 2000000001, got %#v", db.args[1])
	}
}

func TestUsageRepo_InsertProviderRun(t *testing.T) {
	db := &fakeUsageDB{}
	repo := NewRepo(db)

	err := repo.InsertProviderRun(context.Background(), model.ProviderRunRecord{
		ID:             "prun_1",
		Provider:       "nexushub",
		ProviderTaskID: "img_req_1",
		UsageEventID:   "uevt_1",
		AuthMode:       "platform_token",
		AbilityKey:     "flux-dev",
		ProviderStatus: "success",
		ProviderUsage:  map[string]any{"credits": 1},
		ProviderCost:   1,
		SubmittedAt:    time.Date(2026, 3, 30, 12, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("InsertProviderRun() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected insert query to be executed")
	}
	if got, ok := db.args[2].(string); !ok || got != "img_req_1" {
		t.Fatalf("expected provider_task_id img_req_1, got %#v", db.args[2])
	}
}

func TestMemoryRepo_SummarizeUsageByUser(t *testing.T) {
	repo := NewMemoryRepo()
	_ = repo.InsertUsageEvent(context.Background(), model.UsageEventRecord{ID: "uevt_1", UserID: "2000000001", APIKeyID: "akid_1", Action: "image.generate", Provider: "nexushub", Status: "success", FinalCost: 3, OccurredAt: time.Date(2026, 3, 30, 12, 0, 0, 0, time.UTC)})
	_ = repo.InsertUsageEvent(context.Background(), model.UsageEventRecord{ID: "uevt_2", UserID: "2000000001", APIKeyID: "akid_1", Action: "video.generate", Provider: "nexushub", Status: "failed", FinalCost: 2, OccurredAt: time.Date(2026, 3, 30, 12, 1, 0, 0, time.UTC)})
	_ = repo.InsertUsageEvent(context.Background(), model.UsageEventRecord{ID: "uevt_3", UserID: "2000000001", APIKeyID: "akid_2", Action: "music.generate", Provider: "nexushub", Status: "success", FinalCost: 1, OccurredAt: time.Date(2026, 3, 30, 12, 2, 0, 0, time.UTC)})

	result, err := repo.SummarizeUsageByUser(context.Background(), "2000000001", model.UsageQuery{})
	if err != nil {
		t.Fatalf("SummarizeUsageByUser() error = %v", err)
	}
	if result.TotalEvents != 3 || result.SuccessEvents != 2 || result.FailureEvents != 1 || result.TotalCost != 6 {
		t.Fatalf("unexpected summary: %+v", result)
	}
}

func TestMemoryRepo_ListUsageEventsByUser(t *testing.T) {
	now := time.Date(2026, 3, 30, 12, 0, 0, 0, time.UTC)
	repo := NewMemoryRepo()
	_ = repo.InsertUsageEvent(context.Background(), model.UsageEventRecord{
		ID:          "uevt_1",
		UserID:      "2000000001",
		APIKeyID:    "akid_1",
		ProductArea: "capability",
		Action:      "image.generate",
		Provider:    "nexushub",
		RequestID:   "req_1",
		Status:      "success",
		FinalCost:   3,
		OccurredAt:  now,
	})

	result, err := repo.ListUsageEventsByUser(context.Background(), "2000000001", model.UsageQuery{})
	if err != nil {
		t.Fatalf("ListUsageEventsByUser() error = %v", err)
	}
	if len(result.Items) != 1 || result.Items[0].Action != "image.generate" || result.Items[0].FinalCost != 3 {
		t.Fatalf("unexpected usage events: %+v", result.Items)
	}
}

func TestMemoryRepo_SummarizeUsageByAPIKey(t *testing.T) {
	repo := NewMemoryRepo()
	_ = repo.InsertUsageEvent(context.Background(), model.UsageEventRecord{ID: "uevt_1", UserID: "2000000001", APIKeyID: "akid_1", Action: "image.generate", Provider: "nexushub", Status: "success", FinalCost: 3, OccurredAt: time.Date(2026, 3, 30, 12, 0, 0, 0, time.UTC)})
	_ = repo.InsertUsageEvent(context.Background(), model.UsageEventRecord{ID: "uevt_2", UserID: "2000000001", APIKeyID: "akid_1", Action: "video.generate", Provider: "nexushub", Status: "failed", FinalCost: 2, OccurredAt: time.Date(2026, 3, 30, 12, 1, 0, 0, time.UTC)})
	_ = repo.InsertUsageEvent(context.Background(), model.UsageEventRecord{ID: "uevt_3", UserID: "2000000001", APIKeyID: "akid_2", Action: "music.generate", Provider: "nexushub", Status: "success", FinalCost: 1, OccurredAt: time.Date(2026, 3, 30, 12, 2, 0, 0, time.UTC)})
	_ = repo.InsertUsageEvent(context.Background(), model.UsageEventRecord{ID: "uevt_4", UserID: "2000000001", APIKeyID: "", Action: "image.generate", Provider: "nexushub", Status: "success", FinalCost: 9, OccurredAt: time.Date(2026, 3, 30, 12, 3, 0, 0, time.UTC)})

	result, err := repo.SummarizeUsageByAPIKey(context.Background(), "2000000001", model.UsageQuery{})
	if err != nil {
		t.Fatalf("SummarizeUsageByAPIKey() error = %v", err)
	}
	if result["akid_1"].UsageCount != 2 || result["akid_1"].FailureCount != 1 || result["akid_1"].Cost != 5 {
		t.Fatalf("unexpected akid_1 summary: %+v", result["akid_1"])
	}
	if result["akid_1"].LastAction != "video.generate" {
		t.Fatalf("expected last action video.generate, got %+v", result["akid_1"])
	}
	if _, ok := result[""]; ok {
		t.Fatalf("did not expect empty api key summary: %+v", result)
	}
}

func TestMemoryRepo_ListProviderRunsForSync(t *testing.T) {
	now := time.Date(2026, 3, 30, 12, 0, 0, 0, time.UTC)
	repo := NewMemoryRepo()
	_ = repo.InsertProviderRun(context.Background(), model.ProviderRunRecord{
		ID:             "prun_1",
		Provider:       "nexushub",
		ProviderTaskID: "task_1",
		UsageEventID:   "uevt_1",
		ProviderStatus: "processing",
		SubmittedAt:    now,
	})
	_ = repo.InsertProviderRun(context.Background(), model.ProviderRunRecord{
		ID:             "prun_2",
		Provider:       "nexushub",
		ProviderTaskID: "task_2",
		UsageEventID:   "uevt_2",
		ProviderStatus: "success",
		LastSyncedAt:   ptrTime(now),
		SubmittedAt:    now.Add(-time.Minute),
	})
	_ = repo.InsertProviderRun(context.Background(), model.ProviderRunRecord{
		ID:             "prun_3",
		Provider:       "nexushub",
		ProviderTaskID: "task_3",
		UsageEventID:   "uevt_3",
		ProviderStatus: "success",
		SubmittedAt:    now.Add(-2 * time.Minute),
	})

	items, err := repo.ListProviderRunsForSync(context.Background(), "nexushub", 10)
	if err != nil {
		t.Fatalf("ListProviderRunsForSync() error = %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 sync candidates, got %+v", items)
	}
	if items[0].ProviderTaskID != "task_3" || items[1].ProviderTaskID != "task_1" {
		t.Fatalf("unexpected sync candidates: %+v", items)
	}
}

func TestMemoryRepo_UpdateSyncResults(t *testing.T) {
	now := time.Date(2026, 3, 30, 12, 0, 0, 0, time.UTC)
	repo := NewMemoryRepo()
	_ = repo.InsertUsageEvent(context.Background(), model.UsageEventRecord{
		ID:         "uevt_1",
		UserID:     "2000000001",
		APIKeyID:   "akid_1",
		Action:     "image.generate",
		Provider:   "nexushub",
		Status:     "processing",
		FinalCost:  1,
		OccurredAt: now,
	})
	_ = repo.InsertProviderRun(context.Background(), model.ProviderRunRecord{
		ID:             "prun_1",
		Provider:       "nexushub",
		ProviderTaskID: "task_1",
		UsageEventID:   "uevt_1",
		ProviderStatus: "processing",
		SubmittedAt:    now,
	})

	err := repo.UpdateProviderRunSync(context.Background(), model.ProviderRunSyncUpdate{
		Provider:       "nexushub",
		ProviderTaskID: "task_1",
		ProviderStatus: "failed",
		ProviderUsage:  map[string]any{"images": 1},
		ProviderCost:   4,
		RawResult:      map[string]any{"err_msg": "validation failed"},
		FinishedAt:     ptrTime(now.Add(time.Minute)),
		LastSyncedAt:   now.Add(time.Minute),
	})
	if err != nil {
		t.Fatalf("UpdateProviderRunSync() error = %v", err)
	}
	err = repo.UpdateUsageEventResult(context.Background(), model.UsageEventResultUpdate{
		ID:          "uevt_1",
		Status:      "failed",
		FinalCost:   4,
		CompletedAt: ptrTime(now.Add(time.Minute)),
	})
	if err != nil {
		t.Fatalf("UpdateUsageEventResult() error = %v", err)
	}

	run, err := repo.GetProviderRunByTaskID(context.Background(), "nexushub", "task_1")
	if err != nil {
		t.Fatalf("GetProviderRunByTaskID() error = %v", err)
	}
	if run == nil || run.ProviderStatus != "failed" || run.ProviderCost != 4 {
		t.Fatalf("unexpected provider run after sync: %+v", run)
	}

	events, err := repo.ListUsageEventsByUser(context.Background(), "2000000001", model.UsageQuery{})
	if err != nil {
		t.Fatalf("ListUsageEventsByUser() error = %v", err)
	}
	if len(events.Items) != 1 || events.Items[0].Status != "failed" || events.Items[0].FinalCost != 4 {
		t.Fatalf("unexpected usage events after sync: %+v", events.Items)
	}
}

func ptrTime(v time.Time) *time.Time {
	return &v
}
