// Package draw implements a browser-based interactive whiteboard powered by Excalidraw.
// It starts a localhost HTTP server that serves the Excalidraw app, supports
// Mermaid diagram conversion, position-preserving updates, and multi-user collaboration.
package draw

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"nhooyr.io/websocket"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/auth"
)

const (
	sessionTimeout = 30 * time.Minute
	sessionGCAge   = 1 * time.Hour
	maxUploadSize  = 50 << 20 // 50 MB
)

// SessionTimeoutSeconds returns the session timeout in seconds.
func SessionTimeoutSeconds() int {
	return int(sessionTimeout.Seconds())
}

// ---------------------------------------------------------------------------
// Init format detection
// ---------------------------------------------------------------------------

const (
	FormatMermaid    = "mermaid"
	FormatExcalidraw = "excalidraw"
	FormatImage      = "image"
)

var mermaidExts = map[string]bool{
	".mmd": true, ".mermaid": true,
}

var imageExts = map[string]bool{
	".png": true, ".jpg": true, ".jpeg": true, ".svg": true,
	".gif": true, ".webp": true, ".bmp": true,
}

// DetectInitFormat determines the format from the file extension and content.
func DetectInitFormat(path string) string {
	ext := strings.ToLower(filepath.Ext(path))
	if mermaidExts[ext] {
		return FormatMermaid
	}
	if imageExts[ext] {
		return FormatImage
	}
	if ext == ".excalidraw" {
		return FormatExcalidraw
	}
	// .json or .excalidraw.json
	if ext == ".json" {
		if strings.HasSuffix(strings.ToLower(path), ".excalidraw.json") {
			return FormatExcalidraw
		}
		// Inspect content
		data, err := os.ReadFile(path)
		if err == nil {
			var obj map[string]any
			if json.Unmarshal(data, &obj) == nil {
				if obj["type"] == "excalidraw" {
					return FormatExcalidraw
				}
			}
		}
		return FormatExcalidraw
	}
	return FormatExcalidraw
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

// ImageDimensions holds snapshot dimensions.
type ImageDimensions struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

// DrawResult is the final output of a draw session.
type DrawResult struct {
	Status             string           `json:"status"`
	Snapshot           string           `json:"snapshot"`
	Document           string           `json:"document"`
	Source             string           `json:"source,omitempty"`
	SnapshotDimensions *ImageDimensions `json:"snapshot_dimensions,omitempty"`
	Hint               string           `json:"hint"`
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

// Session persists draw state to disk for non-blocking mode.
type Session struct {
	SessionID    string      `json:"session_id"`
	PID          int         `json:"pid"`
	Port         int         `json:"port"`
	Bind         string      `json:"bind"`
	CSRFToken    string      `json:"csrf_token"`
	InitPath     string      `json:"init_path,omitempty"`
	InitFormat   string      `json:"init_format,omitempty"`
	SourcePath   string      `json:"source_path,omitempty"`
	ImagePath    string      `json:"image_path,omitempty"`
	OutputDir    string      `json:"output_dir"`
	SnapshotPath string      `json:"snapshot_path,omitempty"`
	DocumentPath string      `json:"document_path,omitempty"`
	YjsStatePath string      `json:"yjs_state_path,omitempty"`
	CreatedAt    time.Time   `json:"created_at"`
	ExpiresAt    time.Time   `json:"expires_at"`
	Status       string      `json:"status"`
	Result       *DrawResult `json:"result"`
}

func sessionDir() string {
	wd, err := os.Getwd()
	if err != nil {
		wd = "."
	}
	return filepath.Join(wd, ".anycap", "draw")
}

func sessionFilePath(id string) string {
	return filepath.Join(sessionDir(), id+".json")
}

// SessionFilePath returns the session file path for the given ID.
func SessionFilePath(id string) string {
	return sessionFilePath(id)
}

func generateSessionID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return "drw_" + hex.EncodeToString(b)
}

func generateCSRFToken() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// NewSession creates a new draw session.
func NewSession(initPath, imagePath, outputDir, bind string, port int) *Session {
	if bind == "" {
		bind = "127.0.0.1"
	}
	if outputDir == "" {
		wd, _ := os.Getwd()
		if wd == "" {
			wd = "."
		}
		outputDir = filepath.Join(wd, ".anycap", "draw")
	}
	outputDir, _ = filepath.Abs(outputDir)
	_ = os.MkdirAll(outputDir, 0o755)
	now := time.Now()
	sid := generateSessionID()

	s := &Session{
		SessionID: sid,
		Port:      port,
		Bind:      bind,
		CSRFToken: generateCSRFToken(),
		OutputDir: outputDir,
		CreatedAt: now,
		ExpiresAt: now.Add(sessionTimeout),
		Status:    "pending",
	}

	if initPath != "" {
		abs, _ := filepath.Abs(initPath)
		s.InitPath = abs
		s.InitFormat = DetectInitFormat(abs)
		if s.InitFormat == FormatMermaid {
			s.SourcePath = abs
		}
	}
	if imagePath != "" {
		abs, _ := filepath.Abs(imagePath)
		s.ImagePath = abs
	}

	s.SnapshotPath = filepath.Join(outputDir, sid+"_snapshot.png")
	s.DocumentPath = filepath.Join(outputDir, sid+".excalidraw")
	s.YjsStatePath = filepath.Join(sessionDir(), sid+"_yjs.bin")

	return s
}

// LoadSession reads a session from disk.
func LoadSession(sessionID string) (*Session, error) {
	data, err := os.ReadFile(sessionFilePath(sessionID))
	if err != nil {
		return nil, fmt.Errorf("session %q not found: %w", sessionID, err)
	}
	var s Session
	if err := json.Unmarshal(data, &s); err != nil {
		return nil, fmt.Errorf("corrupt session file: %w", err)
	}
	if time.Now().After(s.ExpiresAt) {
		s.Status = "expired"
	}
	return &s, nil
}

// Save writes the session to disk.
func (s *Session) Save() error {
	dir := sessionDir()
	if err := os.MkdirAll(dir, 0700); err != nil {
		return err
	}
	ensureGitignore()
	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(sessionFilePath(s.SessionID), data, 0600)
}

// Remove deletes the session file and associated artifacts.
func (s *Session) Remove() {
	_ = os.Remove(sessionFilePath(s.SessionID))
	_ = os.Remove(s.YjsStatePath)
}

// ListSessions returns all sessions found in the session directory.
func ListSessions() ([]*Session, error) {
	dir := sessionDir()
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var sessions []*Session
	for _, e := range entries {
		if e.IsDir() || filepath.Ext(e.Name()) != ".json" {
			continue
		}
		id := strings.TrimSuffix(e.Name(), ".json")
		s, err := LoadSession(id)
		if err != nil {
			continue
		}
		sessions = append(sessions, s)
	}
	return sessions, nil
}

// CleanExpiredSessions removes expired session metadata files.
// Only cleans session JSON (.json) and Yjs state (_yjs.bin) files,
// never user artifacts (snapshots, .excalidraw documents).
func CleanExpiredSessions() {
	dir := sessionDir()
	entries, err := os.ReadDir(dir)
	if err != nil {
		return
	}
	cutoff := time.Now().Add(-sessionGCAge)
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		// Only clean session metadata: drw_*.json and drw_*_yjs.bin
		isSessionFile := strings.HasPrefix(name, "drw_") &&
			(strings.HasSuffix(name, ".json") || strings.HasSuffix(name, "_yjs.bin"))
		if !isSessionFile {
			continue
		}
		info, err := e.Info()
		if err != nil {
			continue
		}
		if info.ModTime().Before(cutoff) {
			_ = os.Remove(filepath.Join(dir, e.Name()))
		}
	}
}

