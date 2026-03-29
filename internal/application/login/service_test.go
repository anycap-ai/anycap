package login

import (
	"context"
	"net/url"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

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
	links   map[string]string
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

func (f *fakeLoginCreditClient) ListTransactions(_ context.Context, _ string, _, _ int) ([]model.CreditTransaction, int, error) {
	return nil, 0, nil
}

func (f *fakeUserProvisioner) FindOrCreateByAuthIdentity(_ context.Context, provider string, authUser model.AuthUser, _ time.Time) (model.User, bool, error) {
	key := provider + ":" + authUser.UserID
	if linkedID, ok := f.links[key]; ok {
		user := f.users[linkedID]
		user.Email = firstNonEmpty(authUser.Email, user.Email)
		user.Name = firstNonEmpty(authUser.Name, user.Name)
		user.AvatarURL = firstNonEmpty(authUser.Picture, user.AvatarURL)
		f.users[linkedID] = user
		return user, f.created != nil && f.created[key], nil
	}
	if user, ok := f.users[key]; ok {
		return user, f.created != nil && f.created[key], nil
	}
	user := model.User{
		ID:        authUser.UserID,
		Email:     authUser.Email,
		Name:      authUser.Name,
		AvatarURL: authUser.Picture,
		Status:    model.UserStatusActive,
	}
	if f.users == nil {
		f.users = make(map[string]model.User)
	}
	if f.links == nil {
		f.links = make(map[string]string)
	}
	f.users[user.ID] = user
	f.links[key] = user.ID
	return user, true, nil
}

func (f *fakeUserProvisioner) GetUserByID(_ context.Context, userID string) (model.User, error) {
	if user, ok := f.users[userID]; ok {
		return user, nil
	}
	return model.User{}, model.ErrAuthInvalid
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

func (r *fakeLoginSessionRepo) GetByUserCode(_ context.Context, userCode string) (model.LoginSession, error) {
	for _, session := range r.sessions {
		if session.UserCode == userCode {
			return session, nil
		}
	}
	return model.LoginSession{}, nil
}

func (r *fakeLoginSessionRepo) GetByBrowserToken(_ context.Context, browserToken string) (model.LoginSession, error) {
	for _, session := range r.sessions {
		if session.BrowserToken == browserToken {
			return session, nil
		}
	}
	return model.LoginSession{}, nil
}

func (r *fakeLoginSessionRepo) MarkCompleted(_ context.Context, sessionID, apiKeyID string, _ time.Time) error {
	session := r.sessions[sessionID]
	session.APIKeyID = apiKeyID
	session.Status = model.LoginSessionStatusCompleted
	r.sessions[sessionID] = session
	return nil
}

func (r *fakeLoginSessionRepo) MarkVerified(_ context.Context, sessionID string, authUser model.AuthUser, _ time.Time) error {
	session := r.sessions[sessionID]
	session.AuthorizedUserID = authUser.UserID
	session.AuthUserEmail = authUser.Email
	session.AuthUserName = authUser.Name
	session.AuthUserPicture = authUser.Picture
	session.Status = model.LoginSessionStatusAuthorized
	r.sessions[sessionID] = session
	return nil
}

func (r *fakeLoginSessionRepo) MarkPolled(_ context.Context, sessionID string, polledAt time.Time) error {
	session := r.sessions[sessionID]
	session.LastPolledAt = polledAt
	r.sessions[sessionID] = session
	return nil
}

func newServiceForTest(now func() time.Time, apiKeys *fakeLoginAPIKeyService, users *fakeUserProvisioner, sessions *fakeLoginSessionRepo) *Service {
	return NewService(
		users,
		&fakeLoginCreditClient{},
		apiKeys,
		sessions,
		"https://anycap.ai/auth/device",
		func() string { return "state-test" },
		func() string { return "lsn-test" },
		func() string { return "CODE-TEST" },
		now,
		7*24*time.Hour,
	)
}

func TestService_InitBrowserPoll(t *testing.T) {
	now := func() time.Time { return time.Date(2026, 3, 29, 10, 0, 0, 0, time.UTC) }
	apiKeys := &fakeLoginAPIKeyService{}
	users := &fakeUserProvisioner{users: map[string]model.User{}}
	sessions := newFakeLoginSessionRepo()
	service := newServiceForTest(now, apiKeys, users, sessions)

	result, err := service.Init(context.Background(), model.LoginFlowBrowserPoll)
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}
	if result.FlowType != model.LoginFlowBrowserPoll {
		t.Fatalf("expected browser_poll flow, got %q", result.FlowType)
	}
	if result.LoginSessionID == "" || result.BrowserURL == "" || result.PollToken == "" {
		t.Fatalf("missing browser_poll fields: %#v", result)
	}
	if result.Interval != 5 {
		t.Fatalf("expected interval=5, got %d", result.Interval)
	}
}

func TestService_InitDevice(t *testing.T) {
	now := func() time.Time { return time.Date(2026, 3, 29, 10, 0, 0, 0, time.UTC) }
	apiKeys := &fakeLoginAPIKeyService{}
	users := &fakeUserProvisioner{users: map[string]model.User{}}
	sessions := newFakeLoginSessionRepo()
	service := newServiceForTest(now, apiKeys, users, sessions)

	result, err := service.Init(context.Background(), model.LoginFlowDevice)
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}
	if result.FlowType != model.LoginFlowDevice {
		t.Fatalf("expected device flow, got %q", result.FlowType)
	}
	if result.UserCode == "" || result.VerificationURI != "https://anycap.ai/auth/device" {
		t.Fatalf("unexpected device init result: %#v", result)
	}
}

