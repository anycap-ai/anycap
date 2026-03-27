package login

import (
	"context"
	"fmt"
	"net/url"
	"path"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

const loginCredentialTypeAPIKey = "api_key"
const devicePollInterval = 5 * time.Second

type Service struct {
	authClient port.Auth0Client
	users      interface {
		port.UserProvisioner
		port.UserReader
	}
	credit                port.CreditClient
	apiKeys               port.APIKeyService
	sessions              port.LoginSessionRepo
	deviceVerificationURL string
	loginAPIKeyTTL        time.Duration
	stateGenerator        func() string
	sessionIDGenerator    func() string
	userCodeGenerator     func() string
	now                   func() time.Time
}

func NewService(
	authClient port.Auth0Client,
	users interface {
		port.UserProvisioner
		port.UserReader
	},
	credit port.CreditClient,
	apiKeys port.APIKeyService,
	sessions port.LoginSessionRepo,
	deviceVerificationURL string,
	stateGenerator func() string,
	sessionIDGenerator func() string,
	userCodeGenerator func() string,
	now func() time.Time,
	loginAPIKeyTTL time.Duration,
) *Service {
	if stateGenerator == nil {
		stateGenerator = func() string {
			return "state-" + time.Now().UTC().Format("20060102150405.000000000")
		}
	}
	if sessionIDGenerator == nil {
		sessionIDGenerator = func() string {
			return "lsn-" + time.Now().UTC().Format("20060102150405.000000000")
		}
	}
	if userCodeGenerator == nil {
		userCodeGenerator = func() string {
			return "ANYCAP-" + time.Now().UTC().Format("150405")
		}
	}
	if now == nil {
		now = time.Now
	}
	if deviceVerificationURL == "" {
		deviceVerificationURL = "https://anycap.local/device"
	}

	return &Service{
		authClient:            authClient,
		users:                 users,
		credit:                credit,
		apiKeys:               apiKeys,
		sessions:              sessions,
		deviceVerificationURL: deviceVerificationURL,
		loginAPIKeyTTL:        loginAPIKeyTTL,
		stateGenerator:        stateGenerator,
		sessionIDGenerator:    sessionIDGenerator,
		userCodeGenerator:     userCodeGenerator,
		now:                   now,
	}
}

func (s *Service) Init(ctx context.Context, method string, redirectPort int, redirectURL string) (model.LoginInitResult, error) {
	if s == nil || s.authClient == nil {
		return model.LoginInitResult{}, model.ErrAuthProviderNotConfigured
	}
	if s.sessions == nil {
		return model.LoginInitResult{}, model.ErrInternal
	}

	now := s.now().UTC()
	session := model.LoginSession{
		ID:        s.sessionIDGenerator(),
		FlowType:  method,
		Status:    model.LoginSessionStatusPending,
		ExpiresAt: now.Add(15 * time.Minute),
		CreatedAt: now,
	}

	switch method {
	case "", model.LoginFlowLocalhost:
		if redirectPort <= 0 {
			return model.LoginInitResult{}, model.ErrInvalidParam
		}

		session.FlowType = model.LoginFlowLocalhost
		session.State = s.stateGenerator()
		session.RedirectURI = fmt.Sprintf("http://127.0.0.1:%d/callback", redirectPort)
		session.CodeVerifier = "pkce-" + session.ID

		authURL, err := s.authClient.BuildLoginURL(ctx, session.State, session.RedirectURI)
		if err != nil {
			return model.LoginInitResult{}, err
		}
		if err := s.sessions.CreateSession(ctx, session); err != nil {
			return model.LoginInitResult{}, err
		}

		return model.LoginInitResult{
			FlowType:       session.FlowType,
			LoginSessionID: session.ID,
			AuthorizeURL:   authURL,
			State:          session.State,
			ExpiresIn:      int((15 * time.Minute).Seconds()),
		}, nil
	case model.LoginFlowWeb:
		parsedRedirect, err := url.Parse(strings.TrimSpace(redirectURL))
		if err != nil || parsedRedirect.Scheme == "" || parsedRedirect.Host == "" {
			return model.LoginInitResult{}, model.ErrInvalidParam
		}

		session.FlowType = model.LoginFlowWeb
		session.State = s.stateGenerator()
		session.RedirectURI = parsedRedirect.String()
		session.CodeVerifier = "pkce-" + session.ID

		authURL, err := s.authClient.BuildLoginURL(ctx, session.State, session.RedirectURI)
		if err != nil {
			return model.LoginInitResult{}, err
		}
		if err := s.sessions.CreateSession(ctx, session); err != nil {
			return model.LoginInitResult{}, err
		}

		return model.LoginInitResult{
			FlowType:       session.FlowType,
			LoginSessionID: session.ID,
			AuthorizeURL:   authURL,
			State:          session.State,
			ExpiresIn:      int((15 * time.Minute).Seconds()),
		}, nil
	case model.LoginFlowBrowserPoll:
		session.FlowType = model.LoginFlowBrowserPoll
		session.State = s.stateGenerator()
		session.RedirectURI = s.browserCallbackURL()
		session.CodeVerifier = "pkce-" + session.ID
		session.BrowserToken = "browser-" + session.ID
		session.PollToken = "poll-" + session.ID
		if err := s.sessions.CreateSession(ctx, session); err != nil {
			return model.LoginInitResult{}, err
		}

		return model.LoginInitResult{
			FlowType:       session.FlowType,
			LoginSessionID: session.ID,
			BrowserURL:     s.browserLoginURL(session.BrowserToken),
			PollToken:      session.PollToken,
			ExpiresIn:      int(session.ExpiresAt.Sub(now).Seconds()),
			Interval:       5,
		}, nil
	case model.LoginFlowDevice:
		session.State = s.stateGenerator()
		session.UserCode = s.userCodeGenerator()
		session.UserCodeExpiresAt = now.Add(5 * time.Minute)
		session.RedirectURI = s.deviceCallbackURL()
		if err := s.sessions.CreateSession(ctx, session); err != nil {
			return model.LoginInitResult{}, err
		}

		return model.LoginInitResult{
			FlowType:        session.FlowType,
			LoginSessionID:  session.ID,
			VerificationURI: s.deviceVerificationURL,
			UserCode:        session.UserCode,
			ExpiresIn:       int(session.ExpiresAt.Sub(now).Seconds()),
			Interval:        5,
		}, nil
	default:
		return model.LoginInitResult{}, model.ErrInvalidParam
	}
}

func (s *Service) BrowserBind(ctx context.Context, browserToken string) (model.LoginInitResult, error) {
	if browserToken == "" {
		return model.LoginInitResult{}, model.ErrInvalidParam
	}
	if s == nil || s.authClient == nil {
		return model.LoginInitResult{}, model.ErrAuthProviderNotConfigured
	}
	if s.sessions == nil {
		return model.LoginInitResult{}, model.ErrInternal
	}

	session, err := s.sessions.GetByBrowserToken(ctx, browserToken)
	if err != nil {
		return model.LoginInitResult{}, err
	}
	if session.ID == "" || session.FlowType != model.LoginFlowBrowserPoll {
		return model.LoginInitResult{}, model.ErrAuthInvalid
	}
	if s.now().UTC().After(session.ExpiresAt) {
		return model.LoginInitResult{}, model.ErrAuthExpired
	}

	authURL, err := s.authClient.BuildLoginURL(ctx, session.State, session.RedirectURI)
	if err != nil {
		return model.LoginInitResult{}, err
	}
	return model.LoginInitResult{
		FlowType:       session.FlowType,
		LoginSessionID: session.ID,
		AuthorizeURL:   authURL,
	}, nil
}

func (s *Service) BrowserComplete(ctx context.Context, sessionID, browserToken, code, state, redirectURI string) error {
	if sessionID == "" || browserToken == "" || code == "" {
		return model.ErrInvalidParam
	}
	if s == nil || s.authClient == nil {
		return model.ErrAuthProviderNotConfigured
	}
	if s.sessions == nil {
		return model.ErrInternal
	}

	session, err := s.sessions.GetByID(ctx, sessionID)
	if err != nil {
		return err
	}
	if session.ID == "" || session.FlowType != model.LoginFlowBrowserPoll {
		return model.ErrAuthInvalid
	}
	if session.BrowserToken != browserToken || session.State != state {
		return model.ErrAuthInvalid
	}
	if redirectURI != "" && session.RedirectURI != "" && session.RedirectURI != redirectURI {
		return model.ErrAuthInvalid
	}
	if s.now().UTC().After(session.ExpiresAt) {
		return model.ErrAuthExpired
	}

	user, err := s.authClient.ExchangeCode(ctx, code, session.RedirectURI)
	if err != nil {
		return err
	}
	return s.sessions.MarkAuthorized(ctx, sessionID, user, s.now().UTC())
}

func (s *Service) BrowserVerify(ctx context.Context, browserToken string, principal model.Principal, authUser model.AuthUser) (model.DeviceVerifyResult, error) {
	if browserToken == "" {
		return model.DeviceVerifyResult{}, model.ErrInvalidParam
	}
	if principal.UserID == "" || principal.AuthType == "" {
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	if principal.AuthType != "auth0_jwt" && principal.AuthType != "local_bypass" {
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	if s.sessions == nil || s.users == nil {
		return model.DeviceVerifyResult{}, model.ErrInternal
	}

	session, err := s.sessions.GetByBrowserToken(ctx, browserToken)
	if err != nil {
		return model.DeviceVerifyResult{}, err
	}
	if session.ID == "" || session.FlowType != model.LoginFlowBrowserPoll {
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	if session.Status == model.LoginSessionStatusCompleted {
		return model.DeviceVerifyResult{Message: "authorized"}, nil
	}
	if session.Status != model.LoginSessionStatusPending {
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	if s.now().UTC().After(session.ExpiresAt) {
		return model.DeviceVerifyResult{}, model.ErrAuthExpired
	}

	authUser, err = s.resolveVerifiedAuthUser(ctx, principal, authUser)
	if err != nil {
		return model.DeviceVerifyResult{}, err
	}
	if err := s.sessions.MarkVerified(ctx, session.ID, authUser, s.now().UTC()); err != nil {
		return model.DeviceVerifyResult{}, err
	}
	return model.DeviceVerifyResult{Message: "authorized"}, nil
}

func (s *Service) Callback(ctx context.Context, sessionID, code, state, redirectURI string) (model.LoginCallbackResult, error) {
	if sessionID == "" || code == "" {
		return model.LoginCallbackResult{}, model.ErrInvalidParam
	}
	if s == nil || s.authClient == nil {
		return model.LoginCallbackResult{}, model.ErrAuthProviderNotConfigured
	}
	if s.sessions == nil || s.users == nil || s.apiKeys == nil {
		return model.LoginCallbackResult{}, model.ErrInternal
	}

	session, err := s.sessions.GetByID(ctx, sessionID)
	if err != nil {
		return model.LoginCallbackResult{}, err
	}
	if session.ID == "" || (session.FlowType != model.LoginFlowLocalhost && session.FlowType != model.LoginFlowWeb) {
		return model.LoginCallbackResult{}, model.ErrAuthInvalid
	}
	if session.State != state {
		return model.LoginCallbackResult{}, model.ErrAuthInvalid
	}
	if redirectURI != "" && session.RedirectURI != "" && redirectURI != session.RedirectURI {
		return model.LoginCallbackResult{}, model.ErrAuthInvalid
	}

	user, err := s.authClient.ExchangeCode(ctx, code, session.RedirectURI)
	if err != nil {
		return model.LoginCallbackResult{}, err
	}
	if err := s.sessions.MarkAuthorized(ctx, sessionID, user, s.now().UTC()); err != nil {
		return model.LoginCallbackResult{}, err
	}
	localUser, createdUser, err := s.users.FindOrCreateByAuthIdentity(ctx, "auth0", user, s.now().UTC())
	if err != nil {
		return model.LoginCallbackResult{}, err
	}
	s.grantSignupReward(ctx, localUser.ID, createdUser)

	created, err := s.createLoginAPIKey(ctx, localUser.ID)
	if err != nil {
		return model.LoginCallbackResult{}, err
	}
	if err := s.sessions.MarkCompleted(ctx, sessionID, created.APIKey.ID, s.now().UTC()); err != nil {
		return model.LoginCallbackResult{}, err
	}

	return model.LoginCallbackResult{
		CredentialType: loginCredentialTypeAPIKey,
		AccessToken:    created.RawKey,
		APIKeyID:       created.APIKey.ID,
		APIKey:         created.RawKey,
		User: &model.LoginUser{
			ID:    localUser.ID,
			Email: localUser.Email,
			Name:  localUser.Name,
		},
	}, nil
}

func (s *Service) Exchange(ctx context.Context, principal model.Principal) (model.LoginCallbackResult, error) {
	if principal.UserID == "" || principal.AuthType == "" {
		return model.LoginCallbackResult{}, model.ErrAuthInvalid
	}
	if s == nil || s.users == nil || s.apiKeys == nil {
		return model.LoginCallbackResult{}, model.ErrInternal
	}
	if principal.AuthType != "auth0_jwt" && principal.AuthType != "local_bypass" {
		return model.LoginCallbackResult{}, model.ErrAuthInvalid
	}

	localUser, err := s.users.GetUserByID(ctx, principal.UserID)
	if err != nil {
		return model.LoginCallbackResult{}, err
	}
	created, err := s.createLoginAPIKey(ctx, localUser.ID)
	if err != nil {
		return model.LoginCallbackResult{}, err
	}

	return model.LoginCallbackResult{
		CredentialType: loginCredentialTypeAPIKey,
		AccessToken:    created.RawKey,
		APIKeyID:       created.APIKey.ID,
		APIKey:         created.RawKey,
		User: &model.LoginUser{
			ID:    localUser.ID,
			Email: localUser.Email,
			Name:  localUser.Name,
		},
	}, nil
}

func (s *Service) Poll(ctx context.Context, sessionID, pollToken string) (model.LoginPollResult, error) {
	if sessionID == "" {
		return model.LoginPollResult{}, model.ErrInvalidParam
	}
	if s.sessions == nil || s.users == nil {
		return model.LoginPollResult{}, model.ErrInternal
	}

	session, err := s.sessions.GetByID(ctx, sessionID)
	if err != nil {
		return model.LoginPollResult{}, err
	}
	if session.ID == "" || (session.FlowType != model.LoginFlowDevice && session.FlowType != model.LoginFlowBrowserPoll) {
		return model.LoginPollResult{}, model.ErrAuthInvalid
	}
	if session.FlowType == model.LoginFlowBrowserPoll && session.PollToken != pollToken {
		return model.LoginPollResult{}, model.ErrAuthInvalid
	}
	now := s.now().UTC()
	if now.After(session.ExpiresAt) {
		return model.LoginPollResult{Status: model.LoginSessionStatusExpired}, nil
	}
	if !session.LastPolledAt.IsZero() && now.Sub(session.LastPolledAt) < devicePollInterval {
		return model.LoginPollResult{Status: model.LoginSessionStatusSlowDown}, nil
	}
	if err := s.sessions.MarkPolled(ctx, sessionID, now); err != nil {
		return model.LoginPollResult{}, err
	}

	switch session.Status {
	case model.LoginSessionStatusPending:
		if session.FlowType == model.LoginFlowDevice && !session.UserCodeExpiresAt.IsZero() && now.After(session.UserCodeExpiresAt) {
			return model.LoginPollResult{Status: model.LoginSessionStatusExpired}, nil
		}
		return model.LoginPollResult{Status: model.LoginSessionStatusPending}, nil
	case model.LoginSessionStatusAuthorized:
		return s.issueDeviceCredential(ctx, sessionID, session)
	case model.LoginSessionStatusCompleted:
		return s.issueDeviceCredential(ctx, sessionID, session)
	default:
		return model.LoginPollResult{Status: session.Status}, nil
	}
}

func (s *Service) CheckDeviceCode(ctx context.Context, userCode string) (model.DeviceCodeCheckResult, error) {
	session, err := s.getVerifiableDeviceSession(ctx, userCode)
	if err != nil {
		return model.DeviceCodeCheckResult{}, err
	}
	if session.Status != model.LoginSessionStatusPending {
		return model.DeviceCodeCheckResult{}, model.ErrAuthInvalid
	}
	return model.DeviceCodeCheckResult{Valid: true}, nil
}

func (s *Service) VerifyDeviceCode(ctx context.Context, userCode string, principal model.Principal, authUser model.AuthUser) (model.DeviceVerifyResult, error) {
	if principal.UserID == "" || principal.AuthType == "" {
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	session, err := s.getVerifiableDeviceSession(ctx, userCode)
	if err != nil {
		return model.DeviceVerifyResult{}, err
	}
	if session.Status == model.LoginSessionStatusCompleted {
		return model.DeviceVerifyResult{Message: "authorized"}, nil
	}
	if session.Status != model.LoginSessionStatusPending {
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	authUser, err = s.resolveVerifiedAuthUser(ctx, principal, authUser)
	if err != nil {
		return model.DeviceVerifyResult{}, err
	}
	if err := s.sessions.MarkVerified(ctx, session.ID, authUser, s.now().UTC()); err != nil {
		return model.DeviceVerifyResult{}, err
	}
	return model.DeviceVerifyResult{Message: "authorized"}, nil
}

func (s *Service) resolveVerifiedAuthUser(ctx context.Context, principal model.Principal, fallback model.AuthUser) (model.AuthUser, error) {
	user, err := s.users.GetUserByID(ctx, principal.UserID)
	if err != nil {
		return model.AuthUser{}, err
	}

	authUser := model.AuthUser{
		UserID:  principal.UserID,
		Email:   firstNonEmpty(user.Email, fallback.Email, principal.Email),
		Name:    firstNonEmpty(user.Name, fallback.Name, principal.Name),
		Picture: firstNonEmpty(user.AvatarURL, fallback.Picture, principal.Picture),
	}

	if principal.ExternalUserID != "" {
		updatedUser, _, err := s.users.FindOrCreateByAuthIdentity(ctx, "auth0", model.AuthUser{
			UserID:  principal.ExternalUserID,
			Email:   authUser.Email,
			Name:    authUser.Name,
			Picture: authUser.Picture,
		}, s.now().UTC())
		if err != nil {
			return model.AuthUser{}, err
		}
		authUser.Email = firstNonEmpty(updatedUser.Email, authUser.Email)
		authUser.Name = firstNonEmpty(updatedUser.Name, authUser.Name)
		authUser.Picture = firstNonEmpty(updatedUser.AvatarURL, authUser.Picture)
	}

	return authUser, nil
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func (s *Service) BeginDeviceAuthorization(ctx context.Context, userCode string) (string, error) {
	if userCode == "" {
		return "", model.ErrInvalidParam
	}
	if s == nil || s.authClient == nil {
		return "", model.ErrAuthProviderNotConfigured
	}
	if s.sessions == nil {
		return "", model.ErrInternal
	}

	session, err := s.sessions.GetByUserCode(ctx, userCode)
	if err != nil {
		return "", err
	}
	if session.ID == "" || session.FlowType != model.LoginFlowDevice {
		return "", model.ErrAuthInvalid
	}
	now := s.now().UTC()
	if now.After(session.ExpiresAt) || (!session.UserCodeExpiresAt.IsZero() && now.After(session.UserCodeExpiresAt)) {
		return "", model.ErrAuthExpired
	}
	return s.authClient.BuildLoginURL(ctx, session.State, session.RedirectURI)
}

func (s *Service) CompleteDeviceAuthorization(ctx context.Context, code, state string) error {
	if code == "" || state == "" {
		return model.ErrInvalidParam
	}
	if s == nil || s.authClient == nil {
		return model.ErrAuthProviderNotConfigured
	}
	if s.sessions == nil {
		return model.ErrInternal
	}

	session, err := s.sessions.GetByState(ctx, state)
	if err != nil {
		return err
	}
	if session.ID == "" || session.FlowType != model.LoginFlowDevice {
		return model.ErrAuthInvalid
	}
	if s.now().UTC().After(session.ExpiresAt) {
		return model.ErrAuthExpired
	}

	user, err := s.authClient.ExchangeCode(ctx, code, session.RedirectURI)
	if err != nil {
		return err
	}
	return s.sessions.MarkAuthorized(ctx, session.ID, user, s.now().UTC())
}

func (s *Service) createLoginAPIKey(ctx context.Context, userID string) (model.CreatedAPIKey, error) {
	if s.loginAPIKeyTTL > 0 {
		return s.apiKeys.CreateAPIKeyWithTTL(ctx, userID, "cli", s.loginAPIKeyTTL)
	}
	return s.apiKeys.CreateAPIKey(ctx, userID, "cli")
}

func (s *Service) grantSignupReward(ctx context.Context, userID string, createdUser bool) {
	if !createdUser || s.credit == nil || userID == "" {
		return
	}
	_ = s.credit.GrantSignupReward(ctx, userID)
}

func (s *Service) deviceCallbackURL() string {
	if s.deviceVerificationURL == "" {
		return "https://anycap.local/auth/callback"
	}
	parsed, err := url.Parse(s.deviceVerificationURL)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return "https://anycap.local/auth/callback"
	}
	parsed.Path = path.Join("/", "auth", "callback")
	parsed.RawQuery = ""
	parsed.Fragment = ""
	return parsed.String()
}

func (s *Service) browserCallbackURL() string {
	return s.callbackURLForPath(path.Join("/", "auth", "callback"))
}

func (s *Service) browserLoginURL(browserToken string) string {
	loginURL := s.callbackURLForPath(path.Join("/", "auth", "cli-login"))
	parsed, err := url.Parse(loginURL)
	if err != nil {
		return loginURL
	}
	query := parsed.Query()
	query.Set("cli", "1")
	query.Set("browser_token", browserToken)
	parsed.RawQuery = query.Encode()
	return parsed.String()
}

func (s *Service) callbackURLForPath(targetPath string) string {
	if s.deviceVerificationURL == "" {
		return "https://anycap.local" + targetPath
	}
	parsed, err := url.Parse(s.deviceVerificationURL)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return "https://anycap.local" + targetPath
	}
	parsed.Path = targetPath
	parsed.RawQuery = ""
	parsed.Fragment = ""
	return parsed.String()
}

func (s *Service) issueDeviceCredential(ctx context.Context, sessionID string, session model.LoginSession) (model.LoginPollResult, error) {
	localUser, err := s.resolveDeviceUser(ctx, session)
	if err != nil {
		return model.LoginPollResult{}, err
	}
	created, err := s.createLoginAPIKey(ctx, localUser.ID)
	if err != nil {
		return model.LoginPollResult{}, err
	}
	if err := s.sessions.MarkCompleted(ctx, sessionID, created.APIKey.ID, s.now().UTC()); err != nil {
		return model.LoginPollResult{}, err
	}

	return model.LoginPollResult{
		Status:         model.LoginSessionStatusComplete,
		CredentialType: loginCredentialTypeAPIKey,
		AccessToken:    created.RawKey,
		APIKeyID:       created.APIKey.ID,
		APIKey:         created.RawKey,
		User: &model.LoginUser{
			ID:    localUser.ID,
			Email: localUser.Email,
			Name:  localUser.Name,
		},
	}, nil
}

func (s *Service) getVerifiableDeviceSession(ctx context.Context, userCode string) (model.LoginSession, error) {
	if userCode == "" {
		return model.LoginSession{}, model.ErrInvalidParam
	}
	if s.sessions == nil {
		return model.LoginSession{}, model.ErrInternal
	}
	session, err := s.sessions.GetByUserCode(ctx, userCode)
	if err != nil {
		return model.LoginSession{}, err
	}
	if session.ID == "" || session.FlowType != model.LoginFlowDevice {
		return model.LoginSession{}, model.ErrAuthInvalid
	}
	now := s.now().UTC()
	if now.After(session.ExpiresAt) || (!session.UserCodeExpiresAt.IsZero() && now.After(session.UserCodeExpiresAt)) {
		return model.LoginSession{}, model.ErrAuthExpired
	}
	return session, nil
}

func (s *Service) resolveDeviceUser(ctx context.Context, session model.LoginSession) (model.User, error) {
	if session.AuthorizedUserID != "" {
		return model.User{
			ID:    session.AuthorizedUserID,
			Email: session.AuthUserEmail,
			Name:  session.AuthUserName,
		}, nil
	}
	if session.Auth0Subject == "" {
		return model.User{}, model.ErrAuthInvalid
	}
	authUser := model.AuthUser{
		UserID:  session.Auth0Subject,
		Email:   session.AuthUserEmail,
		Name:    session.AuthUserName,
		Picture: session.AuthUserPicture,
	}
	localUser, createdUser, err := s.users.FindOrCreateByAuthIdentity(ctx, "auth0", authUser, s.now().UTC())
	if err != nil {
		return model.User{}, err
	}
	s.grantSignupReward(ctx, localUser.ID, createdUser)
	return localUser, nil
}
