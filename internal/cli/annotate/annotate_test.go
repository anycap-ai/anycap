package annotate

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestDetectMediaType(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		// Images
		{"photo.png", MediaTypeImage},
		{"dir/image.jpg", MediaTypeImage},
		{"file.JPEG", MediaTypeImage},
		{"file.webp", MediaTypeImage},
		{"file.svg", MediaTypeImage},
		{"file.gif", MediaTypeImage},
		{"file.bmp", MediaTypeImage},
		// URLs
		{"http://localhost:3000", MediaTypeURL},
		{"https://example.com/page", MediaTypeURL},
		{"http://127.0.0.1:8080/path", MediaTypeURL},
		// Videos
		{"output.mp4", MediaTypeVideo},
		{"clip.webm", MediaTypeVideo},
		{"movie.mov", MediaTypeVideo},
		{"video.avi", MediaTypeVideo},
		// Audio
		{"song.mp3", MediaTypeAudio},
		{"track.wav", MediaTypeAudio},
		{"podcast.ogg", MediaTypeAudio},
		{"voice.m4a", MediaTypeAudio},
		{"music.flac", MediaTypeAudio},
		{"clip.aac", MediaTypeAudio},
		// Unknown defaults to image
		{"noext", MediaTypeImage},
		{"file.xyz", MediaTypeImage},
	}
	for _, tt := range tests {
		got := DetectMediaType(tt.input)
		if got != tt.want {
			t.Errorf("DetectMediaType(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}

func TestDefaultOutputPath(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"photo.png", "photo_annotated.png"},
		{"dir/image.jpg", "dir/image_annotated.jpg"},
		{"noext", "noext_annotated"},
		{"a.b.png", "a.b_annotated.png"},
	}
	for _, tt := range tests {
		got := DefaultOutputPath(tt.input)
		if got != tt.want {
			t.Errorf("DefaultOutputPath(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}

func TestSessionCreateLoadRemove(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	s := NewSession("/tmp/test.png", "/tmp/test_annotated.png", "127.0.0.1", 12345, MediaTypeImage)
	if s.SessionID == "" || s.CSRFToken == "" {
		t.Fatal("session ID and CSRF token must be generated")
	}
	if s.Status != "pending" {
		t.Fatalf("initial status = %q, want pending", s.Status)
	}
	if s.Port != 12345 {
		t.Fatalf("port = %d, want 12345", s.Port)
	}
	if s.MediaType != MediaTypeImage {
		t.Fatalf("media type = %q, want image", s.MediaType)
	}
	if s.ImagePath != "/tmp/test.png" {
		t.Fatalf("image path = %q", s.ImagePath)
	}

	// Save.
	if err := s.Save(); err != nil {
		t.Fatalf("Save: %v", err)
	}

	// Load.
	loaded, err := LoadSession(s.SessionID)
	if err != nil {
		t.Fatalf("LoadSession: %v", err)
	}
	if loaded.SessionID != s.SessionID {
		t.Errorf("loaded session ID = %q, want %q", loaded.SessionID, s.SessionID)
	}
	if loaded.CSRFToken != s.CSRFToken {
		t.Errorf("loaded CSRF token mismatch")
	}
	if loaded.Status != "pending" {
		t.Errorf("loaded status = %q, want pending", loaded.Status)
	}
	if loaded.MediaType != MediaTypeImage {
		t.Errorf("loaded media type = %q, want image", loaded.MediaType)
	}

	// Remove.
	s.Remove()
	if _, err := LoadSession(s.SessionID); err == nil {
		t.Error("expected error after Remove, got nil")
	}
}

func TestSessionMultimodalTypes(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	// URL session.
	s := NewSession("https://localhost:3000", "", "127.0.0.1", 0, MediaTypeURL)
	if s.SourceURL != "https://localhost:3000" {
		t.Errorf("url session: source_url = %q", s.SourceURL)
	}
	if s.Source() != "https://localhost:3000" {
		t.Errorf("url session: Source() = %q", s.Source())
	}
	if s.ImagePath != "" {
		t.Errorf("url session: image_path should be empty, got %q", s.ImagePath)
	}

	// Video session.
	s = NewSession("/tmp/video.mp4", "", "127.0.0.1", 0, MediaTypeVideo)
	if s.MediaPath != "/tmp/video.mp4" {
		t.Errorf("video session: media_path = %q", s.MediaPath)
	}
	if s.Source() != "/tmp/video.mp4" {
		t.Errorf("video session: Source() = %q", s.Source())
	}

	// Audio session.
	s = NewSession("/tmp/song.mp3", "", "127.0.0.1", 0, MediaTypeAudio)
	if s.MediaPath != "/tmp/song.mp3" {
		t.Errorf("audio session: media_path = %q", s.MediaPath)
	}
	if s.Source() != "/tmp/song.mp3" {
		t.Errorf("audio session: Source() = %q", s.Source())
	}
}

func TestSessionExpired(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	s := NewSession("/tmp/test.png", "/tmp/out.png", "127.0.0.1", 0, MediaTypeImage)
	s.ExpiresAt = time.Now().Add(-1 * time.Second) // already expired
	if err := s.Save(); err != nil {
		t.Fatalf("Save: %v", err)
	}

	loaded, err := LoadSession(s.SessionID)
	if err != nil {
		t.Fatalf("LoadSession: %v", err)
	}
	if loaded.Status != "expired" {
		t.Errorf("status = %q, want expired", loaded.Status)
	}
}

func TestServerStartAndSubmit(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	imgPath := filepath.Join(tmp, "test.png")
	if err := os.WriteFile(imgPath, []byte("fake-png-data"), 0644); err != nil {
		t.Fatal(err)
	}
	outPath := filepath.Join(tmp, "test_annotated.png")

	session := NewSession(imgPath, outPath, "127.0.0.1", 0, MediaTypeImage)
	srv, err := NewServer(session)
	if err != nil {
		t.Fatalf("NewServer: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Run server in background.
	errCh := make(chan error, 1)
	go func() { errCh <- srv.Run(ctx) }()

	// Wait for server to be ready.
	if err := WaitForReady("127.0.0.1", srv.Port(), 3*time.Second); err != nil {
		t.Fatalf("server not ready: %v", err)
	}

	baseURL := srv.URL()

	// Test GET / returns HTML with CSRF token and media type.
	resp, err := http.Get(baseURL + "/")
	if err != nil {
		t.Fatalf("GET /: %v", err)
	}
	body, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	if resp.StatusCode != 200 {
		t.Fatalf("GET / status = %d", resp.StatusCode)
	}
	if !bytes.Contains(body, []byte(session.CSRFToken)) {
		t.Error("GET / response does not contain CSRF token")
	}
	// Media type should be injected.
	if !bytes.Contains(body, []byte("image")) {
		t.Error("GET / response does not contain media type")
	}

	// Test GET /image.
	resp, err = http.Get(baseURL + "/image")
	if err != nil {
		t.Fatalf("GET /image: %v", err)
	}
	imgBody, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	if string(imgBody) != "fake-png-data" {
		t.Errorf("GET /image returned %q", string(imgBody))
	}

	// Test POST /submit with annotations only (no recording).
	annotations := []Annotation{
		{ID: 1, Type: "rect", Bounds: &Bounds{X: 10, Y: 20, Width: 100, Height: 50}, Label: "change color"},
		{ID: 2, Type: "point", Position: &Point{X: 200, Y: 300}, Label: "remove this"},
	}
	annJSON, _ := json.Marshal(annotations)
	dimsJSON, _ := json.Marshal(ImageDimensions{Width: 1024, Height: 768})

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, _ := writer.CreateFormFile("annotated_image", "annotated.png")
	fw.Write([]byte("annotated-png-bytes"))
	writer.WriteField("annotations", string(annJSON))
	writer.WriteField("image_dimensions", string(dimsJSON))
	writer.WriteField("csrf_token", session.CSRFToken)
	writer.Close()

	resp, err = http.Post(baseURL+"/submit", writer.FormDataContentType(), &buf)
	if err != nil {
		t.Fatalf("POST /submit: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != 200 {
		t.Fatalf("POST /submit status = %d", resp.StatusCode)
	}

	// Verify result stored.
	result := srv.LatestResult()
	if result == nil {
		t.Fatal("LatestResult is nil after submit")
	}
	if result.Status != "submitted" {
		t.Errorf("result status = %q, want submitted", result.Status)
	}
	if result.SourceType != MediaTypeImage {
		t.Errorf("result source_type = %q, want image", result.SourceType)
	}
	if len(result.Annotations) != 2 {
		t.Errorf("result has %d annotations, want 2", len(result.Annotations))
	}
	if result.Annotations[0].Label != "change color" {
		t.Errorf("annotation[0].Label = %q", result.Annotations[0].Label)
	}
	if result.ImageDimensions == nil || result.ImageDimensions.Width != 1024 || result.ImageDimensions.Height != 768 {
		t.Errorf("dimensions = %+v", result.ImageDimensions)
	}
	if result.Hint == "" {
		t.Error("hint should not be empty")
	}

	// Verify annotated image written to disk.
	outData, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatalf("read output: %v", err)
	}
	if string(outData) != "annotated-png-bytes" {
		t.Errorf("output file = %q", string(outData))
	}

	// Verify session file updated.
	loaded, err := LoadSession(session.SessionID)
	if err != nil {
		t.Fatalf("LoadSession after submit: %v", err)
	}
	if loaded.Status != "submitted" {
		t.Errorf("session status = %q, want submitted", loaded.Status)
	}

	// Shutdown.
	cancel()
	if err := <-errCh; err != nil {
		t.Errorf("Run returned error: %v", err)
	}
}

func TestSubmitWithRecording(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	imgPath := filepath.Join(tmp, "test.png")
	os.WriteFile(imgPath, []byte("img"), 0644)
	outPath := filepath.Join(tmp, "out.png")

	session := NewSession(imgPath, outPath, "127.0.0.1", 0, MediaTypeImage)
	srv, err := NewServer(session)
	if err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go srv.Run(ctx)
	WaitForReady("127.0.0.1", srv.Port(), 3*time.Second)

	// Submit with both annotations and recording.
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, _ := writer.CreateFormFile("annotated_image", "a.png")
	fw.Write([]byte("annotated-data"))
	fw2, _ := writer.CreateFormFile("recording", "recording.webm")
	fw2.Write([]byte("fake-webm-recording-data"))
	writer.WriteField("annotations", `[{"id":1,"type":"point","position":{"x":50,"y":50},"label":"here"}]`)
	writer.WriteField("recording_duration", "45.5")
	writer.WriteField("csrf_token", session.CSRFToken)
	writer.Close()

	resp, _ := http.Post(srv.URL()+"/submit", writer.FormDataContentType(), &buf)
	resp.Body.Close()
	if resp.StatusCode != 200 {
		t.Fatalf("submit status = %d", resp.StatusCode)
	}

	result := srv.LatestResult()
	if result == nil {
		t.Fatal("nil result")
	}
	if result.Recording == "" {
		t.Error("recording path should be set")
	}
	if result.RecordingDuration != 45.5 {
		t.Errorf("recording duration = %f, want 45.5", result.RecordingDuration)
	}
	// Verify recording file written.
	recData, err := os.ReadFile(result.Recording)
	if err != nil {
		t.Fatalf("read recording: %v", err)
	}
	if string(recData) != "fake-webm-recording-data" {
		t.Errorf("recording data = %q", string(recData))
	}
	// Hint should mention both annotations and recording.
	if !bytes.Contains([]byte(result.Hint), []byte("annotated image")) || !bytes.Contains([]byte(result.Hint), []byte("video-read")) {
		t.Errorf("hint should mention both annotations and recording, got: %q", result.Hint)
	}
}

func TestSubmitRecordingOnly(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	imgPath := filepath.Join(tmp, "test.png")
	os.WriteFile(imgPath, []byte("img"), 0644)

	session := NewSession(imgPath, "", "127.0.0.1", 0, MediaTypeImage)
	srv, err := NewServer(session)
	if err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go srv.Run(ctx)
	WaitForReady("127.0.0.1", srv.Port(), 3*time.Second)

	// Submit with only recording (no annotations, no annotated image).
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, _ := writer.CreateFormFile("recording", "rec.webm")
	fw.Write([]byte("recording-bytes"))
	writer.WriteField("recording_duration", "30")
	writer.WriteField("csrf_token", session.CSRFToken)
	writer.Close()

	resp, _ := http.Post(srv.URL()+"/submit", writer.FormDataContentType(), &buf)
	resp.Body.Close()

	result := srv.LatestResult()
	if result == nil {
		t.Fatal("nil result")
	}
	if result.AnnotatedImage != "" {
		t.Errorf("annotated_image should be empty, got %q", result.AnnotatedImage)
	}
	if len(result.Annotations) != 0 {
		t.Errorf("annotations should be empty, got %d", len(result.Annotations))
	}
	if result.Recording == "" {
		t.Error("recording should be set")
	}
	// Hint should only mention recording.
	if !bytes.Contains([]byte(result.Hint), []byte("video-read")) {
		t.Errorf("hint should mention video-read, got: %q", result.Hint)
	}
}

func TestSubmitCSRFValidation(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	imgPath := filepath.Join(tmp, "test.png")
	os.WriteFile(imgPath, []byte("img"), 0644)

	session := NewSession(imgPath, filepath.Join(tmp, "out.png"), "127.0.0.1", 0, MediaTypeImage)
	srv, err := NewServer(session)
	if err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go srv.Run(ctx)
	WaitForReady("127.0.0.1", srv.Port(), 3*time.Second)

	// Submit with wrong CSRF token.
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, _ := writer.CreateFormFile("annotated_image", "a.png")
	fw.Write([]byte("data"))
	writer.WriteField("csrf_token", "wrong-token")
	writer.Close()

	resp, err := http.Post(srv.URL()+"/submit", writer.FormDataContentType(), &buf)
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusForbidden {
		t.Errorf("expected 403 for wrong CSRF, got %d", resp.StatusCode)
	}
}

func TestMediaEndpoint(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	// Create a video file.
	videoPath := filepath.Join(tmp, "test.mp4")
	os.WriteFile(videoPath, []byte("fake-video-data"), 0644)

	session := NewSession(videoPath, "", "127.0.0.1", 0, MediaTypeVideo)
	srv, err := NewServer(session)
	if err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go srv.Run(ctx)
	WaitForReady("127.0.0.1", srv.Port(), 3*time.Second)

	// GET /media should return video file.
	resp, err := http.Get(srv.URL() + "/media")
	if err != nil {
		t.Fatal(err)
	}
	body, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	if string(body) != "fake-video-data" {
		t.Errorf("GET /media returned %q", string(body))
	}

	// GET /image should 404 for video sessions.
	resp, err = http.Get(srv.URL() + "/image")
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("GET /image for video session: status = %d, want 404", resp.StatusCode)
	}
}

func TestStateEndpoint(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	imgPath := filepath.Join(tmp, "test.png")
	os.WriteFile(imgPath, []byte("img"), 0644)

	session := NewSession(imgPath, "", "127.0.0.1", 0, MediaTypeImage)
	srv, err := NewServer(session)
	if err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go srv.Run(ctx)
	WaitForReady("127.0.0.1", srv.Port(), 3*time.Second)

	// GET /state with no state should return 204.
	resp, err := http.Get(srv.URL() + "/state")
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("GET /state (empty): status = %d, want 204", resp.StatusCode)
	}

	// Submit with yjs_state.
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, _ := writer.CreateFormFile("yjs_state", "state.bin")
	fw.Write([]byte("yjs-binary-state"))
	writer.WriteField("csrf_token", session.CSRFToken)
	writer.Close()

	resp, _ = http.Post(srv.URL()+"/submit", writer.FormDataContentType(), &buf)
	resp.Body.Close()

	// GET /state should now return the state.
	resp, err = http.Get(srv.URL() + "/state")
	if err != nil {
		t.Fatal(err)
	}
	body, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	if resp.StatusCode != 200 {
		t.Errorf("GET /state: status = %d, want 200", resp.StatusCode)
	}
	if string(body) != "yjs-binary-state" {
		t.Errorf("GET /state returned %q", string(body))
	}
}

func TestShutdownEndpoint(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	imgPath := filepath.Join(tmp, "test.png")
	os.WriteFile(imgPath, []byte("img"), 0644)

	session := NewSession(imgPath, filepath.Join(tmp, "out.png"), "127.0.0.1", 0, MediaTypeImage)
	srv, err := NewServer(session)
	if err != nil {
		t.Fatal(err)
	}

	errCh := make(chan error, 1)
	go func() { errCh <- srv.Run(context.Background()) }()
	WaitForReady("127.0.0.1", srv.Port(), 3*time.Second)

	// Shutdown with correct CSRF.
	url := fmt.Sprintf("%s/shutdown?csrf_token=%s", srv.URL(), session.CSRFToken)
	resp, err := http.Post(url, "", nil)
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != 200 {
		t.Errorf("shutdown status = %d", resp.StatusCode)
	}

	// Server should stop.
	select {
	case err := <-errCh:
		if err != nil {
			t.Errorf("Run error: %v", err)
		}
	case <-time.After(3 * time.Second):
		t.Error("server did not shut down in time")
	}
}

func TestShutdownCSRFRequired(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	imgPath := filepath.Join(tmp, "test.png")
	os.WriteFile(imgPath, []byte("img"), 0644)

	session := NewSession(imgPath, filepath.Join(tmp, "out.png"), "127.0.0.1", 0, MediaTypeImage)
	srv, err := NewServer(session)
	if err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go srv.Run(ctx)
	WaitForReady("127.0.0.1", srv.Port(), 3*time.Second)

	// Shutdown without CSRF.
	resp, err := http.Post(srv.URL()+"/shutdown", "", nil)
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusForbidden {
		t.Errorf("expected 403, got %d", resp.StatusCode)
	}
}

func TestCleanExpiredSessions(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	s := NewSession("/tmp/x.png", "/tmp/x_ann.png", "127.0.0.1", 0, MediaTypeImage)
	if err := s.Save(); err != nil {
		t.Fatal(err)
	}

	// Set the file's mod time to 2 hours ago.
	fp := sessionFilePath(s.SessionID)
	old := time.Now().Add(-2 * time.Hour)
	os.Chtimes(fp, old, old)

	CleanExpiredSessions()

	if _, err := os.Stat(fp); !os.IsNotExist(err) {
		t.Error("expected old session file to be cleaned up")
	}
}

func TestInjectTemplateVars(t *testing.T) {
	html := `TOKEN='{{CSRF_TOKEN}}' TYPE='{{MEDIA_TYPE}}' URL='{{TARGET_URL}}' SID='{{SESSION_ID}}'`
	got := injectTemplateVars(html, "abc123", "video", "", "ann_test1")
	want := `TOKEN='abc123' TYPE='video' URL='' SID='ann_test1'`
	if got != want {
		t.Errorf("injectTemplateVars = %q, want %q", got, want)
	}

	// With URL.
	got = injectTemplateVars(html, "tok", "url", "https://localhost:3000", "ann_test2")
	want = `TOKEN='tok' TYPE='url' URL='https://localhost:3000' SID='ann_test2'`
	if got != want {
		t.Errorf("injectTemplateVars (url) = %q, want %q", got, want)
	}
}

func TestMultipleSubmitsOverwrite(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	imgPath := filepath.Join(tmp, "test.png")
	os.WriteFile(imgPath, []byte("img"), 0644)
	outPath := filepath.Join(tmp, "out.png")

	session := NewSession(imgPath, outPath, "127.0.0.1", 0, MediaTypeImage)
	srv, err := NewServer(session)
	if err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go srv.Run(ctx)
	WaitForReady("127.0.0.1", srv.Port(), 3*time.Second)

	// Submit twice with different data.
	for i, label := range []string{"first", "second"} {
		anns := []Annotation{{ID: i + 1, Type: "point", Position: &Point{X: i * 100, Y: 0}, Label: label}}
		annJSON, _ := json.Marshal(anns)

		var buf bytes.Buffer
		w := multipart.NewWriter(&buf)
		fw, _ := w.CreateFormFile("annotated_image", "a.png")
		fw.Write([]byte("data-" + label))
		w.WriteField("annotations", string(annJSON))
		w.WriteField("image_dimensions", `{"width":100,"height":100}`)
		w.WriteField("csrf_token", session.CSRFToken)
		w.Close()

		resp, _ := http.Post(srv.URL()+"/submit", w.FormDataContentType(), &buf)
		resp.Body.Close()
	}

	// Latest result should be the second submission.
	result := srv.LatestResult()
	if result == nil || len(result.Annotations) != 1 {
		t.Fatal("expected 1 annotation in latest result")
	}
	if result.Annotations[0].Label != "second" {
		t.Errorf("label = %q, want second", result.Annotations[0].Label)
	}

	// Output file should contain second data.
	data, _ := os.ReadFile(outPath)
	if string(data) != "data-second" {
		t.Errorf("output = %q, want data-second", string(data))
	}

	// Session should reflect latest submit.
	loaded, _ := LoadSession(session.SessionID)
	if loaded.Status != "submitted" {
		t.Errorf("session status = %q, want submitted", loaded.Status)
	}
}

func TestSpecificPort(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	imgPath := filepath.Join(tmp, "test.png")
	os.WriteFile(imgPath, []byte("img"), 0644)

	// Find a free port first.
	port, err := findFreePort("127.0.0.1")
	if err != nil {
		t.Fatal(err)
	}

	session := NewSession(imgPath, "", "127.0.0.1", port, MediaTypeImage)
	srv, err := NewServer(session)
	if err != nil {
		t.Fatal(err)
	}

	if srv.Port() != port {
		t.Errorf("port = %d, want %d", srv.Port(), port)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go srv.Run(ctx)
	WaitForReady("127.0.0.1", srv.Port(), 3*time.Second)

	resp, err := http.Get(srv.URL() + "/")
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != 200 {
		t.Errorf("status = %d", resp.StatusCode)
	}
}

func TestDynamicHints(t *testing.T) {
	tests := []struct {
		name   string
		result AnnotationResult
		wants  []string
	}{
		{
			name: "annotations only",
			result: AnnotationResult{
				AnnotatedImage: "/tmp/a.png",
				Annotations:    []Annotation{{ID: 1, Type: "rect"}},
				SourceType:     MediaTypeImage,
			},
			wants: []string{"image generate"},
		},
		{
			name: "recording only",
			result: AnnotationResult{
				Recording:  "/tmp/rec.webm",
				SourceType: MediaTypeImage,
			},
			wants: []string{"video-read"},
		},
		{
			name: "both annotations and recording",
			result: AnnotationResult{
				AnnotatedImage: "/tmp/a.png",
				Annotations:    []Annotation{{ID: 1, Type: "rect"}},
				Recording:      "/tmp/rec.webm",
				SourceType:     MediaTypeImage,
			},
			wants: []string{"annotated image", "video-read"},
		},
		{
			name: "url source with annotations",
			result: AnnotationResult{
				Annotations: []Annotation{{ID: 1, Type: "rect"}},
				SourceType:  MediaTypeURL,
			},
			wants: []string{"web page", "source code"},
		},
		{
			name: "url source recording only",
			result: AnnotationResult{
				Recording:  "/tmp/rec.webm",
				SourceType: MediaTypeURL,
			},
			wants: []string{"video-read"},
		},
		{
			name: "video source with annotations",
			result: AnnotationResult{
				Annotations: []Annotation{{ID: 1, Type: "rect"}},
				SourceType:  MediaTypeVideo,
			},
			wants: []string{"video frame"},
		},
		{
			name: "audio source with annotations",
			result: AnnotationResult{
				Annotations: []Annotation{{ID: 1, Type: "rect"}},
				SourceType:  MediaTypeAudio,
			},
			wants: []string{"feedback on the audio"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hint := generateHint(&tt.result)
			for _, w := range tt.wants {
				if !bytes.Contains([]byte(hint), []byte(w)) {
					t.Errorf("hint %q should contain %q", hint, w)
				}
			}
		})
	}
}

func TestURLSessionPageContent(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("ANYCAP_CONFIG_DIR", tmp)

	session := NewSession("https://localhost:3000", "", "127.0.0.1", 0, MediaTypeURL)
	srv, err := NewServer(session)
	if err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go srv.Run(ctx)
	WaitForReady("127.0.0.1", srv.Port(), 3*time.Second)

	resp, err := http.Get(srv.URL() + "/")
	if err != nil {
		t.Fatal(err)
	}
	body, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	// Page should contain the target URL for iframe.
	if !bytes.Contains(body, []byte("https://localhost:3000")) {
		t.Error("page should contain target URL")
	}
}

func TestListSessions(t *testing.T) {
	tmp := t.TempDir()

	// sessionDir() uses os.Getwd(), so we need to chdir.
	origDir, _ := os.Getwd()
	if err := os.Chdir(tmp); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { os.Chdir(origDir) })

	// No sessions yet.
	sessions, err := ListSessions()
	if err != nil {
		t.Fatalf("ListSessions (empty): %v", err)
	}
	if len(sessions) != 0 {
		t.Errorf("expected 0 sessions, got %d", len(sessions))
	}

	// Create a few sessions.
	s1 := NewSession("/tmp/a.png", "", "127.0.0.1", 11111, MediaTypeImage)
	if err := s1.Save(); err != nil {
		t.Fatal(err)
	}
	s2 := NewSession("https://example.com", "", "127.0.0.1", 22222, MediaTypeURL)
	if err := s2.Save(); err != nil {
		t.Fatal(err)
	}
	s3 := NewSession("/tmp/v.mp4", "", "127.0.0.1", 33333, MediaTypeVideo)
	s3.ExpiresAt = time.Now().Add(-1 * time.Second) // expired
	if err := s3.Save(); err != nil {
		t.Fatal(err)
	}

	sessions, err = ListSessions()
	if err != nil {
		t.Fatalf("ListSessions: %v", err)
	}
	if len(sessions) != 3 {
		t.Fatalf("expected 3 sessions, got %d", len(sessions))
	}

	// Check that expired session is marked.
	found := false
	for _, s := range sessions {
		if s.SessionID == s3.SessionID && s.Status == "expired" {
			found = true
		}
	}
	if !found {
		t.Error("expected expired session to be marked as expired")
	}

	// Remove one session.
	s1.Remove()
	sessions, err = ListSessions()
	if err != nil {
		t.Fatalf("ListSessions after remove: %v", err)
	}
	if len(sessions) != 2 {
		t.Errorf("expected 2 sessions after remove, got %d", len(sessions))
	}
}
