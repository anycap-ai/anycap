package auth

import (
	"context"
	"net/url"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type StubClient struct {
	baseURL string
	users   map[string]model.AuthUser
}

func NewStubClient(baseURL string, users map[string]model.AuthUser) *StubClient {
	if users == nil {
		users = map[string]model.AuthUser{
			"demo-code": {UserID: "user-demo", Email: "demo@anycap.local", Name: "Demo User"},
		}
	}

	return &StubClient{baseURL: baseURL, users: users}
}

func (c *StubClient) BuildLoginURL(_ context.Context, state string) (string, error) {
	u, err := url.Parse(c.baseURL)
	if err != nil {
		return "", err
	}

	query := u.Query()
	query.Set("state", state)
	u.RawQuery = query.Encode()

	return u.String(), nil
}

func (c *StubClient) ExchangeCode(_ context.Context, code string) (model.AuthUser, error) {
	user, ok := c.users[code]
	if !ok {
		return model.AuthUser{}, model.ErrAuthInvalid
	}

	return user, nil
}
