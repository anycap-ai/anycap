package apikey

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type fakeAPIKeyDB struct {
	query string
	args  []any
	row   sqlstore.Row
	rows  sqlstore.Rows
}

func (f *fakeAPIKeyDB) ExecContext(_ context.Context, query string, args ...any) (sqlstore.Result, error) {
	f.query = query
	f.args = args
	return fakeResult{rowsAffected: 1}, nil
}

func (f *fakeAPIKeyDB) QueryRowContext(_ context.Context, query string, args ...any) sqlstore.Row {
	f.query = query
	f.args = args
	return f.row
}

func (f *fakeAPIKeyDB) QueryContext(_ context.Context, query string, args ...any) (sqlstore.Rows, error) {
	f.query = query
	f.args = args
	if f.rows != nil {
		return f.rows, nil
	}
	return &fakeRows{}, nil
}

type scanRow struct {
	scan func(dest ...any) error
}

func (r scanRow) Scan(dest ...any) error { return r.scan(dest...) }

type fakeRows struct {
	items [][]any
	index int
}

func (r *fakeRows) Next() bool {
	return r.index < len(r.items)
}

func (r *fakeRows) Scan(dest ...any) error {
	row := r.items[r.index]
	r.index++
	for i := range dest {
		switch target := dest[i].(type) {
		case *string:
			*target = row[i].(string)
		case *int64:
			*target = row[i].(int64)
		case **time.Time:
			if row[i] == nil {
				*target = nil
				continue
			}
			value := row[i].(time.Time)
			*target = &value
		case *time.Time:
			*target = row[i].(time.Time)
		default:
			return nil
		}
	}
	return nil
}

func (r *fakeRows) Close() error { return nil }
func (r *fakeRows) Err() error   { return nil }

type fakeResult struct {
	rowsAffected int64
}

func (r fakeResult) RowsAffected() (int64, error) { return r.rowsAffected, nil }

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
		Status:    model.APIKeyStatusActive,
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
		*(dest[5].(*string)) = model.APIKeyStatusActive
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

func TestAPIKeyRepo_ListByUserID(t *testing.T) {
	now := time.Date(2026, 3, 30, 12, 0, 0, 0, time.UTC)
	db := &fakeAPIKeyDB{}
	db.rows = &fakeRows{
		items: [][]any{
			{"key-1", int64(2000000001), "cli", "ak_test", "hash", model.APIKeyStatusActive, nil, nil, now, nil},
		},
	}
	repo := NewAPIKeyRepo(db)

	keys, err := repo.ListByUserID(context.Background(), "2000000001")
	if err != nil {
		t.Fatalf("ListByUserID() error = %v", err)
	}
	if len(keys) != 1 || keys[0].ID != "key-1" {
		t.Fatalf("unexpected keys: %+v", keys)
	}
}

func TestAPIKeyRepo_DisableByUserID(t *testing.T) {
	db := &fakeAPIKeyDB{}
	repo := NewAPIKeyRepo(db)

	if err := repo.DisableByUserID(context.Background(), "2000000001", "key-1"); err != nil {
		t.Fatalf("DisableByUserID() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected disable query to be executed")
	}
}

func TestAPIKeyRepo_SoftDeleteByUserID(t *testing.T) {
	db := &fakeAPIKeyDB{}
	repo := NewAPIKeyRepo(db)

	if err := repo.SoftDeleteByUserID(context.Background(), "2000000001", "key-1"); err != nil {
		t.Fatalf("SoftDeleteByUserID() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected soft delete query to be executed")
	}
}
