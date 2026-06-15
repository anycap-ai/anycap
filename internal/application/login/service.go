package login

import (
	"context"
	"errors"
	"net/url"
	"path"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/pkg/externalid"
	"gitlab.knoffice.tech/open/common-go/logging"
)

const (
	loginCredentialTypeAPIKey = "api_key"
	devicePollInterval        = 5 * time.Second
	deviceUserCodeMaxAttempts = 5
)

type Service struct {
	users interface {
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
	signupRewardDeadline  time.Time
}

func NewService(
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
	signupRewardDeadline time.Time,
) *Service {
	if stateGenerator == nil {
		stateGenerator = func() string {
			return "state-" + time.Now().UTC().Format("20060102150405.000000000")
		}
	}
	if sessionIDGenerator == nil {
		sessionIDGenerator = func() string {
			return externalid.Generate(externalid.PrefixLoginSession)
		}
	}
	if userCodeGenerator == nil {
		userCodeGenerator = defaultDeviceUserCode
	}
	if now == nil {
		now = time.Now
	}
	if deviceVerificationURL == "" {
		deviceVerificationURL = "https://anycap.local/auth/device"
	}

	return &Service{
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
		signupRewardDeadline:  signupRewardDeadline,
	}
}

func (s *Service) Init(ctx context.Context, method string) (model.LoginInitResult, error) {
	logger := logging.WithContext(ctx).WithFields(logging.Fields{
		"flow":   "login.init",
		"method": method,
	})
	if s.sessions == nil {
		logger.Error("login session repo not configured")
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
	case "", model.LoginFlowBrowserPoll:
		session.FlowType = model.LoginFlowBrowserPoll
		session.State = s.stateGenerator()
		session.BrowserToken = "browser-" + session.ID
		session.PollToken = "poll-" + session.ID
		if err := s.sessions.CreateSession(ctx, session); err != nil {
			logger.WithError(err).Error("create browser poll login session failed")
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
		session.UserCodeExpiresAt = now.Add(5 * time.Minute)
		if err := s.createDeviceSession(ctx, &session); err != nil {
			logger.WithError(err).Error("create device login session failed")
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
		logger.Warn("unsupported login init method")
		return model.LoginInitResult{}, model.ErrInvalidParam
	}
}

func (s *Service) createDeviceSession(ctx context.Context, session *model.LoginSession) error {
	var err error
	for range deviceUserCodeMaxAttempts {
		session.UserCode = s.userCodeGenerator()
		err = s.sessions.CreateSession(ctx, *session)
		if err == nil {
			return nil
		}
		if !errors.Is(err, port.ErrLoginUserCodeConflict) {
			return err
		}
	}
	return err
}

func (s *Service) BrowserVerify(ctx context.Context, browserToken string, principal model.Principal, authUser model.AuthUser) (model.DeviceVerifyResult, error) {
	logger := logging.WithContext(ctx).WithFields(logging.Fields{
		"flow": "login.browser_verify",
	})
	if browserToken == "" {
		logger.Warn("missing browser token")
		return model.DeviceVerifyResult{}, model.ErrInvalidParam
	}
	if principal.UserID == "" || principal.AuthType == "" {
		logger.Warn("invalid principal for browser verify")
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	if principal.AuthType != "auth0_jwt" && principal.AuthType != "local_bypass" {
		logger.WithField("auth_type", principal.AuthType).Warn("unsupported auth type for browser verify")
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	if s.sessions == nil || s.users == nil {
		logger.Error("browser verify dependencies not configured")
		return model.DeviceVerifyResult{}, model.ErrInternal
	}

	session, err := s.sessions.GetByBrowserToken(ctx, browserToken)
	if err != nil {
		logger.WithError(err).Error("load browser verify session failed")
		return model.DeviceVerifyResult{}, err
	}
	if session.ID == "" || session.FlowType != model.LoginFlowBrowserPoll {
		logger.Warn("browser verify session invalid")
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	if session.Status == model.LoginSessionStatusCompleted || session.Status == model.LoginSessionStatusAuthorized {
		return model.DeviceVerifyResult{Message: "authorized"}, nil
	}
	if session.Status != model.LoginSessionStatusPending {
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	if s.now().UTC().After(session.ExpiresAt) {
		logger.WithField("login_session_id", session.ID).Warn("browser verify session expired")
		return model.DeviceVerifyResult{}, model.ErrAuthExpired
	}

	authUser, err = s.resolveVerifiedAuthUser(ctx, principal, authUser)
	if err != nil {
		logger.WithField("login_session_id", session.ID).WithError(err).Error("resolve verified auth user failed")
		return model.DeviceVerifyResult{}, err
	}
	s.grantSignupReward(ctx, principal.UserID, principal.CreatedUser)
	if err := s.sessions.MarkVerified(ctx, session.ID, authUser, s.now().UTC()); err != nil {
		logger.WithField("login_session_id", session.ID).WithError(err).Error("mark browser verify session authorized failed")
		return model.DeviceVerifyResult{}, err
	}
	return model.DeviceVerifyResult{Message: "authorized"}, nil
}

func (s *Service) Exchange(ctx context.Context, principal model.Principal) (model.LoginCallbackResult, error) {
	logger := logging.WithContext(ctx).WithField("flow", "login.exchange")
	if principal.UserID == "" || principal.AuthType == "" {
		logger.Warn("invalid principal for login exchange")
		return model.LoginCallbackResult{}, model.ErrAuthInvalid
	}
	if s == nil || s.users == nil || s.apiKeys == nil {
		logger.Error("login exchange dependencies not configured")
		return model.LoginCallbackResult{}, model.ErrInternal
	}
	if principal.AuthType != "auth0_jwt" && principal.AuthType != "local_bypass" {
		logger.WithField("auth_type", principal.AuthType).Warn("unsupported auth type for login exchange")
		return model.LoginCallbackResult{}, model.ErrAuthInvalid
	}

	localUser, err := s.users.GetUserByID(ctx, principal.UserID)
	if err != nil {
		logger.WithError(err).Error("load local user for login exchange failed")
		return model.LoginCallbackResult{}, err
	}
	created, err := s.createLoginAPIKey(ctx, localUser.ID)
	if err != nil {
		logger.WithField("user_id", localUser.ID).WithError(err).Error("create login api key failed")
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
	logger := logging.WithContext(ctx).WithFields(logging.Fields{
		"flow":             "login.poll",
		"login_session_id": sessionID,
	})
	if sessionID == "" {
		logger.Warn("missing login session id")
		return model.LoginPollResult{}, model.ErrInvalidParam
	}
	if s.sessions == nil || s.users == nil {
		logger.Error("login poll dependencies not configured")
		return model.LoginPollResult{}, model.ErrInternal
	}

	session, err := s.sessions.GetByID(ctx, sessionID)
	if err != nil {
		logger.WithError(err).Error("load login poll session failed")
		return model.LoginPollResult{}, err
	}
	if session.ID == "" || (session.FlowType != model.LoginFlowDevice && session.FlowType != model.LoginFlowBrowserPoll) {
		logger.Warn("login poll session invalid")
		return model.LoginPollResult{}, model.ErrAuthInvalid
	}
	if session.FlowType == model.LoginFlowBrowserPoll && session.PollToken != pollToken {
		logger.Warn("login poll token mismatch")
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
		logger.WithError(err).Error("mark login session polled failed")
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
		return model.LoginPollResult{Status: model.LoginSessionStatusComplete}, nil
	default:
		return model.LoginPollResult{Status: session.Status}, nil
	}
}

func (s *Service) CheckDeviceCode(ctx context.Context, userCode string) (model.DeviceCodeCheckResult, error) {
	logger := logging.WithContext(ctx).WithField("flow", "login.device_code_check")
	session, err := s.getVerifiableDeviceSession(ctx, userCode)
	if err != nil {
		logger.WithError(err).Error("load verifiable device session failed")
		return model.DeviceCodeCheckResult{}, err
	}
	if session.Status != model.LoginSessionStatusPending {
		logger.WithField("login_session_id", session.ID).Warn("device code check rejected by session status")
		return model.DeviceCodeCheckResult{}, model.ErrAuthInvalid
	}
	return model.DeviceCodeCheckResult{Valid: true}, nil
}

func (s *Service) VerifyDeviceCode(ctx context.Context, userCode string, principal model.Principal, authUser model.AuthUser) (model.DeviceVerifyResult, error) {
	logger := logging.WithContext(ctx).WithField("flow", "login.device_verify")
	if principal.UserID == "" || principal.AuthType == "" {
		logger.Warn("invalid principal for device verify")
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	session, err := s.getVerifiableDeviceSession(ctx, userCode)
	if err != nil {
		logger.WithError(err).Error("load device verify session failed")
		return model.DeviceVerifyResult{}, err
	}
	if session.Status == model.LoginSessionStatusCompleted || session.Status == model.LoginSessionStatusAuthorized {
		return model.DeviceVerifyResult{Message: "authorized"}, nil
	}
	if session.Status != model.LoginSessionStatusPending {
		return model.DeviceVerifyResult{}, model.ErrAuthInvalid
	}
	authUser, err = s.resolveVerifiedAuthUser(ctx, principal, authUser)
	if err != nil {
		logger.WithField("login_session_id", session.ID).WithError(err).Error("resolve device verify auth user failed")
		return model.DeviceVerifyResult{}, err
	}
	s.grantSignupReward(ctx, principal.UserID, principal.CreatedUser)
	if err := s.sessions.MarkVerified(ctx, session.ID, authUser, s.now().UTC()); err != nil {
		logger.WithField("login_session_id", session.ID).WithError(err).Error("mark device session authorized failed")
		return model.DeviceVerifyResult{}, err
	}
	return model.DeviceVerifyResult{Message: "authorized"}, nil
}

func (s *Service) resolveVerifiedAuthUser(ctx context.Context, principal model.Principal, fallback model.AuthUser) (model.AuthUser, error) {
	user, err := s.users.GetUserByID(ctx, principal.UserID)
	if err != nil {
		logging.WithContext(ctx).WithField("flow", "login.resolve_verified_auth_user").WithError(err).Error("load local user for verified auth user failed")
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
			logging.WithContext(ctx).WithField("flow", "login.resolve_verified_auth_user").WithError(err).Error("find or create linked auth user failed")
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
	if !s.signupRewardDeadline.IsZero() && s.now().UTC().After(s.signupRewardDeadline.UTC()) {
		return
	}
	if err := s.credit.GrantSignupReward(ctx, userID); err != nil {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"flow":    "login.grant_signup_reward",
			"user_id": userID,
		}).WithError(err).Warn("grant signup reward failed")
	}
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
	logger := logging.WithContext(ctx).WithFields(logging.Fields{
		"flow":             "login.issue_device_credential",
		"login_session_id": sessionID,
	})
	localUser, err := s.resolveDeviceUser(ctx, session)
	if err != nil {
		logger.WithError(err).Error("resolve device user failed")
		return model.LoginPollResult{}, err
	}
	created, err := s.createLoginAPIKey(ctx, localUser.ID)
	if err != nil {
		logger.WithField("user_id", localUser.ID).WithError(err).Error("create device api key failed")
		return model.LoginPollResult{}, err
	}
	if err := s.sessions.MarkCompleted(ctx, sessionID, created.APIKey.ID, s.now().UTC()); err != nil {
		logger.WithError(err).Error("mark login session completed failed")
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
		logging.WithContext(ctx).WithField("flow", "login.get_verifiable_device_session").Warn("missing device user code")
		return model.LoginSession{}, model.ErrInvalidParam
	}
	if s.sessions == nil {
		logging.WithContext(ctx).WithField("flow", "login.get_verifiable_device_session").Error("login session repo not configured")
		return model.LoginSession{}, model.ErrInternal
	}
	session, err := s.sessions.GetByUserCode(ctx, userCode)
	if err != nil {
		logging.WithContext(ctx).WithField("flow", "login.get_verifiable_device_session").WithError(err).Error("load device session by user code failed")
		return model.LoginSession{}, err
	}
	if session.ID == "" || session.FlowType != model.LoginFlowDevice {
		logging.WithContext(ctx).WithField("flow", "login.get_verifiable_device_session").Warn("device session invalid")
		return model.LoginSession{}, model.ErrAuthInvalid
	}
	now := s.now().UTC()
	if now.After(session.ExpiresAt) || (!session.UserCodeExpiresAt.IsZero() && now.After(session.UserCodeExpiresAt)) {
		logging.WithContext(ctx).WithFields(logging.Fields{
			"flow":             "login.get_verifiable_device_session",
			"login_session_id": session.ID,
		}).Warn("device session expired")
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
		logging.WithContext(ctx).WithField("flow", "login.resolve_device_user").Warn("missing auth0 subject in device session")
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
		logging.WithContext(ctx).WithField("flow", "login.resolve_device_user").WithError(err).Error("find or create device user failed")
		return model.User{}, err
	}
	s.grantSignupReward(ctx, localUser.ID, createdUser)
	return localUser, nil
}