func TestService_BrowserVerifyThenPollIssuesSingleAPIKey(t *testing.T) {
	nowValue := time.Date(2026, 3, 29, 10, 0, 0, 0, time.UTC)
	now := func() time.Time { return nowValue }
	apiKeys := &fakeLoginAPIKeyService{createdResult: model.CreatedAPIKey{APIKey: model.APIKey{ID: "key-1"}, RawKey: "ak-test-1"}}
	users := &fakeUserProvisioner{users: map[string]model.User{
		"user-1": {ID: "user-1", Email: "user@example.com", Name: "Demo User", Status: model.UserStatusActive},
	}}
	sessions := newFakeLoginSessionRepo()
	service := newServiceForTest(now, apiKeys, users, sessions)

	initResult, err := service.Init(context.Background(), model.LoginFlowBrowserPoll)
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}
	parsedURL, err := url.Parse(initResult.BrowserURL)
	if err != nil {
		t.Fatalf("parse browser url: %v", err)
	}
	browserToken := parsedURL.Query().Get("browser_token")

	_, err = service.BrowserVerify(context.Background(), browserToken, model.Principal{UserID: "user-1", AuthType: "auth0_jwt"}, model.AuthUser{})
	if err != nil {
		t.Fatalf("BrowserVerify() error = %v", err)
	}

	firstPoll, err := service.Poll(context.Background(), initResult.LoginSessionID, initResult.PollToken)
	if err != nil {
		t.Fatalf("first Poll() error = %v", err)
	}
	if firstPoll.Status != model.LoginSessionStatusComplete || firstPoll.APIKey != "ak-test-1" {
		t.Fatalf("unexpected first poll result: %#v", firstPoll)
	}
	if len(apiKeys.created) != 1 {
		t.Fatalf("expected one api key issuance, got %d", len(apiKeys.created))
	}

	nowValue = nowValue.Add(6 * time.Second)
	secondPoll, err := service.Poll(context.Background(), initResult.LoginSessionID, initResult.PollToken)
	if err != nil {
		t.Fatalf("second Poll() error = %v", err)
	}
	if secondPoll.Status != model.LoginSessionStatusComplete {
		t.Fatalf("expected complete status on second poll, got %#v", secondPoll)
	}
	if secondPoll.APIKey != "" {
		t.Fatalf("expected no re-issued api key on completed session, got %#v", secondPoll)
	}
	if len(apiKeys.created) != 1 {
		t.Fatalf("expected still one api key issuance, got %d", len(apiKeys.created))
	}
}

func TestService_VerifyDeviceCodeThenPoll(t *testing.T) {
	nowValue := time.Date(2026, 3, 29, 10, 0, 0, 0, time.UTC)
	now := func() time.Time { return nowValue }
	apiKeys := &fakeLoginAPIKeyService{createdResult: model.CreatedAPIKey{APIKey: model.APIKey{ID: "key-2"}, RawKey: "ak-test-2"}}
	users := &fakeUserProvisioner{users: map[string]model.User{
		"user-2": {ID: "user-2", Email: "device@example.com", Name: "Device User", Status: model.UserStatusActive},
	}}
	sessions := newFakeLoginSessionRepo()
	service := newServiceForTest(now, apiKeys, users, sessions)

	initResult, err := service.Init(context.Background(), model.LoginFlowDevice)
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}

	verifyResult, err := service.VerifyDeviceCode(context.Background(), initResult.UserCode, model.Principal{UserID: "user-2", AuthType: "auth0_jwt"}, model.AuthUser{})
	if err != nil {
		t.Fatalf("VerifyDeviceCode() error = %v", err)
	}
	if verifyResult.Message != "authorized" {
		t.Fatalf("expected authorized message, got %#v", verifyResult)
	}

	pollResult, err := service.Poll(context.Background(), initResult.LoginSessionID, "")
	if err != nil {
		t.Fatalf("Poll() error = %v", err)
	}
	if pollResult.Status != model.LoginSessionStatusComplete || pollResult.APIKey != "ak-test-2" {
		t.Fatalf("unexpected device poll result: %#v", pollResult)
	}
}

func TestService_ExchangeIssuesAPIKeyForJWTPrincipal(t *testing.T) {
	now := func() time.Time { return time.Date(2026, 3, 29, 10, 0, 0, 0, time.UTC) }
	apiKeys := &fakeLoginAPIKeyService{createdResult: model.CreatedAPIKey{APIKey: model.APIKey{ID: "key-3"}, RawKey: "ak-test-3"}}
	users := &fakeUserProvisioner{users: map[string]model.User{
		"user-3": {ID: "user-3", Email: "jwt@example.com", Name: "JWT User", Status: model.UserStatusActive},
	}}
	sessions := newFakeLoginSessionRepo()
	service := newServiceForTest(now, apiKeys, users, sessions)

	result, err := service.Exchange(context.Background(), model.Principal{UserID: "user-3", AuthType: "auth0_jwt"})
	if err != nil {
		t.Fatalf("Exchange() error = %v", err)
	}
	if result.APIKey != "ak-test-3" || result.APIKeyID != "key-3" {
		t.Fatalf("unexpected exchange result: %#v", result)
	}
}
