package command

import (
	"bytes"
	"encoding/json"
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

func TestImageReadWithURL(t *testing.T) {
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
	cmd.SetArgs([]string{"actions", "image-read", "--url", "https://example.com/photo.jpg"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image read --url failed: %v\nstderr: %s", err, stderr.String())
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

func TestImageReadWithInstruction(t *testing.T) {
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
	cmd.SetArgs([]string{"actions", "image-read", "--url", "https://example.com/photo.jpg", "--instruction", "What color is the car?"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image read with instruction failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, "What color is the car?") {
		t.Fatalf("expected instruction echoed in mock response, got: %s", output)
	}
}

func TestImageReadWithFile(t *testing.T) {
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
	cmd.SetArgs([]string{"actions", "image-read", "--file", imgPath})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image read --file failed: %v\nstderr: %s", err, stderr.String())
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

func TestImageReadRequiresURLOrFile(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"actions", "image-read"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when neither --url nor --file provided")
	}
}

func TestImageReadMultipleURLs(t *testing.T) {
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
		"actions", "image-read",
		"--url", "https://example.com/img1.jpg",
		"--url", "https://example.com/img2.jpg",
		"--instruction", "Compare these images",
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image read multi-url failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "Compare these images") {
		t.Fatalf("expected instruction in output, got: %s", output)
	}
}

func TestImageReadTooManyImages(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	args := []string{"actions", "image-read"}
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

func TestVideoReadFileTooLarge(t *testing.T) {
	tmpDir := t.TempDir()
	vidPath := filepath.Join(tmpDir, "huge.mp4")

	// Create a sparse file that reports >100 MB without writing all the bytes.
	f, err := os.Create(vidPath)
	if err != nil {
		t.Fatal(err)
	}
	const size = 101 * 1024 * 1024 // 101 MB
	if err := f.Truncate(size); err != nil {
		f.Close()
		t.Fatal(err)
	}
	f.Close()

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"actions", "video-read", "--file", vidPath})

	err = cmd.Execute()
	if err == nil {
		t.Fatal("expected error for oversized video file")
	}
	if !strings.Contains(err.Error(), "too large") {
		t.Fatalf("expected 'too large' error, got: %v", err)
	}
	if !strings.Contains(err.Error(), "compress") {
		t.Fatalf("expected compression hint in error, got: %v", err)
	}
}

func TestAudioReadWithURL(t *testing.T) {
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
	cmd.SetArgs([]string{"actions", "audio-read", "--url", "https://example.com/recording.wav"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("audio read --url failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "mock audio analysis") {
		t.Fatalf("expected mock audio analysis in output, got: %s", output)
	}
}

func TestAudioReadWithInstruction(t *testing.T) {
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
	cmd.SetArgs([]string{"actions", "audio-read", "--url", "https://example.com/podcast.mp3", "--instruction", "Summarize the topics"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("audio read with instruction failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, "Summarize the topics") {
		t.Fatalf("expected instruction echoed in mock response, got: %s", output)
	}
}

func TestAudioReadRequiresURLOrFile(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"actions", "audio-read"})

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
	cmd.SetArgs([]string{"image", "models", "mock-model-1", "schema", "--operation", "generate"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image models schema --operation failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, `"generate"`) {
		t.Fatalf("expected 'generate' operation in output, got: %s", output)
	}
}

func TestImageGenerate(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpDir := t.TempDir()
	origDir, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origDir)

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
	if !strings.Contains(output, `"model":"mock-model-1"`) && !strings.Contains(output, `"model": "mock-model-1"`) {
		t.Fatalf("expected model in flat output, got: %s", output)
	}
	if !strings.Contains(output, `"success"`) {
		t.Fatalf("expected success status in output, got: %s", output)
	}
	// Should auto-download and inject local_path.
	if !strings.Contains(output, "local_path") {
		t.Fatalf("expected local_path in output (auto-download), got: %s", output)
	}
	// Flat output should have credits_used.
	if !strings.Contains(output, "credits_used") {
		t.Fatalf("expected credits_used in flat output, got: %s", output)
	}
}

func TestImageGenerateImageToImage(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpDir := t.TempDir()
	origDir, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origDir)

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
		"--prompt", "make it a watercolor painting",
		"--model", "mock-model-1",
		"--mode", "image-to-image",
		"--param", "images=[\"https://example.com/photo.png\"]",
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("image generate image-to-image failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, `"success"`) {
		t.Fatalf("expected success status in output, got: %s", output)
	}
	if !strings.Contains(output, "local_path") {
		t.Fatalf("expected local_path in output (auto-download), got: %s", output)
	}
	if !strings.Contains(output, "credits_used") {
		t.Fatalf("expected credits_used in flat output, got: %s", output)
	}
}

func TestImageGenerateWithParams(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpDir := t.TempDir()
	origDir, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origDir)

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
	if !strings.Contains(output, "local_path") {
		t.Fatalf("expected local_path in output (auto-download), got: %s", output)
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

	tmpDir := t.TempDir()
	origDir, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origDir)

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

func TestImageGenerateAutoDownload(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpDir := t.TempDir()
	origDir, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origDir)

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
	// Should auto-download: local_path present, no download hint.
	if !strings.Contains(output, "local_path") {
		t.Fatalf("expected local_path in output (auto-download), got: %s", output)
	}
	if strings.Contains(output, "anycap download") {
		t.Fatalf("should not have download hint, got: %s", output)
	}

	// Verify a .png file was actually created in tmpDir.
	entries, _ := os.ReadDir(tmpDir)
	found := false
	for _, e := range entries {
		if strings.HasSuffix(e.Name(), ".png") {
			found = true
			data, _ := os.ReadFile(filepath.Join(tmpDir, e.Name()))
			if string(data) != "mock-image-data" {
				t.Fatalf("expected 'mock-image-data', got: %s", string(data))
			}
		}
	}
	if !found {
		t.Fatalf("expected a .png file in tmpDir, found: %v", entries)
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

	// Verify JSON includes local_path in flat format.
	output := stdout.String()
	if !strings.Contains(output, "local_path") {
		t.Fatalf("expected local_path in output, got: %s", output)
	}
	if !strings.Contains(output, outPath) {
		t.Fatalf("expected output path in JSON, got: %s", output)
	}
	// Flat output: should have credits_used and model at top level.
	if !strings.Contains(output, "credits_used") {
		t.Fatalf("expected credits_used in flat output, got: %s", output)
	}
	// Should not contain nested data/outputs structure.
	if strings.Contains(output, `"outputs"`) {
		t.Fatalf("expected flat output without nested outputs, got: %s", output)
	}
}

// --- Video Generation Tests ---

func TestVideoModels(t *testing.T) {
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
	cmd.SetArgs([]string{"video", "models"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("video models failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "mock-video-1") {
		t.Fatalf("expected mock-video-1 in output, got: %s", output)
	}
	if !strings.Contains(output, "mock-video-2") {
		t.Fatalf("expected mock-video-2 in output, got: %s", output)
	}
	if !strings.Contains(output, `"video"`) {
		t.Fatalf("expected capability video in output, got: %s", output)
	}
}

func TestVideoModelsSingleModel(t *testing.T) {
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
	cmd.SetArgs([]string{"video", "models", "mock-video-1"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("video models single failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "mock-video-1") {
		t.Fatalf("expected mock-video-1 in output, got: %s", output)
	}
	// Should NOT contain the other model.
	if strings.Contains(output, "mock-video-2") {
		t.Fatalf("expected only mock-video-1 but got mock-video-2: %s", output)
	}
}

func TestVideoModelSchema(t *testing.T) {
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
	cmd.SetArgs([]string{"video", "models", "mock-video-1", "schema"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("video model schema failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "duration") {
		t.Fatalf("expected duration in schema output, got: %s", output)
	}
	if !strings.Contains(output, "ratio") {
		t.Fatalf("expected ratio in schema output, got: %s", output)
	}
}

func TestVideoGenerateAutoDownload(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpDir := t.TempDir()
	origDir, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origDir)

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"video", "generate", "--prompt", "a cat on the beach", "--model", "mock-video-1"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("video generate failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "local_path") {
		t.Fatalf("expected local_path in output, got: %s", output)
	}
	if !strings.Contains(output, `"credits_used":5`) {
		t.Fatalf("expected credits_used:5 in output, got: %s", output)
	}

	// Verify a .mp4 file was created.
	entries, _ := os.ReadDir(tmpDir)
	found := false
	for _, e := range entries {
		if strings.HasSuffix(e.Name(), ".mp4") {
			found = true
			data, _ := os.ReadFile(filepath.Join(tmpDir, e.Name()))
			if string(data) != "mock-video-data" {
				t.Fatalf("expected 'mock-video-data', got: %s", string(data))
			}
		}
	}
	if !found {
		t.Fatalf("expected a .mp4 file in tmpDir, found: %v", entries)
	}
}

func TestVideoGenerateWithOutput(t *testing.T) {
	fileMux := http.NewServeMux()
	fileMux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "video/mp4")
		w.Write([]byte("generated-video-data"))
	})
	fileServer := httptest.NewServer(fileMux)
	defer fileServer.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("POST /v1/video/generate", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"id":"req_1","status":"success","data":{"id":"vid_1","status":"success","model":"m","outputs":[{"type":"video","url":"%s/output.mp4","mime_type":"video/mp4"}],"usage":{"credits":5},"credit_cost":5}}`, fileServer.URL)
	})
	ts := httptest.NewServer(mux)
	defer ts.Close()

	tmpDir := t.TempDir()
	outPath := filepath.Join(tmpDir, "result.mp4")

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"video", "generate", "--prompt", "test", "--model", "m", "-o", outPath})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("video generate -o failed: %v\nstderr: %s", err, stderr.String())
	}

	data, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatalf("read output file: %v", err)
	}
	if string(data) != "generated-video-data" {
		t.Fatalf("expected 'generated-video-data', got: %s", string(data))
	}

	output := stdout.String()
	if !strings.Contains(output, outPath) {
		t.Fatalf("expected output path in JSON, got: %s", output)
	}
	if strings.Contains(output, `"outputs"`) {
		t.Fatalf("expected flat output without nested outputs, got: %s", output)
	}
}

func TestVideoGenerateWithVideoParams(t *testing.T) {
	var receivedBody map[string]any

	mux := http.NewServeMux()
	mux.HandleFunc("POST /v1/video/generate", func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&receivedBody)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"id":"req_1","status":"success","data":{"id":"vid_1","status":"success","model":"m","outputs":[],"credit_cost":5}}`))
	})
	ts := httptest.NewServer(mux)
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
		"video", "generate",
		"--prompt", "ocean waves",
		"--model", "mock-video-1",
		"--param", "negative_prompt=blurry",
		"--param", "aspect_ratio=16:9",
		"--param", "resolution=1080p",
		"--param", "duration=5",
		"--param", `images=["https://example.com/ref.jpg"]`,
	})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("video generate with params failed: %v\nstderr: %s", err, stderr.String())
	}

	// Verify all params were sent in the request body.
	if receivedBody["negative_prompt"] != "blurry" {
		t.Fatalf("expected negative_prompt=blurry, got: %v", receivedBody["negative_prompt"])
	}
	if receivedBody["aspect_ratio"] != "16:9" {
		t.Fatalf("expected aspect_ratio=16:9, got: %v", receivedBody["aspect_ratio"])
	}
	if receivedBody["resolution"] != "1080p" {
		t.Fatalf("expected resolution=1080p, got: %v", receivedBody["resolution"])
	}
	dur, _ := receivedBody["duration"].(float64)
	if dur != 5 {
		t.Fatalf("expected duration=5, got: %v", receivedBody["duration"])
	}
	images, ok := receivedBody["images"].([]any)
	if !ok || len(images) != 1 || images[0] != "https://example.com/ref.jpg" {
		t.Fatalf("expected images=[https://example.com/ref.jpg], got: %v", receivedBody["images"])
	}
}

