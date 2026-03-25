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
		UserID:     "user-1",
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
}
