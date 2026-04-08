package postgres

import (
	"context"
	"database/sql"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type fakeAgentControlDB struct {
	query   string
	args    []any
	scanFn  func(dest ...any) error
	rowFns  []func(dest ...any) error
	execErr error
}

func (f *fakeAgentControlDB) ExecContext(_ context.Context, query string, args ...any) (sqlstore.Result, error) {
	f.query = query
	f.args = args
	if f.execErr != nil {
		return nil, f.execErr
	}
	return fakeAgentControlResult{rowsAffected: 1}, nil
}

func (f *fakeAgentControlDB) QueryRowContext(_ context.Context, query string, args ...any) sqlstore.Row {
	f.query = query
	f.args = args
	return fakeAgentControlRow{scanFn: f.scanFn}
}

func (f *fakeAgentControlDB) QueryContext(_ context.Context, query string, args ...any) (sqlstore.Rows, error) {
	f.query = query
	f.args = args
	return &fakeAgentControlRows{rowFns: f.rowFns}, nil
}

type fakeAgentControlResult struct {
	rowsAffected int64
}

func (r fakeAgentControlResult) RowsAffected() (int64, error) { return r.rowsAffected, nil }

type fakeAgentControlRow struct {
	scanFn func(dest ...any) error
}

func (r fakeAgentControlRow) Scan(dest ...any) error {
	if r.scanFn != nil {
		return r.scanFn(dest...)
	}
	return errors.New("scanFn not configured")
}

type fakeAgentControlRows struct {
	rowFns []func(dest ...any) error
	index  int
}

func (r *fakeAgentControlRows) Next() bool {
	return r.index < len(r.rowFns)
}

func (r *fakeAgentControlRows) Scan(dest ...any) error {
	if r.index >= len(r.rowFns) {
		return sql.ErrNoRows
	}
	fn := r.rowFns[r.index]
	r.index++
	if fn != nil {
		return fn(dest...)
	}
	return nil
}

func (*fakeAgentControlRows) Close() error { return nil }
func (*fakeAgentControlRows) Err() error   { return nil }

func TestAgentControlRepo_CreateIMBindToken(t *testing.T) {
	now := time.Date(2026, 4, 8, 10, 0, 0, 0, time.UTC)
	expiresAt := now.Add(10 * time.Minute)
	db := &fakeAgentControlDB{
		scanFn: func(dest ...any) error {
			*(dest[0].(*int64)) = 11
			*(dest[1].(*int64)) = 2001
			*(dest[2].(*string)) = "bind-token"
			*(dest[3].(*string)) = model.IMPlatformFeishu
			*(dest[4].(*time.Time)) = expiresAt
			*(dest[5].(*sql.NullTime)) = sql.NullTime{}
			*(dest[6].(*time.Time)) = now
			return nil
		},
	}
	repo := NewAgentControlRepo(db)

	item, err := repo.CreateIMBindToken(context.Background(), model.IMBindToken{
		UserID:    "2001",
		Token:     "bind-token",
		Platform:  model.IMPlatformFeishu,
		ExpiresAt: expiresAt,
		CreatedAt: now,
	})
	if err != nil {
		t.Fatalf("CreateIMBindToken() error = %v", err)
	}
	if item.ID != 11 || item.Token != "bind-token" {
		t.Fatalf("unexpected bind token: %+v", item)
	}
	if got, ok := db.args[0].(string); !ok || got == "" {
		t.Fatalf("expected external_id arg, got %#v", db.args[0])
	}
}

func TestAgentControlRepo_GetActiveBindingByPlatformSender(t *testing.T) {
	now := time.Date(2026, 4, 8, 11, 0, 0, 0, time.UTC)
	lastBoundAt := now.Add(-time.Minute)
	db := &fakeAgentControlDB{
		scanFn: func(dest ...any) error {
			*(dest[0].(*int64)) = 21
			*(dest[1].(*int64)) = 2001
			*(dest[2].(*string)) = model.IMPlatformFeishu
			*(dest[3].(*string)) = "bot-1"
			*(dest[4].(*string)) = "chat-1"
			*(dest[5].(*string)) = "sender-1"
			*(dest[6].(*string)) = model.IMBindingStatusActive
			*(dest[7].(*time.Time)) = now
			*(dest[8].(*time.Time)) = now
			*(dest[9].(*sql.NullTime)) = sql.NullTime{Time: lastBoundAt, Valid: true}
			return nil
		},
	}
	repo := NewAgentControlRepo(db)

	item, err := repo.GetActiveByPlatformSender(context.Background(), model.IMPlatformFeishu, "bot-1", "sender-1")
	if err != nil {
		t.Fatalf("GetActiveByPlatformSender() error = %v", err)
	}
	if item == nil || item.SenderID != "sender-1" {
		t.Fatalf("unexpected binding: %+v", item)
	}
	if item.LastBoundAt == nil || !item.LastBoundAt.Equal(lastBoundAt) {
		t.Fatalf("expected last bound at %v, got %+v", lastBoundAt, item.LastBoundAt)
	}
}

func TestAgentControlRepo_CreateAndUpdateTask(t *testing.T) {
	now := time.Date(2026, 4, 8, 12, 0, 0, 0, time.UTC)
	dispatchedAt := now.Add(time.Minute)
	db := &fakeAgentControlDB{
		scanFn: func(dest ...any) error {
			*(dest[0].(*int64)) = 31
			*(dest[1].(*int64)) = 2001
			*(dest[2].(*int64)) = 41
			*(dest[3].(*sql.NullInt64)) = sql.NullInt64{}
			*(dest[4].(*string)) = model.IMPlatformFeishu
			*(dest[5].(*string)) = model.AgentIntentExecuteTask
			*(dest[6].(*string)) = "fix parser panic"
			*(dest[7].(*sql.NullString)) = sql.NullString{}
			*(dest[8].(*sql.NullString)) = sql.NullString{}
			*(dest[9].(*string)) = model.AgentTaskStatusQueued
			*(dest[10].(*sql.NullString)) = sql.NullString{}
			*(dest[11].(*sql.NullTime)) = sql.NullTime{}
			*(dest[12].(*sql.NullTime)) = sql.NullTime{}
			*(dest[13].(*sql.NullTime)) = sql.NullTime{}
			*(dest[14].(*time.Time)) = now
			*(dest[15].(*time.Time)) = now
			return nil
		},
	}
	repo := NewAgentControlRepo(db)

	item, err := repo.CreateTask(context.Background(), model.AgentTask{
		UserID:    "2001",
		RunnerID:  41,
		Platform:  model.IMPlatformFeishu,
		Intent:    model.AgentIntentExecuteTask,
		TaskText:  "fix parser panic",
		Status:    model.AgentTaskStatusQueued,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		t.Fatalf("CreateTask() error = %v", err)
	}
	if item.ID != 31 || item.Status != model.AgentTaskStatusQueued {
		t.Fatalf("unexpected task: %+v", item)
	}

	db.scanFn = func(dest ...any) error {
		*(dest[0].(*int64)) = 31
		*(dest[1].(*int64)) = 2001
		*(dest[2].(*int64)) = 41
		*(dest[3].(*sql.NullInt64)) = sql.NullInt64{}
		*(dest[4].(*string)) = model.IMPlatformFeishu
		*(dest[5].(*string)) = model.AgentIntentExecuteTask
		*(dest[6].(*string)) = "fix parser panic"
		*(dest[7].(*sql.NullString)) = sql.NullString{}
		*(dest[8].(*sql.NullString)) = sql.NullString{}
		*(dest[9].(*string)) = model.AgentTaskStatusDispatched
		*(dest[10].(*sql.NullString)) = sql.NullString{}
		*(dest[11].(*sql.NullTime)) = sql.NullTime{Time: dispatchedAt, Valid: true}
		*(dest[12].(*sql.NullTime)) = sql.NullTime{}
		*(dest[13].(*sql.NullTime)) = sql.NullTime{}
		*(dest[14].(*time.Time)) = now
		*(dest[15].(*time.Time)) = dispatchedAt
		return nil
	}

	updated, err := repo.UpdateTask(context.Background(), model.AgentTaskUpdate{
		ID:           31,
		Status:       model.AgentTaskStatusDispatched,
		DispatchedAt: &dispatchedAt,
		UpdatedAt:    dispatchedAt,
	})
	if err != nil {
		t.Fatalf("UpdateTask() error = %v", err)
	}
	if updated.Status != model.AgentTaskStatusDispatched {
		t.Fatalf("expected dispatched status, got %+v", updated)
	}
	if updated.DispatchedAt == nil || !updated.DispatchedAt.Equal(dispatchedAt) {
		t.Fatalf("expected dispatched at %v, got %+v", dispatchedAt, updated.DispatchedAt)
	}
}

func TestAgentControlRepo_CreateConversation(t *testing.T) {
	now := time.Date(2026, 4, 8, 13, 0, 0, 0, time.UTC)
	db := &fakeAgentControlDB{
		scanFn: func(dest ...any) error {
			*(dest[0].(*int64)) = 41
			*(dest[1].(*int64)) = 2001
			*(dest[2].(*string)) = model.IMPlatformFeishu
			*(dest[3].(*string)) = "bot-1"
			*(dest[4].(*string)) = "chat-1"
			*(dest[5].(*int64)) = 51
			*(dest[6].(*string)) = "codex"
			*(dest[7].(*string)) = model.AgentConversationStatusActive
			*(dest[8].(*sql.NullInt64)) = sql.NullInt64{}
			*(dest[9].(*time.Time)) = now
			*(dest[10].(*time.Time)) = now
			return nil
		},
	}
	repo := NewAgentControlRepo(db)

	item, err := repo.CreateConversation(context.Background(), model.AgentConversation{
		UserID:    "2001",
		Platform:  model.IMPlatformFeishu,
		BotID:     "bot-1",
		ChatID:    "chat-1",
		RunnerID:  51,
		Agent:     "codex",
		Status:    model.AgentConversationStatusActive,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		t.Fatalf("CreateConversation() error = %v", err)
	}
	if item.ID != 41 || item.RunnerID != 51 || item.Status != model.AgentConversationStatusActive {
		t.Fatalf("unexpected conversation: %+v", item)
	}
}

func TestAgentControlRepo_CreateSession(t *testing.T) {
	now := time.Date(2026, 4, 8, 13, 30, 0, 0, time.UTC)
	parentID := int64(61)
	startedAt := now.Add(time.Minute)
	db := &fakeAgentControlDB{
		scanFn: func(dest ...any) error {
			*(dest[0].(*int64)) = 71
			*(dest[1].(*int64)) = 2001
			*(dest[2].(*int64)) = 41
			*(dest[3].(*sql.NullInt64)) = sql.NullInt64{Int64: parentID, Valid: true}
			*(dest[4].(*int64)) = 51
			*(dest[5].(*string)) = "codex"
			*(dest[6].(*string)) = model.AgentSessionModeContinue
			*(dest[7].(*sql.NullString)) = sql.NullString{String: "继续修复", Valid: true}
			*(dest[8].(*sql.NullString)) = sql.NullString{}
			*(dest[9].(*string)) = model.AgentSessionStatusRunning
			*(dest[10].(*sql.NullString)) = sql.NullString{String: "proc-1", Valid: true}
			*(dest[11].(*sql.NullTime)) = sql.NullTime{Time: startedAt, Valid: true}
			*(dest[12].(*sql.NullTime)) = sql.NullTime{}
			*(dest[13].(*time.Time)) = now
			*(dest[14].(*time.Time)) = now
			return nil
		},
	}
	repo := NewAgentControlRepo(db)
	userMessage := "继续修复"
	executorRef := "proc-1"

	item, err := repo.CreateSession(context.Background(), model.AgentSession{
		UserID:          "2001",
		ConversationID:  41,
		ParentSessionID: &parentID,
		RunnerID:        51,
		Agent:           "codex",
		Mode:            model.AgentSessionModeContinue,
		UserMessage:     &userMessage,
		Status:          model.AgentSessionStatusRunning,
		ExecutorRef:     &executorRef,
		StartedAt:       &startedAt,
		CreatedAt:       now,
		UpdatedAt:       now,
	})
	if err != nil {
		t.Fatalf("CreateSession() error = %v", err)
	}
	if item.ID != 71 || item.ParentSessionID == nil || *item.ParentSessionID != parentID {
		t.Fatalf("unexpected session: %+v", item)
	}
}

func TestAgentControlRepo_ListUndeliveredMailboxMessages(t *testing.T) {
	now := time.Date(2026, 4, 8, 14, 0, 0, 0, time.UTC)
	db := &fakeAgentControlDB{
		rowFns: []func(dest ...any) error{
			func(dest ...any) error {
				*(dest[0].(*int64)) = 81
				*(dest[1].(*int64)) = 41
				*(dest[2].(*int64)) = 71
				*(dest[3].(*string)) = model.AgentMailboxSourceToolResult
				*(dest[4].(*string)) = "{\"summary\":\"done\"}"
				*(dest[5].(*sql.NullInt64)) = sql.NullInt64{}
				*(dest[6].(*time.Time)) = now
				return nil
			},
		},
	}
	repo := NewAgentControlRepo(db)

	items, err := repo.ListUndeliveredMailboxMessages(context.Background(), 41)
	if err != nil {
		t.Fatalf("ListUndeliveredMailboxMessages() error = %v", err)
	}
	if len(items) != 1 || items[0].ID != 81 || items[0].SourceType != model.AgentMailboxSourceToolResult {
		t.Fatalf("unexpected mailbox messages: %+v", items)
	}
}