func TestVideoGenerateRequiresPrompt(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"video", "generate", "--model", "m"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when --prompt missing")
	}
}

func TestVideoGenerateRequiresModel(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"video", "generate", "--prompt", "test"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when --model missing")
	}
}

// --- Music CLI Tests ---

func TestMusicModels(t *testing.T) {
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
	cmd.SetArgs([]string{"music", "models"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("music models failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "mock-music-1") {
		t.Fatalf("expected mock-music-1 in output, got: %s", output)
	}
}

func TestMusicModelsSingleFilter(t *testing.T) {
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
	cmd.SetArgs([]string{"music", "models", "mock-music-1"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("music models single filter failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, "mock-music-1") {
		t.Fatalf("expected mock-music-1 in output, got: %s", output)
	}
}

func TestMusicModelsNotFound(t *testing.T) {
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
	cmd.SetArgs([]string{"music", "models", "nonexistent"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for nonexistent model")
	}
	if !strings.Contains(err.Error(), "not found") {
		t.Fatalf("expected 'not found' error, got: %v", err)
	}
}

func TestMusicModelSchema(t *testing.T) {
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
	cmd.SetArgs([]string{"music", "models", "mock-music-1", "schema"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("music model schema failed: %v", err)
	}

	output := stdout.String()
	if !strings.Contains(output, "make_instrumental") {
		t.Fatalf("expected make_instrumental in schema, got: %s", output)
	}
}

func TestMusicGenerate(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpDir := t.TempDir()
	origDir, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origDir)

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"music", "generate", "--prompt", "lofi night drive", "--model", "mock-music-1"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("music generate failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "success") {
		t.Fatalf("expected success in output, got: %s", output)
	}
	if !strings.Contains(output, "mock-music-1") {
		t.Fatalf("expected mock-music-1 in output, got: %s", output)
	}
}

func TestMusicGenerateWithTags(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpDir := t.TempDir()
	origDir, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origDir)

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"music", "generate", "--tags", "pop,upbeat", "--model", "mock-music-1"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("music generate with tags failed: %v\nstderr: %s", err, stderr.String())
	}

	output := stdout.String()
	if !strings.Contains(output, "success") {
		t.Fatalf("expected success in output, got: %s", output)
	}
}

func TestMusicGenerateRequiresPromptOrTags(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"music", "generate", "--model", "m"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when neither --prompt nor --tags provided")
	}
	if !strings.Contains(err.Error(), "prompt") && !strings.Contains(err.Error(), "tags") {
		t.Fatalf("expected prompt/tags error, got: %v", err)
	}
}

func TestMusicGenerateRequiresModel(t *testing.T) {
	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"music", "generate", "--prompt", "test"})

	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error when --model missing")
	}
}

