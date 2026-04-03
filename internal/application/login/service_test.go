package login

import (
	"bytes"
	"context"
	"net/url"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/sirupsen/logrus"
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

func (f *fakeLoginAPIKeyService) ListAPIKeys(_ context.Context, _ string) ([]model.APIKey, error) {
	return nil, nil
}

func (f *fakeLoginAPIKeyService) DisableAPIKey(_ context.Context, _, _ string) error {
	return nil
}

func (f *fakeLoginAPIKeyService) DeleteAPIKey(_ context.Context, _, _ string) error {
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

func captureLogs(t *testing.T) *bytes.Buffer {
	t.Helper()

	logger := logging.GetLogger()
	originalOut := logger.Out
	originalFormatter := logger.Formatter
	originalLevel := logger.GetLevel()

	var buf bytes.Buffer
	logger.SetOutput(&buf)
	logger.SetFormatter(&logrus.JSONFormatter{})
	logger.SetLevel(logrus.DebugLevel)

	t.Cleanup(func() {
		logger.SetOutput(originalOut)
		logger.SetFormatter(originalFormatter)
		logger.SetLevel(originalLevel)
	})

	return &buf
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
	return newServiceForTestWithCredit(now, apiKeys, users, &fakeLoginCreditClient{}, sessions, time.Time{})
}

func newServiceForTestWithCredit(now func() time.Time, apiKeys *fakeLoginAPIKeyService, users *fakeUserProvisioner, credit *fakeLoginCreditClient, sessions *fakeLoginSessionRepo, signupRewardDeadline time.Time) *Service {
	return NewService(
		users,
		credit,
		apiKeys,
		sessions,
		"https://anycap.ai/auth/device",
		func() string { return "state-test" },
		func() string { return "lsn-test" },
		func() string { return "CODE-TEST" },
		now,
		7*24*time.Hour,
		signupRewardDeadline,
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

func TestService_InitUsesExternalLoginSessionIDByDefault(t *testing.T) {
	now := func() time.Time { return time.Date(2026, 3, 29, 10, 0, 0, 0, time.UTC) }
	apiKeys := &fakeLoginAPIKeyService{}
	users := &fakeUserProvisioner{users: map[string]model.User{}}
	sessions := newFakeLoginSessionRepo()
	service := NewService(
		users,
		&fakeLoginCreditClient{},
		apiKeys,
		sessions,
		"https://anycap.ai/auth/device",
		nil,
		nil,
		nil,
		now,
		7*24*time.Hour,
		time.Time{},
	)

	result, err := service.Init(context.Background(), model.LoginFlowBrowserPoll)
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}
	if !strings.HasPrefix(result.LoginSessionID, "lsn_") {
		t.Fatalf("expected login session id with lsn_ prefix, got %q", result.LoginSessionID)
	}
}

func TestService_Init_LogsMissingSessionRepoWithTraceID(t *testing.T) {
	now := func() time.Time { return time.Date(2026, 3, 29, 10, 0, 0, 0, time.UTC) }
	apiKeys := &fakeLoginAPIKeyService{}
	users := &fakeUserProvisioner{users: map[string]model.User{}}
	service := newServiceForTest(now, apiKeys, users, newFakeLoginSessionRepo())
	service.sessions = nil
	logBuf := captureLogs(t)

	ctx := trace.SetTraceID(context.Background(), "trace-login-init-1")
	_, err := service.Init(ctx, model.LoginFlowBrowserPoll)
	if err != model.ErrInternal {
		t.Fatalf("expected ErrInternal, got %v", err)
	}

	output := logBuf.String()
	if !strings.Contains(output, `"trace_id":"trace-login-init-1"`) {
		t.Fatalf("expected trace_id in logs, got %q", output)
	}
	if !strings.Contains(output, "login session repo not configured") {
		t.Fatalf("expected missing session repo log, got %q", output)
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

func TestService_BrowserVerifyGrantsSignupRewardForNewUser(t *testing.T) {
	now := func() time.Time { return time.Date(2026, 4, 3, 10, 0, 0, 0, time.UTC) }
	apiKeys := &fakeLoginAPIKeyService{}
	credit := &fakeLoginCreditClient{}
	users := &fakeUserProvisioner{users: map[string]model.User{
		"2000000001": {ID: "2000000001", Email: "new@example.com", Name: "New User", Status: model.UserStatusActive},
	}}
	sessions := newFakeLoginSessionRepo()
	service := newServiceForTestWithCredit(
		now,
		apiKeys,
		users,
		credit,
		sessions,
		time.Date(2026, 4, 10, 23, 59, 59, 0, time.UTC),
	)

	initResult, err := service.Init(context.Background(), model.LoginFlowBrowserPoll)
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}
	parsedURL, err := url.Parse(initResult.BrowserURL)
	if err != nil {
		t.Fatalf("parse browser url: %v", err)
	}

	_, err = service.BrowserVerify(context.Background(), parsedURL.Query().Get("browser_token"), model.Principal{
		UserID:      "2000000001",
		AuthType:    "auth0_jwt",
		CreatedUser: true,
	}, model.AuthUser{})
	if err != nil {
		t.Fatalf("BrowserVerify() error = %v", err)
	}

	if len(credit.grants) != 1 || credit.grants[0] != "2000000001" {
		t.Fatalf("expected signup reward grant for browser login, got %#v", credit.grants)
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

func TestService_VerifyDeviceCodeGrantsSignupRewardForNewUser(t *testing.T) {
	now := func() time.Time { return time.Date(2026, 4, 3, 10, 0, 0, 0, time.UTC) }
	apiKeys := &fakeLoginAPIKeyService{createdResult: model.CreatedAPIKey{APIKey: model.APIKey{ID: "key-2"}, RawKey: "ak-test-2"}}
	credit := &fakeLoginCreditClient{}
	users := &fakeUserProvisioner{users: map[string]model.User{
		"2000000002": {ID: "2000000002", Email: "device@example.com", Name: "Device User", Status: model.UserStatusActive},
	}}
	sessions := newFakeLoginSessionRepo()
	service := newServiceForTestWithCredit(
		now,
		apiKeys,
		users,
		credit,
		sessions,
		time.Date(2026, 4, 10, 23, 59, 59, 0, time.UTC),
	)

	initResult, err := service.Init(context.Background(), model.LoginFlowDevice)
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}

	_, err = service.VerifyDeviceCode(context.Background(), initResult.UserCode, model.Principal{
		UserID:      "2000000002",
		AuthType:    "auth0_jwt",
		CreatedUser: true,
	}, model.AuthUser{})
	if err != nil {
		t.Fatalf("VerifyDeviceCode() error = %v", err)
	}

	if len(credit.grants) != 1 || credit.grants[0] != "2000000002" {
		t.Fatalf("expected signup reward grant for device login, got %#v", credit.grants)
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

func TestService_GrantSignupRewardBeforeDeadline(t *testing.T) {
	credit := &fakeLoginCreditClient{}
	service := &Service{
		credit:               credit,
		now:                  func() time.Time { return time.Date(2026, 4, 9, 10, 0, 0, 0, time.UTC) },
		signupRewardDeadline: time.Date(2026, 4, 10, 23, 59, 59, 0, time.UTC),
	}

	service.grantSignupReward(context.Background(), "user-before-deadline", true)

	if len(credit.grants) != 1 {
		t.Fatalf("expected one signup reward grant, got %d", len(credit.grants))
	}
}

func TestService_GrantSignupRewardSkipsAfterDeadline(t *testing.T) {
	credit := &fakeLoginCreditClient{}
	service := &Service{
		credit:               credit,
		now:                  func() time.Time { return time.Date(2026, 4, 11, 0, 0, 0, 0, time.UTC) },
		signupRewardDeadline: time.Date(2026, 4, 10, 23, 59, 59, 0, time.UTC),
	}

	service.grantSignupReward(context.Background(), "user-after-deadline", true)

	if len(credit.grants) != 0 {
		t.Fatalf("expected no signup reward grant after deadline, got %d", len(credit.grants))
	}
}

func TestService_GrantSignupRewardSkipsExistingUser(t *testing.T) {
	credit := &fakeLoginCreditClient{}
	service := &Service{
		credit:               credit,
		now:                  func() time.Time { return time.Date(2026, 4, 9, 10, 0, 0, 0, time.UTC) },
		signupRewardDeadline: time.Date(2026, 4, 10, 23, 59, 59, 0, time.UTC),
	}

	service.grantSignupReward(context.Background(), "existing-user", false)

	if len(credit.grants) != 0 {
		t.Fatalf("expected no signup reward grant for existing user, got %d", len(credit.grants))
	}
}
