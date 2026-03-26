package apikey

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeAPIKeyDB struct {
	query string
	args  []any
	row   Row
}

func (f *fakeAPIKeyDB) ExecContext(_ context.Context, query string, args ...any) (Result, error) {
	f.query = query
	f.args = args
	return fakeResult{rowsAffected: 1}, nil
}

func (f *fakeAPIKeyDB) QueryRowContext(_ context.Context, query string, args ...any) Row {
	f.query = query
	f.args = args
	return f.row
}

func (f *fakeAPIKeyDB) QueryContext(_ context.Context, query string, args ...any) (Rows, error) {
	f.query = query
	f.args = args
	return fakeRows{}, nil
}

type scanRow struct {
	scan func(dest ...any) error
}

func (r scanRow) Scan(dest ...any) error { return r.scan(dest...) }

type fakeRows struct{}

func (fakeRows) Next() bool              { return false }
func (fakeRows) Scan(...any) error       { return nil }
func (fakeRows) Close() error            { return nil }
func (fakeRows) Err() error              { return nil }

func TestAPIKeyRepo_Insert(t *testing.T) {
	db := &fakeAPIKeyDB{}
	repo := NewAPIKeyRepo(db)
	now := time.Date(2026, 3, 24, 12, 0, 0, 0, time.UTC)

	err := repo.Insert(context.Background(), model.APIKey{
		ID:        "key-1",
		UserID:    "2000000001",
		Name:      "cli",
		KeyPrefix: "ak_test",
		KeyHash:   "hash",
		Status:    ActiveStatus(),
		CreatedAt: now,
	})
	if err != nil {
		t.Fatalf("Insert() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected insert query to be executed")
	}
	if len(db.args) != 8 {
		t.Fatalf("expected 8 args, got %d", len(db.args))
	}
	if got, ok := db.args[1].(int64); !ok || got != 2000000001 {
		t.Fatalf("expected bigint user_id arg 2000000001, got %#v", db.args[1])
	}
}

func TestAPIKeyRepo_FindByPrefix(t *testing.T) {
	now := time.Date(2026, 3, 24, 12, 0, 0, 0, time.UTC)
	db := &fakeAPIKeyDB{row: scanRow{scan: func(dest ...any) error {
		*(dest[0].(*string)) = "key-1"
		*(dest[1].(*int64)) = 2000000001
		*(dest[2].(*string)) = "cli"
		*(dest[3].(*string)) = "ak_test"
		*(dest[4].(*string)) = "hash"
		*(dest[5].(*string)) = ActiveStatus()
		*(dest[6].(**time.Time)) = nil
		*(dest[7].(**time.Time)) = nil
		*(dest[8].(*time.Time)) = now
		return nil
	}}}
	repo := NewAPIKeyRepo(db)

	key, err := repo.FindByPrefix(context.Background(), "ak_test")
	if err != nil {
		t.Fatalf("FindByPrefix() error = %v", err)
	}
	if key.ID != "key-1" || key.UserID != "2000000001" {
		t.Fatalf("unexpected key: %+v", key)
	}
}

func TestAPIKeyRepo_Revoke(t *testing.T) {
	db := &fakeAPIKeyDB{}
	repo := NewAPIKeyRepo(db)

	if err := repo.Revoke(context.Background(), "key-1"); err != nil {
		t.Fatalf("Revoke() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected revoke query to be executed")
	}
}
