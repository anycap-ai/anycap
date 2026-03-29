package migration

import (
	"context"
	"errors"
	"io/fs"
	"strings"
	"testing"
	"testing/fstest"

	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type migrationExecCall struct {
	query string
}

type migrationDBStub struct {
	calls []migrationExecCall
}

type brokenMigrationFS struct{}

func (d *migrationDBStub) ExecContext(_ context.Context, query string, _ ...any) (sqlstore.Result, error) {
	d.calls = append(d.calls, migrationExecCall{query: strings.TrimSpace(query)})
	return fakeResult{rowsAffected: 0}, nil
}

func (d *migrationDBStub) QueryRowContext(_ context.Context, _ string, _ ...any) sqlstore.Row {
	panic("unexpected QueryRowContext call")
}

func (d *migrationDBStub) QueryContext(_ context.Context, _ string, _ ...any) (sqlstore.Rows, error) {
	panic("unexpected QueryContext call")
}

func (brokenMigrationFS) Open(string) (fs.File, error) {
	return nil, fs.ErrNotExist
}

func (brokenMigrationFS) ReadDir(name string) ([]fs.DirEntry, error) {
	if name != "." {
		return nil, fs.ErrNotExist
	}

	return []fs.DirEntry{fakeDirEntry{name: "0001_broken.sql"}}, nil
}

func (brokenMigrationFS) ReadFile(name string) ([]byte, error) {
	if name != "0001_broken.sql" {
		return nil, fs.ErrNotExist
	}

	return nil, errors.New("boom")
}

type fakeDirEntry struct {
	name string
}

func (e fakeDirEntry) Name() string             { return e.name }
func (fakeDirEntry) IsDir() bool                { return false }
func (fakeDirEntry) Type() fs.FileMode          { return 0 }
func (fakeDirEntry) Info() (fs.FileInfo, error) { return nil, nil }

type fakeResult struct {
	rowsAffected int64
}

func (r fakeResult) RowsAffected() (int64, error) { return r.rowsAffected, nil }

func TestApplyMigrationsFS_ExecutesSQLFilesInOrder(t *testing.T) {
	migrations := fstest.MapFS{
		"0002_call_logs.sql":     {Data: []byte("SELECT 2;")},
		"0001_init_api_keys.sql": {Data: []byte("SELECT 1;")},
		"notes.txt":              {Data: []byte("skip")},
		"nested/0003_nested.sql": {Data: []byte("skip nested")},
		".hidden.sql":            {Data: []byte("SELECT hidden;")},
	}
	db := &migrationDBStub{}

	err := ApplyMigrationsFS(context.Background(), db, migrations)
	if err != nil {
		t.Fatalf("ApplyMigrationsFS() error = %v", err)
	}

	if len(db.calls) != 2 {
		t.Fatalf("expected 2 migration exec calls, got %d", len(db.calls))
	}
	if db.calls[0].query != "SELECT 1;" {
		t.Fatalf("expected first migration query SELECT 1;, got %q", db.calls[0].query)
	}
	if db.calls[1].query != "SELECT 2;" {
		t.Fatalf("expected second migration query SELECT 2;, got %q", db.calls[1].query)
	}
}

func TestApplyMigrationsFS_RejectsInvalidFS(t *testing.T) {
	err := ApplyMigrationsFS(context.Background(), &migrationDBStub{}, brokenMigrationFS{})
	if err == nil {
		t.Fatal("expected error for invalid migration fs")
	}
}
