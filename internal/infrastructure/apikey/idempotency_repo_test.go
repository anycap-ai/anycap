package apikey

import (
	"context"
	"testing"
)

type fakeExecDB struct {
	rowsAffected int64
	query        string
	args         []any
}

func (f *fakeExecDB) ExecContext(_ context.Context, query string, args ...any) (Result, error) {
	f.query = query
	f.args = args
	return fakeResult{rowsAffected: f.rowsAffected}, nil
}

func (f *fakeExecDB) QueryRowContext(context.Context, string, ...any) Row {
	return fakeRow{}
}

type fakeResult struct {
	rowsAffected int64
}

func (r fakeResult) LastInsertId() (int64, error) { return 0, nil }
func (r fakeResult) RowsAffected() (int64, error) { return r.rowsAffected, nil }

type fakeRow struct{}

func (fakeRow) Scan(...any) error { return nil }

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
