package cap

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

// newSchemaJSON builds a schema endpoint response with the given model_params.
func newSchemaJSON(modelParams map[string]any) []byte {
	resp := map[string]any{
		"status":     "success",
		"capability": "image",
		"model":      "test-model",
		"schemas": []map[string]any{
			{
				"operation": "generate",
				"mode":      "image-to-image",
				"schema": map[string]any{
					"model_params": modelParams,
				},
			},
		},
	}
	data, _ := json.Marshal(resp)
	return data
}

func TestResolveFileParams_UploadsSingleFile(t *testing.T) {
	// Create a temp file to "upload".
	tmpDir := t.TempDir()
	testFile := filepath.Join(tmpDir, "photo.png")
	if err := os.WriteFile(testFile, []byte("fake-png-data"), 0644); err != nil {
		t.Fatal(err)
	}

	schemaBody := newSchemaJSON(map[string]any{
		"reference_image": map[string]any{
			"type":   "string",
			"format": "file-or-url",
		},
		"prompt": map[string]any{
			"type": "string",
		},
	})

	uploadCalled := false
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/image/models/test-model/schema":
			w.Header().Set("Content-Type", "application/json")
			w.Write(schemaBody)

		case r.URL.Path == "/v1/capabilities/presign":
			uploadCalled = true
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"data": map[string]any{
					"upload_url": "", // empty = reused
					"object_url": "https://storage.example.com/uploaded-photo.png",
					"reused":     true,
				},
			})

		default:
			http.NotFound(w, r)
		}
	}))
	defer srv.Close()

	client := httpclient.New(srv.URL)
	body := map[string]any{
		"prompt":          "a cool photo",
		"model":           "test-model",
		"reference_image": testFile,
	}

	err := resolveFileParams(context.Background(), client, "image", "test-model", "image-to-image", body, nil)
	if err != nil {
		t.Fatalf("resolveFileParams: %v", err)
	}

	if !uploadCalled {
		t.Fatal("expected presign to be called for local file")
	}

	got, ok := body["reference_image"].(string)
	if !ok {
		t.Fatalf("expected string, got %T", body["reference_image"])
	}
	if got != "https://storage.example.com/uploaded-photo.png" {
		t.Fatalf("expected uploaded URL, got %q", got)
	}

	// Prompt should remain unchanged.
	if body["prompt"] != "a cool photo" {
		t.Fatalf("prompt should not be modified")
	}
}

func TestResolveFileParams_UploadsArrayField(t *testing.T) {
	tmpDir := t.TempDir()
	file1 := filepath.Join(tmpDir, "img1.png")
	file2 := filepath.Join(tmpDir, "img2.png")
	os.WriteFile(file1, []byte("data1"), 0644)
	os.WriteFile(file2, []byte("data2"), 0644)

	schemaBody := newSchemaJSON(map[string]any{
		"images": map[string]any{
			"type": "array",
			"items": map[string]any{
				"type":   "string",
				"format": "file-or-url",
			},
		},
	})

	uploadCount := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/image/models/test-model/schema":
			w.Header().Set("Content-Type", "application/json")
			w.Write(schemaBody)

		case r.URL.Path == "/v1/capabilities/presign":
			uploadCount++
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"data": map[string]any{
					"upload_url": "",
					"object_url": "https://storage.example.com/uploaded.png",
					"reused":     true,
				},
			})

		default:
			http.NotFound(w, r)
		}
	}))
	defer srv.Close()

	client := httpclient.New(srv.URL)
	body := map[string]any{
		"images": []any{file1, file2},
	}

	err := resolveFileParams(context.Background(), client, "image", "test-model", "", body, nil)
	if err != nil {
		t.Fatalf("resolveFileParams: %v", err)
	}

	if uploadCount != 2 {
		t.Fatalf("expected 2 uploads, got %d", uploadCount)
	}

	arr, ok := body["images"].([]any)
	if !ok {
		t.Fatalf("expected []any, got %T", body["images"])
	}
	if len(arr) != 2 {
		t.Fatalf("expected 2 elements, got %d", len(arr))
	}
	for i, v := range arr {
		s, ok := v.(string)
		if !ok || s != "https://storage.example.com/uploaded.png" {
			t.Fatalf("element %d: expected uploaded URL, got %v", i, v)
		}
	}
}

