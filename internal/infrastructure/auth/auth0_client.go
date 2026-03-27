package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
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

func (c *Client) ExchangeCode(ctx context.Context, code, redirectURI string) (model.AuthUser, error) {
	tokenResp, err := c.exchangeToken(ctx, map[string]string{
		"grant_type":    "authorization_code",
		"client_id":     c.cfg.ClientID,
		"client_secret": c.cfg.ClientSecret,
		"code":          code,
		"redirect_uri":  resolveRedirectURI(c.cfg.RedirectURL, redirectURI),
	})
	if err != nil {
		return model.AuthUser{}, err
	}
	return c.fetchUserInfo(ctx, tokenResp.AccessToken)
}

func (c *Client) StartDeviceFlow(ctx context.Context) (model.DeviceAuthorization, error) {
	base, err := normalizeIssuerURL(c.cfg.Issuer)
	if err != nil {
		return model.DeviceAuthorization{}, err
	}

	payload, _ := json.Marshal(map[string]string{
		"client_id": c.cfg.ClientID,
		"audience":  c.cfg.Audience,
		"scope":     "openid profile email",
	})

	deviceURL := *base
	deviceURL.Path = joinURLPath(base.Path, "oauth/device/code")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, deviceURL.String(), bytes.NewReader(payload))
	if err != nil {
		return model.DeviceAuthorization{}, model.ErrInternal
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return model.DeviceAuthorization{}, model.ErrInternal
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return model.DeviceAuthorization{}, mapAuthError(resp)
	}

	var deviceResp struct {
		DeviceCode      string `json:"device_code"`
		UserCode        string `json:"user_code"`
		VerificationURI string `json:"verification_uri"`
		ExpiresIn       int    `json:"expires_in"`
		Interval        int    `json:"interval"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&deviceResp); err != nil {
		return model.DeviceAuthorization{}, model.ErrInternal
	}
	if deviceResp.DeviceCode == "" || deviceResp.UserCode == "" {
		return model.DeviceAuthorization{}, model.ErrAuthInvalid
	}

	return model.DeviceAuthorization{
		DeviceCode:      deviceResp.DeviceCode,
		UserCode:        deviceResp.UserCode,
		VerificationURI: deviceResp.VerificationURI,
		ExpiresIn:       deviceResp.ExpiresIn,
		Interval:        deviceResp.Interval,
	}, nil
}

func (c *Client) PollDeviceFlow(ctx context.Context, deviceCode string) (model.DeviceAuthorizationStatus, error) {
	tokenResp, err := c.exchangeToken(ctx, map[string]string{
		"grant_type":    "urn:ietf:params:oauth:grant-type:device_code",
		"client_id":     c.cfg.ClientID,
		"client_secret": c.cfg.ClientSecret,
		"device_code":   deviceCode,
	})
	if err != nil {
		if errors.Is(err, errAuthorizationPending) {
			return model.DeviceAuthorizationStatus{Status: model.LoginSessionStatusPending}, nil
		}
		if errors.Is(err, errSlowDown) {
			return model.DeviceAuthorizationStatus{Status: model.LoginSessionStatusSlowDown}, nil
		}
		if errors.Is(err, errDeviceExpired) {
			return model.DeviceAuthorizationStatus{Status: model.LoginSessionStatusExpired}, nil
		}
		return model.DeviceAuthorizationStatus{}, err
	}

	user, err := c.fetchUserInfo(ctx, tokenResp.AccessToken)
	if err != nil {
		return model.DeviceAuthorizationStatus{}, err
	}
	return model.DeviceAuthorizationStatus{
		Status: model.LoginSessionStatusComplete,
		User:   user,
	}, nil
}

type tokenResponse struct {
	AccessToken string `json:"access_token"`
}

func (c *Client) exchangeToken(ctx context.Context, payload map[string]string) (tokenResponse, error) {
	base, err := normalizeIssuerURL(c.cfg.Issuer)
	if err != nil {
		return tokenResponse{}, err
	}

	encoded, _ := json.Marshal(payload)
	tokenURL := *base
	tokenURL.Path = joinURLPath(base.Path, "oauth/token")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, tokenURL.String(), bytes.NewReader(encoded))
	if err != nil {
		return tokenResponse{}, model.ErrInternal
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return tokenResponse{}, model.ErrInternal
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return tokenResponse{}, mapTokenError(resp, payload["grant_type"] == "urn:ietf:params:oauth:grant-type:device_code")
	}

	var tokenResp tokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return tokenResponse{}, model.ErrInternal
	}
	if tokenResp.AccessToken == "" {
		return tokenResponse{}, model.ErrAuthInvalid
	}
	return tokenResp, nil
}

func (c *Client) fetchUserInfo(ctx context.Context, accessToken string) (model.AuthUser, error) {
	base, err := normalizeIssuerURL(c.cfg.Issuer)
	if err != nil {
		return model.AuthUser{}, err
	}

	userInfoURL := *base
	userInfoURL.Path = joinURLPath(base.Path, "userinfo")
	userReq, err := http.NewRequestWithContext(ctx, http.MethodGet, userInfoURL.String(), nil)
	if err != nil {
		return model.AuthUser{}, model.ErrInternal
	}
	userReq.Header.Set("Authorization", "Bearer "+accessToken)

	userResp, err := c.httpClient.Do(userReq)
	if err != nil {
		return model.AuthUser{}, model.ErrInternal
	}
	defer userResp.Body.Close()

	if userResp.StatusCode >= http.StatusBadRequest {
		return model.AuthUser{}, mapAuthError(userResp)
	}

	var userInfo struct {
		Sub     string `json:"sub"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}
	if err := json.NewDecoder(userResp.Body).Decode(&userInfo); err != nil {
		return model.AuthUser{}, model.ErrInternal
	}
	if userInfo.Sub == "" {
		return model.AuthUser{}, model.ErrAuthInvalid
	}

	return model.AuthUser{
		UserID:  userInfo.Sub,
		Email:   userInfo.Email,
		Name:    userInfo.Name,
		Picture: userInfo.Picture,
	}, nil
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

var (
	errAuthorizationPending = errors.New("authorization_pending")
	errSlowDown             = errors.New("slow_down")
	errDeviceExpired        = errors.New("expired_token")
)

func mapAuthError(resp *http.Response) error {
	return mapTokenError(resp, false)
}

func mapTokenError(resp *http.Response, deviceFlow bool) error {
	var body struct {
		Error string `json:"error"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&body)
	if deviceFlow && body.Error != "" {
		switch body.Error {
		case "authorization_pending":
			return errAuthorizationPending
		case "slow_down":
			return errSlowDown
		case "expired_token", "access_denied":
			return errDeviceExpired
		}
	}
	if resp.StatusCode >= http.StatusBadRequest && resp.StatusCode < http.StatusInternalServerError {
		return model.ErrAuthInvalid
	}
	return model.ErrInternal
}
