package idempotency

import (
	"context"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type fakeExecDB struct {
	rowsAffected int64
	query        string
	args         []any
}

func (f *fakeExecDB) ExecContext(_ context.Context, query string, args ...any) (sqlstore.Result, error) {
	f.query = query
	f.args = args
	return fakeResult{rowsAffected: f.rowsAffected}, nil
}

func (f *fakeExecDB) QueryRowContext(context.Context, string, ...any) sqlstore.Row {
	return fakeRow{}
}

func (f *fakeExecDB) QueryContext(_ context.Context, query string, args ...any) (sqlstore.Rows, error) {
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

func TestIdempotencyRepo_ClaimOnce(t *testing.T) {
	db := &fakeExecDB{rowsAffected: 1}
	repo := NewIdempotencyRepo(db)

	claimed, err := repo.Claim(context.Background(), "credit", "req-1")
	if err != nil {
		t.Fatalf("Claim() error = %v", err)
	}
	if !claimed {
		t.Fatal("expected first claim to succeed")
	}
}

func TestIdempotencyRepo_DuplicateClaim(t *testing.T) {
	db := &fakeExecDB{rowsAffected: 0}
	repo := NewIdempotencyRepo(db)

	claimed, err := repo.Claim(context.Background(), "credit", "req-1")
	if err != nil {
		t.Fatalf("Claim() error = %v", err)
	}
	if claimed {
		t.Fatal("expected duplicate claim to be rejected")
	}
}

func TestIdempotencyRepo_Release(t *testing.T) {
	db := &fakeExecDB{}
	repo := NewIdempotencyRepo(db)

	if err := repo.Release(context.Background(), "credit", "req-1"); err != nil {
		t.Fatalf("Release() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected release query to be executed")
	}
	if len(db.args) != 2 || db.args[0] != "credit" || db.args[1] != "req-1" {
		t.Fatalf("unexpected release args: %#v", db.args)
	}
}
