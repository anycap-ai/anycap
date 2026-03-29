package command

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestDriveMkdirWithParentPath(t *testing.T) {
	var createCalled int32

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/drive/nodes":
			if r.URL.Query().Get("parent_id") != "" {
				t.Fatalf("unexpected parent_id query for root lookup: %s", r.URL.RawQuery)
			}
			writeSuccessEnvelope(t, w, map[string]any{
				"items": []map[string]any{
					{"id": "dn_test", "kind": "folder", "name": "test"},
				},
				"total": 1,
			})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/drive/folders":
			atomic.StoreInt32(&createCalled, 1)
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("decode create folder body: %v", err)
			}
			if body["name"] != "demo" {
				t.Fatalf("unexpected folder name: %+v", body)
			}
			if body["parent_id"] != "dn_test" {
				t.Fatalf("unexpected parent_id: %+v", body)
			}
			writeSuccessEnvelope(t, w, map[string]any{
				"id":   "dn_demo",
				"name": "demo",
				"kind": "folder",
			})
		default:
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.String())
		}
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"drive", "mkdir", "--parent-path", "/test", "--name", "demo"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute mkdir: %v", err)
	}
	if atomic.LoadInt32(&createCalled) != 1 {
		t.Fatalf("expected create folder endpoint to be called")
	}
	if !strings.Contains(stdout.String(), `"id":"dn_demo"`) {
		t.Fatalf("unexpected output: %s", stdout.String())
	}
}

func TestRootHelpIncludesDriveAndPage(t *testing.T) {
	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"--help"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute help: %v", err)
	}

	out := stdout.String()
	if !strings.Contains(out, "drive") || !strings.Contains(out, "page") {
		t.Fatalf("expected drive/page commands in help output, got: %s", out)
	}
}

func TestDriveUploadFlow(t *testing.T) {
	tmpDir := t.TempDir()
	filePath := filepath.Join(tmpDir, "hello.txt")
	fileContent := []byte("hello-upload")
	if err := os.WriteFile(filePath, fileContent, 0644); err != nil {
		t.Fatalf("write temp file: %v", err)
	}

	var uploaded bytes.Buffer
	var completeCalled int32

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/v1/drive/files/presign":
			writeSuccessEnvelope(t, w, map[string]any{
				"upload_session_id": "upl_77",
				"file_id":           "dn_file_88",
				"upload_url":        server.URL + "/mock-upload",
			})
		case r.Method == http.MethodPut && r.URL.Path == "/mock-upload":
			data, err := io.ReadAll(r.Body)
			if err != nil {
				t.Fatalf("read upload body: %v", err)
			}
			uploaded.Write(data)
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodPost && r.URL.Path == "/v1/drive/files/complete":
			atomic.StoreInt32(&completeCalled, 1)
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("decode complete body: %v", err)
			}
			if body["upload_session_id"] != "upl_77" || body["file_id"] != "dn_file_88" {
				t.Fatalf("unexpected complete payload: %+v", body)
			}
			writeSuccessEnvelope(t, w, map[string]any{
				"id":   "dn_file_88",
				"name": "hello.txt",
				"size": len(fileContent),
			})
		default:
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.String())
		}
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"drive", "upload", filePath, "--parent-path", "/"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute drive upload: %v", err)
	}

	if atomic.LoadInt32(&completeCalled) != 1 {
		t.Fatalf("expected complete endpoint to be called")
	}
	if uploaded.String() != string(fileContent) {
		t.Fatalf("uploaded content mismatch: %q", uploaded.String())
	}
	if !strings.Contains(stdout.String(), `"file_id":"dn_file_88"`) || !strings.Contains(stdout.String(), `"status":"success"`) {
		t.Fatalf("unexpected output: %s", stdout.String())
	}
}

func TestDriveShareParsesDayDuration(t *testing.T) {
	var seenSeconds int64

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut || r.URL.Path != "/v1/drive/nodes/dn_5/share" {
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.String())
		}
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Fatalf("decode share body: %v", err)
		}
		seenSeconds = int64(body["expires_in_seconds"].(float64))
		writeSuccessEnvelope(t, w, map[string]any{
			"node_id":      "dn_5",
			"token":        "abc",
			"url":          "https://drive.anycap.cloud/s/abc",
			"has_password": false,
			"status":       "active",
			"expires_at":   nil,
		})
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"drive", "share", "dn_5", "--expires", "7d"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute drive share: %v", err)
	}

	if seenSeconds != 7*24*60*60 {
		t.Fatalf("expected 604800 seconds, got %d", seenSeconds)
	}
	if !strings.Contains(stdout.String(), `"token":"abc"`) {
		t.Fatalf("unexpected output: %s", stdout.String())
	}
}

