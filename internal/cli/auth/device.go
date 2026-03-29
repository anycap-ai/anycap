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

type DeviceInitResult struct {
	LoginSessionID  string `json:"login_session_id"`
	UserCode        string `json:"user_code"`
	VerificationURI string `json:"verification_uri"`
	Interval        int    `json:"interval"`
	ExpiresIn       int    `json:"expires_in"`
}

type DevicePollResult struct {
	Status   string `json:"status"`
	APIKey   string `json:"api_key"`
	APIKeyID string `json:"api_key_id"`
	User     *struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	} `json:"user"`
}

func DeviceInit(ctx context.Context, client *httpclient.Client) (DeviceInitResult, error) {
	resp, err := client.PostJSON(ctx, "/v1/auth/device-code", map[string]any{})
	if err != nil {
		return DeviceInitResult{}, fmt.Errorf("failed to init device code flow: %w", err)
	}

	var initResp struct {
		Data DeviceInitResult `json:"data"`
	}
	if err := json.Unmarshal(resp.Body, &initResp); err != nil {
		return DeviceInitResult{}, fmt.Errorf("failed to parse device code response: %w", err)
	}

	return initResp.Data, nil
}

func DevicePoll(ctx context.Context, client *httpclient.Client, loginSessionID string) (DevicePollResult, error) {
	resp, err := client.PostJSON(ctx, "/v1/auth/device-poll", map[string]any{
		"login_session_id": loginSessionID,
	})
	if err != nil {
		return DevicePollResult{}, err
	}

	var pollResp struct {
		Data DevicePollResult `json:"data"`
	}
	if err := json.Unmarshal(resp.Body, &pollResp); err != nil {
		return DevicePollResult{}, fmt.Errorf("failed to parse device poll response: %w", err)
	}

	return pollResp.Data, nil
}

// DeviceFlow runs the device code polling auth flow.
func DeviceFlow(ctx context.Context, client *httpclient.Client, stderr io.Writer) (cred *cliconfig.Credential, email string, err error) {
	d, err := DeviceInit(ctx, client)
	if err != nil {
		return nil, "", err
	}

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

		poll, err := DevicePoll(ctx, client, d.LoginSessionID)
		if err != nil {
			fmt.Fprint(stderr, ".")
			continue
		}

		switch poll.Status {
		case "complete", "completed":
			fmt.Fprintln(stderr, " done!")
			body, marshalErr := json.Marshal(map[string]any{
				"data": poll,
			})
			if marshalErr != nil {
				return nil, "", fmt.Errorf("failed to re-encode device poll response: %w", marshalErr)
			}
			cred, email, err := parseTokenResponse(body)
			if err != nil {
				return nil, "", fmt.Errorf("authentication completed but no api key was returned; run 'anycap login' again")
			}
			return cred, email, nil
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
