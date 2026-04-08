// Package annotate implements a browser-based multimodal annotation tool.
// It starts a localhost HTTP server that serves an interactive page,
// supporting image, URL (iframe), video, and audio annotation with
// drawing tools and screen/canvas recording.
package annotate

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
	sessionTimeout = 10 * time.Minute
	sessionGCAge   = 1 * time.Hour
	maxUploadSize  = 100 << 20 // 100 MB (recording can be 8 MB/min, 10+ min sessions)
)

// SessionTimeoutSeconds returns the session timeout in seconds.
func SessionTimeoutSeconds() int {
	return int(sessionTimeout.Seconds())
}

// ---------------------------------------------------------------------------
// Media type detection
// ---------------------------------------------------------------------------

// MediaType constants.
const (
	MediaTypeImage = "image"
	MediaTypeURL   = "url"
	MediaTypeVideo = "video"
	MediaTypeAudio = "audio"
)

var imageExts = map[string]bool{
	".png": true, ".jpg": true, ".jpeg": true, ".gif": true,
	".webp": true, ".bmp": true, ".svg": true,
}

var videoExts = map[string]bool{
	".mp4": true, ".webm": true, ".mov": true, ".avi": true,
}

var audioExts = map[string]bool{
	".mp3": true, ".wav": true, ".ogg": true,
	".m4a": true, ".flac": true, ".aac": true,
}

