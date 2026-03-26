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

type fakeUserProvisioner struct {
	users   map[string]model.User
	created map[string]bool
}

type fakeLoginCreditClient struct {
	grants   []string
	grantErr error
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

func (f *fakeLoginCreditClient) GetBalance(_ context.Context, _ string) (model.Balance, error) {
	return model.Balance{}, nil
}

func (f *fakeLoginCreditClient) Deduct(_ context.Context, _ string, _ int64, _ string, _ string) error {
	return nil
}

func (f *fakeLoginCreditClient) GrantSignupReward(_ context.Context, userID string) error {
	f.grants = append(f.grants, userID)
	return f.grantErr
}

func (f *fakeUserProvisioner) FindOrCreateByAuthIdentity(_ context.Context, provider string, authUser model.AuthUser, _ time.Time) (model.User, bool, error) {
	if user, ok := f.users[provider+":"+authUser.UserID]; ok {
		return user, f.created != nil && f.created[provider+":"+authUser.UserID], nil
	}
	return model.User{
		ID:        authUser.UserID,
		Email:     authUser.Email,
		Name:      authUser.Name,
		AvatarURL: authUser.Picture,
		Status:    model.UserStatusActive,
	}, true, nil
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

func (r *fakeLoginSessionRepo) GetByUserCode(_ context.Context, userCode string) (model.LoginSession, error) {
	for _, session := range r.sessions {
		if session.UserCode == userCode {
			return session, nil
		}
	}
	return model.LoginSession{}, nil
}

func (r *fakeLoginSessionRepo) MarkAuthorized(_ context.Context, sessionID string, authUser model.AuthUser, _ time.Time) error {
	session := r.sessions[sessionID]
	session.Auth0Subject = authUser.UserID
	session.AuthUserEmail = authUser.Email
	session.AuthUserName = authUser.Name
	session.AuthUserPicture = authUser.Picture
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

func (r *fakeLoginSessionRepo) MarkVerified(_ context.Context, sessionID, userID string, _ time.Time) error {
	session := r.sessions[sessionID]
	session.AuthorizedUserID = userID
	session.Status = model.LoginSessionStatusCompleted
	r.sessions[sessionID] = session
	return nil
}

func (r *fakeLoginSessionRepo) MarkPolled(_ context.Context, sessionID string, polledAt time.Time) error {
	session := r.sessions[sessionID]
	session.LastPolledAt = polledAt
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
		&fakeUserProvisioner{},
		&fakeLoginCreditClient{},
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
			APIKey: model.APIKey{ID: "key-123", UserID: "2000000001"},
			RawKey: "ak-created",
		},
	}
	service := NewService(
		authClient,
		&fakeUserProvisioner{
			users: map[string]model.User{
				"auth0:user-123": {ID: "2000000001", Email: "user@example.com", Name: "Demo User", Status: model.UserStatusActive},
			},
		},
		&fakeLoginCreditClient{},
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
	if result.CredentialType != loginCredentialTypeAPIKey {
		t.Fatalf("expected credential_type api_key, got %q", result.CredentialType)
	}
	if result.AccessToken != "ak-created" {
		t.Fatalf("expected access token alias to be populated, got %q", result.AccessToken)
	}
	if result.User == nil || result.User.ID != "2000000001" {
		t.Fatalf("expected local user id 2000000001, got %#v", result.User)
	}
	if authClient.redirectURI != "http://127.0.0.1:14565/callback" {
		t.Fatalf("expected redirect uri to be used for exchange, got %q", authClient.redirectURI)
	}
	if len(apiKeys.created) != 1 {
		t.Fatalf("expected one api key create call, got %d", len(apiKeys.created))
	}
	if apiKeys.created[0].UserID != "2000000001" {
		t.Fatalf("expected api key created for local user id, got %q", apiKeys.created[0].UserID)
	}
	if apiKeys.created[0].TTL != 7*24*time.Hour {
		t.Fatalf("expected 7d ttl, got %v", apiKeys.created[0].TTL)
	}
}

func TestService_InitDeviceAndPollPending(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	service := NewService(
		&fakeAuthClient{loginURL: "https://auth.anycap.local/authorize?state=unused"},
		&fakeUserProvisioner{},
		&fakeLoginCreditClient{},
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
	if initResult.Interval != 5 {
		t.Fatalf("expected interval 5, got %d", initResult.Interval)
	}
	stored := repo.sessions["lsn-device"]
	if stored.State != "state-123" {
		t.Fatalf("expected generated state for device flow, got %q", stored.State)
	}
	if stored.RedirectURI != "https://anycap.local/auth/callback" {
		t.Fatalf("expected device callback redirect uri, got %q", stored.RedirectURI)
	}
	if stored.UserCodeExpiresAt != time.Date(2026, 3, 25, 10, 5, 0, 0, time.UTC) {
		t.Fatalf("expected user code to expire in 5m, got %v", stored.UserCodeExpiresAt)
	}

	pollResult, err := service.Poll(context.Background(), "lsn-device")
	if err != nil {
		t.Fatalf("Poll() error = %v", err)
	}
	if pollResult.Status != model.LoginSessionStatusPending {
		t.Fatalf("expected pending, got %q", pollResult.Status)
	}
}

func TestService_BeginDeviceAuthorizationBuildsAuthURL(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	now := time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC)
	repo.sessions["lsn-device"] = model.LoginSession{
		ID:                "lsn-device",
		FlowType:          model.LoginFlowDevice,
		State:             "state-device",
		UserCode:          "ABCD-EFGH",
		RedirectURI:       "https://anycap.local/auth/callback",
		Status:            model.LoginSessionStatusPending,
		ExpiresAt:         now.Add(15 * time.Minute),
		UserCodeExpiresAt: now.Add(5 * time.Minute),
		CreatedAt:         now,
	}
	authClient := &fakeAuthClient{
		loginURL: "https://auth.anycap.local/authorize?state=state-device",
	}
	service := NewService(
		authClient,
		&fakeUserProvisioner{},
		&fakeLoginCreditClient{},
		apikey.NewMemoryService(),
		repo,
		"https://anycap.local/device",
		nil,
		nil,
		nil,
		func() time.Time { return now },
		7*24*time.Hour,
	)

	authURL, err := service.BeginDeviceAuthorization(context.Background(), "ABCD-EFGH")
	if err != nil {
		t.Fatalf("BeginDeviceAuthorization() error = %v", err)
	}
	if authURL != "https://auth.anycap.local/authorize?state=state-device" {
		t.Fatalf("expected auth url, got %q", authURL)
	}
	if authClient.redirectURI != "https://anycap.local/auth/callback" {
		t.Fatalf("expected device redirect uri to be forwarded, got %q", authClient.redirectURI)
	}
}

func TestService_CompleteDeviceAuthorizationMarksSessionAuthorized(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	now := time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC)
	repo.sessions["lsn-device"] = model.LoginSession{
		ID:                "lsn-device",
		FlowType:          model.LoginFlowDevice,
		State:             "state-device",
		UserCode:          "ABCD-EFGH",
		RedirectURI:       "https://anycap.local/auth/callback",
		Status:            model.LoginSessionStatusPending,
		ExpiresAt:         now.Add(15 * time.Minute),
		UserCodeExpiresAt: now.Add(5 * time.Minute),
		CreatedAt:         now,
	}
	authClient := &fakeAuthClient{
		codeUsers: map[string]model.AuthUser{
			"code-123": {UserID: "auth0|user-1", Email: "user@example.com", Name: "Demo User"},
		},
	}
	service := NewService(
		authClient,
		&fakeUserProvisioner{},
		&fakeLoginCreditClient{},
		apikey.NewMemoryService(),
		repo,
		"https://anycap.local/device",
		nil,
		nil,
		nil,
		func() time.Time { return now },
		7*24*time.Hour,
	)

	if err := service.CompleteDeviceAuthorization(context.Background(), "code-123", "state-device"); err != nil {
		t.Fatalf("CompleteDeviceAuthorization() error = %v", err)
	}
	stored := repo.sessions["lsn-device"]
	if stored.Status != model.LoginSessionStatusAuthorized {
		t.Fatalf("expected authorized status, got %q", stored.Status)
	}
	if stored.Auth0Subject != "auth0|user-1" || stored.AuthUserEmail != "user@example.com" || stored.AuthUserName != "Demo User" {
		t.Fatalf("expected auth user profile to be stored, got %#v", stored)
	}
}

func TestService_PollAuthorizedDeviceCreatesAPIKey(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	now := time.Date(2026, 3, 25, 10, 0, 0, 0, time.UTC)
	repo.sessions["lsn-device"] = model.LoginSession{
		ID:                "lsn-device",
		FlowType:          model.LoginFlowDevice,
		Auth0Subject:      "auth0|user-1",
		AuthUserEmail:     "user@example.com",
		AuthUserName:      "Demo User",
		Status:            model.LoginSessionStatusAuthorized,
		ExpiresAt:         now.Add(15 * time.Minute),
		UserCodeExpiresAt: now.Add(5 * time.Minute),
		CreatedAt:         now,
	}
	apiKeys := &fakeLoginAPIKeyService{
		createdResult: model.CreatedAPIKey{
			APIKey: model.APIKey{ID: "key-456", UserID: "2000000002"},
			RawKey: "ak-device",
		},
	}
	service := NewService(
		&fakeAuthClient{},
		&fakeUserProvisioner{
			users: map[string]model.User{
				"auth0:auth0|user-1": {ID: "2000000002", Email: "user@example.com", Name: "Demo User", Status: model.UserStatusActive},
			},
		},
		&fakeLoginCreditClient{},
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
	if result.CredentialType != loginCredentialTypeAPIKey {
		t.Fatalf("expected credential_type api_key, got %q", result.CredentialType)
	}
	if result.AccessToken != "ak-device" {
		t.Fatalf("expected access token alias to be populated, got %q", result.AccessToken)
	}
	if result.User == nil || result.User.ID != "2000000002" {
		t.Fatalf("expected local user id 2000000002, got %#v", result.User)
	}
	if len(apiKeys.created) != 1 {
		t.Fatalf("expected one api key create call, got %d", len(apiKeys.created))
	}
	if apiKeys.created[0].UserID != "2000000002" {
		t.Fatalf("expected api key created for local user id, got %q", apiKeys.created[0].UserID)
	}
	if apiKeys.created[0].TTL != 7*24*time.Hour {
		t.Fatalf("expected 7d ttl, got %v", apiKeys.created[0].TTL)
	}
}

func TestService_PollDeviceExpiresWhenUserCodeExpires(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	now := time.Date(2026, 3, 25, 10, 6, 0, 0, time.UTC)
	repo.sessions["lsn-device"] = model.LoginSession{
		ID:                "lsn-device",
		FlowType:          model.LoginFlowDevice,
		UserCode:          "ABCD-EFGH",
		Status:            model.LoginSessionStatusPending,
		ExpiresAt:         now.Add(9 * time.Minute),
		UserCodeExpiresAt: now.Add(-1 * time.Minute),
		CreatedAt:         now.Add(-6 * time.Minute),
	}
	service := NewService(
		&fakeAuthClient{},
		&fakeUserProvisioner{},
		&fakeLoginCreditClient{},
		apikey.NewMemoryService(),
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
	if result.Status != model.LoginSessionStatusExpired {
		t.Fatalf("expected expired, got %q", result.Status)
	}
}

func TestService_PollCompletedDeviceReissuesAPIKey(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	now := time.Date(2026, 3, 25, 10, 10, 0, 0, time.UTC)
	repo.sessions["lsn-device"] = model.LoginSession{
		ID:                "lsn-device",
		FlowType:          model.LoginFlowDevice,
		Auth0Subject:      "auth0|user-1",
		AuthUserEmail:     "user@example.com",
		AuthUserName:      "Demo User",
		Status:            model.LoginSessionStatusCompleted,
		APIKeyID:          "key-old",
		ExpiresAt:         now.Add(5 * time.Minute),
		UserCodeExpiresAt: now.Add(-5 * time.Minute),
		CreatedAt:         now.Add(-10 * time.Minute),
	}
	apiKeys := &fakeLoginAPIKeyService{
		createdResult: model.CreatedAPIKey{
			APIKey: model.APIKey{ID: "key-reissued", UserID: "2000000002"},
			RawKey: "ak-reissued",
		},
	}
	service := NewService(
		&fakeAuthClient{},
		&fakeUserProvisioner{
			users: map[string]model.User{
				"auth0:auth0|user-1": {ID: "2000000002", Email: "user@example.com", Name: "Demo User", Status: model.UserStatusActive},
			},
		},
		&fakeLoginCreditClient{},
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
	if result.APIKey != "ak-reissued" {
		t.Fatalf("expected reissued api key, got %#v", result)
	}
	if len(apiKeys.created) != 1 {
		t.Fatalf("expected one api key create call, got %d", len(apiKeys.created))
	}
	if repo.sessions["lsn-device"].APIKeyID != "key-reissued" {
		t.Fatalf("expected session api key id to be updated, got %#v", repo.sessions["lsn-device"])
	}
}

func TestService_CheckDeviceCodeValid(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	now := time.Date(2026, 3, 26, 6, 0, 0, 0, time.UTC)
	repo.sessions["lsn-device"] = model.LoginSession{
		ID:                "lsn-device",
		FlowType:          model.LoginFlowDevice,
		UserCode:          "ABCD-1234",
		Status:            model.LoginSessionStatusPending,
		ExpiresAt:         now.Add(10 * time.Minute),
		UserCodeExpiresAt: now.Add(5 * time.Minute),
	}
	service := NewService(
		&fakeAuthClient{},
		&fakeUserProvisioner{},
		&fakeLoginCreditClient{},
		&fakeLoginAPIKeyService{},
		repo,
		"https://anycap.local/device",
		nil,
		nil,
		nil,
		func() time.Time { return now },
		7*24*time.Hour,
	)

	result, err := service.CheckDeviceCode(context.Background(), "ABCD-1234")
	if err != nil {
		t.Fatalf("CheckDeviceCode() error = %v", err)
	}
	if !result.Valid {
		t.Fatalf("expected valid result, got %#v", result)
	}
}

func TestService_VerifyDeviceCodeMarksSessionForUser(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	now := time.Date(2026, 3, 26, 6, 0, 0, 0, time.UTC)
	repo.sessions["lsn-device"] = model.LoginSession{
		ID:                "lsn-device",
		FlowType:          model.LoginFlowDevice,
		UserCode:          "ABCD-1234",
		Status:            model.LoginSessionStatusPending,
		ExpiresAt:         now.Add(10 * time.Minute),
		UserCodeExpiresAt: now.Add(5 * time.Minute),
	}
	service := NewService(
		&fakeAuthClient{},
		&fakeUserProvisioner{},
		&fakeLoginCreditClient{},
		&fakeLoginAPIKeyService{},
		repo,
		"https://anycap.local/device",
		nil,
		nil,
		nil,
		func() time.Time { return now },
		7*24*time.Hour,
	)

	result, err := service.VerifyDeviceCode(context.Background(), "ABCD-1234", model.Principal{
		UserID:   "2000000009",
		APIKeyID: "key-web",
		AuthType: "api_key",
	})
	if err != nil {
		t.Fatalf("VerifyDeviceCode() error = %v", err)
	}
	if result.Message != "authorized" {
		t.Fatalf("expected authorized message, got %#v", result)
	}
	session := repo.sessions["lsn-device"]
	if session.Status != model.LoginSessionStatusCompleted {
		t.Fatalf("expected completed session, got %#v", session)
	}
	if session.AuthorizedUserID != "2000000009" {
		t.Fatalf("expected authorized user id to be recorded, got %#v", session)
	}
}

func TestService_PollDeviceTooFastReturnsSlowDown(t *testing.T) {
	repo := newFakeLoginSessionRepo()
	now := time.Date(2026, 3, 26, 6, 0, 0, 0, time.UTC)
	repo.sessions["lsn-device"] = model.LoginSession{
		ID:                "lsn-device",
		FlowType:          model.LoginFlowDevice,
		UserCode:          "ABCD-1234",
		Status:            model.LoginSessionStatusPending,
		ExpiresAt:         now.Add(10 * time.Minute),
		UserCodeExpiresAt: now.Add(5 * time.Minute),
	}
	service := NewService(
		&fakeAuthClient{},
		&fakeUserProvisioner{},
		&fakeLoginCreditClient{},
		&fakeLoginAPIKeyService{},
		repo,
		"https://anycap.local/device",
		nil,
		nil,
		nil,
		func() time.Time { return now },
		7*24*time.Hour,
	)

	first, err := service.Poll(context.Background(), "lsn-device")
	if err != nil {
		t.Fatalf("first Poll() error = %v", err)
	}
	if first.Status != model.LoginSessionStatusPending {
		t.Fatalf("expected first poll pending, got %#v", first)
	}

	second, err := service.Poll(context.Background(), "lsn-device")
	if err != nil {
		t.Fatalf("second Poll() error = %v", err)
	}
	if second.Status != model.LoginSessionStatusSlowDown {
		t.Fatalf("expected slow_down, got %#v", second)
	}
}

func TestService_CallbackGrantsSignupRewardForNewUser(t *testing.T) {
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
			"code-123": {UserID: "auth0-user-123", Email: "new@example.com", Name: "New User"},
		},
	}
	apiKeys := &fakeLoginAPIKeyService{
		createdResult: model.CreatedAPIKey{
			APIKey: model.APIKey{ID: "key-123", UserID: "2000000001"},
			RawKey: "ak-created",
		},
	}
	credits := &fakeLoginCreditClient{}
	service := NewService(
		authClient,
		&fakeUserProvisioner{
			users: map[string]model.User{
				"auth0:auth0-user-123": {ID: "2000000001", Email: "new@example.com", Name: "New User", Status: model.UserStatusActive},
			},
			created: map[string]bool{
				"auth0:auth0-user-123": true,
			},
		},
		credits,
		apiKeys,
		repo,
		"https://anycap.local/device",
		func() string { return "state-unused" },
		func() string { return "lsn-unused" },
		func() string { return "code-unused" },
		func() time.Time { return now },
		7*24*time.Hour,
	)

	_, err := service.Callback(context.Background(), "lsn-123", "code-123", "state-123", "http://127.0.0.1:14565/callback")
	if err != nil {
		t.Fatalf("Callback() error = %v", err)
	}
	if len(credits.grants) != 1 || credits.grants[0] != "2000000001" {
		t.Fatalf("expected one signup reward grant for local user, got %#v", credits.grants)
	}
}

func TestService_CallbackDoesNotGrantSignupRewardForExistingUser(t *testing.T) {
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
			"code-123": {UserID: "auth0-user-123", Email: "existing@example.com", Name: "Existing User"},
		},
	}
	apiKeys := &fakeLoginAPIKeyService{
		createdResult: model.CreatedAPIKey{
			APIKey: model.APIKey{ID: "key-123", UserID: "2000000001"},
			RawKey: "ak-created",
		},
	}
	credits := &fakeLoginCreditClient{}
	service := NewService(
		authClient,
		&fakeUserProvisioner{
			users: map[string]model.User{
				"auth0:auth0-user-123": {ID: "2000000001", Email: "existing@example.com", Name: "Existing User", Status: model.UserStatusActive},
			},
		},
		credits,
		apiKeys,
		repo,
		"https://anycap.local/device",
		func() string { return "state-unused" },
		func() string { return "lsn-unused" },
		func() string { return "code-unused" },
		func() time.Time { return now },
		7*24*time.Hour,
	)

	_, err := service.Callback(context.Background(), "lsn-123", "code-123", "state-123", "http://127.0.0.1:14565/callback")
	if err != nil {
		t.Fatalf("Callback() error = %v", err)
	}
	if len(credits.grants) != 0 {
		t.Fatalf("expected no signup reward grant for existing user, got %#v", credits.grants)
	}
}

func TestService_CallbackDoesNotFailWhenSignupRewardGrantFails(t *testing.T) {
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
			"code-123": {UserID: "auth0-user-123", Email: "new@example.com", Name: "New User"},
		},
	}
	apiKeys := &fakeLoginAPIKeyService{
		createdResult: model.CreatedAPIKey{
			APIKey: model.APIKey{ID: "key-123", UserID: "2000000001"},
			RawKey: "ak-created",
		},
	}
	credits := &fakeLoginCreditClient{grantErr: model.ErrBillingUncertain}
	service := NewService(
		authClient,
		&fakeUserProvisioner{
			users: map[string]model.User{
				"auth0:auth0-user-123": {ID: "2000000001", Email: "new@example.com", Name: "New User", Status: model.UserStatusActive},
			},
			created: map[string]bool{
				"auth0:auth0-user-123": true,
			},
		},
		credits,
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
	if result.APIKey != "ak-created" {
		t.Fatalf("expected login to still succeed, got %#v", result)
	}
}
