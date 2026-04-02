package paymentevents

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/sqlstore"
)

type fakeRepoDB struct {
	query        string
	args         []any
	rowsAffected int64
	row          sqlstore.Row
}

func (f *fakeRepoDB) ExecContext(_ context.Context, query string, args ...any) (sqlstore.Result, error) {
	f.query = query
	f.args = args
	return fakeRepoResult{rowsAffected: f.rowsAffected}, nil
}

func (f *fakeRepoDB) QueryContext(context.Context, string, ...any) (sqlstore.Rows, error) {
	return fakeRepoRows{}, nil
}

func (f *fakeRepoDB) QueryRowContext(_ context.Context, query string, args ...any) sqlstore.Row {
	f.query = query
	f.args = args
	if f.row != nil {
		return f.row
	}
	return fakeReceiptRow{err: errors.New("unexpected QueryRowContext")}
}

type fakeRepoResult struct {
	rowsAffected int64
}

func (r fakeRepoResult) RowsAffected() (int64, error) { return r.rowsAffected, nil }

type fakeRepoRows struct{}

func (fakeRepoRows) Next() bool        { return false }
func (fakeRepoRows) Scan(...any) error { return nil }
func (fakeRepoRows) Close() error      { return nil }
func (fakeRepoRows) Err() error        { return nil }

type fakeReceiptRow struct {
	receipt model.PaymentEventReceipt
	err     error
}

func (r fakeReceiptRow) Scan(dest ...any) error {
	if r.err != nil {
		return r.err
	}
	values := []any{
		r.receipt.EventKey,
		r.receipt.EventType,
		r.receipt.BizID,
		r.receipt.UserID,
		r.receipt.Status,
		[]byte(r.receipt.Payload),
		r.receipt.RewardID,
		r.receipt.SessionID,
		r.receipt.LastError,
		r.receipt.CreatedAt,
		r.receipt.UpdatedAt,
		r.receipt.ProcessedAt,
	}
	for i := range dest {
		switch target := dest[i].(type) {
		case *string:
			*target = values[i].(string)
		case *int64:
			*target = values[i].(int64)
		case *[]byte:
			*target = values[i].([]byte)
		case *time.Time:
			*target = values[i].(time.Time)
		case **time.Time:
			*target = values[i].(*time.Time)
		default:
			return errors.New("unsupported scan target")
		}
	}
	return nil
}

func TestRepo_CreateIfAbsent_InsertsNewReceipt(t *testing.T) {
	db := &fakeRepoDB{rowsAffected: 1}
	repo := NewRepo(db)

	created, err := repo.CreateIfAbsent(context.Background(), model.PaymentEventReceipt{
		EventKey:  "credits_granted:biz:anycap:reward:555",
		EventType: model.PaymentEventTypeCreditsGranted,
		BizID:     "anycap",
		UserID:    456,
		Status:    model.PaymentEventReceiptStatusPending,
		Payload:   json.RawMessage(`{"credit_reward":{"id":555}}`),
		RewardID:  555,
	})
	if err != nil {
		t.Fatalf("CreateIfAbsent() error = %v", err)
	}
	if !created {
		t.Fatal("expected receipt insert to succeed")
	}
}

func TestRepo_CreateIfAbsent_RejectsDuplicateReceipt(t *testing.T) {
	db := &fakeRepoDB{rowsAffected: 0}
	repo := NewRepo(db)

	created, err := repo.CreateIfAbsent(context.Background(), model.PaymentEventReceipt{
		EventKey: "credits_granted:biz:anycap:reward:555",
	})
	if err != nil {
		t.Fatalf("CreateIfAbsent() error = %v", err)
	}
	if created {
		t.Fatal("expected duplicate receipt to be ignored")
	}
}

func TestRepo_MarkProcessed(t *testing.T) {
	db := &fakeRepoDB{rowsAffected: 1}
	repo := NewRepo(db)

	if err := repo.MarkProcessed(context.Background(), "credits_granted:biz:anycap:reward:555", time.Date(2026, 4, 1, 10, 0, 0, 0, time.UTC)); err != nil {
		t.Fatalf("MarkProcessed() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected update query to be executed")
	}
}

func TestRepo_MarkFailed(t *testing.T) {
	db := &fakeRepoDB{rowsAffected: 1}
	repo := NewRepo(db)

	if err := repo.MarkFailed(context.Background(), "payment_failed:biz:anycap:session:cs_xxx", "decode failed", time.Date(2026, 4, 1, 10, 0, 0, 0, time.UTC)); err != nil {
		t.Fatalf("MarkFailed() error = %v", err)
	}
	if db.query == "" {
		t.Fatal("expected failed update query to be executed")
	}
}

func TestRepo_GetByEventKey(t *testing.T) {
	processedAt := time.Date(2026, 4, 1, 10, 5, 0, 0, time.UTC)
	createdAt := time.Date(2026, 4, 1, 10, 0, 0, 0, time.UTC)
	updatedAt := time.Date(2026, 4, 1, 10, 5, 0, 0, time.UTC)
	db := &fakeRepoDB{
		row: fakeReceiptRow{
			receipt: model.PaymentEventReceipt{
				EventKey:    "credits_granted:biz:anycap:reward:555",
				EventType:   model.PaymentEventTypeCreditsGranted,
				BizID:       "anycap",
				UserID:      456,
				Status:      model.PaymentEventReceiptStatusProcessed,
				Payload:     json.RawMessage(`{"credit_reward":{"id":555}}`),
				RewardID:    555,
				CreatedAt:   createdAt,
				UpdatedAt:   updatedAt,
				ProcessedAt: &processedAt,
			},
		},
	}
	repo := NewRepo(db)

	receipt, err := repo.GetByEventKey(context.Background(), "credits_granted:biz:anycap:reward:555")
	if err != nil {
		t.Fatalf("GetByEventKey() error = %v", err)
	}
	if receipt == nil {
		t.Fatal("expected receipt")
	}
	if receipt.RewardID != 555 || receipt.Status != model.PaymentEventReceiptStatusProcessed {
		t.Fatalf("unexpected receipt: %+v", receipt)
	}
}