func TestResolveFileParams_SinglePathWrappedToArray(t *testing.T) {
	tmpDir := t.TempDir()
	testFile := filepath.Join(tmpDir, "photo.png")
	os.WriteFile(testFile, []byte("data"), 0644)

	schemaBody := newSchemaJSON(map[string]any{
		"images": map[string]any{
			"type": "array",
			"items": map[string]any{
				"type":   "string",
				"format": "file-or-url",
			},
		},
	})

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/image/models/test-model/schema":
			w.Header().Set("Content-Type", "application/json")
			w.Write(schemaBody)
		case r.URL.Path == "/v1/capabilities/presign":
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"data": map[string]any{
					"object_url": "https://storage.example.com/uploaded.png",
					"reused":     true,
				},
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer srv.Close()

	client := httpclient.New(srv.URL)

	// Pass a single string for an array field -> should be wrapped.
	body := map[string]any{
		"images": testFile,
	}

	err := resolveFileParams(context.Background(), client, "image", "test-model", "", body, nil)
	if err != nil {
		t.Fatalf("resolveFileParams: %v", err)
	}

	arr, ok := body["images"].([]any)
	if !ok {
		t.Fatalf("expected []any, got %T", body["images"])
	}
	if len(arr) != 1 {
		t.Fatalf("expected 1 element, got %d", len(arr))
	}
	if arr[0] != "https://storage.example.com/uploaded.png" {
		t.Fatalf("expected uploaded URL, got %v", arr[0])
	}
}

func TestResolveFileParams_URLsPassedThrough(t *testing.T) {
	schemaBody := newSchemaJSON(map[string]any{
		"reference_image": map[string]any{
			"type":   "string",
			"format": "file-or-url",
		},
	})

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/v1/image/models/test-model/schema" {
			w.Header().Set("Content-Type", "application/json")
			w.Write(schemaBody)
			return
		}
		// presign should NOT be called
		t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
		http.NotFound(w, r)
	}))
	defer srv.Close()

	client := httpclient.New(srv.URL)
	body := map[string]any{
		"reference_image": "https://example.com/photo.jpg",
	}

	err := resolveFileParams(context.Background(), client, "image", "test-model", "", body, nil)
	if err != nil {
		t.Fatalf("resolveFileParams: %v", err)
	}

	if body["reference_image"] != "https://example.com/photo.jpg" {
		t.Fatalf("URL should pass through unchanged, got %v", body["reference_image"])
	}
}

func TestResolveFileParams_SchemaFetchFails_NonFatal(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error":{"code":"INTERNAL","message":"boom"}}`))
	}))
	defer srv.Close()

	client := httpclient.New(srv.URL)
	body := map[string]any{
		"prompt": "test",
		"images": "/some/path.png",
	}

	var logBuf bytes.Buffer
	err := resolveFileParams(context.Background(), client, "image", "test-model", "", body, &logBuf)
	if err != nil {
		t.Fatalf("schema failure should be non-fatal, got: %v", err)
	}

	// Body should remain unchanged.
	if body["images"] != "/some/path.png" {
		t.Fatalf("body should not be modified on schema failure")
	}
}

func TestResolveFileParams_NoFileFieldsInSchema(t *testing.T) {
	schemaBody := newSchemaJSON(map[string]any{
		"prompt": map[string]any{
			"type": "string",
		},
		"ratio": map[string]any{
			"type": "string",
		},
	})

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/v1/image/models/test-model/schema" {
			w.Header().Set("Content-Type", "application/json")
			w.Write(schemaBody)
			return
		}
		t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
	}))
	defer srv.Close()

	client := httpclient.New(srv.URL)
	body := map[string]any{
		"prompt": "test",
	}

	err := resolveFileParams(context.Background(), client, "image", "test-model", "", body, nil)
	if err != nil {
		t.Fatalf("no file fields should be a no-op, got: %v", err)
	}
}

func TestResolveFileParams_NonexistentFilePath(t *testing.T) {
	schemaBody := newSchemaJSON(map[string]any{
		"reference_image": map[string]any{
			"type":   "string",
			"format": "file-or-url",
		},
	})

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/v1/image/models/test-model/schema" {
			w.Header().Set("Content-Type", "application/json")
			w.Write(schemaBody)
			return
		}
		t.Errorf("unexpected request to presign for nonexistent path")
	}))
	defer srv.Close()

	client := httpclient.New(srv.URL)
	body := map[string]any{
		"reference_image": "/nonexistent/path/image.png",
	}

	err := resolveFileParams(context.Background(), client, "image", "test-model", "", body, nil)
	if err == nil {
		t.Fatal("expected error for nonexistent file path, got nil")
	}
	if !strings.Contains(err.Error(), "file not found") {
		t.Fatalf("expected 'file not found' error, got: %v", err)
	}
}

