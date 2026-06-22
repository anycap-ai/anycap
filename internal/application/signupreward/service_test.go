package signupreward

import (
	"context"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeCreditClient struct {
	grants []string
	err    error
}

func (f *fakeCreditClient) GetBalance(_ context.Context, _ string) (model.Balance, error) {
	return model.Balance{}, nil
}

func (f *fakeCreditClient) Deduct(_ context.Context, _ string, _ int64, _, _ string) error {
	return nil
}

func (f *fakeCreditClient) GrantSignupReward(_ context.Context, userID string) error {
	f.grants = append(f.grants, userID)
	return f.err
}

func (f *fakeCreditClient) ListTransactions(_ context.Context, _ string, _, _ int) ([]model.CreditTransaction, int, error) {
	return nil, 0, nil
}

func TestService_DisabledSkipsGrant(t *testing.T) {
	credit := &fakeCreditClient{}
	service := NewService(credit, Config{Enabled: false})

	service.GrantForNewUser(context.Background(), "user-1", true)

	if len(credit.grants) != 0 {
		t.Fatalf("expected no signup reward grant when disabled, got %#v", credit.grants)
	}
}

func TestService_GrantBeforeDeadline(t *testing.T) {
	credit := &fakeCreditClient{}
	service := NewService(credit, Config{
		Enabled:  true,
		Deadline: time.Date(2026, 4, 10, 23, 59, 59, 0, time.UTC),
		Now:      func() time.Time { return time.Date(2026, 4, 9, 10, 0, 0, 0, time.UTC) },
	})

	service.GrantForNewUser(context.Background(), "user-before-deadline", true)

	if len(credit.grants) != 1 || credit.grants[0] != "user-before-deadline" {
		t.Fatalf("expected signup reward grant before deadline, got %#v", credit.grants)
	}
}

func TestService_SkipsAfterDeadline(t *testing.T) {
	credit := &fakeCreditClient{}
	service := NewService(credit, Config{
		Enabled:  true,
		Deadline: time.Date(2026, 4, 10, 23, 59, 59, 0, time.UTC),
		Now:      func() time.Time { return time.Date(2026, 4, 11, 0, 0, 0, 0, time.UTC) },
	})

	service.GrantForNewUser(context.Background(), "user-after-deadline", true)

	if len(credit.grants) != 0 {
		t.Fatalf("expected no signup reward grant after deadline, got %#v", credit.grants)
	}
}

func TestService_SkipsExistingUser(t *testing.T) {
	credit := &fakeCreditClient{}
	service := NewService(credit, Config{Enabled: true})

	service.GrantForNewUser(context.Background(), "existing-user", false)

	if len(credit.grants) != 0 {
		t.Fatalf("expected no signup reward grant for existing user, got %#v", credit.grants)
	}
}

func TestService_ContinuesWhenGrantFails(t *testing.T) {
	credit := &fakeCreditClient{err: errors.New("credit unavailable")}
	service := NewService(credit, Config{Enabled: true})

	service.GrantForNewUser(context.Background(), "user-1", true)

	if len(credit.grants) != 1 {
		t.Fatalf("expected signup reward grant attempt, got %#v", credit.grants)
	}
}
