package auth

import (
	"context"
	"io"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type ClientConfig struct {
	Issuer       string
	Audience     string
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type Client struct {
	cfg        ClientConfig
	httpClient *http.Client
}

func NewClient(cfg ClientConfig, httpClient *http.Client) *Client {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 10 * time.Second}
	}
	return &Client{cfg: cfg, httpClient: httpClient}
}

func (c *Client) BuildLoginURL(_ context.Context, state, redirectURI string) (string, error) {
	base, err := normalizeIssuerURL(c.cfg.Issuer)
	if err != nil {
		return "", err
	}
	base.Path = joinURLPath(base.Path, "authorize")
	query := base.Query()
	query.Set("response_type", "code")
	query.Set("client_id", c.cfg.ClientID)
	query.Set("redirect_uri", resolveRedirectURI(c.cfg.RedirectURL, redirectURI))
	query.Set("scope", "openid profile email")
	query.Set("state", state)
	query.Set("prompt", "login")
	if c.cfg.Audience != "" {
		query.Set("audience", c.cfg.Audience)
	}
	base.RawQuery = query.Encode()
	return base.String(), nil
}

func normalizeIssuerURL(raw string) (*url.URL, error) {
	if strings.TrimSpace(raw) == "" {
		return nil, model.ErrInternal
	}
	parsed, err := url.Parse(raw)
	if err != nil {
		return nil, model.ErrInternal
	}
	if parsed.Scheme == "" {
		parsed, err = url.Parse("https://" + raw)
		if err != nil {
			return nil, model.ErrInternal
		}
	}
	return parsed, nil
}

func joinURLPath(basePath, suffix string) string {
	cleanBase := strings.TrimSuffix(basePath, "/")
	return path.Join(cleanBase, suffix)
}

func resolveRedirectURI(defaultRedirectURI, override string) string {
	if strings.TrimSpace(override) != "" {
		return override
	}
	return defaultRedirectURI
}

func mapAuthError(resp *http.Response) error {
	if resp != nil && resp.Body != nil {
		_, _ = io.Copy(io.Discard, resp.Body)
	}
	if resp == nil {
		return model.ErrInternal
	}
	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden || resp.StatusCode == http.StatusBadRequest {
		return model.ErrAuthInvalid
	}
	return model.ErrInternal
}