// DetectMediaType determines the media type from the target argument.
func DetectMediaType(target string) string {
	if strings.HasPrefix(target, "http://") || strings.HasPrefix(target, "https://") {
		return MediaTypeURL
	}
	ext := strings.ToLower(filepath.Ext(target))
	if imageExts[ext] {
		return MediaTypeImage
	}
	if videoExts[ext] {
		return MediaTypeVideo
	}
	if audioExts[ext] {
		return MediaTypeAudio
	}
	// Default to image for unknown extensions.
	return MediaTypeImage
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

// Point represents a 2D coordinate in original image pixel space.
type Point struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// Bounds represents a rectangular region in original image pixel space.
type Bounds struct {
	X      int `json:"x"`
	Y      int `json:"y"`
	Width  int `json:"width"`
	Height int `json:"height"`
}

// Annotation represents a single user annotation.
type Annotation struct {
	ID       int     `json:"id"`
	Type     string  `json:"type"` // rect, arrow, point, freehand
	Bounds   *Bounds `json:"bounds,omitempty"`
	From     *Point  `json:"from,omitempty"`
	To       *Point  `json:"to,omitempty"`
	Position *Point  `json:"position,omitempty"`
	Points   []Point `json:"points,omitempty"`
	Label    string  `json:"label"`
}

// ImageDimensions holds the original image dimensions.
type ImageDimensions struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

// AnnotationResult is the final output of an annotation session.
type AnnotationResult struct {
	Status            string           `json:"status"`
	Source            string           `json:"source"`
	SourceType        string           `json:"source_type"` // image, url, video, audio
	AnnotatedImage    string           `json:"annotated_image,omitempty"`
	Annotations       []Annotation     `json:"annotations,omitempty"`
	ImageDimensions   *ImageDimensions `json:"image_dimensions,omitempty"`
	Recording         string           `json:"recording,omitempty"`
	RecordingDuration float64          `json:"recording_duration_seconds,omitempty"`
	Hint              string           `json:"hint"`
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

// Session persists annotation state to disk for non-blocking mode.
type Session struct {
	SessionID     string            `json:"session_id"`
	PID           int               `json:"pid"`
	Port          int               `json:"port"`
	Bind          string            `json:"bind"`
	CSRFToken     string            `json:"csrf_token"`
	ImagePath     string            `json:"image_path"`
	OutputPath    string            `json:"output_path"`
	MediaType     string            `json:"media_type"`           // image, url, video, audio
	MediaPath     string            `json:"media_path,omitempty"` // original file (video/audio)
	SourceURL     string            `json:"source_url,omitempty"` // target URL (url mode)
	RecordingPath string            `json:"recording_path,omitempty"`
	YjsStatePath  string            `json:"yjs_state_path,omitempty"`
	CreatedAt     time.Time         `json:"created_at"`
	ExpiresAt     time.Time         `json:"expires_at"`
	Status        string            `json:"status"` // pending, submitted, expired
	Result        *AnnotationResult `json:"result"`
}

func sessionDir() string {
	wd, err := os.Getwd()
	if err != nil {
		wd = "."
	}
	return filepath.Join(wd, ".anycap", "annotate")
}

func sessionFilePath(id string) string {
	return filepath.Join(sessionDir(), id+".json")
}

// SessionFilePath returns the path to the session JSON file for the given ID.
// Exported so the command layer can include it in the non-blocking start response.
func SessionFilePath(id string) string {
	return sessionFilePath(id)
}

func yjsStatePath(id string) string {
	return filepath.Join(sessionDir(), id+"_yjs.bin")
}

func generateSessionID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return "ann_" + hex.EncodeToString(b)
}

func generateCSRFToken() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// NewSession creates a new annotation session.
func NewSession(target, outputPath, bind string, port int, mediaType string) *Session {
	if bind == "" {
		bind = "127.0.0.1"
	}
	now := time.Now()
	sessionID := generateSessionID()

	s := &Session{
		SessionID: sessionID,
		Port:      port,
		Bind:      bind,
		CSRFToken: generateCSRFToken(),
		MediaType: mediaType,
		CreatedAt: now,
		ExpiresAt: now.Add(sessionTimeout),
		Status:    "pending",
	}

	switch mediaType {
	case MediaTypeImage:
		s.ImagePath = target
		s.OutputPath = outputPath
	case MediaTypeURL:
		s.SourceURL = target
		// URL mode has no image output path by default.
		if outputPath != "" {
			s.OutputPath = outputPath
		}
	case MediaTypeVideo:
		s.MediaPath = target
		if outputPath != "" {
			s.OutputPath = outputPath
		}
	case MediaTypeAudio:
		s.MediaPath = target
		if outputPath != "" {
			s.OutputPath = outputPath
		}
	}

	// Set recording path in session dir.
	s.RecordingPath = filepath.Join(sessionDir(), sessionID+"_recording.webm")
	s.YjsStatePath = yjsStatePath(sessionID)

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

// Remove deletes the session file and associated artifacts from disk.
func (s *Session) Remove() {
	_ = os.Remove(sessionFilePath(s.SessionID))
	_ = os.Remove(s.RecordingPath)
	_ = os.Remove(s.YjsStatePath)
}

// Source returns the primary source path or URL for this session.
func (s *Session) Source() string {
	switch s.MediaType {
	case MediaTypeImage:
		return s.ImagePath
	case MediaTypeURL:
		return s.SourceURL
	case MediaTypeVideo, MediaTypeAudio:
		return s.MediaPath
	}
	return ""
}

// ListSessions returns all sessions found in the session directory.
// Expired sessions are marked with status "expired".
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

// CleanExpiredSessions removes session files older than sessionGCAge.
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
// WebSocket relay (for Yjs collaboration)
// ---------------------------------------------------------------------------

// wsMsg is used for minimal JSON inspection of WebSocket messages.
type wsMsg struct {
	Type string `json:"type"`
}

// wsRelay broadcasts WebSocket messages to all connected clients
// and stores the last "sync" message for state recovery.
type wsRelay struct {
	mu       sync.Mutex
	clients  map[*websocket.Conn]struct{}
	lastSync []byte // last annotation sync message
}

func newWSRelay() *wsRelay {
	return &wsRelay{clients: make(map[*websocket.Conn]struct{})}
}

func (r *wsRelay) add(c *websocket.Conn) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.clients[c] = struct{}{}
	// Send stored annotation state to new client.
	if len(r.lastSync) > 0 {
		_ = c.Write(context.Background(), websocket.MessageText, r.lastSync)
	}
}

func (r *wsRelay) remove(c *websocket.Conn) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.clients, c)
}

func (r *wsRelay) broadcastAll(msg []byte) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for c := range r.clients {
		_ = c.Write(context.Background(), websocket.MessageText, msg)
	}
}

