package apikey

import (
	"context"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeCallLogDB struct {
	query string
	args  []any
}

func (f *fakeCallLogDB) ExecContext(_ context.Context, query string, args ...any) (Result, error) {
	f.query = query
	f.args = args
	return fakeResult{rowsAffected: 1}, nil
}

func (f *fakeCallLogDB) QueryRowContext(context.Context, string, ...any) Row {
	return fakeRow{}
}

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
