package auth

import (
	"context"
	"net/url"
)

type StubProvider struct {
	baseURL string
}

func NewStubProvider(baseURL string) *StubProvider {
	return &StubProvider{baseURL: baseURL}
}

func (p *StubProvider) BuildLoginURL(_ context.Context, state string) (string, error) {
	u, err := url.Parse(p.baseURL)
	if err != nil {
		return "", err
	}

	query := u.Query()
	query.Set("state", state)
	u.RawQuery = query.Encode()

	return u.String(), nil
}
