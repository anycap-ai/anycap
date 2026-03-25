package login

import (
	"context"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"
)

type fakeAuthClient struct {
	loginURL      string
	codeUsers     map[string]model.AuthUser
	deviceInit    model.DeviceAuthorization
	devicePoll    map[string]model.DeviceAuthorizationStatus
	exchangeErr   error
	deviceInitErr error
	devicePollErr error
	redirectURI   string
}

type fakeLoginAPIKeyService struct {
	created []struct {
		UserID string
		Name   string
		TTL    time.Duration
	}
	createdResult model.CreatedAPIKey
}

func (f *fakeLoginAPIKeyService) AuthenticateAPIKey(_ context.Context, _ string) (model.Principal, error) {
	return model.Principal{}, nil
}

func (f *fakeLoginAPIKeyService) CreateAPIKey(_ context.Context, userID, name string) (model.CreatedAPIKey, error) {
	f.created = append(f.created, struct {
		UserID string
		Name   string
		TTL    time.Duration
	}{UserID: userID, Name: name})
	return f.createdResult, nil
}

func (f *fakeLoginAPIKeyService) CreateAPIKeyWithTTL(_ context.Context, userID, name string, ttl time.Duration) (model.CreatedAPIKey, error) {
	f.created = append(f.created, struct {
		UserID string
		Name   string
		TTL    time.Duration
	}{UserID: userID, Name: name, TTL: ttl})
	return f.createdResult, nil
}

func (f *fakeLoginAPIKeyService) RevokeAPIKey(_ context.Context, _ string) error {
	return nil
}

func (f *fakeAuthClient) BuildLoginURL(_ context.Context, _, redirectURI string) (string, error) {
	f.redirectURI = redirectURI
	return f.loginURL, nil
}

func (f *fakeAuthClient) ExchangeCode(_ context.Context, code, redirectURI string) (model.AuthUser, error) {
	if f.exchangeErr != nil {
		return model.AuthUser{}, f.exchangeErr
	}
	f.redirectURI = redirectURI
	return f.codeUsers[code], nil
}

func (f *fakeAuthClient) StartDeviceFlow(_ context.Context) (model.DeviceAuthorization, error) {
	if f.deviceInitErr != nil {
		return model.DeviceAuthorization{}, f.deviceInitErr
	}
	return f.deviceInit, nil
}

func (f *fakeAuthClient) PollDeviceFlow(_ context.Context, deviceCode string) (model.DeviceAuthorizationStatus, error) {
	if f.devicePollErr != nil {
		return model.DeviceAuthorizationStatus{}, f.devicePollErr
	}
	return f.devicePoll[deviceCode], nil
}

type fakeLoginSessionRepo struct {
	sessions map[string]model.LoginSession
}

func newFakeLoginSessionRepo() *fakeLoginSessionRepo {
	return &fakeLoginSessionRepo{sessions: make(map[string]model.LoginSession)}
}

func (r *fakeLoginSessionRepo) CreateSession(_ context.Context, session model.LoginSession) error {
	r.sessions[session.ID] = session
	return nil
}

func (r *fakeLoginSessionRepo) GetByID(_ context.Context, sessionID string) (model.LoginSession, error) {
	return r.sessions[sessionID], nil
}

func (r *fakeLoginSessionRepo) GetByState(_ context.Context, state string) (model.LoginSession, error) {
	for _, session := range r.sessions {
		if session.State == state {
			return session, nil
		}
	}
	return model.LoginSession{}, nil
}

func (r *fakeLoginSessionRepo) MarkAuthorized(_ context.Context, sessionID, auth0Subject string, _ time.Time) error {
	session := r.sessions[sessionID]
	session.Auth0Subject = auth0Subject
	session.Status = model.LoginSessionStatusAuthorized
	r.sessions[sessionID] = session
	return nil
}

func (r *fakeLoginSessionRepo) MarkCompleted(_ context.Context, sessionID, apiKeyID string, _ time.Time) error {
	session := r.sessions[sessionID]
	session.APIKeyID = apiKeyID
	session.Status = model.LoginSessionStatusCompleted
	r.sessions[sessionID] = session
	return nil
}

func TestService_InitLocalhost(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	authClient := &fakeAuthClient{
		loginURL: "https://auth.anycap.local/authorize?state=state-123",
	}
	service := NewService(
		authClient,
		apikey.NewMemoryService(),
		repo,
		"https://anycap.local/device",
		func() string { return "state-123" },
		func() string { return "lsn-123" },
		func() string { return "ABCD-EFGH" },
		func() time.Time { return time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC) },
		7*24*time.Hour,
	)

	result, err := service.Init(context.Background(), model.LoginFlowLocalhost, 14565)
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}
	if result.LoginSessionID != "lsn-123" {
		t.Fatalf("expected lsn-123, got %q", result.LoginSessionID)
	}
	if result.FlowType != model.LoginFlowLocalhost {
		t.Fatalf("expected localhost flow, got %q", result.FlowType)
	}
	if result.State != "state-123" {
		t.Fatalf("expected state-123, got %q", result.State)
	}
	if result.AuthorizeURL == "" {
		t.Fatal("expected authorize url")
	}
	if authClient.redirectURI != "http://127.0.0.1:14565/callback" {
		t.Fatalf("expected redirect uri to be forwarded, got %q", authClient.redirectURI)
	}
}

