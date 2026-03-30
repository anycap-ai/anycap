package usage

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeCallLogRepo struct {
	logs []model.CallLog
}

func (f *fakeCallLogRepo) Insert(_ context.Context, entry model.CallLog) error {
	f.logs = append(f.logs, entry)
	return nil
}

func (f *fakeCallLogRepo) ListByUserID(_ context.Context, userID string, limit int) ([]model.CallLog, error) {
	result := make([]model.CallLog, 0, len(f.logs))
	for _, item := range f.logs {
		if item.UserID != userID {
			continue
		}
		result = append(result, item)
	}
	if limit > 0 && len(result) > limit {
		result = result[:limit]
	}
	return result, nil
}

func TestCallLogReader_SummarizeUsageByUser(t *testing.T) {
	reader := NewCallLogReader(&fakeCallLogRepo{
		logs: []model.CallLog{
			{UserID: "2000000001", APIKeyID: "akid_1", Status: "success", CreditCost: 3},
			{UserID: "2000000001", APIKeyID: "akid_1", Status: "failed", CreditCost: 2},
			{UserID: "2000000001", APIKeyID: "akid_2", Status: "success", CreditCost: 1},
		},
	})

	result, err := reader.SummarizeUsageByUser(context.Background(), "2000000001", model.UsageQuery{})
	if err != nil {
		t.Fatalf("SummarizeUsageByUser() error = %v", err)
	}
	if result.TotalEvents != 3 || result.SuccessEvents != 2 || result.FailureEvents != 1 || result.TotalCost != 6 {
		t.Fatalf("unexpected summary: %+v", result)
	}
}

func TestCallLogReader_ListUsageEventsByUser(t *testing.T) {
	now := time.Date(2026, 3, 30, 12, 0, 0, 0, time.UTC)
	reader := NewCallLogReader(&fakeCallLogRepo{
		logs: []model.CallLog{
			{RequestID: "req_1", UserID: "2000000001", APIKeyID: "akid_1", Capability: "image.generate", Status: "success", CreditCost: 3, CreatedAt: now},
		},
	})

	result, err := reader.ListUsageEventsByUser(context.Background(), "2000000001", model.UsageQuery{})
	if err != nil {
		t.Fatalf("ListUsageEventsByUser() error = %v", err)
	}
	if len(result.Items) != 1 || result.Items[0].Action != "image.generate" || result.Items[0].FinalCost != 3 {
		t.Fatalf("unexpected usage events: %+v", result.Items)
	}
}

func TestCallLogReader_SummarizeUsageByAPIKey(t *testing.T) {
	reader := NewCallLogReader(&fakeCallLogRepo{
		logs: []model.CallLog{
			{UserID: "2000000001", APIKeyID: "akid_1", Capability: "image.generate", Status: "success", CreditCost: 3},
			{UserID: "2000000001", APIKeyID: "akid_1", Capability: "video.generate", Status: "failed", CreditCost: 2},
			{UserID: "2000000001", APIKeyID: "akid_2", Capability: "music.generate", Status: "success", CreditCost: 1},
			{UserID: "2000000001", APIKeyID: "", Capability: "image.generate", Status: "success", CreditCost: 9},
		},
	})

	result, err := reader.SummarizeUsageByAPIKey(context.Background(), "2000000001", model.UsageQuery{})
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
