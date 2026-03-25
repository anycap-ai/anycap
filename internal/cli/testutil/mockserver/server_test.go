package mockserver

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestDeviceCodeFlow(t *testing.T) {
	ms := New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	// Step 1: Request device code
	resp := postJSON(t, ts.URL+"/v1/auth/device-code", map[string]any{})

	data := resp["data"].(map[string]any)
	loginSessionID := data["login_session_id"].(string)
	userCode := data["user_code"].(string)

	if len(loginSessionID) == 0 {
		t.Fatal("expected non-empty login_session_id")
	}
	if len(userCode) != 9 || userCode[4] != '-' {
		t.Fatalf("expected user_code in XXXX-XXXX format, got %s", userCode)
	}

	// Step 2: Poll (mock auto-approves)
	resp = postJSON(t, ts.URL+"/v1/auth/device-poll", map[string]any{
		"login_session_id": loginSessionID,
	})

	data = resp["data"].(map[string]any)
	if data["status"] != "complete" {
		t.Fatalf("expected complete, got %s", data["status"])
	}
	apiKey := data["api_key"].(string)
	if len(apiKey) == 0 || apiKey[:8] != "mock-ak-" {
		t.Fatalf("expected mock-ak-... api key, got %s", apiKey)
	}
	if user := data["user"].(map[string]any); user["email"] != "dev@anycap.ai" {
		t.Fatalf("expected dev@anycap.ai, got %v", user["email"])
	}

	// Step 3: Polling again should return expired (code consumed)
	resp = postJSON(t, ts.URL+"/v1/auth/device-poll", map[string]any{
		"login_session_id": loginSessionID,
	})
	data = resp["data"].(map[string]any)
	if data["status"] != "expired" {
		t.Fatalf("expected expired on second poll, got %s", data["status"])
	}
}

func TestLocalhostCallbackFlow(t *testing.T) {
	ms := New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	// Step 1: Init login with a fake redirect port
	resp := postJSON(t, ts.URL+"/v1/auth/login", map[string]any{
		"method":        "localhost",
		"redirect_port": 59999,
	})

	data := resp["data"].(map[string]any)
	loginSessionID := data["login_session_id"].(string)
	state := data["state"].(string)
	authURL := data["authorize_url"].(string)

	if len(state) == 0 {
		t.Fatal("expected non-empty state")
	}
	if len(authURL) == 0 {
		t.Fatal("expected non-empty auth_url")
	}

	// Step 2: Hit mock authorize - should redirect to localhost:59999
	client := &http.Client{CheckRedirect: func(req *http.Request, via []*http.Request) error {
		return http.ErrUseLastResponse // don't follow redirect
	}}
	authResp, err := client.Get(authURL)
	if err != nil {
		t.Fatalf("mock authorize: %v", err)
	}
	defer authResp.Body.Close()

	if authResp.StatusCode != http.StatusFound {
		t.Fatalf("expected 302, got %d", authResp.StatusCode)
	}
	location := authResp.Header.Get("Location")
	if location == "" {
		t.Fatal("expected Location header")
	}
	t.Logf("redirect location: %s", location)

	// Step 3: Exchange code for API key
	resp = postJSON(t, ts.URL+"/v1/auth/callback", map[string]any{
		"login_session_id": loginSessionID,
		"code":             "mock-code-test",
		"state":            state,
		"redirect_uri":     "http://localhost:59999/callback",
	})
	data = resp["data"].(map[string]any)
	apiKey := data["api_key"].(string)
	if len(apiKey) == 0 || apiKey[:8] != "mock-ak-" {
		t.Fatalf("expected mock-ak-... api key, got %s", apiKey)
	}

	user := data["user"].(map[string]any)
	if user["email"] != "dev@anycap.ai" {
		t.Fatalf("expected dev@anycap.ai, got %s", user["email"])
	}
}

func TestRefreshToken(t *testing.T) {
	ms := New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	refreshToken := ms.SeedRefreshToken("dev@anycap.ai")

	// Refresh
	resp := postJSON(t, ts.URL+"/v1/auth/refresh", map[string]any{
		"refresh_token": refreshToken,
	})
	data := resp["data"].(map[string]any)
	newAccessToken := data["access_token"].(string)
	newRefreshToken := data["refresh_token"].(string)

	if newAccessToken[:8] != "mock-at-" {
		t.Fatalf("expected mock-at-... access token, got %s", newAccessToken)
	}
	if newRefreshToken[:8] != "mock-rt-" {
		t.Fatalf("expected mock-rt-... refresh token, got %s", newRefreshToken)
	}
	if newRefreshToken == refreshToken {
		t.Fatal("expected rotated refresh token")
	}

	// Old refresh token should be invalid
	b, _ := json.Marshal(map[string]any{"refresh_token": refreshToken})
	httpResp, err := http.Post(ts.URL+"/v1/auth/refresh", "application/json", bytes.NewReader(b))
	if err != nil {
		t.Fatalf("refresh with old token: %v", err)
	}
	defer httpResp.Body.Close()
	if httpResp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401 for expired refresh token, got %d", httpResp.StatusCode)
	}
}

func TestStatus(t *testing.T) {
	ms := New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	resp, err := http.Get(ts.URL + "/v1/status")
	if err != nil {
		t.Fatalf("status: %v", err)
	}
	defer resp.Body.Close()

	var result map[string]any
	json.NewDecoder(resp.Body).Decode(&result)

	if result["status"] != "success" {
		t.Fatalf("expected success, got %v", result["status"])
	}
}

// postJSON is a test helper that POSTs JSON and returns the parsed response.
func postJSON(t *testing.T, url string, body map[string]any) map[string]any {
	t.Helper()

	b, _ := json.Marshal(body)
	resp, err := http.Post(url, "application/json", bytes.NewReader(b))
	if err != nil {
		t.Fatalf("POST %s: %v", url, err)
	}
	defer resp.Body.Close()

	data, _ := io.ReadAll(resp.Body)
	var result map[string]any
	if err := json.Unmarshal(data, &result); err != nil {
		t.Fatalf("unmarshal response from %s: %v\nbody: %s", url, err, data)
	}

	if result["status"] != "success" {
		t.Fatalf("expected success from %s, got: %s", url, data)
	}
	return result
}
