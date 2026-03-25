package command

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/testutil/mockserver"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestImageUnderstandWithURL(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"actions", "image-understand", "--url", "https://example.com/photo.jpg"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image understand --url failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "mock image analysis") {
		t.Fatalf("expected mock analysis in output, got: %s", output)
	}
	// CLI should not expose internal fields like model name
	if strings.Contains(output, "mock-vision-model") {
		t.Fatalf("model name should not be in CLI output, got: %s", output)
	}
}

func TestImageUnderstandWithInstruction(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"actions", "image-understand", "--url", "https://example.com/photo.jpg", "--instruction", "What color is the car?"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image understand with instruction failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, "What color is the car?") {
		t.Fatalf("expected instruction echoed in mock response, got: %s", output)
	}
}

func TestImageUnderstandWithFile(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	// Create a temp image file
	tmpDir := t.TempDir()
	imgPath := filepath.Join(tmpDir, "test-photo.png")
	if err := os.WriteFile(imgPath, []byte("fake-png-content"), 0644); err != nil {
		t.Fatal(err)
	}

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"actions", "image-understand", "--file", imgPath})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image understand --file failed: %v\nstderr: %s", err, stderr.String())
	}

	// Verify no intermediate progress messages leaked to stderr
	stderrOut := stderr.String()
	if stderrOut != "" {
		t.Fatalf("expected no stderr output, got: %s", stderrOut)
	}

	// Verify clean JSON result on stdout (content only, no model/usage)
	output := stdout.String()
	if !strings.Contains(output, "mock image analysis") {
		t.Fatalf("expected mock analysis in output, got: %s", output)
	}
	if strings.Contains(output, "mock-vision-model") {
		t.Fatalf("model name should not be in CLI output, got: %s", output)
	}
}

func TestImageUnderstandRequiresURLOrFile(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"actions", "image-understand"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when neither --url nor --file provided")
	}
}

func TestImageUnderstandMultipleURLs(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{
		"actions", "image-understand",
		"--url", "https://example.com/img1.jpg",
		"--url", "https://example.com/img2.jpg",
		"--instruction", "Compare these images",
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image understand multi-url failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "Compare these images") {
		t.Fatalf("expected instruction in output, got: %s", output)
	}
}

func TestImageUnderstandTooManyImages(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	args := []string{"actions", "image-understand"}
	for i := 0; i < 11; i++ {
		args = append(args, "--url", fmt.Sprintf("https://example.com/img%d.jpg", i))
	}
	cmd.SetArgs(args)

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when too many images provided")
	}
	if !strings.Contains(err.Error(), "too many images") {
		t.Fatalf("expected 'too many images' error, got: %v", err)
	}
}

func TestVideoReadWithURL(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"actions", "video-read", "--url", "https://example.com/clip.mp4"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("video read --url failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "mock video analysis") {
		t.Fatalf("expected mock video analysis in output, got: %s", output)
	}
	// CLI should not expose internal fields like model name
	if strings.Contains(output, "mock-vision-model") {
		t.Fatalf("model name should not be in CLI output, got: %s", output)
	}
}

func TestVideoReadWithInstruction(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"actions", "video-read", "--url", "https://example.com/clip.mp4", "--instruction", "Count the people"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("video read with instruction failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, "Count the people") {
		t.Fatalf("expected instruction echoed in mock response, got: %s", output)
	}
}

func TestVideoReadWithFile(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	// Create a temp video file
	tmpDir := t.TempDir()
	vidPath := filepath.Join(tmpDir, "test-clip.mp4")
	if err := os.WriteFile(vidPath, []byte("fake-mp4-content"), 0644); err != nil {
		t.Fatal(err)
	}

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"actions", "video-read", "--file", vidPath})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("video read --file failed: %v\nstderr: %s", err, stderr.String())
	}

	// Verify no intermediate progress messages leaked to stderr
	stderrOut := stderr.String()
	if stderrOut != "" {
		t.Fatalf("expected no stderr output, got: %s", stderrOut)
	}

	// Verify clean JSON result (content only)
	output := stdout.String()
	if !strings.Contains(output, "mock video analysis") {
		t.Fatalf("expected mock video analysis in output, got: %s", output)
	}
	if strings.Contains(output, "mock-vision-model") {
		t.Fatalf("model name should not be in CLI output, got: %s", output)
	}
}