func TestService_CallbackCreatesAPIKey(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	now := time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC)
	repo.sessions["lsn-123"] = model.LoginSession{
		ID:          "lsn-123",
		FlowType:    model.LoginFlowLocalhost,
		State:       "state-123",
		RedirectURI: "http://127.0.0.1:14565/callback",
		Status:      model.LoginSessionStatusPending,
		ExpiresAt:   now.Add(5 * time.Minute),
		CreatedAt:   now,
	}
	authClient := &fakeAuthClient{
		codeUsers: map[string]model.AuthUser{
			"code-123": {UserID: "user-123", Email: "user@example.com", Name: "Demo User"},
		},
	}
	apiKeys := &fakeLoginAPIKeyService{
		createdResult: model.CreatedAPIKey{
			APIKey: model.APIKey{ID: "key-123", UserID: "user-123"},
			RawKey: "ak-created",
		},
	}
	service := NewService(
		authClient,
		apiKeys,
		repo,
		"https://anycap.local/device",
		func() string { return "state-unused" },
		func() string { return "lsn-unused" },
		func() string { return "code-unused" },
		func() time.Time { return now },
		7*24*time.Hour,
	)

	result, err := service.Callback(context.Background(), "lsn-123", "code-123", "state-123", "http://127.0.0.1:14565/callback")
	if err != nil {
		t.Fatalf("Callback() error = %v", err)
	}
	if result.APIKey == "" {
		t.Fatal("expected api key")
	}
	if result.User == nil || result.User.ID != "user-123" {
		t.Fatalf("expected user-123, got %#v", result.User)
	}
	if authClient.redirectURI != "http://127.0.0.1:14565/callback" {
		t.Fatalf("expected redirect uri to be used for exchange, got %q", authClient.redirectURI)
	}
	if len(apiKeys.created) != 1 {
		t.Fatalf("expected one api key create call, got %d", len(apiKeys.created))
	}
	if apiKeys.created[0].TTL != 7*24*time.Hour {
		t.Fatalf("expected 7d ttl, got %v", apiKeys.created[0].TTL)
	}
}

func TestService_InitDeviceAndPollPending(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	service := NewService(
		&fakeAuthClient{
			loginURL: "https://auth.anycap.local/authorize?state=unused",
			deviceInit: model.DeviceAuthorization{
				DeviceCode:      "device-code-1",
				UserCode:        "ABCD-EFGH",
				VerificationURI: "https://anycap.local/device",
				ExpiresIn:       900,
				Interval:        5,
			},
			devicePoll: map[string]model.DeviceAuthorizationStatus{
				"device-code-1": {Status: model.LoginSessionStatusPending},
			},
		},
		apikey.NewMemoryService(),
		repo,
		"https://anycap.local/device",
		func() string { return "state-123" },
		func() string { return "lsn-device" },
		func() string { return "ABCD-EFGH" },
		func() time.Time { return time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC) },
		7*24*time.Hour,
	)

	initResult, err := service.Init(context.Background(), model.LoginFlowDevice, 0)
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}
	if initResult.UserCode != "ABCD-EFGH" {
		t.Fatalf("expected user code, got %q", initResult.UserCode)
	}
	if initResult.VerificationURI != "https://anycap.local/device" {
		t.Fatalf("expected verification uri, got %q", initResult.VerificationURI)
	}

	pollResult, err := service.Poll(context.Background(), "lsn-device")
	if err != nil {
		t.Fatalf("Poll() error = %v", err)
	}
	if pollResult.Status != model.LoginSessionStatusPending {
		t.Fatalf("expected pending, got %q", pollResult.Status)
	}
}

func TestService_PollDeviceCompleteCreatesAPIKey(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	now := time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC)
	repo.sessions["lsn-device"] = model.LoginSession{
		ID:         "lsn-device",
		FlowType:   model.LoginFlowDevice,
		DeviceCode: "device-code-1",
		Status:     model.LoginSessionStatusPending,
		ExpiresAt:  now.Add(5 * time.Minute),
		CreatedAt:  now,
	}
	apiKeys := &fakeLoginAPIKeyService{
		createdResult: model.CreatedAPIKey{
			APIKey: model.APIKey{ID: "key-456", UserID: "auth0|user-1"},
			RawKey: "ak-device",
		},
	}
	service := NewService(
		&fakeAuthClient{
			devicePoll: map[string]model.DeviceAuthorizationStatus{
				"device-code-1": {
					Status: model.LoginSessionStatusComplete,
					User: model.AuthUser{
						UserID: "auth0|user-1",
						Email:  "user@example.com",
						Name:   "Demo User",
					},
				},
			},
		},
		apiKeys,
		repo,
		"https://anycap.local/device",
		nil,
		nil,
		nil,
		func() time.Time { return now },
		7*24*time.Hour,
	)

	result, err := service.Poll(context.Background(), "lsn-device")
	if err != nil {
		t.Fatalf("Poll() error = %v", err)
	}
	if result.Status != model.LoginSessionStatusComplete {
		t.Fatalf("expected complete, got %q", result.Status)
	}
	if result.APIKey == "" {
		t.Fatal("expected api key")
	}
	if result.User == nil || result.User.ID != "auth0|user-1" {
		t.Fatalf("expected auth0|user-1, got %#v", result.User)
	}
	if len(apiKeys.created) != 1 {
		t.Fatalf("expected one api key create call, got %d", len(apiKeys.created))
	}
	if apiKeys.created[0].TTL != 7*24*time.Hour {
		t.Fatalf("expected 7d ttl, got %v", apiKeys.created[0].TTL)
	}
}
