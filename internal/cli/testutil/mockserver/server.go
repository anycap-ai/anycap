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

	mu                  sync.Mutex
	browserPollSessions map[string]browserPollStateEntry // login_session_id -> entry
	deviceCodes         map[string]deviceCodeEntry       // login_session_id -> entry
	logoutCalls         int
	deviceAutoApprove   bool
	lastDeviceSessionID string
}

type deviceCodeEntry struct {
	UserCode   string
	Email      string
	Authorized bool
}

type browserPollStateEntry struct {
	PollToken string
	Email     string
}

// New creates a mock server with all auth and capabilities endpoints registered.
func New() *Server {
	s := &Server{
		mux:                 http.NewServeMux(),
		browserPollSessions: make(map[string]browserPollStateEntry),
		deviceCodes:         make(map[string]deviceCodeEntry),
		deviceAutoApprove:   true,
	}

	s.mux.HandleFunc("POST /v1/auth/login", s.handleLogin)
	s.mux.HandleFunc("POST /v1/auth/poll", s.handlePoll)
	s.mux.HandleFunc("POST /v1/auth/device-code", s.handleDeviceCode)
	s.mux.HandleFunc("POST /v1/auth/device-poll", s.handleDevicePoll)
	s.mux.HandleFunc("POST /v1/auth/logout", s.handleLogout)
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
	s.mux.HandleFunc("GET /images/", s.handleMockImage)

	// Video generation
	s.mux.HandleFunc("GET /v1/video/models", s.handleVideoModels)
	s.mux.HandleFunc("GET /v1/video/models/{model}/schema", s.handleVideoModelSchema)
	s.mux.HandleFunc("POST /v1/video/generate", s.handleVideoGenerate)
	s.mux.HandleFunc("GET /videos/", s.handleMockVideo)

	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.mux.ServeHTTP(w, r)
}

// --- Auth Login (browser poll flow) ---

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Method string `json:"method"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		return
	}

	if req.Method != "" && req.Method != "browser_poll" {
		writeError(w, http.StatusBadRequest, "INVALID_PARAM", "unsupported login method")
		return
	}

	loginSessionID := "lsn-" + randomHex(8)
	pollToken := "pt-" + randomHex(8)
	s.mu.Lock()
	s.browserPollSessions[loginSessionID] = browserPollStateEntry{
		PollToken: pollToken,
		Email:     "dev@anycap.ai",
	}
	s.mu.Unlock()

	writeSuccess(w, map[string]any{
		"flow_type":        "browser_poll",
		"login_session_id": loginSessionID,
		"browser_url":      "https://anycap.ai/auth/cli-login?browser_token=bt-" + randomHex(8) + "&cli=1",
		"poll_token":       pollToken,
		"interval":         1,
		"expires_in":       300,
	})
}

func (s *Server) handlePoll(w http.ResponseWriter, r *http.Request) {
	var req struct {
		LoginSessionID string `json:"login_session_id"`
		PollToken      string `json:"poll_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		return
	}

	s.mu.Lock()
	entry, ok := s.browserPollSessions[req.LoginSessionID]
	if ok {
		delete(s.browserPollSessions, req.LoginSessionID)
	}
	s.mu.Unlock()

	if !ok || req.PollToken != entry.PollToken {
		writeSuccess(w, map[string]any{"status": "expired"})
		return
	}

	apiKey := "mock-ak-" + randomHex(16)
	writeSuccess(w, map[string]any{
		"status":          "complete",
		"credential_type": "api_key",
		"access_token":    apiKey,
		"api_key":         apiKey,
		"api_key_id":      "key-" + randomHex(8),
		"user": map[string]string{
			"email": entry.Email,
			"id":    "user-dev",
			"name":  "Dev User",
		},
	})
}

// --- Device Code Flow ---

func (s *Server) handleDeviceCode(w http.ResponseWriter, r *http.Request) {
	loginSessionID := "lsn-" + randomHex(8)
	userCode := randomUserCode()

	s.mu.Lock()
	s.deviceCodes[loginSessionID] = deviceCodeEntry{
		UserCode:   userCode,
		Email:      "dev@anycap.ai",
		Authorized: s.deviceAutoApprove,
	}
	s.lastDeviceSessionID = loginSessionID
	s.mu.Unlock()

	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	verificationURI := fmt.Sprintf("%s://%s/auth/device", scheme, r.Host)

	writeSuccess(w, map[string]any{
		"flow_type":        "device",
		"login_session_id": loginSessionID,
		"user_code":        userCode,
		"verification_uri": verificationURI,
		"interval":         1,
		"expires_in":       300,
	})
}

