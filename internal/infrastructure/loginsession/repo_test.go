package loginsession

import (
	"context"
	"database/sql"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type fakeLoginSessionDB struct {
	query   string
	args    []any
	scanFn  func(dest ...any) error
	execErr error
}

func (f *fakeLoginSessionDB) ExecContext(_ context.Context, query string, args ...any) (sqlstore.Result, error) {
	f.query = query
	f.args = args
	if f.execErr != nil {
		return nil, f.execErr
	}
	return fakeResult{rowsAffected: 1}, nil
}

func (f *fakeLoginSessionDB) QueryRowContext(_ context.Context, query string, args ...any) sqlstore.Row {
	f.query = query
	f.args = args
	return fakeLoginSessionRow{scanFn: f.scanFn}
}

func (f *fakeLoginSessionDB) QueryContext(_ context.Context, query string, args ...any) (sqlstore.Rows, error) {
	f.query = query
	f.args = args
	return fakeRows{}, nil
}

type fakeLoginSessionRow struct {
	scanFn func(dest ...any) error
}

func (r fakeLoginSessionRow) Scan(dest ...any) error {
	if r.scanFn != nil {
		return r.scanFn(dest...)
	}
	return errors.New("scanFn not configured")
}

type fakeResult struct {
	rowsAffected int64
}

func (r fakeResult) RowsAffected() (int64, error) { return r.rowsAffected, nil }

type fakeRows struct{}

func (fakeRows) Next() bool        { return false }
func (fakeRows) Scan(...any) error { return nil }
func (fakeRows) Close() error      { return nil }
func (fakeRows) Err() error        { return nil }

func TestLoginSessionRepo_CreateSession(t *testing.T) {
	db := &fakeLoginSessionDB{}
	repo := NewLoginSessionRepo(db)
	expiresAt := time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC)

	err := repo.CreateSession(context.Background(), model.LoginSession{
		ID:           "lsn-1",
		FlowType:     model.LoginFlowBrowserPoll,
		State:        "state-1",
		CodeVerifier: "verifier-1",
		RedirectURI:  "https://anycap.ai/auth/callback",
		BrowserToken: "bt-1",
		PollToken:    "pt-1",
		Status:       model.LoginSessionStatusPending,
		ExpiresAt:    expiresAt,
		CreatedAt:    time.Date(2026, 3, 25, 9, 55, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("CreateSession() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected insert query to be executed")
	}
	if len(db.args) != 19 {
		t.Fatalf("expected 19 args, got %d", len(db.args))
	}
}

func TestLoginSessionRepo_GetByID(t *testing.T) {
	expiresAt := time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC)
	createdAt := time.Date(2026, 3, 25, 9, 55, 0, 0, time.UTC)
	db := &fakeLoginSessionDB{
		scanFn: func(dest ...any) error {
			*(dest[0].(*string)) = "lsn-1"
			*(dest[1].(*string)) = model.LoginFlowBrowserPoll
			*(dest[2].(*string)) = "state-1"
			*(dest[3].(*string)) = "verifier-1"
			*(dest[4].(*string)) = "http://127.0.0.1:14565/callback"
			*(dest[5].(*string)) = ""
			*(dest[6].(*string)) = ""
			*(dest[7].(*string)) = ""
			*(dest[8].(*string)) = ""
			*(dest[9].(*sql.NullTime)) = sql.NullTime{}
			*(dest[10].(*sql.NullInt64)) = sql.NullInt64{}
			*(dest[11].(*string)) = ""
			*(dest[12].(*string)) = ""
			*(dest[13].(*string)) = ""
			*(dest[14].(*string)) = ""
			*(dest[15].(*sql.NullTime)) = sql.NullTime{}
			*(dest[16].(*string)) = model.LoginSessionStatusPending
			*(dest[17].(*time.Time)) = expiresAt
			*(dest[18].(*time.Time)) = createdAt
			return nil
		},
	}
	repo := NewLoginSessionRepo(db)

	got, err := repo.GetByID(context.Background(), "lsn-1")
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}
	if got.ID != "lsn-1" {
		t.Fatalf("expected lsn-1, got %q", got.ID)
	}
	if got.State != "state-1" {
		t.Fatalf("expected state-1, got %q", got.State)
	}
}