func (r *wsRelay) broadcast(sender *websocket.Conn, typ websocket.MessageType, msg []byte) {
	r.mu.Lock()
	defer r.mu.Unlock()
	// Store sync messages for state recovery on new client connect.
	if typ == websocket.MessageText {
		var m wsMsg
		if json.Unmarshal(msg, &m) == nil && m.Type == "sync" {
			r.lastSync = make([]byte, len(msg))
			copy(r.lastSync, msg)
		}
	}
	for c := range r.clients {
		if c != sender {
			_ = c.Write(context.Background(), typ, msg)
		}
	}
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

// Server hosts the annotation page and handles submissions.
type Server struct {
	session    *Session
	listener   net.Listener
	httpServer *http.Server
	relay      *wsRelay

	mu           sync.Mutex
	latestResult *AnnotationResult

	autoClose    bool // shutdown after first submit (blocking mode)
	shutdownCh   chan struct{}
	shutdownOnce sync.Once
}

// NewServer creates a new annotation server bound to session.Bind:port.
// If session.Port is 0, an ephemeral port is chosen.
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
	// Update session with the actual port (important when port was 0).
	session.Port = ln.Addr().(*net.TCPAddr).Port

	s := &Server{
		session:    session,
		listener:   ln,
		relay:      newWSRelay(),
		shutdownCh: make(chan struct{}),
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", s.handleIndex)
	mux.HandleFunc("/image", s.handleImage)
	mux.HandleFunc("/media", s.handleMedia)
	mux.HandleFunc("/state", s.handleState)
	mux.HandleFunc("/submit", s.handleSubmit)
	mux.HandleFunc("/shutdown", s.handleShutdown)
	mux.HandleFunc("/ws", s.handleWS)

	s.httpServer = &http.Server{Handler: mux}

	return s, nil
}

// Port returns the port the server is listening on.
func (s *Server) Port() int {
	return s.session.Port
}

// URL returns the full URL of the annotation server.
// When bound to 0.0.0.0, returns 127.0.0.1 for local access.
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
	// Auto-shutdown when session expires.
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

// LatestResult returns the most recent annotation result.
func (s *Server) LatestResult() *AnnotationResult {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.latestResult
}

func (s *Server) handleIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	page := injectTemplateVars(annotationPageHTML, s.session.CSRFToken, s.session.MediaType, s.session.SourceURL, s.session.SessionID)
	_, _ = w.Write([]byte(page))
}

func (s *Server) handleImage(w http.ResponseWriter, r *http.Request) {
	if s.session.ImagePath == "" {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, s.session.ImagePath)
}

func (s *Server) handleMedia(w http.ResponseWriter, r *http.Request) {
	if s.session.MediaPath == "" {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, s.session.MediaPath)
}

func (s *Server) handleState(w http.ResponseWriter, r *http.Request) {
	data, err := os.ReadFile(s.session.YjsStatePath)
	if err != nil {
		// No state yet — return empty.
		w.Header().Set("Content-Type", "application/octet-stream")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	w.Header().Set("Content-Type", "application/octet-stream")
	_, _ = w.Write(data)
}

func (s *Server) handleWS(w http.ResponseWriter, r *http.Request) {
	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true, // localhost only
	})
	if err != nil {
		return
	}
	defer c.Close(websocket.StatusNormalClosure, "")

	s.relay.add(c)
	defer s.relay.remove(c)

	// Read and validate the first message (expected: join with sessionId).
	firstMsgValidated := false
	for {
		typ, msg, err := c.Read(r.Context())
		if err != nil {
			return
		}
		// Check session ID on first message.
		if !firstMsgValidated {
			firstMsgValidated = true
			var joinMsg struct {
				SessionID string `json:"sessionId"`
			}
			if json.Unmarshal(msg, &joinMsg) == nil && joinMsg.SessionID != "" && joinMsg.SessionID != s.session.SessionID {
				// Stale client from a previous session — tell it to reload.
				reloadMsg, _ := json.Marshal(map[string]string{"type": "reload"})
				_ = c.Write(r.Context(), websocket.MessageText, reloadMsg)
				return
			}
		}
		s.relay.broadcast(c, typ, msg)
	}
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

	result := &AnnotationResult{
		Status:     "submitted",
		Source:     s.session.Source(),
		SourceType: s.session.MediaType,
	}

	// Read annotated image (optional).
	if file, _, err := r.FormFile("annotated_image"); err == nil {
		imgBytes, readErr := io.ReadAll(file)
		file.Close()
		if readErr == nil {
			outPath := s.session.OutputPath
			if outPath == "" {
				// Generate output path based on source.
				outPath = defaultAnnotatedPath(s.session)
			}
			if writeErr := os.WriteFile(outPath, imgBytes, 0644); writeErr == nil {
				result.AnnotatedImage = outPath
			}
		}
	}

	// Parse annotations JSON (optional).
	if raw := r.FormValue("annotations"); raw != "" {
		var annotations []Annotation
		if err := json.Unmarshal([]byte(raw), &annotations); err == nil {
			result.Annotations = annotations
		}
	}

	// Parse image dimensions (optional).
	if raw := r.FormValue("image_dimensions"); raw != "" {
		var dims ImageDimensions
		if json.Unmarshal([]byte(raw), &dims) == nil {
			result.ImageDimensions = &dims
		}
	}

	// Read recording (optional).
	if file, _, err := r.FormFile("recording"); err == nil {
		recBytes, readErr := io.ReadAll(file)
		file.Close()
		if readErr == nil && len(recBytes) > 0 {
			_ = os.MkdirAll(filepath.Dir(s.session.RecordingPath), 0700)
			if writeErr := os.WriteFile(s.session.RecordingPath, recBytes, 0644); writeErr == nil {
				result.Recording = s.session.RecordingPath
			}
		}
	}

	// Parse recording duration (optional).
	if raw := r.FormValue("recording_duration"); raw != "" {
		var dur float64
		if _, err := fmt.Sscanf(raw, "%f", &dur); err == nil {
			result.RecordingDuration = dur
		}
	}

	// Read Yjs state (optional).
	if file, _, err := r.FormFile("yjs_state"); err == nil {
		stateBytes, readErr := io.ReadAll(file)
		file.Close()
		if readErr == nil && len(stateBytes) > 0 {
			_ = os.MkdirAll(sessionDir(), 0700)
			_ = os.WriteFile(s.session.YjsStatePath, stateBytes, 0600)
		}
	}

	// Generate dynamic hint.
	result.Hint = generateHint(result)

	s.mu.Lock()
	s.latestResult = result
	s.mu.Unlock()

	// Persist to session file for poll.
	s.session.Status = "submitted"
	s.session.Result = result
	_ = s.session.Save()

	w.Header().Set("Content-Type", "application/json")
	resp := map[string]any{"status": "saved"}
	if s.autoClose {
		resp["closing"] = true
	}
	_ = json.NewEncoder(w).Encode(resp)

	// Notify all connected WebSocket clients that feedback has been submitted.
	// Include the submitter's clientId so the submitting browser tab can skip
	// the overlay (it already has its own feedback via the HTTP response).
	submittedMsg, _ := json.Marshal(map[string]any{
		"type":     "submitted",
		"clientId": r.FormValue("client_id"),
	})
	s.relay.broadcastAll(submittedMsg)

	// Auto-close: shutdown server after the first submit (blocking mode).
	if s.autoClose {
		go func() {
			time.Sleep(200 * time.Millisecond)
			s.triggerShutdown()
		}()
	}
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

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "stopping"})

	// Signal shutdown in a goroutine to allow the response to be sent.
	go func() {
		time.Sleep(100 * time.Millisecond)
		s.triggerShutdown()
	}()
}

