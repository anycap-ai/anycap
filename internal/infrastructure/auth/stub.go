package auth

import (
	"context"
	"net/url"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type StubClient struct {
	baseURL string
}

func NewStubClient(baseURL string, users map[string]model.AuthUser) *StubClient {
	_ = users
	return &StubClient{
		baseURL: baseURL,
	}
}

func NewStubProvider(baseURL string) *StubClient {
	return NewStubClient(baseURL, nil)
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