func TestResolveFileParams_MixedArrayURLsAndPaths(t *testing.T) {
	tmpDir := t.TempDir()
	localFile := filepath.Join(tmpDir, "local.png")
	os.WriteFile(localFile, []byte("data"), 0644)

	schemaBody := newSchemaJSON(map[string]any{
		"images": map[string]any{
			"type": "array",
			"items": map[string]any{
				"type":   "string",
				"format": "file-or-url",
			},
		},
	})

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/image/models/test-model/schema":
			w.Header().Set("Content-Type", "application/json")
			w.Write(schemaBody)
		case r.URL.Path == "/v1/capabilities/presign":
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"data": map[string]any{
					"object_url": "https://storage.example.com/uploaded.png",
					"reused":     true,
				},
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer srv.Close()

	client := httpclient.New(srv.URL)
	body := map[string]any{
		"images": []any{
			"https://example.com/remote.jpg",
			localFile,
		},
	}

	err := resolveFileParams(context.Background(), client, "image", "test-model", "", body, nil)
	if err != nil {
		t.Fatalf("resolveFileParams: %v", err)
	}

	arr := body["images"].([]any)
	if arr[0] != "https://example.com/remote.jpg" {
		t.Fatalf("remote URL should pass through, got %v", arr[0])
	}
	if arr[1] != "https://storage.example.com/uploaded.png" {
		t.Fatalf("local file should be uploaded, got %v", arr[1])
	}
}

func TestResolveFileParams_Verbose(t *testing.T) {
	tmpDir := t.TempDir()
	testFile := filepath.Join(tmpDir, "photo.png")
	os.WriteFile(testFile, []byte("data"), 0644)

	schemaBody := newSchemaJSON(map[string]any{
		"ref": map[string]any{
			"type":   "string",
			"format": "file-or-url",
		},
	})

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.URL.Path == "/v1/image/models/test-model/schema":
			w.Header().Set("Content-Type", "application/json")
			w.Write(schemaBody)
		case r.URL.Path == "/v1/capabilities/presign":
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{
				"data": map[string]any{
					"object_url": "https://storage.example.com/uploaded.png",
					"reused":     true,
				},
			})
		}
	}))
	defer srv.Close()

	client := httpclient.New(srv.URL)
	body := map[string]any{"ref": testFile}

	var logBuf bytes.Buffer
	err := resolveFileParams(context.Background(), client, "image", "test-model", "", body, &logBuf)
	if err != nil {
		t.Fatalf("resolveFileParams: %v", err)
	}

	logOutput := logBuf.String()
	if logOutput == "" {
		t.Fatal("expected verbose output")
	}
	// Should mention schema discovery and file upload.
	for _, want := range []string{"[param-resolve]", "schema field", "uploading local file"} {
		if !contains(logOutput, want) {
			t.Errorf("verbose log missing %q, got: %s", want, logOutput)
		}
	}
}

func TestExtractSchemaField(t *testing.T) {
	tests := []struct {
		name    string
		def     map[string]any
		wantOK  bool
		wantArr bool
	}{
		{
			name:    "string file-or-url",
			def:     map[string]any{"type": "string", "format": "file-or-url"},
			wantOK:  true,
			wantArr: false,
		},
		{
			name:    "array file-or-url",
			def:     map[string]any{"type": "array", "items": map[string]any{"type": "string", "format": "file-or-url"}},
			wantOK:  true,
			wantArr: true,
		},
		{
			name:   "plain string",
			def:    map[string]any{"type": "string"},
			wantOK: false,
		},
		{
			name:   "string wrong format",
			def:    map[string]any{"type": "string", "format": "date"},
			wantOK: false,
		},
		{
			name:    "array without file-or-url items",
			def:     map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
			wantOK:  true,
			wantArr: true,
		},
		{
			name:   "number type",
			def:    map[string]any{"type": "number"},
			wantOK: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ff, ok := extractSchemaField(tt.def)
			if ok != tt.wantOK {
				t.Fatalf("extractSchemaField ok=%t, want %t", ok, tt.wantOK)
			}
			if ok && ff.isArray != tt.wantArr {
				t.Fatalf("isArray=%t, want %t", ff.isArray, tt.wantArr)
			}
		})
	}
}

func TestIsURL(t *testing.T) {
	tests := []struct {
		input string
		want  bool
	}{
		{"https://example.com/photo.jpg", true},
		{"http://localhost/img.png", true},
		{"/tmp/photo.png", false},
		{"photo.png", false},
		{"./relative/path.jpg", false},
		{"", false},
	}
	for _, tt := range tests {
		if got := isURL(tt.input); got != tt.want {
			t.Errorf("isURL(%q) = %t, want %t", tt.input, got, tt.want)
		}
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && searchSubstring(s, substr)
}

func searchSubstring(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}

// Ensure io.Writer is used (avoid unused import in some Go versions).
var _ io.Writer = (*bytes.Buffer)(nil)
