package command

import (
	"bytes"
	"fmt"
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