func TestLoginSessionRepo_GetByState(t *testing.T) {
	expiresAt := time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC)
	createdAt := time.Date(2026, 3, 25, 9, 55, 0, 0, time.UTC)
	db := &fakeLoginSessionDB{
		scanFn: func(dest ...any) error {
			*(dest[0].(*string)) = "lsn-2"
			*(dest[1].(*string)) = model.LoginFlowBrowserPoll
			*(dest[2].(*string)) = "state-2"
			*(dest[3].(*string)) = "verifier-2"
			*(dest[4].(*string)) = "http://127.0.0.1:14566/callback"
			*(dest[5].(*string)) = ""
			*(dest[6].(*string)) = ""
			*(dest[7].(*string)) = ""
			*(dest[8].(*string)) = ""
			*(dest[9].(*sql.NullTime)) = sql.NullTime{}
			*(dest[10].(*sql.NullInt64)) = sql.NullInt64{}
			*(dest[11].(*string)) = ""
			*(dest[12].(*string)) = ""
			*(dest[13].(*string)) = ""
			*(dest[14].(*string)) = ""
			*(dest[15].(*sql.NullTime)) = sql.NullTime{}
			*(dest[16].(*string)) = model.LoginSessionStatusPending
			*(dest[17].(*time.Time)) = expiresAt
			*(dest[18].(*time.Time)) = createdAt
			return nil
		},
	}
	repo := NewLoginSessionRepo(db)

	got, err := repo.GetByState(context.Background(), "state-2")
	if err != nil {
		t.Fatalf("GetByState() error = %v", err)
	}
	if got.ID != "lsn-2" {
		t.Fatalf("expected lsn-2, got %q", got.ID)
	}
}

func TestLoginSessionRepo_GetByBrowserToken(t *testing.T) {
	expiresAt := time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC)
	createdAt := time.Date(2026, 3, 25, 9, 55, 0, 0, time.UTC)
	db := &fakeLoginSessionDB{
		scanFn: func(dest ...any) error {
			*(dest[0].(*string)) = "lsn-browser"
			*(dest[1].(*string)) = model.LoginFlowBrowserPoll
			*(dest[2].(*string)) = "state-browser"
			*(dest[3].(*string)) = "verifier-browser"
			*(dest[4].(*string)) = "https://anycap.ai/auth/callback"
			*(dest[5].(*string)) = ""
			*(dest[6].(*string)) = ""
			*(dest[7].(*string)) = "bt-123"
			*(dest[8].(*string)) = "pt-123"
			*(dest[9].(*sql.NullTime)) = sql.NullTime{}
			*(dest[10].(*sql.NullInt64)) = sql.NullInt64{}
			*(dest[11].(*string)) = ""
			*(dest[12].(*string)) = ""
			*(dest[13].(*string)) = ""
			*(dest[14].(*string)) = ""
			*(dest[15].(*sql.NullTime)) = sql.NullTime{}
			*(dest[16].(*string)) = model.LoginSessionStatusPending
			*(dest[17].(*time.Time)) = expiresAt
			*(dest[18].(*time.Time)) = createdAt
			return nil
		},
	}
	repo := NewLoginSessionRepo(db)

	got, err := repo.GetByBrowserToken(context.Background(), "bt-123")
	if err != nil {
		t.Fatalf("GetByBrowserToken() error = %v", err)
	}
	if got.ID != "lsn-browser" {
		t.Fatalf("expected lsn-browser, got %q", got.ID)
	}
	if got.BrowserToken != "bt-123" {
		t.Fatalf("expected browser token bt-123, got %q", got.BrowserToken)
	}
	if got.PollToken != "pt-123" {
		t.Fatalf("expected poll token pt-123, got %q", got.PollToken)
	}
}

func TestLoginSessionRepo_MarkAuthorized(t *testing.T) {
	db := &fakeLoginSessionDB{}
	repo := NewLoginSessionRepo(db)

	err := repo.MarkAuthorized(context.Background(), "lsn-3", model.AuthUser{
		UserID:  "auth0|user-1",
		Email:   "user@example.com",
		Name:    "Demo User",
		Picture: "https://example.com/avatar.png",
	}, time.Date(2026, 3, 25, 10, 1, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("MarkAuthorized() error = %v", err)
	}
	if len(db.args) != 7 {
		t.Fatalf("expected 7 args, got %d", len(db.args))
	}
}

func TestLoginSessionRepo_MarkCompleted(t *testing.T) {
	db := &fakeLoginSessionDB{}
	repo := NewLoginSessionRepo(db)

	err := repo.MarkCompleted(context.Background(), "lsn-4", "key-1", time.Date(2026, 3, 25, 10, 2, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("MarkCompleted() error = %v", err)
	}
	if len(db.args) != 4 {
		t.Fatalf("expected 4 args, got %d", len(db.args))
	}
}

func TestLoginSessionRepo_MarkVerified(t *testing.T) {
	db := &fakeLoginSessionDB{}
	repo := NewLoginSessionRepo(db)

	err := repo.MarkVerified(context.Background(), "lsn-5", model.AuthUser{UserID: "2000000001"}, time.Date(2026, 3, 25, 10, 3, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("MarkVerified() error = %v", err)
	}
	if len(db.args) != 7 {
		t.Fatalf("expected 7 args, got %d", len(db.args))
	}
}

func TestLoginSessionRepo_MarkPolled(t *testing.T) {
	db := &fakeLoginSessionDB{}
	repo := NewLoginSessionRepo(db)

	err := repo.MarkPolled(context.Background(), "lsn-6", time.Date(2026, 3, 25, 10, 4, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("MarkPolled() error = %v", err)
	}
	if len(db.args) != 2 {
		t.Fatalf("expected 2 args, got %d", len(db.args))
	}
}
