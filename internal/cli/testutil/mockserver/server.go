// Package mockserver provides a lightweight mock AnyCap auth server for CLI
// development and testing. It implements the auth API contracts using plain
// net/http with no server-side dependencies.
//
// Usage in tests:
//
//	ms := mockserver.New()
//	ts := httptest.NewServer(ms)
//	defer ts.Close()
//	// point CLI client at ts.URL
//
// Usage as standalone dev server:
//
//	ms := mockserver.New()
//	log.Fatal(http.ListenAndServe(":9999", ms))
package mockserver

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

// Server is a mock AnyCap auth server.
type Server struct {
	mux *http.ServeMux

	mu            sync.Mutex
	loginStates   map[string]int             // state -> redirect_port
	deviceCodes   map[string]deviceCodeEntry // device_code -> entry
	refreshTokens map[string]string          // refresh_token -> user email
}

type deviceCodeEntry struct {
	UserCode string
	Email    string
}

// New creates a mock server with all auth and capabilities endpoints registered.
func New() *Server {
	s := &Server{
		mux:           http.NewServeMux(),
		loginStates:   make(map[string]int),
		deviceCodes:   make(map[string]deviceCodeEntry),
		refreshTokens: make(map[string]string),
	}

	s.mux.HandleFunc("POST /v1/auth/login", s.handleLogin)
	s.mux.HandleFunc("POST /v1/auth/callback", s.handleCallback)
	s.mux.HandleFunc("POST /v1/auth/device-code", s.handleDeviceCode)
	s.mux.HandleFunc("POST /v1/auth/device-poll", s.handleDevicePoll)
	s.mux.HandleFunc("POST /v1/auth/refresh", s.handleRefresh)
	s.mux.HandleFunc("GET /mock/authorize", s.handleMockAuthorize)
	s.mux.HandleFunc("GET /v1/status", s.handleStatus)

	// Capabilities
	s.mux.HandleFunc("POST /v1/capabilities/presign", s.handlePresign)
	s.mux.HandleFunc("PUT /mock/upload/", s.handleMockUpload)
	s.mux.HandleFunc("POST /v1/capabilities/image/understand", s.handleImageUnderstand)
	s.mux.HandleFunc("POST /v1/capabilities/video/read", s.handleVideoRead)

	// Image generation
	s.mux.HandleFunc("GET /v1/image/models", s.handleImageModels)
	s.mux.HandleFunc("GET /v1/image/models/{model}/schema", s.handleImageModelSchema)
	s.mux.HandleFunc("POST /v1/image/generate", s.handleImageGenerate)

	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.mux.ServeHTTP(w, r)
}

// --- Auth Login (localhost callback flow) ---

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Method       string `json:"method"`
		RedirectPort int    `json:"redirect_port"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		return
	}

	state := randomHex(16)

	s.mu.Lock()
	s.loginStates[state] = req.RedirectPort
	s.mu.Unlock()

	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	host := r.Host
	authURL := fmt.Sprintf("%s://%s/mock/authorize?state=%s", scheme, host, state)

	writeSuccess(w, map[string]any{
		"auth_url": authURL,
		"state":    state,
	})
}

// --- Mock Authorize (simulates auth login page, auto-redirects) ---

func (s *Server) handleMockAuthorize(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")
	if state == "" {
		writeError(w, http.StatusBadRequest, "MISSING_STATE", "state parameter required")
		return
	}

	s.mu.Lock()
	port, ok := s.loginStates[state]
	s.mu.Unlock()

	if !ok {
		writeError(w, http.StatusBadRequest, "INVALID_STATE", "unknown state")
		return
	}

	code := "mock-code-" + randomHex(8)
	redirectURL := fmt.Sprintf("http://localhost:%d/callback?code=%s&state=%s", port, code, state)
	http.Redirect(w, r, redirectURL, http.StatusFound)
}

// --- Auth Callback (exchange code for OAuth tokens) ---

func (s *Server) handleCallback(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Code  string `json:"code"`
		State string `json:"state"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		return
	}

	s.mu.Lock()
	_, ok := s.loginStates[req.State]
	if ok {
		delete(s.loginStates, req.State)
	}
	s.mu.Unlock()

	if !ok {
		writeError(w, http.StatusBadRequest, "INVALID_STATE", "unknown or expired state")
		return
	}

	accessToken := "mock-at-" + randomHex(16)
	refreshToken := "mock-rt-" + randomHex(16)

	s.mu.Lock()
	s.refreshTokens[refreshToken] = "dev@anycap.ai"
	s.mu.Unlock()

	writeSuccess(w, map[string]any{
		"credential_type": "oauth",
		"access_token":    accessToken,
		"refresh_token":   refreshToken,
		"expires_in":      3600,
		"user": map[string]string{
			"email": "dev@anycap.ai",
			"name":  "Dev User",
		},
	})
}

