package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"time"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

const callbackTimeout = 5 * time.Minute

// successHTML is displayed in the browser after successful auth.
const successHTML = `<!DOCTYPE html>
<html><head><title>AnyCap - Authenticated</title>
<style>body{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f8f9fa}
.card{text-align:center;padding:2rem;border-radius:8px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.1)}
h1{color:#22c55e;margin-bottom:.5rem}</style></head>
<body><div class="card"><h1>Authenticated</h1><p>You can close this tab and return to the terminal.</p></div></body></html>`

// callbackResult is received from the local HTTP server.
type callbackResult struct {
	Code  string
	State string
	Err   error
}

// LocalhostFlow runs the localhost callback auth flow.
// It binds a local port, calls the server to get an auth URL, opens the browser,
// waits for the callback, and exchanges the code for OAuth tokens.
func LocalhostFlow(ctx context.Context, client *httpclient.Client, stderr io.Writer) (cred *cliconfig.Credential, email string, err error) {
	// Step 1: Bind a random local port
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, "", fmt.Errorf("failed to bind local port: %w", err)
	}
	port := listener.Addr().(*net.TCPAddr).Port

	// Step 2: Call server to initiate login
	resp, err := client.PostJSON(ctx, "/v1/auth/login", map[string]any{
		"method":        "localhost",
		"redirect_port": port,
	})
	if err != nil {
		listener.Close()
		return nil, "", fmt.Errorf("failed to init login: %w", err)
	}

	var initResp struct {
		Data struct {
			AuthURL string `json:"auth_url"`
			State   string `json:"state"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp, &initResp); err != nil {
		listener.Close()
		return nil, "", fmt.Errorf("failed to parse login response: %w", err)
	}

	// Step 3: Start local callback server
	resultCh := make(chan callbackResult, 1)
	mux := http.NewServeMux()
	mux.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		code := r.URL.Query().Get("code")
		state := r.URL.Query().Get("state")
		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, successHTML)
		resultCh <- callbackResult{Code: code, State: state}
	})

	srv := &http.Server{Handler: mux}
	go func() { _ = srv.Serve(listener) }()

	defer func() {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		_ = srv.Shutdown(shutdownCtx)
	}()

	// Step 4: Open browser
	fmt.Fprintln(stderr, "Opening browser to authenticate...")
	if err := OpenBrowser(initResp.Data.AuthURL); err != nil {
		fmt.Fprintf(stderr, "Could not open browser. Visit this URL manually:\n  %s\n", initResp.Data.AuthURL)
	}
	fmt.Fprintln(stderr, "Waiting for authentication...")

	// Step 5: Wait for callback
	var result callbackResult
	select {
	case result = <-resultCh:
	case <-time.After(callbackTimeout):
		return nil, "", fmt.Errorf("authentication timed out after %v. Try 'anycap login --headless' instead", callbackTimeout)
	case <-ctx.Done():
		return nil, "", ctx.Err()
	}

	if result.Err != nil {
		return nil, "", result.Err
	}

	if result.State != initResp.Data.State {
		return nil, "", fmt.Errorf("state mismatch: possible CSRF attack")
	}

	// Step 6: Exchange code for OAuth tokens
	callbackResp, err := client.PostJSON(ctx, "/v1/auth/callback", map[string]any{
		"code":  result.Code,
		"state": result.State,
	})
	if err != nil {
		return nil, "", fmt.Errorf("failed to exchange code: %w", err)
	}

	var tokenResp struct {
		Data struct {
			AccessToken  string `json:"access_token"`
			RefreshToken string `json:"refresh_token"`
			ExpiresIn    int    `json:"expires_in"`
			User         struct {
				Email string `json:"email"`
				Name  string `json:"name"`
			} `json:"user"`
		} `json:"data"`
	}
	if err := json.Unmarshal(callbackResp, &tokenResp); err != nil {
		return nil, "", fmt.Errorf("failed to parse callback response: %w", err)
	}

	expiresAt := time.Now().Add(time.Duration(tokenResp.Data.ExpiresIn) * time.Second)
	oauthCred := cliconfig.NewOAuthCredential(tokenResp.Data.AccessToken, tokenResp.Data.RefreshToken, expiresAt)
	return oauthCred, tokenResp.Data.User.Email, nil
}

// CanBindLocalPort tests whether we can bind a local TCP port.
// Used by AutoFlow to decide between localhost and device code flows.
func CanBindLocalPort() bool {
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return false
	}
	l.Close()
	return true
}
