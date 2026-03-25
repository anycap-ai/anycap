package auth

import (
	"encoding/json"
	"fmt"
	"time"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
)

// tokenResponse is the unified server response for all login flows.
// The server may return either an API key or OAuth tokens.
//
// API key response:
//
//	{"data":{"credential_type":"api_key","access_token":"sk-...","user":{...}}}
//
// OAuth response:
//
//	{"data":{"credential_type":"oauth","access_token":"eyJ...","refresh_token":"...","expires_in":3600,"user":{...}}}
type tokenResponse struct {
	Data struct {
		CredentialType string `json:"credential_type"`
		AccessToken    string `json:"access_token"`
		RefreshToken   string `json:"refresh_token"`
		ExpiresIn      int    `json:"expires_in"`
		User           *struct {
			Email string `json:"email"`
			Name  string `json:"name"`
		} `json:"user"`
	} `json:"data"`
}

// parseTokenResponse parses a unified login response into a Credential
// and user email. It supports both API key and OAuth credential types.
//
// When credential_type is absent, the function infers the type:
// - If refresh_token is present -> OAuth
// - Otherwise -> API key
func parseTokenResponse(body []byte) (cred *cliconfig.Credential, email string, err error) {
	var resp tokenResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, "", fmt.Errorf("failed to parse token response: %w", err)
	}

	d := resp.Data
	if d.AccessToken == "" {
		return nil, "", fmt.Errorf("server returned empty access_token")
	}

	userEmail := ""
	if d.User != nil {
		userEmail = d.User.Email
	}

	// Determine credential type
	credType := d.CredentialType
	if credType == "" {
		// Infer from presence of refresh_token (backward compatibility)
		if d.RefreshToken != "" {
			credType = "oauth"
		} else {
			credType = "api_key"
		}
	}

	switch credType {
	case "api_key":
		return cliconfig.NewAPIKeyCredential(d.AccessToken), userEmail, nil
	case "oauth":
		expiresAt := time.Now().Add(time.Duration(d.ExpiresIn) * time.Second)
		return cliconfig.NewOAuthCredential(d.AccessToken, d.RefreshToken, expiresAt), userEmail, nil
	default:
		return nil, "", fmt.Errorf("unknown credential_type: %q", credType)
	}
}
