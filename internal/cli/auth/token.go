package auth

import (
	"encoding/json"
	"fmt"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
)

// tokenResponse is the unified login response parser for all auth flows.
// The server may return either the current MVP API key shape or the older
// API key-in-access_token shape kept for backward compatibility.
//
// MVP API key response:
//
//	{"data":{"api_key":"ak-...","api_key_id":"key-...","user":{...}}}
//
// Legacy API key response:
//
//	{"data":{"credential_type":"api_key","access_token":"sk-...","user":{...}}}
type tokenResponse struct {
	Data struct {
		CredentialType string `json:"credential_type"`
		APIKey         string `json:"api_key"`
		APIKeyID       string `json:"api_key_id"`
		AccessToken    string `json:"access_token"`
		User           *struct {
			ID    string `json:"id"`
			Email string `json:"email"`
			Name  string `json:"name"`
		} `json:"user"`
	} `json:"data"`
}

// parseTokenResponse parses a login response into a Credential and user email.
// It supports both the current API key response shape and the older API key
// in access_token shape retained for compatibility.
// ParsedLogin holds the result of parsing a login response.
type ParsedLogin struct {
	Credential *cliconfig.Credential
	UserID     string
	Email      string
}

func parseTokenResponse(body []byte) (cred *cliconfig.Credential, email string, err error) {
	result, parseErr := parseTokenResponseFull(body)
	if parseErr != nil {
		return nil, "", parseErr
	}
	return result.Credential, result.Email, nil
}

func parseTokenResponseFull(body []byte) (*ParsedLogin, error) {
	var resp tokenResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("failed to parse token response: %w", err)
	}

	d := resp.Data
	result := &ParsedLogin{}
	if d.User != nil {
		result.UserID = d.User.ID
		result.Email = d.User.Email
	}

	if d.APIKey != "" {
		result.Credential = cliconfig.NewAPIKeyCredential(d.APIKey)
		return result, nil
	}

	if d.CredentialType != "" && d.CredentialType != "api_key" {
		return nil, fmt.Errorf("unsupported credential_type: %q", d.CredentialType)
	}
	if d.AccessToken == "" {
		return nil, fmt.Errorf("server returned empty api key")
	}
	result.Credential = cliconfig.NewAPIKeyCredential(d.AccessToken)
	return result, nil
}

func ParseTokenResponseForCLI(body []byte) (cred *cliconfig.Credential, email string, err error) {
	return parseTokenResponse(body)
}

// ParseTokenResponseFull parses a login response and returns the full parsed result
// including user ID for device tracking.
func ParseTokenResponseFull(body []byte) (*ParsedLogin, error) {
	return parseTokenResponseFull(body)
}