// ---------------------------------------------------------------------------
// Dynamic hint generation
// ---------------------------------------------------------------------------

func generateHint(result *AnnotationResult) string {
	hasAnnotations := len(result.Annotations) > 0 || result.AnnotatedImage != ""
	hasRecording := result.Recording != ""

	var parts []string

	// Annotation-related hints depend on source type.
	if hasAnnotations {
		switch result.SourceType {
		case MediaTypeImage:
			if hasRecording {
				parts = append(parts, "Use the annotated image for spatial edits with 'anycap image generate --mode image-to-image'.")
			} else {
				parts = append(parts, "Use the annotated image with 'anycap image generate --mode image-to-image --param images=<annotated_image>'.")
			}
		case MediaTypeURL:
			parts = append(parts, "Annotations describe visual regions on the web page. Use the annotation coordinates and labels to guide source code modifications.")
		case MediaTypeVideo:
			parts = append(parts, "Annotations mark specific regions in the video frame. Use the coordinates and labels to guide video regeneration with adjusted parameters.")
		case MediaTypeAudio:
			parts = append(parts, "Annotations contain feedback on the audio. Use the labels to guide audio regeneration with adjusted parameters.")
		}
	}

	// Recording hint.
	if hasRecording {
		parts = append(parts, "Use 'anycap actions video-read' on the recording to understand the user's narrated feedback.")
	}

	return strings.Join(parts, " ")
}

// ---------------------------------------------------------------------------
// Background process (non-blocking mode)
// ---------------------------------------------------------------------------

