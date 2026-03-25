package login

import (
	"context"
	"fmt"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

const loginCredentialTypeAPIKey = "api_key"

type Service struct {
	authClient            port.Auth0Client
	users                 port.UserProvisioner
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
	users port.UserProvisioner,
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
			return "state-" + time.Now().UTC().Format("20060102150405")
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

func (s *Service) Init(ctx context.Context, method string, redirectPort int) (model.LoginInitResult, error) {
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
	case model.LoginFlowDevice:
		deviceAuth, err := s.authClient.StartDeviceFlow(ctx)
		if err != nil {
			return model.LoginInitResult{}, err
		}

		session.DeviceCode = deviceAuth.DeviceCode
		session.UserCode = deviceAuth.UserCode
		if session.UserCode == "" {
			session.UserCode = s.userCodeGenerator()
		}
		if deviceAuth.ExpiresIn > 0 {
			session.ExpiresAt = now.Add(time.Duration(deviceAuth.ExpiresIn) * time.Second)
		}
		if err := s.sessions.CreateSession(ctx, session); err != nil {
			return model.LoginInitResult{}, err
		}

		verificationURI := deviceAuth.VerificationURI
		if verificationURI == "" {
			verificationURI = s.deviceVerificationURL
		}
		interval := deviceAuth.Interval
		if interval <= 0 {
			interval = 5
		}

		return model.LoginInitResult{
			FlowType:        session.FlowType,
			LoginSessionID:  session.ID,
			VerificationURI: verificationURI,
			UserCode:        session.UserCode,
			ExpiresIn:       int(session.ExpiresAt.Sub(now).Seconds()),
			Interval:        interval,
		}, nil
	default:
		return model.LoginInitResult{}, model.ErrInvalidParam
	}
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
	if session.ID == "" || session.FlowType != model.LoginFlowLocalhost {
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
	if err := s.sessions.MarkAuthorized(ctx, sessionID, user.UserID, s.now().UTC()); err != nil {
		return model.LoginCallbackResult{}, err
	}
	localUser, err := s.users.FindOrCreateByAuthIdentity(ctx, "auth0", user, s.now().UTC())
	if err != nil {
		return model.LoginCallbackResult{}, err
	}

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

func (s *Service) Poll(ctx context.Context, sessionID string) (model.LoginPollResult, error) {
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
	if session.ID == "" || session.FlowType != model.LoginFlowDevice {
		return model.LoginPollResult{}, model.ErrAuthInvalid
	}
	if s.now().UTC().After(session.ExpiresAt) {
		return model.LoginPollResult{Status: model.LoginSessionStatusExpired}, nil
	}

	switch session.Status {
	case model.LoginSessionStatusPending:
		if session.DeviceCode == "" {
			return model.LoginPollResult{Status: model.LoginSessionStatusPending}, nil
		}

		pollResult, err := s.authClient.PollDeviceFlow(ctx, session.DeviceCode)
		if err != nil {
			return model.LoginPollResult{}, err
		}
		switch pollResult.Status {
		case model.LoginSessionStatusPending, model.LoginSessionStatusSlowDown, model.LoginSessionStatusExpired:
			return model.LoginPollResult{Status: pollResult.Status}, nil
		case model.LoginSessionStatusComplete:
			user := pollResult.User
			if err := s.sessions.MarkAuthorized(ctx, sessionID, user.UserID, s.now().UTC()); err != nil {
				return model.LoginPollResult{}, err
			}
			localUser, err := s.users.FindOrCreateByAuthIdentity(ctx, "auth0", user, s.now().UTC())
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
		default:
			return model.LoginPollResult{Status: pollResult.Status}, nil
		}
	case model.LoginSessionStatusCompleted:
		return model.LoginPollResult{Status: model.LoginSessionStatusComplete}, nil
	default:
		return model.LoginPollResult{Status: session.Status}, nil
	}
}

func (s *Service) createLoginAPIKey(ctx context.Context, userID string) (model.CreatedAPIKey, error) {
	if s.loginAPIKeyTTL > 0 {
		return s.apiKeys.CreateAPIKeyWithTTL(ctx, userID, "cli", s.loginAPIKeyTTL)
	}
	return s.apiKeys.CreateAPIKey(ctx, userID, "cli")
}
