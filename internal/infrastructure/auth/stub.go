package auth

import (
	"context"
	"fmt"
	"net/url"
	"sync"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type StubClient struct {
	mu          sync.Mutex
	baseURL     string
	users       map[string]model.AuthUser
	deviceUsers map[string]model.AuthUser
	deviceSeq   int
}

func NewStubClient(baseURL string, users map[string]model.AuthUser) *StubClient {
	if users == nil {
		users = map[string]model.AuthUser{
			"demo-code": {UserID: "user-demo", Email: "demo@anycap.local", Name: "Demo User"},
		}
	}

	return &StubClient{
		baseURL:     baseURL,
		users:       users,
		deviceUsers: make(map[string]model.AuthUser),
	}
}

func (c *StubClient) BuildLoginURL(_ context.Context, state, redirectURI string) (string, error) {
	u, err := url.Parse(c.baseURL)
	if err != nil {
		return "", err
	}

	query := u.Query()
	query.Set("state", state)
	if redirectURI != "" {
		query.Set("redirect_uri", redirectURI)
	}
	u.RawQuery = query.Encode()

	return u.String(), nil
}

func (c *StubClient) ExchangeCode(_ context.Context, code, _ string) (model.AuthUser, error) {
	user, ok := c.users[code]
	if !ok {
		return model.AuthUser{}, model.ErrAuthInvalid
	}

	return user, nil
}

func (c *StubClient) StartDeviceFlow(_ context.Context) (model.DeviceAuthorization, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.deviceSeq++
	deviceCode := fmt.Sprintf("device-code-%d", c.deviceSeq)

	return model.DeviceAuthorization{
		DeviceCode:      deviceCode,
		UserCode:        "ANYCAP-0000",
		VerificationURI: "https://anycap.local/device",
		ExpiresIn:       900,
		Interval:        5,
	}, nil
}

func (c *StubClient) PollDeviceFlow(_ context.Context, deviceCode string) (model.DeviceAuthorizationStatus, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	user, ok := c.deviceUsers[deviceCode]
	if !ok {
		return model.DeviceAuthorizationStatus{Status: model.LoginSessionStatusPending}, nil
	}
	return model.DeviceAuthorizationStatus{
		Status: model.LoginSessionStatusComplete,
		User:   user,
	}, nil
}
