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
	if len(userCode) != 8 {
		t.Fatalf("expected 8-character user_code, got %s", userCode)
	}
	for _, ch := range userCode {
		if (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') {
			continue
		}
		t.Fatalf("expected alphanumeric user_code, got %s", userCode)
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

func TestDeviceCodeFlowPendingUntilAuthorized(t *testing.T) {
	ms := New()
	ms.RequireDeviceAuthorization()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	resp := postJSON(t, ts.URL+"/v1/auth/device-code", map[string]any{})
	data := resp["data"].(map[string]any)
	loginSessionID := data["login_session_id"].(string)

	resp = postJSON(t, ts.URL+"/v1/auth/device-poll", map[string]any{
		"login_session_id": loginSessionID,
	})
	data = resp["data"].(map[string]any)
	if data["status"] != "pending" {
		t.Fatalf("expected pending before authorization, got %s", data["status"])
	}

	ms.AuthorizeDeviceSession(loginSessionID)

	resp = postJSON(t, ts.URL+"/v1/auth/device-poll", map[string]any{
		"login_session_id": loginSessionID,
	})
	data = resp["data"].(map[string]any)
	if data["status"] != "complete" {
		t.Fatalf("expected complete after authorization, got %s", data["status"])
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
