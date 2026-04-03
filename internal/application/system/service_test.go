package system

import (
	"context"
	"errors"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

type fakeAPIKeyService struct {
	revoked      []string
	listUserIDs  []string
	disabled     []string
	deleted      []string
	keys         []model.APIKey
	disableUsers []string
	deleteUsers  []string
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
	grants       []string
}

func (f *fakeSystemCreditClient) GetBalance(_ context.Context, _ string) (model.Balance, error) {
	return f.balance, nil
}

func (f *fakeSystemCreditClient) Deduct(_ context.Context, _ string, _ int64, _, _ string) error {
	return nil
}

func (f *fakeSystemCreditClient) GrantSignupReward(_ context.Context, userID string) error {
	f.grants = append(f.grants, userID)
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

type fakeUsageReader struct {
	summary     model.UsageSummaryResult
	events      model.UsageEventListResult
	apiKeyUsage map[string]model.APIKeyUsageSummary
}

type fakePaymentClient struct {
	lastInput      model.OrderCheckoutInput
	checkoutResult model.CheckoutSession
	checkoutErr    error
}

type fakeCheckoutIdempotencyClaimer struct {
	claimed  map[string]bool
	calls    []string
	releases []string
	err      error
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

func (f *fakeAPIKeyService) ListAPIKeys(_ context.Context, userID string) ([]model.APIKey, error) {
	f.listUserIDs = append(f.listUserIDs, userID)
	return append([]model.APIKey(nil), f.keys...), nil
}

func (f *fakeAPIKeyService) DisableAPIKey(_ context.Context, userID, keyID string) error {
	f.disableUsers = append(f.disableUsers, userID)
	f.disabled = append(f.disabled, keyID)
	return nil
}

func (f *fakeAPIKeyService) DeleteAPIKey(_ context.Context, userID, keyID string) error {
	f.deleteUsers = append(f.deleteUsers, userID)
	f.deleted = append(f.deleted, keyID)
	return nil
}

func (f *fakeUsageReader) SummarizeUsageByUser(_ context.Context, _ string, _ model.UsageQuery) (model.UsageSummaryResult, error) {
	return f.summary, nil
}

func (f *fakeUsageReader) ListUsageEventsByUser(_ context.Context, _ string, _ model.UsageQuery) (model.UsageEventListResult, error) {
	return f.events, nil
}

func (f *fakeUsageReader) SummarizeUsageByAPIKey(_ context.Context, _ string, _ model.UsageQuery) (map[string]model.APIKeyUsageSummary, error) {
	return f.apiKeyUsage, nil
}

func (f *fakePaymentClient) CreateOrderCheckout(_ context.Context, input model.OrderCheckoutInput) (model.CheckoutSession, error) {
	f.lastInput = input
	if f.checkoutErr != nil {
		return model.CheckoutSession{}, f.checkoutErr
	}
	return f.checkoutResult, nil
}

func (f *fakePaymentClient) HandleWebhook(_ context.Context, _ []byte, _ string) (model.PaymentEvent, error) {
	return model.PaymentEvent{}, nil
}

func (f *fakeCheckoutIdempotencyClaimer) Claim(_ context.Context, scope, key string) (bool, error) {
	f.calls = append(f.calls, scope+":"+key)
	if f.err != nil {
		return false, f.err
	}
	if f.claimed == nil {
		f.claimed = make(map[string]bool)
	}
	if f.claimed[key] {
		return false, nil
	}
	f.claimed[key] = true
	return true, nil
}

func (f *fakeCheckoutIdempotencyClaimer) Release(_ context.Context, scope, key string) error {
	f.releases = append(f.releases, scope+":"+key)
	if f.claimed != nil {
		delete(f.claimed, key)
	}
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

func TestService_ListAPIKeysIncludesUsageSummary(t *testing.T) {
	now := time.Date(2026, 3, 30, 9, 0, 0, 0, time.UTC)
	lastUsed := now.Add(-time.Hour)
	apiKeys := &fakeAPIKeyService{
		keys: []model.APIKey{
			{
				ID:         "akid_1",
				UserID:     "2000000001",
				Name:       "cli",
				Status:     model.APIKeyStatusActive,
				LastUsedAt: &lastUsed,
				CreatedAt:  now.Add(-24 * time.Hour),
			},
		},
	}

	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, apiKeys)
	service.SetUsageReader(&fakeUsageReader{
		apiKeyUsage: map[string]model.APIKeyUsageSummary{
			"akid_1": {
				UsageCount:   3,
				SuccessCount: 2,
				FailureCount: 1,
				Cost:         7,
				LastAction:   "image.generate",
			},
		},
	})

	result, err := service.ListAPIKeys(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"})
	if err != nil {
		t.Fatalf("ListAPIKeys() error = %v", err)
	}
	if len(apiKeys.listUserIDs) != 1 || apiKeys.listUserIDs[0] != "2000000001" {
		t.Fatalf("expected ListAPIKeys to use current user, got %+v", apiKeys.listUserIDs)
	}
	if len(result.Items) != 1 {
		t.Fatalf("expected 1 key, got %d", len(result.Items))
	}
	if result.Items[0].UsageSummary.UsageCount != 3 || result.Items[0].UsageSummary.LastAction != "image.generate" {
		t.Fatalf("unexpected usage summary: %+v", result.Items[0].UsageSummary)
	}
}

func TestService_DisableAPIKeyUsesCurrentUser(t *testing.T) {
	apiKeys := &fakeAPIKeyService{}
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, apiKeys)

	err := service.DisableAPIKey(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, "akid_1")
	if err != nil {
		t.Fatalf("DisableAPIKey() error = %v", err)
	}
	if len(apiKeys.disableUsers) != 1 || apiKeys.disableUsers[0] != "2000000001" {
		t.Fatalf("unexpected disable users: %+v", apiKeys.disableUsers)
	}
	if len(apiKeys.disabled) != 1 || apiKeys.disabled[0] != "akid_1" {
		t.Fatalf("unexpected disabled keys: %+v", apiKeys.disabled)
	}
}

func TestService_DeleteAPIKeyUsesCurrentUser(t *testing.T) {
	apiKeys := &fakeAPIKeyService{}
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, apiKeys)

	err := service.DeleteAPIKey(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, "akid_1")
	if err != nil {
		t.Fatalf("DeleteAPIKey() error = %v", err)
	}
	if len(apiKeys.deleteUsers) != 1 || apiKeys.deleteUsers[0] != "2000000001" {
		t.Fatalf("unexpected delete users: %+v", apiKeys.deleteUsers)
	}
	if len(apiKeys.deleted) != 1 || apiKeys.deleted[0] != "akid_1" {
		t.Fatalf("unexpected deleted keys: %+v", apiKeys.deleted)
	}
}

func TestService_UsageSummary(t *testing.T) {
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetUsageReader(&fakeUsageReader{
		summary: model.UsageSummaryResult{
			TotalEvents:   4,
			SuccessEvents: 3,
			FailureEvents: 1,
			TotalCost:     12,
		},
	})

	result, err := service.UsageSummary(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, model.UsageQuery{})
	if err != nil {
		t.Fatalf("UsageSummary() error = %v", err)
	}
	if result.TotalEvents != 4 || result.TotalCost != 12 {
		t.Fatalf("unexpected usage summary: %+v", result)
	}
}

func TestService_UsageEvents(t *testing.T) {
	now := time.Date(2026, 3, 30, 10, 0, 0, 0, time.UTC)
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetUsageReader(&fakeUsageReader{
		events: model.UsageEventListResult{
			Items: []model.UsageEvent{
				{
					ID:         "uevt_1",
					APIKeyID:   "akid_1",
					Action:     "image.generate",
					Provider:   "nexushub",
					Status:     "success",
					FinalCost:  5,
					OccurredAt: now,
				},
			},
		},
	})

	result, err := service.UsageEvents(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, model.UsageQuery{})
	if err != nil {
		t.Fatalf("UsageEvents() error = %v", err)
	}
	if len(result.Items) != 1 || result.Items[0].Action != "image.generate" {
		t.Fatalf("unexpected usage events: %+v", result.Items)
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

func TestService_CurrentUserGrantsSignupRewardForNewUser(t *testing.T) {
	credit := &fakeSystemCreditClient{}
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
	service.SetCreditClient(credit)

	_, err := service.CurrentUser(context.Background(), &model.Principal{
		UserID:      "2000000001",
		AuthType:    "auth0_jwt",
		CreatedUser: true,
	})
	if err != nil {
		t.Fatalf("CurrentUser() error = %v", err)
	}
	if len(credit.grants) != 1 || credit.grants[0] != "2000000001" {
		t.Fatalf("expected signup reward grant for first web request, got %#v", credit.grants)
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

func TestService_LogsUsesLedgerAmountForMatchedCapabilityCall(t *testing.T) {
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetCreditClient(&fakeSystemCreditClient{
		transactions: []model.CreditTransaction{
			{
				ID:               "txn-1",
				Type:             "CONSUMPTION",
				CreditCentAmount: -500,
				SourceID:         "anycap-image-generate-req_123",
				Description:      "image.generate",
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
				CreditCost: 4,
				CreatedAt:  time.Date(2026, 3, 26, 10, 30, 0, 0, time.UTC),
			},
		},
	})

	result, err := service.Logs(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, 20)
	if err != nil {
		t.Fatalf("Logs() error = %v", err)
	}
	if len(result.Items) != 1 {
		t.Fatalf("expected matched consumption transaction to merge into capability call, got %d items", len(result.Items))
	}
	if result.Items[0].Type != "capability_call" {
		t.Fatalf("expected first item capability_call, got %+v", result.Items[0])
	}
	if result.Items[0].CreditCost != 5 {
		t.Fatalf("expected merged capability call to use ledger credit cost 5, got %+v", result.Items[0])
	}
}

func TestService_DashboardSummary(t *testing.T) {
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
	service.SetCreditClient(&fakeSystemCreditClient{
		balance: model.Balance{
			Available:         12,
			Currency:          "credit",
			CreditCentBalance: 1200,
		},
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
				RequestID:  "req_456",
				UserID:     "2000000001",
				Capability: "image.generate",
				Model:      "flux-1.1-pro",
				Status:     "failed",
				ErrorCode:  "UPSTREAM_TIMEOUT",
				CreditCost: 1,
				CreatedAt:  time.Date(2026, 3, 26, 10, 31, 0, 0, time.UTC),
			},
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

	result, err := service.DashboardSummary(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"})
	if err != nil {
		t.Fatalf("DashboardSummary() error = %v", err)
	}
	if result.User.ID != "2000000001" {
		t.Fatalf("unexpected user: %+v", result.User)
	}
	if result.Balance.CreditCentBalance != 1200 {
		t.Fatalf("unexpected balance: %+v", result.Balance)
	}
	if len(result.RecentActivity) != 3 {
		t.Fatalf("expected 3 recent activity items, got %d", len(result.RecentActivity))
	}
	if result.UsageSummary == nil || result.UsageSummary.LastCapability != "image.generate" {
		t.Fatalf("unexpected usage summary: %+v", result.UsageSummary)
	}
	if result.ErrorSummary == nil || result.ErrorSummary.LastErrorCode != "UPSTREAM_TIMEOUT" {
		t.Fatalf("unexpected error summary: %+v", result.ErrorSummary)
	}
}

func TestService_CreditPacks(t *testing.T) {
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetCreditPacks([]model.CreditPackSpec{
		{
			CreditPack: model.CreditPack{
				ID:          "credits_500",
				Name:        "500 credits",
				Description: "starter",
				PriceCent:   500,
				Currency:    "USD",
				Credits:     500,
			},
			PriceID: "price_500",
		},
		{
			CreditPack: model.CreditPack{
				ID:          "credits_2000",
				Name:        "2,000 credits",
				Description: "best value",
				PriceCent:   1800,
				Currency:    "USD",
				Credits:     2000,
				Featured:    true,
				Badge:       "Best value",
			},
			PriceID: "price_2000",
		},
	})

	result, err := service.CreditPacks(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"})
	if err != nil {
		t.Fatalf("CreditPacks() error = %v", err)
	}
	if len(result.Packs) != 2 {
		t.Fatalf("expected 2 packs, got %d", len(result.Packs))
	}
	if result.Packs[0].ID != "credits_500" || result.Packs[0].PriceCent != 500 {
		t.Fatalf("unexpected first pack: %+v", result.Packs[0])
	}
	if result.Packs[1].ID != "credits_2000" || !result.Packs[1].Featured || result.Packs[1].Badge != "Best value" {
		t.Fatalf("unexpected second pack: %+v", result.Packs[1])
	}
}

func TestService_CreateCheckout(t *testing.T) {
	payment := &fakePaymentClient{
		checkoutResult: model.CheckoutSession{
			ID:  "cs_123",
			URL: "https://checkout.stripe.test/session/cs_123",
		},
	}
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetPaymentClient(payment)
	service.SetAllowedCheckoutReturnOrigins([]string{"https://anycap.ai"})
	service.SetCreditPacks([]model.CreditPackSpec{
		{
			CreditPack: model.CreditPack{
				ID:        "credits_2000",
				Name:      "2,000 credits",
				PriceCent: 1800,
				Currency:  "USD",
				Credits:   2000,
			},
			PriceID: "price_2000",
		},
	})

	result, err := service.CreateCheckout(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, model.CreateCheckoutInput{
		PackID:     "credits_2000",
		Quantity:   2,
		SuccessURL: "https://anycap.ai/dashboard/billing?checkout=success",
		CancelURL:  "https://anycap.ai/dashboard/buy-credits?checkout=cancel",
	})
	if err != nil {
		t.Fatalf("CreateCheckout() error = %v", err)
	}
	if result.CheckoutURL != "https://checkout.stripe.test/session/cs_123" || result.SessionType != "order" {
		t.Fatalf("unexpected checkout result: %+v", result)
	}
	if payment.lastInput.UserID != "2000000001" || payment.lastInput.PriceID != "price_2000" || payment.lastInput.Quantity != 2 {
		t.Fatalf("unexpected payment input: %+v", payment.lastInput)
	}
}

func TestService_CreateCheckoutRejectsDisallowedReturnURL(t *testing.T) {
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetPaymentClient(&fakePaymentClient{})
	service.SetAllowedCheckoutReturnOrigins([]string{"https://anycap.ai"})
	service.SetCreditPacks([]model.CreditPackSpec{{
		CreditPack: model.CreditPack{
			ID:        "credits_2000",
			Name:      "2,000 credits",
			PriceCent: 1800,
			Currency:  "USD",
			Credits:   2000,
		},
		PriceID: "price_2000",
	}})

	_, err := service.CreateCheckout(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, model.CreateCheckoutInput{
		PackID:     "credits_2000",
		SuccessURL: "https://evil.example.com/checkout/success",
	})
	if err == nil {
		t.Fatal("expected validation error for disallowed success_url")
	}
	var domainErr *model.DomainError
	if !errors.As(err, &domainErr) || domainErr.Code != "validation" {
		t.Fatalf("expected validation error, got %v", err)
	}
}

func TestService_CreateCheckoutRejectsDuplicateIdempotencyKey(t *testing.T) {
	payment := &fakePaymentClient{
		checkoutResult: model.CheckoutSession{
			ID:  "cs_123",
			URL: "https://checkout.stripe.test/session/cs_123",
		},
	}
	claimer := &fakeCheckoutIdempotencyClaimer{}
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetPaymentClient(payment)
	service.SetCheckoutIdempotencyClaimer(claimer)
	service.SetAllowedCheckoutReturnOrigins([]string{"https://anycap.ai"})
	service.SetCreditPacks([]model.CreditPackSpec{{
		CreditPack: model.CreditPack{
			ID:        "credits_2000",
			Name:      "2,000 credits",
			PriceCent: 1800,
			Currency:  "USD",
			Credits:   2000,
		},
		PriceID: "price_2000",
	}})

	input := model.CreateCheckoutInput{
		PackID:         "credits_2000",
		SuccessURL:     "https://anycap.ai/dashboard/billing?checkout=success",
		IdempotencyKey: "checkout-attempt-1",
	}
	if _, err := service.CreateCheckout(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, input); err != nil {
		t.Fatalf("first CreateCheckout() error = %v", err)
	}

	_, err := service.CreateCheckout(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, input)
	if err == nil {
		t.Fatal("expected conflict error for duplicate checkout idempotency key")
	}
	var domainErr *model.DomainError
	if !errors.As(err, &domainErr) || domainErr.Code != "conflict" {
		t.Fatalf("expected conflict error, got %v", err)
	}
	if len(claimer.calls) != 2 {
		t.Fatalf("expected claimer to be called twice, got %+v", claimer.calls)
	}
}

func TestService_CreateCheckoutReleasesIdempotencyKeyAfterPaymentFailure(t *testing.T) {
	payment := &fakePaymentClient{
		checkoutErr: model.ErrBillingUncertain,
	}
	claimer := &fakeCheckoutIdempotencyClaimer{}
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetPaymentClient(payment)
	service.SetCheckoutIdempotencyClaimer(claimer)
	service.SetAllowedCheckoutReturnOrigins([]string{"https://anycap.ai"})
	service.SetCreditPacks([]model.CreditPackSpec{{
		CreditPack: model.CreditPack{
			ID:        "credits_2000",
			Name:      "2,000 credits",
			PriceCent: 1800,
			Currency:  "USD",
			Credits:   2000,
		},
		PriceID: "price_2000",
	}})

	input := model.CreateCheckoutInput{
		PackID:         "credits_2000",
		SuccessURL:     "https://anycap.ai/dashboard/billing?checkout=success",
		IdempotencyKey: "checkout-attempt-1",
	}
	_, err := service.CreateCheckout(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, input)
	if !errors.Is(err, model.ErrBillingUncertain) {
		t.Fatalf("expected billing uncertain error, got %v", err)
	}
	if len(claimer.releases) != 1 || claimer.releases[0] != "billing.checkout:checkout-attempt-1" {
		t.Fatalf("expected release to be called once, got %+v", claimer.releases)
	}

	payment.checkoutErr = nil
	payment.checkoutResult = model.CheckoutSession{
		ID:  "cs_123",
		URL: "https://checkout.stripe.test/session/cs_123",
	}
	if _, err := service.CreateCheckout(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, input); err != nil {
		t.Fatalf("expected retry after payment failure to succeed, got %v", err)
	}
}

func TestService_CreateCheckoutRejectsUnknownPack(t *testing.T) {
	service := NewService("anycap-server", "test", "stub", buildinfo.Info{Version: "dev"}, nil)
	service.SetPaymentClient(&fakePaymentClient{})
	service.SetCreditPacks([]model.CreditPackSpec{{
		CreditPack: model.CreditPack{
			ID:   "credits_500",
			Name: "500 credits",
		},
		PriceID: "price_500",
	}})

	_, err := service.CreateCheckout(context.Background(), &model.Principal{UserID: "2000000001", AuthType: "api_key"}, model.CreateCheckoutInput{
		PackID: "missing_pack",
	})
	if err == nil {
		t.Fatal("expected error for unknown pack")
	}
	var domainErr *model.DomainError
	if !errors.As(err, &domainErr) || domainErr.Code != "validation" {
		t.Fatalf("expected validation error, got %v", err)
	}
}