func TestMusicGenerateAutoDownload(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpDir := t.TempDir()
	outBase := filepath.Join(tmpDir, "output.mp3")

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"music", "generate", "--prompt", "test beat", "--model", "mock-music-1", "-o", outBase})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("music generate auto-download failed: %v\nstderr: %s", err, stderr.String())
	}

	// Mock returns 2 outputs; with -o, they become output_1.mp3 and output_2.mp3.
	expected1 := filepath.Join(tmpDir, "output_1.mp3")
	expected2 := filepath.Join(tmpDir, "output_2.mp3")

	data1, err := os.ReadFile(expected1)
	if err != nil {
		t.Fatalf("expected downloaded file at %s: %v", expected1, err)
	}
	if string(data1) != "mock-audio-data" {
		t.Fatalf("expected mock-audio-data, got: %s", string(data1))
	}

	data2, err := os.ReadFile(expected2)
	if err != nil {
		t.Fatalf("expected downloaded file at %s: %v", expected2, err)
	}
	if string(data2) != "mock-audio-data" {
		t.Fatalf("expected mock-audio-data, got: %s", string(data2))
	}

	// Verify output JSON contains both paths.
	output := stdout.String()
	if !strings.Contains(output, expected1) {
		t.Fatalf("expected output_1 path in result, got: %s", output)
	}
	if !strings.Contains(output, expected2) {
		t.Fatalf("expected output_2 path in result, got: %s", output)
	}
}

