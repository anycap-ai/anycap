package billing

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type fakeBillingDB struct {
	query   string
	args    []any
	row     sqlstore.Row
	rows    sqlstore.Rows
	execErr error
}

func (f *fakeBillingDB) ExecContext(_ context.Context, query string, args ...any) (sqlstore.Result, error) {
	f.query = query
	f.args = args
	return fakeBillingResult{rowsAffected: 1}, f.execErr
}

func (f *fakeBillingDB) QueryRowContext(_ context.Context, query string, args ...any) sqlstore.Row {
	f.query = query
	f.args = args
	if f.row != nil {
		return f.row
	}
	return fakeBillingRow{}
}

func (f *fakeBillingDB) QueryContext(_ context.Context, query string, args ...any) (sqlstore.Rows, error) {
	f.query = query
	f.args = args
	if f.rows != nil {
		return f.rows, nil
	}
	return &billingRows{}, nil
}

type fakeBillingResult struct {
	rowsAffected int64
}

func (r fakeBillingResult) RowsAffected() (int64, error) { return r.rowsAffected, nil }

type fakeBillingRow struct{}

func (fakeBillingRow) Scan(...any) error { return nil }

type billingRow struct {
	item []any
	err  error
}

func (r billingRow) Scan(dest ...any) error {
	if r.err != nil {
		return r.err
	}
	for i := range dest {
		assignBillingValue(dest[i], r.item[i])
	}
	return nil
}

type billingRows struct {
	items [][]any
	index int
}

func (r *billingRows) Next() bool {
	return r.index < len(r.items)
}

func (r *billingRows) Scan(dest ...any) error {
	row := r.items[r.index]
	r.index++
	for i := range dest {
		assignBillingValue(dest[i], row[i])
	}
	return nil
}

func (r *billingRows) Close() error { return nil }
func (r *billingRows) Err() error   { return nil }

func assignBillingValue(dest any, value any) {
	switch target := dest.(type) {
	case *string:
		if value == nil {
			*target = ""
			return
		}
		*target = value.(string)
	case *int64:
		*target = value.(int64)
	case *int:
		*target = value.(int)
	case *time.Time:
		*target = value.(time.Time)
	case **time.Time:
		if value == nil {
			*target = nil
			return
		}
		ts := value.(time.Time)
		*target = &ts
	default:
	}
}

func TestRepo_CreateOrGetIntent(t *testing.T) {
	now := time.Date(2026, 4, 3, 10, 0, 0, 0, time.UTC)
	db := &fakeBillingDB{
		row: billingRow{item: []any{
			"bi_1", int64(2000000001), "akid_1", "nexushub", "image.generate", "trc_1",
			nil, int64(0), "created", nil, "anycap-image-generate-trc_1", nil, 0, nil,
			now, now, nil, nil,
		}},
	}
	repo := NewRepo(db)

	intent, err := repo.CreateOrGetIntent(context.Background(), model.BillingIntent{
		ID:             "bi_1",
		UserID:         "2000000001",
		APIKeyID:       "akid_1",
		Provider:       "nexushub",
		Capability:     "image.generate",
		TraceID:        "trc_1",
		BillingStatus:  model.BillingStatusCreated,
		DeductSourceID: "anycap-image-generate-trc_1",
		CreatedAt:      now,
		UpdatedAt:      now,
	})
	if err != nil {
		t.Fatalf("CreateOrGetIntent() error = %v", err)
	}
	if intent.TraceID != "trc_1" || intent.DeductSourceID != "anycap-image-generate-trc_1" {
		t.Fatalf("unexpected intent: %+v", intent)
	}
	if got, ok := db.args[1].(int64); !ok || got != 2000000001 {
		t.Fatalf("expected bigint user_id arg 2000000001, got %#v", db.args[1])
	}
}

func TestRepo_RecordProviderSuccess(t *testing.T) {
	db := &fakeBillingDB{}
	repo := NewRepo(db)
	now := time.Date(2026, 4, 3, 10, 0, 0, 0, time.UTC)

	err := repo.RecordProviderSuccess(context.Background(), model.BillingIntentProviderSuccessUpdate{
		Provider:       "nexushub",
		TraceID:        "trc_1",
		ProviderTaskID: "atomic_1",
		ProviderStatus: "success",
		CreditCost:     3,
		UpdatedAt:      now,
	})
	if err != nil {
		t.Fatalf("RecordProviderSuccess() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected update query to be executed")
	}
	if got, ok := db.args[0].(string); !ok || got != "atomic_1" {
		t.Fatalf("expected provider_task_id atomic_1, got %#v", db.args[0])
	}
}

func TestRepo_ListRecoverableIntents(t *testing.T) {
	now := time.Date(2026, 4, 3, 10, 0, 0, 0, time.UTC)
	db := &fakeBillingDB{
		rows: &billingRows{items: [][]any{
			{
				"bi_1", int64(2000000001), "akid_1", "nexushub", "image.generate", "trc_1",
				"atomic_1", int64(3), "provider_succeeded_pending_deduct", "success",
				"anycap-image-generate-trc_1", nil, 0, nil, now.Add(-time.Minute), now.Add(-time.Minute), nil, nil,
			},
			{
				"bi_2", int64(2000000001), "", "nexushub", "video.generate", "trc_2",
				nil, int64(0), "uncertain_retryable", "", "anycap-video-generate-trc_2",
				"trace lookup 404", 1, now.Add(2 * time.Minute), now.Add(-2 * time.Minute), now.Add(-time.Minute), nil, nil,
			},
		}},
	}
	repo := NewRepo(db)

	items, err := repo.ListRecoverableIntents(context.Background(), now, 10)
	if err != nil {
		t.Fatalf("ListRecoverableIntents() error = %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 recoverable intents, got %+v", items)
	}
	if items[0].ProviderTaskID != "atomic_1" || items[1].TraceID != "trc_2" {
		t.Fatalf("unexpected items: %+v", items)
	}
}