// ---------------------------------------------------------------------------
// WebSocket relay with control message support
// ---------------------------------------------------------------------------

type wsRelay struct {
	mu      sync.Mutex
	clients map[*websocket.Conn]string // conn -> clientId

	// Latest scene state for new/reconnecting clients
	sceneMu     sync.RWMutex
	latestScene []byte // raw JSON of the last sync message

	// Pending update requests: request_id -> result channel
	pendingMu sync.Mutex
	pending   map[string]chan json.RawMessage
}

func newWSRelay() *wsRelay {
	return &wsRelay{
		clients: make(map[*websocket.Conn]string),
		pending: make(map[string]chan json.RawMessage),
	}
}

func (r *wsRelay) add(c *websocket.Conn) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.clients[c] = ""
}

func (r *wsRelay) setClientID(c *websocket.Conn, clientID string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.clients[c]; ok {
		r.clients[c] = clientID
	}
}

// remove removes a connection and returns its clientId (empty if unknown).
func (r *wsRelay) remove(c *websocket.Conn) string {
	r.mu.Lock()
	clientID := r.clients[c]
	delete(r.clients, c)
	r.mu.Unlock()
	return clientID
}

func (r *wsRelay) saveScene(msg []byte) {
	cp := make([]byte, len(msg))
	copy(cp, msg)
	r.sceneMu.Lock()
	r.latestScene = cp
	r.sceneMu.Unlock()
}