func TestMusicGenerateMultiOutputDefaultNames(t *testing.T) {
	ms := mockserver.New()
	ts := httptest.NewServer(ms)
	defer ts.Close()

	tmpDir := t.TempDir()
	origDir, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origDir)

	stdout := &bytes.Buffer{}
	stderr := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  ts.URL,
		Stdout:    stdout,
		Stderr:    stderr,
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"music", "generate", "--prompt", "multi output", "--model", "mock-music-1"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("music generate multi-output failed: %v\nstderr: %s", err, stderr.String())
	}

	// Verify output has 2 entries in outputs array.
	output := stdout.String()
	var result map[string]any
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("failed to parse output JSON: %v\noutput: %s", err, output)
	}
	outputs, ok := result["outputs"].([]any)
	if !ok {
		t.Fatalf("expected outputs array in result, got: %s", output)
	}
	if len(outputs) != 2 {
		t.Fatalf("expected 2 outputs, got %d: %s", len(outputs), output)
	}

	// Both should have local_path set.
	for i, o := range outputs {
		entry, _ := o.(map[string]any)
		lp, _ := entry["local_path"].(string)
		if lp == "" {
			t.Fatalf("output[%d] missing local_path: %v", i, entry)
		}
	}
}

func TestMusicGenerateWithInstrumental(t *testing.T) {
	var receivedBody map[string]any

	mux := http.NewServeMux()
	mux.HandleFunc("POST /v1/music/generate", func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&receivedBody)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status": "success",
			"data": map[string]any{
				"id":          "mus_test",
				"status":      "success",
				"model":       "mock-music-1",
				"outputs":     []map[string]any{},
				"credit_cost": 2,
			},
		})
	})
	ts := httptest.NewServer(mux)
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
	cmd.SetArgs([]string{"music", "generate", "--prompt", "chill", "--model", "mock-music-1", "--instrumental"})

	if err := cmd.Execute(); err != nil {
		t.Fatalf("music generate with --instrumental failed: %v\nstderr: %s", err, stderr.String())
	}

	if receivedBody["make_instrumental"] != true {
		t.Fatalf("expected make_instrumental=true, got: %v", receivedBody["make_instrumental"])
	}
}
