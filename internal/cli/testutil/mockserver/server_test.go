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
	deviceCode := data["device_code"].(string)
	userCode := data["user_code"].(string)

	if len(deviceCode) == 0 {
		t.Fatal("expected non-empty device_code")
	}
	if len(userCode) != 9 || userCode[4] != '-' {
		t.Fatalf("expected user_code in XXXX-XXXX format, got %s", userCode)
	}

	// Step 2: Poll (mock auto-approves)
	resp = postJSON(t, ts.URL+"/v1/auth/device-poll", map[string]any{
		"device_code": deviceCode,
	})

	data = resp["data"].(map[string]any)
	if data["status"] != "complete" {
		t.Fatalf("expected complete, got %s", data["status"])
	}
	apiKey := data["api_key"].(string)
	if len(apiKey) == 0 || apiKey[:8] != "sk-mock-" {
		t.Fatalf("expected sk-mock-... API key, got %s", apiKey)
	}

	// Step 3: Polling again should return expired (code consumed)
	resp = postJSON(t, ts.URL+"/v1/auth/device-poll", map[string]any{
		"device_code": deviceCode,
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
	state := data["state"].(string)
	authURL := data["auth_url"].(string)

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

	// Step 3: Exchange code (extract code from redirect URL)
	// The redirect URL is: http://localhost:59999/callback?code=xxx&state=yyy
	// We just need the code parameter
	resp = postJSON(t, ts.URL+"/v1/auth/callback", map[string]any{
		"code":  "mock-code-test",
		"state": state,
	})
	data = resp["data"].(map[string]any)
	apiKey := data["api_key"].(string)
	if len(apiKey) == 0 || apiKey[:8] != "sk-mock-" {
		t.Fatalf("expected sk-mock-... API key, got %s", apiKey)
	}

	user := data["user"].(map[string]any)
	if user["email"] != "dev@anycap.ai" {
		t.Fatalf("expected dev@anycap.ai, got %s", user["email"])
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