func TestVideoReadRequiresURLOrFile(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"actions", "video-read"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when neither --url nor --file provided")
	}
}

func TestHelpIncludesActionsCommand(t *testing.T) {
	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"--help"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("help: %v", err)
	}

	output := stdout.String()
	for _, expected := range []string{"actions", "login", "logout", "status"} {
		if !strings.Contains(output, expected) {
			t.Fatalf("expected %q in help output: %s", expected, output)
		}
	}
}

// --- Image Models & Generate Tests ---

func TestImageModelsList(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "models"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image models failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "mock-model-1") {
		t.Fatalf("expected mock-model-1 in output, got: %s", output)
	}
	if !strings.Contains(output, "mock-model-2") {
		t.Fatalf("expected mock-model-2 in output, got: %s", output)
	}
	if !strings.Contains(output, `"capability":"image"`) {
		t.Fatalf("expected capability field in output, got: %s", output)
	}
}

func TestImageModelsDetail(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "models", "mock-model-1"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image models <model> failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "mock-model-1") {
		t.Fatalf("expected mock-model-1 in output, got: %s", output)
	}
	// Should NOT contain the other model.
	if strings.Contains(output, "mock-model-2") {
		t.Fatalf("expected only mock-model-1, but got mock-model-2 in output: %s", output)
	}
}

func TestImageModelsDetailNotFound(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "models", "nonexistent-model"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for nonexistent model")
	}
	if !strings.Contains(err.Error(), "not found") {
		t.Fatalf("expected 'not found' error, got: %v", err)
	}
}

func TestImageModelsSchema(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "models", "mock-model-1", "schema"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image models <model> schema failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "model_params") {
		t.Fatalf("expected model_params in schema output, got: %s", output)
	}
	if !strings.Contains(output, "mock-model-1") {
		t.Fatalf("expected model name in schema output, got: %s", output)
	}
	if !strings.Contains(output, "generate") {
		t.Fatalf("expected operation in schema output, got: %s", output)
	}
}

func TestImageModelsSchemaWithOperation(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "models", "mock-model-1", "schema", "--operation", "edit"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image models schema --operation failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, `"edit"`) {
		t.Fatalf("expected 'edit' operation in output, got: %s", output)
	}
}

func TestImageGenerate(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "generate", "--prompt", "a paper crane", "--model", "mock-model-1"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image generate failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "mock.anycap.ai/images/") {
		t.Fatalf("expected image URL in output, got: %s", output)
	}
	if !strings.Contains(output, "mock-model-1") {
		t.Fatalf("expected model name in output, got: %s", output)
	}
	if !strings.Contains(output, `"success"`) {
		t.Fatalf("expected success status in output, got: %s", output)
	}
}

func TestImageGenerateWithParams(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{
		"image", "generate",
		"--prompt", "a landscape",
		"--model", "mock-model-1",
		"--param", "aspect_ratio=16:9",
		"--param", "resolution=2k",
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image generate with params failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "mock.anycap.ai/images/") {
		t.Fatalf("expected image URL in output, got: %s", output)
	}
}

func TestImageGenerateRequiresPrompt(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "generate", "--model", "mock-model-1"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when --prompt missing")
	}
	if !strings.Contains(err.Error(), "prompt") {
		t.Fatalf("expected prompt-related error, got: %v", err)
	}
}

func TestImageGenerateRequiresModel(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "generate", "--prompt", "a crane"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when --model missing")
	}
	if !strings.Contains(err.Error(), "model") {
		t.Fatalf("expected model-related error, got: %v", err)
	}
}

func TestImageGenerateInvalidParam(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{
		"image", "generate",
		"--prompt", "test",
		"--model", "m",
		"--param", "bad-no-equals",
	})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for invalid --param format")
	}
	if !strings.Contains(err.Error(), "key=value") {
		t.Fatalf("expected key=value error, got: %v", err)
	}
}