func (s *Server) handleDevicePoll(w http.ResponseWriter, r *http.Request) {
	var req struct {
		LoginSessionID string `json:"login_session_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		return
	}

	s.mu.Lock()
	entry, ok := s.deviceCodes[req.LoginSessionID]
	if ok && entry.Authorized {
		delete(s.deviceCodes, req.LoginSessionID)
	}
	s.mu.Unlock()

	if !ok {
		writeSuccess(w, map[string]any{"status": "expired"})
		return
	}

	if !entry.Authorized {
		writeSuccess(w, map[string]any{"status": "pending"})
		return
	}

	apiKey := "mock-ak-" + randomHex(16)
	writeSuccess(w, map[string]any{
		"status":          "complete",
		"credential_type": "api_key",
		"access_token":    apiKey,
		"api_key":         apiKey,
		"api_key_id":      "key-" + randomHex(8),
		"user": map[string]string{
			"email": entry.Email,
			"id":    "user-dev",
			"name":  "Dev User",
		},
	})
}

func (s *Server) handleLogout(w http.ResponseWriter, r *http.Request) {
	s.mu.Lock()
	s.logoutCalls++
	s.mu.Unlock()

	writeSuccess(w, map[string]any{
		"message": "logged out",
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

func (s *Server) LogoutCalls() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.logoutCalls
}

func (s *Server) RequireDeviceAuthorization() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.deviceAutoApprove = false
}

func (s *Server) LastDeviceSessionID() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.lastDeviceSessionID
}

func (s *Server) AuthorizeDeviceSession(loginSessionID string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	entry, ok := s.deviceCodes[loginSessionID]
	if !ok {
		return
	}
	entry.Authorized = true
	s.deviceCodes[loginSessionID] = entry
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
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	imageURL := fmt.Sprintf("%s://%s/images/%s.png", scheme, r.Host, reqID)
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
					"url":       imageURL,
					"mime_type": "image/png",
				},
			},
			"usage":       map[string]int{"credits": 1},
			"credit_cost": 1,
		},
	})
}

// handleMockImage serves fake image data for download tests.
func (s *Server) handleMockImage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "image/png")
	w.Write([]byte("mock-image-data"))
}

// --- Video Generation Capabilities ---

func (s *Server) handleVideoModels(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"status":     "success",
		"capability": "video",
		"models": []map[string]any{
			{
				"model":        "mock-video-1",
				"capability":   "video",
				"display_name": "Mock Video 1",
				"status":       "active",
				"operations":   []string{"generate"},
			},
			{
				"model":        "mock-video-2",
				"capability":   "video",
				"display_name": "Mock Video 2",
				"status":       "active",
				"operations":   []string{"generate"},
			},
		},
	})
}

func (s *Server) handleVideoModelSchema(w http.ResponseWriter, r *http.Request) {
	model := r.PathValue("model")
	operation := r.URL.Query().Get("operation")
	if operation == "" {
		operation = "generate"
	}

	writeSuccess(w, map[string]any{
		"capability": "video",
		"model":      model,
		"operation":  operation,
		"schema": map[string]any{
			"model_params": map[string]any{
				"prompt":          map[string]any{"type": "string", "required": true},
				"negative_prompt": map[string]any{"type": "string"},
				"ratio":           map[string]any{"type": "string", "enum": []string{"1:1", "16:9", "9:16"}},
				"resolution":      map[string]any{"type": "string", "enum": []string{"720p", "1080p"}},
				"duration":        map[string]any{"type": "integer", "min": 2, "max": 10},
			},
		},
	})
}

func (s *Server) handleVideoGenerate(w http.ResponseWriter, r *http.Request) {
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

	reqID := "vid_req_" + randomHex(8)
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	videoURL := fmt.Sprintf("%s://%s/videos/%s.mp4", scheme, r.Host, reqID)
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
					"type":      "video",
					"url":       videoURL,
					"mime_type": "video/mp4",
				},
			},
			"usage":       map[string]int{"credits": 5},
			"credit_cost": 5,
		},
	})
}

// handleMockVideo serves fake video data for download tests.
func (s *Server) handleMockVideo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "video/mp4")
	w.Write([]byte("mock-video-data"))
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
