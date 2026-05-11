package postgres

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type fakeAnonymousTrialDB struct {
	tx *fakeAnonymousTrialTx
}

func (f *fakeAnonymousTrialDB) BeginTx(context.Context, *sql.TxOptions) (sqlstore.Tx, error) {
	return f.tx, nil
}

func (f *fakeAnonymousTrialDB) ExecContext(context.Context, string, ...any) (sqlstore.Result, error) {
	panic("unexpected root ExecContext")
}

func (f *fakeAnonymousTrialDB) QueryContext(context.Context, string, ...any) (sqlstore.Rows, error) {
	panic("unexpected root QueryContext")
}

func (f *fakeAnonymousTrialDB) QueryRowContext(context.Context, string, ...any) sqlstore.Row {
	panic("unexpected root QueryRowContext")
}

type fakeAnonymousTrialTx struct {
	insertedRows int64
	count        int
	resetAt      time.Time
	updateArgs   []any
	committed    bool
	rolledBack   bool
}

func (f *fakeAnonymousTrialTx) ExecContext(_ context.Context, query string, args ...any) (sqlstore.Result, error) {
	switch {
	case strings.Contains(query, "INSERT INTO anonymous_trial_buckets"):
		return fakeAnonymousTrialResult{rowsAffected: f.insertedRows}, nil
	case strings.Contains(query, "UPDATE anonymous_trial_buckets"):
		f.updateArgs = append([]any(nil), args...)
		return fakeAnonymousTrialResult{rowsAffected: 1}, nil
	default:
		return nil, errors.New("unexpected exec query")
	}
}

func (f *fakeAnonymousTrialTx) QueryContext(context.Context, string, ...any) (sqlstore.Rows, error) {
	panic("unexpected QueryContext")
}

func (f *fakeAnonymousTrialTx) QueryRowContext(_ context.Context, query string, _ ...any) sqlstore.Row {
	if !strings.Contains(query, "FOR UPDATE") {
		return fakeAnonymousTrialRow{err: errors.New("unexpected query")}
	}
	return fakeAnonymousTrialRow{count: f.count, resetAt: f.resetAt}
}

func (f *fakeAnonymousTrialTx) Commit() error {
	f.committed = true
	return nil
}

func (f *fakeAnonymousTrialTx) Rollback() error {
	f.rolledBack = true
	return nil
}

type fakeAnonymousTrialResult struct {
	rowsAffected int64
}

func (f fakeAnonymousTrialResult) RowsAffected() (int64, error) {
	return f.rowsAffected, nil
}

type fakeAnonymousTrialRow struct {
	count   int
	resetAt time.Time
	err     error
}

func (f fakeAnonymousTrialRow) Scan(dest ...any) error {
	if f.err != nil {
		return f.err
	}
	*(dest[0].(*int)) = f.count
	*(dest[1].(*time.Time)) = f.resetAt
	return nil
}

func TestAnonymousTrialRepo_AllowsFirstInsertedBucket(t *testing.T) {
	now := time.Date(2026, 5, 9, 12, 0, 0, 0, time.UTC)
	tx := &fakeAnonymousTrialTx{insertedRows: 1}
	repo := NewAnonymousTrialRepo(&fakeAnonymousTrialDB{tx: tx})

	state, err := repo.ConsumeAnonymousTrial(context.Background(), "install|ip", now, 3, 30*24*time.Hour)
	if err != nil {
		t.Fatalf("ConsumeAnonymousTrial() error = %v", err)
	}
	if !state.Allowed || state.Count != 1 || state.ResetAt.IsZero() {
		t.Fatalf("expected first request allowed with count 1, got %#v", state)
	}
	if !tx.committed || len(tx.updateArgs) != 0 {
		t.Fatalf("expected insert-only commit, committed=%v updateArgs=%#v", tx.committed, tx.updateArgs)
	}
}

func TestAnonymousTrialRepo_IncrementsExistingBucket(t *testing.T) {
	now := time.Date(2026, 5, 9, 12, 0, 0, 0, time.UTC)
	tx := &fakeAnonymousTrialTx{insertedRows: 0, count: 2, resetAt: now.Add(time.Hour)}
	repo := NewAnonymousTrialRepo(&fakeAnonymousTrialDB{tx: tx})

	state, err := repo.ConsumeAnonymousTrial(context.Background(), "install|ip", now, 3, 30*24*time.Hour)
	if err != nil {
		t.Fatalf("ConsumeAnonymousTrial() error = %v", err)
	}
	if !state.Allowed || state.Count != 3 {
		t.Fatalf("expected third request allowed with count 3, got %#v", state)
	}
	if len(tx.updateArgs) == 0 {
		t.Fatal("expected existing bucket update")
	}
}

func TestAnonymousTrialRepo_BlocksExhaustedBucket(t *testing.T) {
	now := time.Date(2026, 5, 9, 12, 0, 0, 0, time.UTC)
	tx := &fakeAnonymousTrialTx{insertedRows: 0, count: 3, resetAt: now.Add(time.Hour)}
	repo := NewAnonymousTrialRepo(&fakeAnonymousTrialDB{tx: tx})

	state, err := repo.ConsumeAnonymousTrial(context.Background(), "install|ip", now, 3, 30*24*time.Hour)
	if err != nil {
		t.Fatalf("ConsumeAnonymousTrial() error = %v", err)
	}
	if state.Allowed || state.Count != 3 {
		t.Fatalf("expected exhausted bucket blocked at count 3, got %#v", state)
	}
	if len(tx.updateArgs) != 0 {
		t.Fatalf("expected exhausted bucket to avoid increment, got update args %#v", tx.updateArgs)
	}
}

func TestAnonymousTrialRepo_ResetsExpiredBucket(t *testing.T) {
	now := time.Date(2026, 5, 9, 12, 0, 0, 0, time.UTC)
	tx := &fakeAnonymousTrialTx{insertedRows: 0, count: 3, resetAt: now.Add(-time.Second)}
	repo := NewAnonymousTrialRepo(&fakeAnonymousTrialDB{tx: tx})

	state, err := repo.ConsumeAnonymousTrial(context.Background(), "install|ip", now, 3, 30*24*time.Hour)
	if err != nil {
		t.Fatalf("ConsumeAnonymousTrial() error = %v", err)
	}
	if !state.Allowed || state.Count != 1 || !state.ResetAt.After(now) {
		t.Fatalf("expected expired bucket reset to allowed count 1, got %#v", state)
	}
	if len(tx.updateArgs) == 0 {
		t.Fatal("expected expired bucket update")
	}
}
