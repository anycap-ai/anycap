package auth

import (
	"encoding/json"
	"fmt"
	"time"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
)

// tokenResponse is the unified login response parser for all auth flows.
// The server may return either the current MVP API key shape or the older
// OAuth/token-oriented shape kept for backward compatibility.
//
// MVP API key response:
//
//	{"data":{"api_key":"ak-...","api_key_id":"key-...","user":{...}}}
//
// Legacy API key response:
//
//	{"data":{"credential_type":"api_key","access_token":"sk-...","user":{...}}}
//
// OAuth response:
//
//	{"data":{"credential_type":"oauth","access_token":"eyJ...","refresh_token":"...","expires_in":3600,"user":{...}}}
type tokenResponse struct {
	Data struct {
		CredentialType string `json:"credential_type"`
		APIKey         string `json:"api_key"`
		APIKeyID       string `json:"api_key_id"`
		AccessToken    string `json:"access_token"`
		RefreshToken   string `json:"refresh_token"`
		ExpiresIn      int    `json:"expires_in"`
		User           *struct {
			Email string `json:"email"`
			Name  string `json:"name"`
		} `json:"user"`
	} `json:"data"`
}

// parseTokenResponse parses a login response into a Credential and user email.
// It supports both the current API key response shape and the older OAuth /
// token response shape retained for compatibility.
//
// When credential_type is absent, the function infers the type:
// - If api_key is present -> API key
// - Else if refresh_token is present -> OAuth
// - Otherwise -> API key via access_token
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

	// Determine credential type
	credType := d.CredentialType
	if credType == "" {
		switch {
		case d.RefreshToken != "":
			credType = "oauth"
		default:
			credType = "api_key"
		}
	}

	switch credType {
	case "api_key":
		if d.AccessToken == "" {
			return nil, "", fmt.Errorf("server returned empty api key")
		}
		return cliconfig.NewAPIKeyCredential(d.AccessToken), userEmail, nil
	case "oauth":
		if d.AccessToken == "" {
			return nil, "", fmt.Errorf("server returned empty access_token")
		}
		expiresAt := time.Now().Add(time.Duration(d.ExpiresIn) * time.Second)
		return cliconfig.NewOAuthCredential(d.AccessToken, d.RefreshToken, expiresAt), userEmail, nil
	default:
		return nil, "", fmt.Errorf("unknown credential_type: %q", credType)
	}
}

func ParseTokenResponseForCLI(body []byte) (cred *cliconfig.Credential, email string, err error) {
	return parseTokenResponse(body)
}
