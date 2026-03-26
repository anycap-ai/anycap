package system

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

type fakeAPIKeyService struct {
	revoked []string
}

type fakeUserReader struct {
	users map[string]model.User
}

func (f *fakeUserReader) GetUserByID(_ context.Context, userID string) (model.User, error) {
	if user, ok := f.users[userID]; ok {
		return user, nil
	}
	return model.User{}, model.ErrAuthInvalid
}

type fakeSystemCreditClient struct {
	balance      model.Balance
	transactions []model.CreditTransaction
}

func (f *fakeSystemCreditClient) GetBalance(_ context.Context, _ string) (model.Balance, error) {
	return f.balance, nil
}

func (f *fakeSystemCreditClient) Deduct(_ context.Context, _ string, _ int64, _, _ string) error {
	return nil
}

func (f *fakeSystemCreditClient) GrantSignupReward(_ context.Context, _ string) error {
	return nil
}

func (f *fakeSystemCreditClient) ListTransactions(_ context.Context, _ string, limit, offset int) ([]model.CreditTransaction, int, error) {
	start := offset
	if start > len(f.transactions) {
		start = len(f.transactions)
	}
	end := start + limit
	if limit <= 0 || end > len(f.transactions) {
		end = len(f.transactions)
	}
	return append([]model.CreditTransaction(nil), f.transactions[start:end]...), len(f.transactions), nil
}

type fakeCallLogRepo struct {
	logs []model.CallLog
}

func (f *fakeCallLogRepo) Insert(_ context.Context, entry model.CallLog) error {
	f.logs = append(f.logs, entry)
	return nil
}

func (f *fakeCallLogRepo) ListByUserID(_ context.Context, userID string, limit int) ([]model.CallLog, error) {
	var filtered []model.CallLog
	for _, item := range f.logs {
		if item.UserID == userID {
			filtered = append(filtered, item)
		}
	}
	if limit > 0 && len(filtered) > limit {
		filtered = filtered[:limit]
	}
	return filtered, nil
}

func (f *fakeAPIKeyService) AuthenticateAPIKey(_ context.Context, _ string) (model.Principal, error) {
	return model.Principal{}, nil
}

func (f *fakeAPIKeyService) CreateAPIKey(_ context.Context, _, _ string) (model.CreatedAPIKey, error) {
	return model.CreatedAPIKey{}, nil
}

func (f *fakeAPIKeyService) CreateAPIKeyWithTTL(_ context.Context, _, _ string, _ time.Duration) (model.CreatedAPIKey, error) {
	return model.CreatedAPIKey{}, nil
}

func (f *fakeAPIKeyService) RevokeAPIKey(_ context.Context, keyID string) error {
	f.revoked = append(f.revoked, keyID)
	return nil
}

func TestService_Status(t *testing.T) {
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{
		Version: "dev",
		Commit:  "abc123",
		Date:    "2026-03-24T00:00:00Z",
	}, nil)

	status := service.Status(nil)
	if status.Service.Name != "anycap-server" {
		t.Fatalf("expected anycap-server, got %s", status.Service.Name)
	}
	if status.Service.Version != "dev" {
		t.Fatalf("expected version dev, got %s", status.Service.Version)
	}
	if status.Service.Status != "ok" {
		t.Fatalf("expected status ok, got %s", status.Service.Status)
	}
}

func TestService_LogoutRevokesCurrentAPIKey(t *testing.T) {
	apiKeys := &fakeAPIKeyService{}
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, apiKeys)

	err := service.Logout(context.Background(), &model.Principal{
		UserID:   "user-1",
		APIKeyID: "key-123",
		AuthType: "api_key",
	})
	if err != nil {
		t.Fatalf("Logout() error = %v", err)
	}
	if len(apiKeys.revoked) != 1 || apiKeys.revoked[0] != "key-123" {
		t.Fatalf("unexpected revoked keys: %+v", apiKeys.revoked)
	}
}

func TestService_CurrentUser(t *testing.T) {
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetUserReader(&fakeUserReader{
		users: map[string]model.User{
			"2000000001": {
				ID:        "2000000001",
				Email:     "user@example.com",
				Name:      "Demo User",
				AvatarURL: "https://cdn.example.com/avatar.png",
				Status:    model.UserStatusActive,
			},
		},
	})

	user, err := service.CurrentUser(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"})
	if err != nil {
		t.Fatalf("CurrentUser() error = %v", err)
	}
	if user.ID != "2000000001" || user.Email != "user@example.com" {
		t.Fatalf("unexpected user: %+v", user)
	}
}

func TestService_CreditBalance(t *testing.T) {
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetCreditClient(&fakeSystemCreditClient{
		balance: model.Balance{
			Available:         12,
			Currency:          "credit",
			CreditCentBalance: 1200,
		},
	})

	balance, err := service.CreditBalance(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"})
	if err != nil {
		t.Fatalf("CreditBalance() error = %v", err)
	}
	if balance.Available != 12 || balance.CreditCentBalance != 1200 {
		t.Fatalf("unexpected balance: %+v", balance)
	}
}

func TestService_LogsMergesTimeline(t *testing.T) {
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetCreditClient(&fakeSystemCreditClient{
		transactions: []model.CreditTransaction{
			{
				ID:               "txn-1",
				Type:             "CONSUMPTION",
				CreditCentAmount: -100,
				SourceID:         "image.generate-req_123",
				Description:      "image.generate | model:flux-1.1-pro",
				CreatedAt:        time.Date(2026, 3, 26, 10, 29, 30, 0, time.UTC),
			},
		},
	})
	service.SetCallLogRepo(&fakeCallLogRepo{
		logs: []model.CallLog{
			{
				RequestID:  "req_123",
				UserID:     "2000000001",
				Capability: "image.generate",
				Model:      "flux-1.1-pro",
				Status:     "success",
				CreditCost: 1,
				CreatedAt:  time.Date(2026, 3, 26, 10, 30, 0, 0, time.UTC),
			},
		},
	})

	result, err := service.Logs(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, 20)
	if err != nil {
		t.Fatalf("Logs() error = %v", err)
	}
	if len(result.Items) != 2 {
		t.Fatalf("expected 2 items, got %d", len(result.Items))
	}
	if result.Items[0].Type != "capability_call" {
		t.Fatalf("expected first item capability_call, got %+v", result.Items[0])
	}
	if result.Items[1].Type != "credit_transaction" {
		t.Fatalf("expected second item credit_transaction, got %+v", result.Items[1])
	}
}