// --- Device Code Flow ---

func (s *Server) handleDeviceCode(w http.ResponseWriter, r *http.Request) {
	deviceCode := randomHex(16)
	userCode := randomUserCode()

	s.mu.Lock()
	s.deviceCodes[deviceCode] = deviceCodeEntry{
		UserCode: userCode,
		Email:    "dev@anycap.ai",
	}
	s.mu.Unlock()

	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	verificationURI := fmt.Sprintf("%s://%s/device", scheme, r.Host)

	writeSuccess(w, map[string]any{
		"device_code":      deviceCode,
		"user_code":        userCode,
		"verification_uri": verificationURI,
		"interval":         1,
		"expires_in":       300,
	})
}

func (s *Server) handleDevicePoll(w http.ResponseWriter, r *http.Request) {
	var req struct {
		DeviceCode string `json:"device_code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		return
	}

	s.mu.Lock()
	entry, ok := s.deviceCodes[req.DeviceCode]
	if ok {
		delete(s.deviceCodes, req.DeviceCode)
	}
	s.mu.Unlock()

	if !ok {
		writeSuccess(w, map[string]any{"status": "expired"})
		return
	}

	accessToken := "mock-at-" + randomHex(16)
	refreshToken := "mock-rt-" + randomHex(16)

	s.mu.Lock()
	s.refreshTokens[refreshToken] = entry.Email
	s.mu.Unlock()

	// Mock: auto-approve immediately
	writeSuccess(w, map[string]any{
		"status":          "complete",
		"credential_type": "oauth",
		"access_token":    accessToken,
		"refresh_token":   refreshToken,
		"expires_in":      3600,
		"user": map[string]string{
			"email": entry.Email,
			"name":  "Dev User",
		},
	})
}

// --- Auth Refresh ---

func (s *Server) handleRefresh(w http.ResponseWriter, r *http.Request) {
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		return
	}

	s.mu.Lock()
	email, ok := s.refreshTokens[req.RefreshToken]
	if ok {
		// Rotate: delete old, issue new
		delete(s.refreshTokens, req.RefreshToken)
	}
	s.mu.Unlock()

	if !ok {
		writeError(w, http.StatusUnauthorized, "INVALID_REFRESH_TOKEN", "refresh token is invalid or expired")
		return
	}

	newAccessToken := "mock-at-" + randomHex(16)
	newRefreshToken := "mock-rt-" + randomHex(16)

	s.mu.Lock()
	s.refreshTokens[newRefreshToken] = email
	s.mu.Unlock()

	writeSuccess(w, map[string]any{
		"access_token":  newAccessToken,
		"refresh_token": newRefreshToken,
		"expires_in":    3600,
	})
}

// --- Status ---

func (s *Server) handleStatus(w http.ResponseWriter, r *http.Request) {
	writeSuccess(w, map[string]any{
		"name":    "anycap-mock-server",
		"env":     "dev",
		"version": "mock",
		"status":  "ok",
	})
}

// --- Capabilities: Presign ---

func (s *Server) handlePresign(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Filename      string `json:"filename"`
		ContentType   string `json:"content_type"`
		ContentLength int64  `json:"content_length"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		return
	}
	if req.Filename == "" || req.ContentType == "" {
		writeError(w, http.StatusBadRequest, "INVALID_PARAM", "filename and content_type required")
		return
	}

	key := randomHex(16)
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	host := r.Host

	writeSuccess(w, map[string]any{
		"upload_url": fmt.Sprintf("%s://%s/mock/upload/%s", scheme, host, key),
		"object_url": fmt.Sprintf("%s://%s/mock/objects/%s/%s", scheme, host, key, req.Filename),
		"expires_in": 3600,
	})
}

// --- Capabilities: Mock Upload (simulates S3 presigned PUT) ---

func (s *Server) handleMockUpload(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	w.WriteHeader(http.StatusOK)
}

// --- Capabilities: Image Understand ---

