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
//
type tokenResponse struct {
	Data struct {
		CredentialType string `json:"credential_type"`
		APIKey         string `json:"api_key"`
		APIKeyID       string `json:"api_key_id"`
		AccessToken    string `json:"access_token"`
		User           *struct {
			Email string `json:"email"`
			Name  string `json:"name"`
		} `json:"user"`
	} `json:"data"`
}

// parseTokenResponse parses a login response into a Credential and user email.
// It supports both the current API key response shape and the older API key
// in access_token shape retained for compatibility.
func parseTokenResponse(body []byte) (cred *cliconfig.Credential, email string, err error) {
	var resp tokenResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, "", fmt.Errorf("failed to parse token response: %w", err)
	}

	d := resp.Data
	userEmail := ""
	if d.User != nil {
		userEmail = d.User.Email
	}

	if d.APIKey != "" {
		return cliconfig.NewAPIKeyCredential(d.APIKey), userEmail, nil
	}

	if d.CredentialType != "" && d.CredentialType != "api_key" {
		return nil, "", fmt.Errorf("unsupported credential_type: %q", d.CredentialType)
	}
	if d.AccessToken == "" {
		return nil, "", fmt.Errorf("server returned empty api key")
	}
	return cliconfig.NewAPIKeyCredential(d.AccessToken), userEmail, nil
}

func ParseTokenResponseForCLI(body []byte) (cred *cliconfig.Credential, email string, err error) {
	return parseTokenResponse(body)
}