func (r *wsRelay) getScene() []byte {
	r.sceneMu.RLock()
	defer r.sceneMu.RUnlock()
	return r.latestScene
}

func (r *wsRelay) hasClients() bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	return len(r.clients) > 0
}

// broadcastControl sends a JSON control message to all connected clients.
func (r *wsRelay) broadcastControl(msg []byte) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for c := range r.clients {
		_ = c.Write(context.Background(), websocket.MessageText, msg)
	}
}

// broadcast relays a message from sender to all other clients.
func (r *wsRelay) broadcast(sender *websocket.Conn, typ websocket.MessageType, msg []byte) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for c := range r.clients {
		if c != sender {
			_ = c.Write(context.Background(), typ, msg)
		}
	}
}

// registerPending creates a channel for an update request.
func (r *wsRelay) registerPending(requestID string) chan json.RawMessage {
	r.pendingMu.Lock()
	defer r.pendingMu.Unlock()
	ch := make(chan json.RawMessage, 1)
	r.pending[requestID] = ch
	return ch
}

// resolvePending sends a validate_result to the waiting channel.
func (r *wsRelay) resolvePending(requestID string, msg json.RawMessage) {
	r.pendingMu.Lock()
	ch, ok := r.pending[requestID]
	if ok {
		delete(r.pending, requestID)
	}
	r.pendingMu.Unlock()
	if ok {
		ch <- msg
	}
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

// Server hosts the draw whiteboard page and handles interactions.
type Server struct {
	session    *Session
	listener   net.Listener
	httpServer *http.Server
	relay      *wsRelay

	mu           sync.Mutex
	latestResult *DrawResult

	autoClose    bool
	shutdownCh   chan struct{}
	shutdownOnce sync.Once
}

// NewServer creates a new draw server.
func NewServer(session *Session) (*Server, error) {
	bind := session.Bind
	if bind == "" {
		bind = "127.0.0.1"
	}
	addr := fmt.Sprintf("%s:%d", bind, session.Port)
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return nil, fmt.Errorf("listen %s: %w", addr, err)
	}
	session.Port = ln.Addr().(*net.TCPAddr).Port

	s := &Server{
		session:    session,
		listener:   ln,
		relay:      newWSRelay(),
		shutdownCh: make(chan struct{}),
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", s.handleIndex)
	mux.HandleFunc("/init", s.handleInit)
	mux.HandleFunc("/image/", s.handleImage)
	mux.HandleFunc("/submit", s.handleSubmit)
	mux.HandleFunc("/update", s.handleUpdate)
	mux.HandleFunc("/poll", s.handlePoll)
	mux.HandleFunc("/shutdown", s.handleShutdown)
	mux.HandleFunc("/state", s.handleState)
	mux.HandleFunc("/ws", s.handleWS)

	s.httpServer = &http.Server{Handler: mux}
	return s, nil
}

// Port returns the port the server is listening on.
func (s *Server) Port() int { return s.session.Port }

// URL returns the full URL of the server.
func (s *Server) URL() string {
	host := s.session.Bind
	if host == "" || host == "0.0.0.0" {
		host = "127.0.0.1"
	}
	return fmt.Sprintf("http://%s:%d", host, s.session.Port)
}

func (s *Server) triggerShutdown() {
	s.shutdownOnce.Do(func() { close(s.shutdownCh) })
}

// Run starts the HTTP server and blocks until shutdown or context cancellation.
func (s *Server) Run(ctx context.Context) error {
	timer := time.AfterFunc(time.Until(s.session.ExpiresAt), func() {
		s.session.Status = "expired"
		_ = s.session.Save()
		_ = s.httpServer.Shutdown(context.Background())
	})
	defer timer.Stop()

	go func() {
		select {
		case <-ctx.Done():
			_ = s.httpServer.Shutdown(context.Background())
		case <-s.shutdownCh:
			_ = s.httpServer.Shutdown(context.Background())
		}
	}()

	err := s.httpServer.Serve(s.listener)
	if err == http.ErrServerClosed {
		return nil
	}
	return err
}

// LatestResult returns the most recent draw result.
func (s *Server) LatestResult() *DrawResult {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.latestResult
}

// ---------------------------------------------------------------------------
// HTTP Handlers
// ---------------------------------------------------------------------------

func (s *Server) handleIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate")
	page := injectTemplateVars(drawPageHTML, s.session.CSRFToken, s.session.SessionID, s.autoClose)
	_, _ = w.Write([]byte(page))
}