// StartBackground spawns a detached _serve process and returns the session.
func StartBackground(target, outputPath, bind string, port int, mediaType string) (*Session, error) {
	if port == 0 {
		p, err := findFreePort(bind)
		if err != nil {
			return nil, fmt.Errorf("find free port: %w", err)
		}
		port = p
	} else {
		// Verify the specified port is available.
		ln, err := net.Listen("tcp", fmt.Sprintf("%s:%d", bind, port))
		if err != nil {
			return nil, fmt.Errorf("port %d is already in use", port)
		}
		ln.Close()
	}

	session := NewSession(target, outputPath, bind, port, mediaType)
	if err := session.Save(); err != nil {
		return nil, fmt.Errorf("save session: %w", err)
	}

	exe, err := os.Executable()
	if err != nil {
		session.Remove()
		return nil, fmt.Errorf("resolve executable: %w", err)
	}

	cmd := exec.Command(exe, "annotate", "_serve",
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

	// Detach: let the process run independently.
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

// WaitForReady waits until the annotation server is accepting connections.
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

// RunBlocking starts the annotation server, opens the browser, and blocks
// until ctx is cancelled (Ctrl+C). Returns the latest annotation result.
func RunBlocking(ctx context.Context, target, outputPath, bind string, port int, mediaType string, stderr io.Writer) (*AnnotationResult, error) {
	session := NewSession(target, outputPath, bind, port, mediaType)

	srv, err := NewServer(session)
	if err != nil {
		return nil, err
	}
	srv.autoClose = true // auto-shutdown after user clicks Done

	url := srv.URL()
	fmt.Fprintf(stderr, "Annotation tool (%s): %s\n", mediaType, url)
	if session.Bind == "0.0.0.0" {
		fmt.Fprintf(stderr, "Listening on 0.0.0.0:%d (accessible from other machines)\n", srv.Port())
	}
	fmt.Fprintf(stderr, "Click 'Done' in the browser when finished.\n\n")

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
// It reads the session, starts the server, and runs until timeout or shutdown.
func RunServe(ctx context.Context, sessionID string) error {
	session, err := LoadSession(sessionID)
	if err != nil {
		return err
	}
	if session.Status == "expired" {
		return fmt.Errorf("session %q has expired", sessionID)
	}

	// Update PID in session.
	session.PID = os.Getpid()
	_ = session.Save()

	srv, err := NewServer(session)
	if err != nil {
		return err
	}
	// Background mode: keep server running after submit so the user can iterate.
	// The agent calls poll to read the latest result, then stop to shut down.
	return srv.Run(ctx)
}

// ---------------------------------------------------------------------------
// Poll / Stop
// ---------------------------------------------------------------------------

// PollSession reads the session file and returns it.
func PollSession(sessionID string) (*Session, error) {
	return LoadSession(sessionID)
}

// StopSession sends a shutdown request to the background server and cleans up.
func StopSession(sessionID string) error {
	session, err := LoadSession(sessionID)
	if err != nil {
		return err
	}

	// Always connect via 127.0.0.1 for shutdown (local operation).
	shutdownURL := fmt.Sprintf("http://127.0.0.1:%d/shutdown?csrf_token=%s",
		session.Port, session.CSRFToken)
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Post(shutdownURL, "", nil)
	if err != nil {
		// Server might already be dead. Clean up anyway.
		session.Remove()
		return nil
	}
	resp.Body.Close()
	session.Remove()
	return nil
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// DefaultOutputPath returns the default annotated output path.
// e.g., "photo.png" -> "photo_annotated.png"
func DefaultOutputPath(imagePath string) string {
	ext := filepath.Ext(imagePath)
	base := imagePath[:len(imagePath)-len(ext)]
	return base + "_annotated" + ext
}

// defaultAnnotatedPath generates an output path for the annotated image
// based on the session's source.
func defaultAnnotatedPath(s *Session) string {
	switch s.MediaType {
	case MediaTypeImage:
		return DefaultOutputPath(s.ImagePath)
	case MediaTypeVideo:
		return DefaultOutputPath(s.MediaPath)
	case MediaTypeURL:
		return filepath.Join(sessionDir(), s.SessionID+"_annotated.png")
	case MediaTypeAudio:
		return filepath.Join(sessionDir(), s.SessionID+"_annotated.png")
	}
	return filepath.Join(sessionDir(), s.SessionID+"_annotated.png")
}

// ensureGitignore adds .anycap/ to the local .gitignore if we are inside a
// git work tree and .anycap/ is not already covered by any gitignore rule
// (local, parent directory, or global).
func ensureGitignore() {
	wd, err := os.Getwd()
	if err != nil {
		return
	}

	// Check if inside a git work tree (handles subdirectories correctly).
	cmd := exec.Command("git", "rev-parse", "--is-inside-work-tree")
	cmd.Dir = wd
	cmd.Stdout = nil
	cmd.Stderr = nil
	if cmd.Run() != nil {
		return // not a git repo
	}

	// Check if .anycap/ is already covered by any gitignore rule.
	cmd = exec.Command("git", "check-ignore", "-q", ".anycap/")
	cmd.Dir = wd
	cmd.Stdout = nil
	cmd.Stderr = nil
	if cmd.Run() == nil {
		return // already ignored by some rule
	}

	// Append .anycap/ to the local .gitignore.
	gitignorePath := filepath.Join(wd, ".gitignore")
	entry := ".anycap/"

	// Read existing content for duplicate check and trailing-newline detection.
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
