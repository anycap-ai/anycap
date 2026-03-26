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
const localhostCallbackPort = 14565

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
// waits for the callback, and exchanges the code for an API key.
func LocalhostFlow(ctx context.Context, client *httpclient.Client, stderr io.Writer) (cred *cliconfig.Credential, email string, err error) {
	// Step 1: Bind the fixed localhost callback port configured in Auth0.
	listener, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", localhostCallbackPort))
	if err != nil {
		return nil, "", fmt.Errorf("failed to bind localhost callback port %d: %w. Close the process using it or run 'anycap login --headless' instead", localhostCallbackPort, err)
	}
	port := localhostCallbackPort

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
			LoginSessionID string `json:"login_session_id"`
			AuthorizeURL   string `json:"authorize_url"`
			State          string `json:"state"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp.Body, &initResp); err != nil {
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
	if err := OpenBrowser(initResp.Data.AuthorizeURL); err != nil {
		fmt.Fprintf(stderr, "Could not open browser. Visit this URL manually:\n  %s\n", initResp.Data.AuthorizeURL)
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

	// Step 6: Exchange code for credentials
	callbackResp, err := client.PostJSON(ctx, "/v1/auth/callback", map[string]any{
		"login_session_id": initResp.Data.LoginSessionID,
		"code":             result.Code,
		"state":            result.State,
		"redirect_uri":     fmt.Sprintf("http://127.0.0.1:%d/callback", port),
	})
	if err != nil {
		return nil, "", fmt.Errorf("failed to exchange code: %w", err)
	}

	cred, userEmail, err := parseTokenResponse(callbackResp.Body)
	if err != nil {
		return nil, "", err
	}
	return cred, userEmail, nil
}

// CanBindLocalPort tests whether we can bind a local TCP port.
// Used by AutoFlow to decide between localhost and device code flows.
func CanBindLocalPort() bool {
	l, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", localhostCallbackPort))
	if err != nil {
		return false
	}
	l.Close()
	return true
}