func (s *Server) handleInit(w http.ResponseWriter, r *http.Request) {
	if s.session.InitPath == "" && s.session.ImagePath == "" {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if s.session.ImagePath != "" && s.session.InitPath == "" {
		// Image-only: return image URL
		_ = json.NewEncoder(w).Encode(map[string]any{
			"format":    "image",
			"image_url": "image/" + filepath.Base(s.session.ImagePath),
		})
		return
	}

	data, err := os.ReadFile(s.session.InitPath)
	if err != nil {
		http.Error(w, "init file not found", http.StatusNotFound)
		return
	}

	switch s.session.InitFormat {
	case FormatMermaid:
		_ = json.NewEncoder(w).Encode(map[string]any{
			"format":  "mermaid",
			"content": string(data),
		})
	case FormatExcalidraw:
		// Try to decode as object or bare array
		var raw json.RawMessage
		if err := json.Unmarshal(data, &raw); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		var elements any
		var files any
		format := "excalidraw"

		// Check if it's an object or an array
		trimmed := strings.TrimSpace(string(raw))
		if len(trimmed) > 0 && trimmed[0] == '[' {
			// Bare elements array
			var arr []any
			if err := json.Unmarshal(raw, &arr); err != nil {
				http.Error(w, "invalid JSON array", http.StatusBadRequest)
				return
			}
			elements = arr
		} else {
			// Object — extract elements
			var doc map[string]any
			if err := json.Unmarshal(raw, &doc); err != nil {
				http.Error(w, "invalid JSON object", http.StatusBadRequest)
				return
			}
			if elems, ok := doc["elements"]; ok {
				elements = elems
			} else {
				elements = []any{}
			}
			if _, hasType := doc["type"]; hasType {
				format = "excalidraw_full"
			}
			// Pass through files if present (embedded image data, etc.)
			if f, ok := doc["files"]; ok {
				files = f
			}
		}

		resp := map[string]any{
			"format":   format,
			"elements": elements,
		}
		if files != nil {
			resp["files"] = files
		}
		_ = json.NewEncoder(w).Encode(resp)
	default:
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s *Server) handleImage(w http.ResponseWriter, r *http.Request) {
	if s.session.ImagePath == "" {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, s.session.ImagePath)
}

func (s *Server) handleSubmit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		http.Error(w, "payload too large", http.StatusRequestEntityTooLarge)
		return
	}
	if r.FormValue("csrf_token") != s.session.CSRFToken {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	result := &DrawResult{
		Status: "submitted",
	}

	// Save snapshot PNG
	if file, _, err := r.FormFile("snapshot"); err == nil {
		imgBytes, readErr := io.ReadAll(file)
		file.Close()
		if readErr == nil {
			_ = os.MkdirAll(filepath.Dir(s.session.SnapshotPath), 0755)
			if writeErr := os.WriteFile(s.session.SnapshotPath, imgBytes, 0644); writeErr == nil {
				result.Snapshot = s.session.SnapshotPath
			}
		}
	}

	// Save Excalidraw document
	if file, _, err := r.FormFile("document"); err == nil {
		docBytes, readErr := io.ReadAll(file)
		file.Close()
		if readErr == nil {
			_ = os.MkdirAll(filepath.Dir(s.session.DocumentPath), 0755)
			if writeErr := os.WriteFile(s.session.DocumentPath, docBytes, 0644); writeErr == nil {
				result.Document = s.session.DocumentPath
			}
		}
	}

	// Copy source file if mermaid
	if s.session.SourcePath != "" {
		result.Source = s.session.SourcePath
	}

	// Generate hint
	result.Hint = generateHint(result)

	s.mu.Lock()
	s.latestResult = result
	s.mu.Unlock()

	s.session.Status = "submitted"
	s.session.Result = result
	_ = s.session.Save()

	w.Header().Set("Content-Type", "application/json")
	resp := map[string]any{"status": "saved"}
	if s.autoClose {
		resp["closing"] = true
	}
	_ = json.NewEncoder(w).Encode(resp)

	// Notify WebSocket clients
	submittedMsg, _ := json.Marshal(map[string]any{
		"type":      "submitted",
		"clientId":  r.FormValue("client_id"),
		"autoClose": s.autoClose,
	})
	s.relay.broadcastControl(submittedMsg)

	if s.autoClose {
		go func() {
			time.Sleep(200 * time.Millisecond)
			s.triggerShutdown()
		}()
	}
}

func (s *Server) handleUpdate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req struct {
		Format    string `json:"format"`
		Content   string `json:"content"`
		InitPath  string `json:"init_path,omitempty"`
		CSRFToken string `json:"csrf_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON body", http.StatusBadRequest)
		return
	}
	if req.CSRFToken != s.session.CSRFToken {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	// Content is required — the CLI reads the file and sends content.
	// The server never reads files from client-supplied paths.
	if req.Content == "" {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"applied": false,
			"error":   "content is required",
		})
		return
	}

	// Update source path tracking from the trusted init_path metadata
	if req.InitPath != "" {
		if req.Format == "" {
			req.Format = DetectInitFormat(req.InitPath)
		}
		if req.Format == FormatMermaid {
			s.session.SourcePath = req.InitPath
			_ = s.session.Save()
		}
	}

	if req.Format == "" {
		req.Format = FormatExcalidraw
	}

	// Check if any browser is connected
	if !s.relay.hasClients() {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"applied": false,
			"error":   "no browser connected to session",
			"hint":    "Open the draw URL in a browser first",
		})
		return
	}

	// Generate request ID
	reqID := generateRequestID()

	// Register pending response channel
	ch := s.relay.registerPending(reqID)

	// Push content_update to browser via WebSocket
	updateMsg, _ := json.Marshal(map[string]any{
		"type":       "content_update",
		"format":     req.Format,
		"content":    req.Content,
		"request_id": reqID,
	})
	s.relay.broadcastControl(updateMsg)

	// Wait for validate_result with timeout
	select {
	case result := <-ch:
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(result)
	case <-time.After(15 * time.Second):
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"applied": false,
			"error":   "browser validation timeout (15s)",
			"hint":    "The browser may be unresponsive. Try refreshing the page.",
		})
	}
}

func (s *Server) handlePoll(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	s.mu.Lock()
	result := s.latestResult
	s.mu.Unlock()

	if result == nil {
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "pending"})
		return
	}
	_ = json.NewEncoder(w).Encode(result)
}

func (s *Server) handleState(w http.ResponseWriter, r *http.Request) {
	data, err := os.ReadFile(s.session.YjsStatePath)
	if err != nil {
		w.Header().Set("Content-Type", "application/octet-stream")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	w.Header().Set("Content-Type", "application/octet-stream")
	_, _ = w.Write(data)
}

func (s *Server) handleShutdown(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	token := r.FormValue("csrf_token")
	if token == "" {
		token = r.URL.Query().Get("csrf_token")
	}
	if token != s.session.CSRFToken {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	// Notify browser clients
	closingMsg, _ := json.Marshal(map[string]string{"type": "session_closing"})
	s.relay.broadcastControl(closingMsg)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "stopping"})

	go func() {
		time.Sleep(100 * time.Millisecond)
		s.triggerShutdown()
	}()
}

func (s *Server) handleWS(w http.ResponseWriter, r *http.Request) {
	// Authenticate WebSocket connections via CSRF token
	token := r.URL.Query().Get("csrf_token")
	if token != s.session.CSRFToken {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		// Origin check is skipped because the page is served from the same
		// localhost server, but the CSRF token above prevents unauthorized access.
		InsecureSkipVerify: true,
	})
	if err != nil {
		return
	}
	defer c.Close(websocket.StatusNormalClosure, "")

	s.relay.add(c)
	defer func() {
		clientID := s.relay.remove(c)
		// Broadcast leave to remaining clients so they remove the stale cursor
		if clientID != "" {
			leaveMsg, _ := json.Marshal(map[string]string{
				"type":     "leave",
				"clientId": clientID,
			})
			s.relay.broadcastControl(leaveMsg)
		}
	}()

	for {
		typ, msg, err := c.Read(r.Context())
		if err != nil {
			return
		}

		// Check for control messages
		if typ == websocket.MessageText {
			var ctrl struct {
				Type      string `json:"type"`
				ClientID  string `json:"clientId"`
				RequestID string `json:"request_id"`
			}
			if json.Unmarshal(msg, &ctrl) == nil {
				// Track clientId from join message and send latest scene
				if ctrl.Type == "join" && ctrl.ClientID != "" {
					s.relay.setClientID(c, ctrl.ClientID)
					// Send cached scene state to the new/reconnecting client
					if scene := s.relay.getScene(); scene != nil {
						// Wrap as scene_state so the client applies it unconditionally
						// (sync messages are filtered by clientId which would skip own state)
						var raw map[string]json.RawMessage
						if json.Unmarshal(scene, &raw) == nil {
							raw["type"], _ = json.Marshal("scene_state")
							if wrapped, err := json.Marshal(raw); err == nil {
								_ = c.Write(r.Context(), websocket.MessageText, wrapped)
							}
						}
					}
				}
				if ctrl.Type == "validate_result" && ctrl.RequestID != "" {
					// Route to pending update handler
					s.relay.resolvePending(ctrl.RequestID, msg)
					continue
				}
			}
		}

		// Cache sync messages so new/reconnecting clients get the latest state
		if typ == websocket.MessageText {
			var peek struct {
				Type string `json:"type"`
			}
			if json.Unmarshal(msg, &peek) == nil && peek.Type == "sync" {
				s.relay.saveScene(msg)
			}
		}

		// Relay to other clients
		s.relay.broadcast(c, typ, msg)
	}
}

// ---------------------------------------------------------------------------
// Background process (non-blocking mode)
// ---------------------------------------------------------------------------

// StartBackground spawns a detached _serve process and returns the session.
func StartBackground(initPath, imagePath, outputDir, bind string, port int) (*Session, error) {
	if port == 0 {
		p, err := findFreePort(bind)
		if err != nil {
			return nil, fmt.Errorf("find free port: %w", err)
		}
		port = p
	} else {
		ln, err := net.Listen("tcp", fmt.Sprintf("%s:%d", bind, port))
		if err != nil {
			return nil, fmt.Errorf("port %d is already in use", port)
		}
		ln.Close()
	}

	session := NewSession(initPath, imagePath, outputDir, bind, port)
	if err := session.Save(); err != nil {
		return nil, fmt.Errorf("save session: %w", err)
	}

	exe, err := os.Executable()
	if err != nil {
		session.Remove()
		return nil, fmt.Errorf("resolve executable: %w", err)
	}

	cmd := exec.Command(exe, "draw", "_serve",
		"--session", session.SessionID,
	)
	detachProcess(cmd)
	cmd.Stdin = nil
	cmd.Stdout = nil
	cmd.Stderr = nil

	if err := cmd.Start(); err != nil {
		session.Remove()
		return nil, fmt.Errorf("start background server: %w", err)
	}

	session.PID = cmd.Process.Pid
	if err := session.Save(); err != nil {
		return nil, err
	}

	_ = cmd.Process.Release()
	return session, nil
}

func findFreePort(bind string) (int, error) {
	if bind == "" {
		bind = "127.0.0.1"
	}
	ln, err := net.Listen("tcp", bind+":0")
	if err != nil {
		return 0, err
	}
	port := ln.Addr().(*net.TCPAddr).Port
	_ = ln.Close()
	return port, nil
}

// WaitForReady waits until the draw server is accepting connections.
func WaitForReady(bind string, port int, timeout time.Duration) error {
	host := bind
	if host == "" || host == "0.0.0.0" {
		host = "127.0.0.1"
	}
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		conn, err := net.DialTimeout("tcp", fmt.Sprintf("%s:%d", host, port), 200*time.Millisecond)
		if err == nil {
			_ = conn.Close()
			return nil
		}
		time.Sleep(100 * time.Millisecond)
	}
	return fmt.Errorf("server not ready after %v", timeout)
}

// ---------------------------------------------------------------------------
// Blocking mode
// ---------------------------------------------------------------------------

// RunBlocking starts the draw server, opens the browser, and blocks
// until ctx is cancelled. Returns the latest draw result.
func RunBlocking(ctx context.Context, initPath, imagePath, outputDir, bind string, port int, stderr io.Writer) (*DrawResult, error) {
	session := NewSession(initPath, imagePath, outputDir, bind, port)

	srv, err := NewServer(session)
	if err != nil {
		return nil, err
	}
	srv.autoClose = true

	url := srv.URL()
	fmt.Fprintf(stderr, "Draw whiteboard: %s\n", url)
	if session.Bind == "0.0.0.0" {
		fmt.Fprintf(stderr, "Listening on 0.0.0.0:%d (accessible from other machines)\n", srv.Port())
	}
	fmt.Fprintf(stderr, "Click 'Save' in the browser when finished.\n\n")

	if berr := auth.OpenBrowser(url); berr != nil {
		fmt.Fprintf(stderr, "Could not open browser. Open this URL manually:\n  %s\n", url)
		if session.Bind == "127.0.0.1" {
			fmt.Fprintf(stderr, "  Tip: use --bind 0.0.0.0 to allow access from other machines.\n")
		}
		fmt.Fprintln(stderr)
	}

	_ = srv.Run(ctx)
	return srv.LatestResult(), nil
}

// ---------------------------------------------------------------------------
// Serve (hidden _serve command)
// ---------------------------------------------------------------------------

// RunServe is the entry point for the hidden _serve command.
func RunServe(ctx context.Context, sessionID string) error {
	session, err := LoadSession(sessionID)
	if err != nil {
		return err
	}
	if session.Status == "expired" {
		return fmt.Errorf("session %q has expired", sessionID)
	}

	session.PID = os.Getpid()
	_ = session.Save()

	srv, err := NewServer(session)
	if err != nil {
		return err
	}
	return srv.Run(ctx)
}

// ---------------------------------------------------------------------------
// Poll / Stop
// ---------------------------------------------------------------------------

// PollSession reads the session file and returns it.
func PollSession(sessionID string) (*Session, error) {
	return LoadSession(sessionID)
}

// StopSession sends a shutdown request to the background server.
func StopSession(sessionID string) error {
	session, err := LoadSession(sessionID)
	if err != nil {
		return err
	}

	shutdownURL := fmt.Sprintf("http://127.0.0.1:%d/shutdown?csrf_token=%s",
		session.Port, session.CSRFToken)
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Post(shutdownURL, "", nil)
	if err != nil {
		session.Remove()
		return nil
	}
	resp.Body.Close()
	session.Remove()
	return nil
}

// ---------------------------------------------------------------------------
// Update (CLI -> server -> browser)
// ---------------------------------------------------------------------------

// UpdateSession sends an update to an active draw session.
func UpdateSession(sessionID, initPath string) (json.RawMessage, error) {
	session, err := LoadSession(sessionID)
	if err != nil {
		return nil, err
	}
	if session.Status == "expired" {
		return nil, fmt.Errorf("session %q has expired", sessionID)
	}

	absPath, err := filepath.Abs(initPath)
	if err != nil {
		return nil, fmt.Errorf("resolve path: %w", err)
	}
	if _, err := os.Stat(absPath); err != nil {
		return nil, fmt.Errorf("file not found: %w", err)
	}

	format := DetectInitFormat(absPath)
	content, err := os.ReadFile(absPath)
	if err != nil {
		return nil, fmt.Errorf("read file: %w", err)
	}

	// POST to the running server's /update endpoint
	updateURL := fmt.Sprintf("http://127.0.0.1:%d/update", session.Port)

	reqBody, _ := json.Marshal(map[string]string{
		"format":     format,
		"content":    string(content),
		"init_path":  absPath,
		"csrf_token": session.CSRFToken,
	})

	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Post(updateURL, "application/json", strings.NewReader(string(reqBody)))
	if err != nil {
		return nil, fmt.Errorf("update request failed: %w (is the session still running?)", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response: %w", err)
	}

	return body, nil
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func generateRequestID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return "req_" + hex.EncodeToString(b)
}

func generateHint(result *DrawResult) string {
	parts := []string{
		"User modified the whiteboard.",
		"Use 'anycap image read' on the snapshot to understand the current state.",
	}
	if result.Source != "" {
		parts = append(parts, "To iterate: edit the .mmd source and push via 'anycap draw update'. Update replaces all diagram elements with the new conversion (user-drawn annotations are preserved, but diagram element positions are reset). Alternatively, re-open the .excalidraw file with 'anycap draw --init' to start from the current visual state.")
	} else {
		parts = append(parts, "The .excalidraw file can be re-opened with 'anycap draw --init' for further iteration.")
	}
	return strings.Join(parts, " ")
}

func ensureGitignore() {
	wd, err := os.Getwd()
	if err != nil {
		return
	}
	cmd := exec.Command("git", "rev-parse", "--is-inside-work-tree")
	cmd.Dir = wd
	cmd.Stdout = nil
	cmd.Stderr = nil
	if cmd.Run() != nil {
		return
	}
	cmd = exec.Command("git", "check-ignore", "-q", ".anycap/")
	cmd.Dir = wd
	cmd.Stdout = nil
	cmd.Stderr = nil
	if cmd.Run() == nil {
		return
	}
	gitignorePath := filepath.Join(wd, ".gitignore")
	entry := ".anycap/"
	existing, _ := os.ReadFile(gitignorePath)
	for _, line := range strings.Split(string(existing), "\n") {
		if strings.TrimSpace(line) == entry {
			return
		}
	}
	f, err := os.OpenFile(gitignorePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return
	}
	defer f.Close()
	if len(existing) > 0 && existing[len(existing)-1] != '\n' {
		_, _ = f.WriteString("\n")
	}
	_, _ = f.WriteString(entry + "\n")
}
