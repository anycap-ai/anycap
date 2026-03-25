package httpclient

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
)

// AuthError is returned when the server responds with 401 Unauthorized.
// Callers can type-assert to provide user-friendly re-login hints.
type AuthError struct {
	Body string
}

func (e *AuthError) Error() string {
	return "not authenticated or API key expired. Run 'anycap login' to authenticate"
}

// Client wraps HTTP communication with the AnyCap Server.
type Client struct {
	baseURL         string
	credential      *cliconfig.Credential
	credentialSaver func(*cliconfig.Credential) error
	version         string
	httpClient      *http.Client
}

// Option configures the Client.
type Option func(*Client)

// WithCredential sets the credential used for authentication.
func WithCredential(cred *cliconfig.Credential) Option {
	return func(c *Client) { c.credential = cred }
}

// WithCredentialSaver sets a callback to persist updated credentials after
// an OAuth token refresh.
func WithCredentialSaver(fn func(*cliconfig.Credential) error) Option {
	return func(c *Client) { c.credentialSaver = fn }
}

// WithVersion sets the User-Agent version string.
func WithVersion(v string) Option {
	return func(c *Client) { c.version = v }
}

// New creates a Client for the given base URL.
func New(baseURL string, opts ...Option) *Client {
	c := &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		version: "dev",
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
	for _, o := range opts {
		o(c)
	}
	return c
}

func (c *Client) Get(ctx context.Context, path string) ([]byte, error) {
	return c.do(ctx, http.MethodGet, path, nil)
}

func (c *Client) PostJSON(ctx context.Context, path string, payload any) ([]byte, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return c.do(ctx, http.MethodPost, path, body)
}

func (c *Client) do(ctx context.Context, method, path string, body []byte) ([]byte, error) {
	// Pre-flight: refresh expired OAuth token before sending.
	if c.canRefresh() && c.credential.IsExpired() {
		_ = c.refreshToken(ctx) // best effort; if it fails, proceed and let server 401
	}

	data, err := c.doRaw(ctx, method, path, body)
	if err != nil {
		// On 401 with an OAuth credential, try one refresh + retry.
		var authErr *AuthError
		if errors.As(err, &authErr) && c.canRefresh() {
			if c.refreshToken(ctx) == nil {
				return c.doRaw(ctx, method, path, body)
			}
		}
		return nil, err
	}
	return data, nil
}

func (c *Client) doRaw(ctx context.Context, method, path string, body []byte) ([]byte, error) {
	var bodyReader io.Reader
	if body != nil {
		bodyReader = bytes.NewReader(body)
	}

	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, bodyReader)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "anycap-cli/"+c.version)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token := c.credential.Token(); token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode == http.StatusUnauthorized {
		return nil, &AuthError{Body: strings.TrimSpace(string(data))}
	}

	if resp.StatusCode >= http.StatusBadRequest {
		return nil, fmt.Errorf("request failed with status %d: %s", resp.StatusCode, strings.TrimSpace(string(data)))
	}

	return data, nil
}

// canRefresh reports whether the current credential supports token refresh.
func (c *Client) canRefresh() bool {
	return c.credential != nil && c.credential.IsOAuth() && c.credential.RefreshToken != ""
}

// refreshToken exchanges the refresh token for a new access token.
// It makes a direct HTTP call (bypassing do/doRaw) to avoid retry loops.
func (c *Client) refreshToken(ctx context.Context) error {
	payload, _ := json.Marshal(map[string]string{
		"refresh_token": c.credential.RefreshToken,
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/v1/auth/refresh", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "anycap-cli/"+c.version)
	// No Authorization header -- the refresh endpoint validates the refresh_token from body.

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("token refresh failed: %s", strings.TrimSpace(string(data)))
	}

	var tokenResp struct {
		Data struct {
			AccessToken  string `json:"access_token"`
			RefreshToken string `json:"refresh_token"`
			ExpiresIn    int    `json:"expires_in"`
		} `json:"data"`
	}
	if err := json.Unmarshal(data, &tokenResp); err != nil {
		return fmt.Errorf("failed to parse refresh response: %w", err)
	}

	expiresAt := time.Now().Add(time.Duration(tokenResp.Data.ExpiresIn) * time.Second)
	refreshToken := tokenResp.Data.RefreshToken
	if refreshToken == "" {
		refreshToken = c.credential.RefreshToken // keep existing if server didn't rotate
	}

	c.credential = cliconfig.NewOAuthCredential(tokenResp.Data.AccessToken, refreshToken, expiresAt)

	if c.credentialSaver != nil {
		return c.credentialSaver(c.credential)
	}
	return nil
}
