package calllog

import (
	"context"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type fakeCallLogDB struct {
	query string
	args  []any
}

func (f *fakeCallLogDB) ExecContext(_ context.Context, query string, args ...any) (sqlstore.Result, error) {
	f.query = query
	f.args = args
	return fakeResult{rowsAffected: 1}, nil
}

func (f *fakeCallLogDB) QueryRowContext(context.Context, string, ...any) sqlstore.Row {
	return fakeRow{}
}

func (f *fakeCallLogDB) QueryContext(_ context.Context, query string, args ...any) (sqlstore.Rows, error) {
	f.query = query
	f.args = args
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

func TestCallLogDBRepo_Insert(t *testing.T) {
	db := &fakeCallLogDB{}
	repo := NewCallLogDBRepo(db)

	err := repo.Insert(context.Background(), model.CallLog{
		RequestID:  "req-1",
		UserID:     "2000000001",
		APIKeyID:   "key-1",
		Capability: "image.generate",
		Model:      "flux-dev",
		Status:     "success",
		LatencyMS:  123,
		CreditCost: 1,
	})
	if err != nil {
		t.Fatalf("Insert() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected insert query to be executed")
	}
	if len(db.args) != 9 {
		t.Fatalf("expected 9 args, got %d", len(db.args))
	}
	if got, ok := db.args[1].(int64); !ok || got != 2000000001 {
		t.Fatalf("expected bigint user_id arg 2000000001, got %#v", db.args[1])
	}
}