func TestImageParamValueParsing(t *testing.T) {
	// Test the parseParamValue function via the image generate flow
	// with various value types to ensure JSON parsing works correctly.
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{
		"image", "generate",
		"--prompt", "test",
		"--model", "mock-model-1",
		"--param", "count=3", // number
		"--param", "hd=true", // boolean
		"--param", "ratio=16:9", // string fallback
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image generate with typed params failed: %v", err)
	}
}

func TestHelpIncludesImageCommand(t *testing.T) {
	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"--help"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("help: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, "image") {
		t.Fatalf("expected 'image' in help output: %s", output)
	}
}

// --- Download and Generate -o Tests ---

func TestDownloadCommand(t *testing.T) {
	// Set up a mock file server.
	fileMux := http.NewServeMux()
	fileMux.HandleFunc("/images/test.png", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/png")
		w.Write([]byte("fake-png-data"))
	})
	fileServer := httptest.NewServer(fileMux)
	defer fileServer.Close()

	tmpDir := t.TempDir()
	outPath := filepath.Join(tmpDir, "downloaded.png")

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"download", fileServer.URL + "/images/test.png", "-o", outPath})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("download failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, `"success"`) {
		t.Fatalf("expected success in output, got: %s", output)
	}
	if !strings.Contains(output, outPath) {
		t.Fatalf("expected path in output, got: %s", output)
	}

	// Verify file contents.
	data, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatalf("read downloaded file: %v", err)
	}
	if string(data) != "fake-png-data" {
		t.Fatalf("expected 'fake-png-data', got: %s", string(data))
	}
}

func TestDownloadAutoFilename(t *testing.T) {
	fileMux := http.NewServeMux()
	fileMux.HandleFunc("/path/to/output.png", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("data"))
	})
	fileServer := httptest.NewServer(fileMux)
	defer fileServer.Close()

	tmpDir := t.TempDir()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	// No -o flag; file should auto-name from URL.
	// Change working directory to tmpDir so auto-named file goes there.
	origDir, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origDir)

	cmd.SetArgs([]string{"download", fileServer.URL + "/path/to/output.png"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("download auto-name failed: %v", err)
	}

	// Verify file was created with the URL filename.
	if _, err := os.Stat(filepath.Join(tmpDir, "output.png")); err != nil {
		t.Fatalf("expected output.png in tmpDir: %v", err)
	}
}

func TestImageGenerateHint(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "generate", "--prompt", "a crane", "--model", "mock-model-1"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image generate failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, "anycap download") {
		t.Fatalf("expected download hint in output when no -o, got: %s", output)
	}
}

func TestImageGenerateWithOutput(t *testing.T) {
	// Mock file server for the generated image URL.
	fileMux := http.NewServeMux()
	fileMux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/png")
		w.Write([]byte("generated-image-data"))
	})
	fileServer := httptest.NewServer(fileMux)
	defer fileServer.Close()

	// Custom mock that returns the file server URL in outputs.
	mux := http.NewServeMux()
	mux.HandleFunc("POST /v1/image/generate", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"id":"req_1","status":"success","data":{"id":"img_1","status":"success","model":"m","outputs":[{"type":"image","url":"%s/output.png","mime_type":"image/png"}],"usage":{"credits":1},"credit_cost":1}}`, fileServer.URL)
	})
	ts := httptest.NewServer(mux)
	defer ts.Close()

	tmpDir := t.TempDir()
	outPath := filepath.Join(tmpDir, "result.png")

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"image", "generate", "--prompt", "test", "--model", "m", "-o", outPath})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image generate -o failed: %v\nstderr: %s", err, stderr.String())
	}

	// Verify file was downloaded.
	data, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatalf("read output file: %v", err)
	}
	if string(data) != "generated-image-data" {
		t.Fatalf("expected 'generated-image-data', got: %s", string(data))
	}

	// Verify JSON includes local_path.
	output := stdout.String()
	if !strings.Contains(output, "local_path") {
		t.Fatalf("expected local_path in output, got: %s", output)
	}
	if !strings.Contains(output, outPath) {
		t.Fatalf("expected output path in JSON, got: %s", output)
	}
	// Should NOT have the hint when -o is used.
	if strings.Contains(output, "anycap download") {
		t.Fatalf("should not have download hint when -o is used, got: %s", output)
	}
}
