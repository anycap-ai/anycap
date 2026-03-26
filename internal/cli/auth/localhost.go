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

const callbackTimeout = 5 * time.Minute

// BrowserPollFlow runs the browser login flow backed by a frontend-domain callback
// and server-side polling for the final API key.
func BrowserPollFlow(ctx context.Context, client *httpclient.Client, stderr io.Writer) (cred *cliconfig.Credential, email string, err error) {
	resp, err := client.PostJSON(ctx, "/v1/auth/login", map[string]any{
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
		fmt.Fprintf(stderr, "Could not open browser. Visit this URL manually:\n  %s\n", d.BrowserURL)
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

		pollResp, err := client.PostJSON(ctx, "/v1/auth/poll", map[string]any{
			"login_session_id": d.LoginSessionID,
			"poll_token":       d.PollToken,
		})
		if err != nil {
			fmt.Fprint(stderr, ".")
			continue
		}

		var poll struct {
			Data struct {
				Status string `json:"status"`
			} `json:"data"`
		}
		if err := json.Unmarshal(pollResp.Body, &poll); err != nil {
			fmt.Fprint(stderr, ".")
			continue
		}

		switch poll.Data.Status {
		case "complete", "completed":
			fmt.Fprintln(stderr, " done!")
			cred, email, err := parseTokenResponse(pollResp.Body)
			if err != nil {
				return nil, "", err
			}
			return cred, email, nil
		case "expired":
			return nil, "", fmt.Errorf("authentication expired. Please try again")
		case "slow_down":
			interval *= 2
			fmt.Fprint(stderr, ".")
		default:
			fmt.Fprint(stderr, ".")
		}
	}
}

// LocalhostFlow is kept as a compatibility alias while browser_poll replaces
// the localhost callback flow as the default browser login path.
func LocalhostFlow(ctx context.Context, client *httpclient.Client, stderr io.Writer) (cred *cliconfig.Credential, email string, err error) {
	return BrowserPollFlow(ctx, client, stderr)
}

// CanBindLocalPort is kept for compatibility with older code paths.
func CanBindLocalPort() bool {
	return true
}
