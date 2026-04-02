package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"time"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"
)

const callbackTimeout = 5 * time.Minute

// ErrBrowserUnavailable is returned when the browser cannot be opened.
// AutoFlow uses this to fall back to device code flow.
var ErrBrowserUnavailable = errors.New("browser unavailable")

// BrowserPollFlow runs the browser login flow backed by a frontend-domain callback
// and server-side polling for the final API key.
func BrowserPollFlow(ctx context.Context, client *httpclient.Client, stderr io.Writer) (cred *cliconfig.Credential, email string, err error) {
	resp, err := client.PostJSON(ctx, api.AuthLoginPath, map[string]any{
		"method": "browser_poll",
	})
	if err != nil {
		return nil, "", fmt.Errorf("failed to init browser login: %w", err)
	}

	var initResp struct {
		Data struct {
			LoginSessionID string `json:"login_session_id"`
			BrowserURL     string `json:"browser_url"`
			PollToken      string `json:"poll_token"`
			Interval       int    `json:"interval"`
			ExpiresIn      int    `json:"expires_in"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp.Body, &initResp); err != nil {
		return nil, "", fmt.Errorf("failed to parse browser login response: %w", err)
	}

	d := initResp.Data
	if d.LoginSessionID == "" || d.BrowserURL == "" || d.PollToken == "" {
		return nil, "", fmt.Errorf("browser login response missing required fields")
	}

	fmt.Fprintln(stderr, "Opening browser to authenticate...")
	if err := OpenBrowser(d.BrowserURL); err != nil {
		return nil, "", fmt.Errorf("%w: %v", ErrBrowserUnavailable, err)
	}
	fmt.Fprintln(stderr, "Waiting for authentication...")

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
			return nil, "", fmt.Errorf("authentication timed out after %v. Try 'anycap login --headless' instead", callbackTimeout)
		}

		pollResp, err := client.PostJSON(ctx, api.AuthPollPath, map[string]any{
			"login_session_id": d.LoginSessionID,
			"poll_token":       d.PollToken,
		})
		if err != nil {
			continue
		}

		var poll struct {
			Data struct {
				Status string `json:"status"`
			} `json:"data"`
		}
		if err := json.Unmarshal(pollResp.Body, &poll); err != nil {
			continue
		}

		switch poll.Data.Status {
		case "complete", "completed":
			result, parseErr := parseTokenResponseFull(pollResp.Body)
			if parseErr != nil {
				return nil, "", fmt.Errorf("authentication completed but no api key was returned; run 'anycap login' again")
			}
			cliconfig.SetDeviceUserID(result.UserID)
			return result.Credential, result.Email, nil
		case "expired":
			return nil, "", fmt.Errorf("authentication expired. Please try again")
		case "slow_down":
			interval *= 2
		default:
			// pending -- keep polling silently
		}
	}
}
