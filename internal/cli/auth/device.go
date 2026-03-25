package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"time"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

// DeviceFlow runs the device code polling auth flow.
func DeviceFlow(ctx context.Context, client *httpclient.Client, stderr io.Writer) (cred *cliconfig.Credential, email string, err error) {
	// Step 1: Request device code
	resp, err := client.PostJSON(ctx, "/v1/auth/device-code", map[string]any{})
	if err != nil {
		return nil, "", fmt.Errorf("failed to init device code flow: %w", err)
	}

	var initResp struct {
		Data struct {
			DeviceCode      string `json:"device_code"`
			UserCode        string `json:"user_code"`
			VerificationURI string `json:"verification_uri"`
			Interval        int    `json:"interval"`
			ExpiresIn       int    `json:"expires_in"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp, &initResp); err != nil {
		return nil, "", fmt.Errorf("failed to parse device code response: %w", err)
	}

	d := initResp.Data

	// Step 2: Display code to user
	fmt.Fprintf(stderr, "\n! First, copy your one-time code: %s\n\n", d.UserCode)
	fmt.Fprintf(stderr, "Then open this URL in a browser: %s\n\n", d.VerificationURI)

	// Try to open browser (best effort)
	_ = OpenBrowser(d.VerificationURI)

	fmt.Fprint(stderr, "Waiting for authentication...")

	// Step 3: Poll for completion
	interval := time.Duration(d.Interval) * time.Second
	if interval < time.Second {
		interval = time.Second
	}
	deadline := time.Now().Add(time.Duration(d.ExpiresIn) * time.Second)

	for {
		select {
		case <-ctx.Done():
			return nil, "", ctx.Err()
		case <-time.After(interval):
		}

		if time.Now().After(deadline) {
			return nil, "", fmt.Errorf("\nauthentication expired. Please try again")
		}

		pollResp, err := client.PostJSON(ctx, "/v1/auth/device-poll", map[string]any{
			"device_code": d.DeviceCode,
		})
		if err != nil {
			fmt.Fprint(stderr, ".")
			continue
		}

		var poll struct {
			Data struct {
				Status       string `json:"status"`
				AccessToken  string `json:"access_token"`
				RefreshToken string `json:"refresh_token"`
				ExpiresIn    int    `json:"expires_in"`
				User         *struct {
					Email string `json:"email"`
					Name  string `json:"name"`
				} `json:"user"`
			} `json:"data"`
		}
		if err := json.Unmarshal(pollResp, &poll); err != nil {
			fmt.Fprint(stderr, ".")
			continue
		}

		switch poll.Data.Status {
		case "complete":
			fmt.Fprintln(stderr, " done!")
			userEmail := ""
			if poll.Data.User != nil {
				userEmail = poll.Data.User.Email
			}
			expiresAt := time.Now().Add(time.Duration(poll.Data.ExpiresIn) * time.Second)
			oauthCred := cliconfig.NewOAuthCredential(poll.Data.AccessToken, poll.Data.RefreshToken, expiresAt)
			return oauthCred, userEmail, nil
		case "expired":
			return nil, "", fmt.Errorf("\ndevice code expired. Please try again")
		case "slow_down":
			interval *= 2
			fmt.Fprint(stderr, ".")
		default: // pending
			fmt.Fprint(stderr, ".")
		}
	}
}