func TestPageDeployWithoutNameAndPublish(t *testing.T) {
	tmpDir := t.TempDir()
	if err := os.WriteFile(filepath.Join(tmpDir, "index.html"), []byte("<html></html>"), 0644); err != nil {
		t.Fatalf("write index: %v", err)
	}
	if err := os.MkdirAll(filepath.Join(tmpDir, "assets"), 0755); err != nil {
		t.Fatalf("mkdir assets: %v", err)
	}
	if err := os.WriteFile(filepath.Join(tmpDir, "assets", "app.js"), []byte("console.log('ok')"), 0644); err != nil {
		t.Fatalf("write app.js: %v", err)
	}

	var (
		presignCount  int32
		completeCount int32
		publishCount  int32
		createdName   string
	)

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/v1/pages":
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("decode create site body: %v", err)
			}
			createdName = body["name"].(string)
			writeSuccessEnvelope(t, w, map[string]any{
				"id":        "pg_7",
				"name":      createdName,
				"page_name": "site-abc1234",
				"page_url":  "https://page-site-abc1234.anycap.cloud",
			})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/pages/pg_7/versions":
			writeSuccessEnvelope(t, w, map[string]any{
				"id":         "pv_11",
				"version_no": 2,
				"status":     "draft",
			})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/pages/pg_7/versions/pv_11/files/presign":
			idx := atomic.AddInt32(&presignCount, 1)
			writeSuccessEnvelope(t, w, map[string]any{
				"upload_session_id": "upl_" + strconv.FormatInt(int64(idx), 10),
				"upload_url":        server.URL + "/upload/" + strconv.FormatInt(int64(idx), 10),
			})
		case r.Method == http.MethodPut && strings.HasPrefix(r.URL.Path, "/upload/"):
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodPost && r.URL.Path == "/v1/pages/pg_7/versions/pv_11/files/complete":
			atomic.AddInt32(&completeCount, 1)
			writeSuccessEnvelope(t, w, map[string]any{"id": "pv_11", "version_no": 2, "status": "draft"})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/pages/pg_7/versions/pv_11/finalize":
			writeSuccessEnvelope(t, w, map[string]any{"id": "pv_11", "version_no": 2, "status": "verified"})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/pages/pg_7/versions/pv_11/publish":
			atomic.AddInt32(&publishCount, 1)
			writeSuccessEnvelope(t, w, map[string]any{"id": "pv_11", "version_no": 2, "status": "published"})
		default:
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.String())
		}
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"page", "deploy", tmpDir, "--publish"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute page deploy: %v", err)
	}

	if !strings.HasPrefix(createdName, "site-") {
		t.Fatalf("expected generated site name, got: %s", createdName)
	}
	if atomic.LoadInt32(&presignCount) != 2 || atomic.LoadInt32(&completeCount) != 2 {
		t.Fatalf("expected 2 files presign/complete, got presign=%d complete=%d", presignCount, completeCount)
	}
	if atomic.LoadInt32(&publishCount) != 1 {
		t.Fatalf("expected publish call after deploy")
	}
	out := stdout.String()
	if !strings.Contains(out, `"published":true`) || !strings.Contains(out, `"version":2`) {
		t.Fatalf("unexpected output: %s", out)
	}
	if !strings.Contains(out, `"page_url":"https://page-site-abc1234.anycap.cloud"`) {
		t.Fatalf("unexpected page_url in output: %s", out)
	}
}

func TestPageRollbackAutoPublishWhenCurrentPublished(t *testing.T) {
	var publishCalls int32

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/pages/pg_9":
			writeSuccessEnvelope(t, w, map[string]any{
				"id":                 "pg_9",
				"name":               "docs",
				"page_name":          "docs-live",
				"page_url":           "https://page-docs-live.anycap.cloud",
				"current_version_id": "pv_3",
			})
		case r.Method == http.MethodGet && r.URL.Path == "/v1/pages/pg_9/versions":
			writeSuccessEnvelope(t, w, map[string]any{
				"items": []map[string]any{
					{"id": "pv_101", "version_no": 1, "status": "archived"},
					{"id": "pv_102", "version_no": 2, "status": "published"},
				},
			})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/pages/pg_9/versions/pv_101/rollback-clone":
			writeSuccessEnvelope(t, w, map[string]any{
				"id":         "pv_202",
				"version_no": 3,
				"status":     "verified",
			})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/pages/pg_9/versions/pv_202/publish":
			atomic.AddInt32(&publishCalls, 1)
			writeSuccessEnvelope(t, w, map[string]any{
				"id":         "pv_202",
				"version_no": 3,
				"status":     "published",
			})
		default:
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.String())
		}
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  server.URL,
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"page", "rollback", "pg_9", "--version", "1"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute page rollback: %v", err)
	}

	if atomic.LoadInt32(&publishCalls) != 1 {
		t.Fatalf("expected rollback to auto publish when site has current published version")
	}
	out := stdout.String()
	if !strings.Contains(out, `"published":true`) || !strings.Contains(out, `"new_version":3`) {
		t.Fatalf("unexpected output: %s", out)
	}
}

func writeSuccessEnvelope(t *testing.T, w http.ResponseWriter, data any) {
	t.Helper()
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]any{
		"status": "success",
		"data":   data,
	}); err != nil {
		t.Fatalf("write envelope: %v", err)
	}
}