func (s *Server) handleImageUnderstand(w http.ResponseWriter, r *http.Request) {
	var req struct {
		URL         string           `json:"url"`
		Images      []map[string]any `json:"images"`
		Instruction string           `json:"instruction"`
		Model       string           `json:"model"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		return
	}

	imageCount := 0
	if len(req.Images) > 0 {
		imageCount = len(req.Images)
	} else if req.URL != "" {
		imageCount = 1
	}

	if imageCount == 0 {
		writeError(w, http.StatusUnprocessableEntity, "MISSING_INPUT", "url or images is required")
		return
	}

	content := "This is a mock image analysis result."
	if imageCount > 1 {
		content = fmt.Sprintf("Mock analysis of %d images.", imageCount)
	}
	if req.Instruction != "" {
		content = fmt.Sprintf("Mock analysis for instruction: %s", req.Instruction)
	}

	writeSuccess(w, map[string]any{
		"content": content,
		"model":   "mock-vision-model",
		"usage": map[string]int{
			"input_tokens":  1200,
			"output_tokens": 50,
			"total_tokens":  1250,
		},
		"duration_ms": 100,
	})
}

// --- Capabilities: Video Read ---

func (s *Server) handleVideoRead(w http.ResponseWriter, r *http.Request) {
	var req struct {
		URL         string `json:"url"`
		Instruction string `json:"instruction"`
		Model       string `json:"model"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		return
	}
	if req.URL == "" {
		writeError(w, http.StatusUnprocessableEntity, "MISSING_INPUT", "url is required")
		return
	}

	content := "This is a mock video analysis result."
	if req.Instruction != "" {
		content = fmt.Sprintf("Mock video analysis for instruction: %s", req.Instruction)
	}

	writeSuccess(w, map[string]any{
		"content": content,
		"model":   "mock-vision-model",
		"usage": map[string]int{
			"input_tokens":  5000,
			"output_tokens": 200,
			"total_tokens":  5200,
		},
		"duration_ms": 500,
	})
}

// --- Image Generation Capabilities ---

func (s *Server) handleImageModels(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"status":     "success",
		"capability": "image",
		"models": []map[string]any{
			{
				"model":        "mock-model-1",
				"capability":   "image",
				"display_name": "Mock Model 1",
				"status":       "active",
				"operations":   []string{"generate", "edit"},
			},
			{
				"model":        "mock-model-2",
				"capability":   "image",
				"display_name": "Mock Model 2",
				"status":       "active",
				"operations":   []string{"generate"},
			},
		},
	})
}

func (s *Server) handleImageModelSchema(w http.ResponseWriter, r *http.Request) {
	model := r.PathValue("model")
	operation := r.URL.Query().Get("operation")
	if operation == "" {
		operation = "generate"
	}

	writeSuccess(w, map[string]any{
		"capability": "image",
		"model":      model,
		"operation":  operation,
		"schema": map[string]any{
			"model_params": map[string]any{
				"prompt":       map[string]any{"type": "string", "required": true},
				"aspect_ratio": map[string]any{"type": "string", "enum": []string{"1:1", "16:9", "9:16"}},
				"resolution":   map[string]any{"type": "string", "enum": []string{"1k", "2k", "4k"}},
			},
		},
	})
}

func (s *Server) handleImageGenerate(w http.ResponseWriter, r *http.Request) {
	var req map[string]any
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		return
	}

	prompt, _ := req["prompt"].(string)
	model, _ := req["model"].(string)

	if prompt == "" {
		writeError(w, http.StatusBadRequest, "INVALID_PARAM", "prompt is required")
		return
	}
	if model == "" {
		writeError(w, http.StatusBadRequest, "INVALID_PARAM", "model is required")
		return
	}

	reqID := "img_req_" + randomHex(8)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"id":     "req_" + randomHex(8),
		"status": "success",
		"data": map[string]any{
			"id":     reqID,
			"status": "success",
			"model":  model,
			"outputs": []map[string]any{
				{
					"type":      "image",
					"url":       "https://mock.anycap.ai/images/" + reqID + ".png",
					"mime_type": "image/png",
				},
			},
			"usage":       map[string]int{"credits": 1},
			"credit_cost": 1,
		},
	})
}

// --- Helpers ---

func writeSuccess(w http.ResponseWriter, data any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"status": "success",
		"data":   data,
	})
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]any{
		"status": "error",
		"error": map[string]string{
			"code":    code,
			"message": message,
		},
	})
}

func randomHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func randomUserCode() string {
	const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ"
	const digits = "0123456789"

	b := make([]byte, 8)
	_, _ = rand.Read(b)

	code := make([]byte, 9)
	for i := 0; i < 4; i++ {
		code[i] = alpha[int(b[i])%len(alpha)]
	}
	code[4] = '-'
	for i := 0; i < 4; i++ {
		code[5+i] = digits[int(b[4+i])%len(digits)]
	}
	return string(code)
}
