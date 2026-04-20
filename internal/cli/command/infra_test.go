package command

import (
	"archive/tar"
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
	"time"

	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestDriveMkdirWithParentPath(t *testing.T) {
	var createCalled int32

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/drive/resolve-path":
			if r.URL.Query().Get("path") != "/test" {
				t.Fatalf("unexpected resolve-path query: %s", r.URL.RawQuery)
			}
			writeSuccessEnvelope(t, w, map[string]any{
				"id":   "dn_test",
				"kind": "folder",
				"name": "test",
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
	if !strings.Contains(out, "drive") || !strings.Contains(out, "page") || !strings.Contains(out, "snapshot") {
		t.Fatalf("expected drive/page/snapshot commands in help output, got: %s", out)
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

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

func TestSnapshotCreateBlocksSensitiveFiles(t *testing.T) {
	tmpDir := t.TempDir()
	if err := os.WriteFile(filepath.Join(tmpDir, ".env"), []byte("TOKEN=secret"), 0644); err != nil {
		t.Fatalf("write .env: %v", err)
	}
	if err := os.WriteFile(filepath.Join(tmpDir, "README.md"), []byte("hello"), 0644); err != nil {
		t.Fatalf("write README: %v", err)
	}

	origDir, _ := os.Getwd()
	if err := os.Chdir(tmpDir); err != nil {
		t.Fatalf("chdir: %v", err)
	}
	defer os.Chdir(origDir)

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"snapshot", "create", "--target", "."})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute snapshot create: %v", err)
	}

	out := stdout.String()
	if !strings.Contains(out, `"status":"blocked"`) || !strings.Contains(out, `.env`) {
		t.Fatalf("unexpected output: %s", out)
	}
}

func TestSnapshotCreateFlow(t *testing.T) {
	tmpDir := t.TempDir()
	if err := os.MkdirAll(filepath.Join(tmpDir, "app"), 0755); err != nil {
		t.Fatalf("mkdir app: %v", err)
	}
	if err := os.MkdirAll(filepath.Join(tmpDir, "app", "node_modules", "left-pad"), 0755); err != nil {
		t.Fatalf("mkdir node_modules: %v", err)
	}
	if err := os.WriteFile(filepath.Join(tmpDir, "README.md"), []byte("hello"), 0644); err != nil {
		t.Fatalf("write README: %v", err)
	}
	if err := os.WriteFile(filepath.Join(tmpDir, "app", "main.go"), []byte("package main\n"), 0644); err != nil {
		t.Fatalf("write main.go: %v", err)
	}
	if err := os.WriteFile(filepath.Join(tmpDir, "app", "node_modules", "left-pad", "index.js"), []byte("module.exports = 1;"), 0644); err != nil {
		t.Fatalf("write index.js: %v", err)
	}

	origDir, _ := os.Getwd()
	if err := os.Chdir(tmpDir); err != nil {
		t.Fatalf("chdir: %v", err)
	}
	defer os.Chdir(origDir)

	var (
		rootLookupCount   int32
		childLookupCount  int32
		folderCreateCount int32
		uploaded          bytes.Buffer
		sharePassword     string
		shareExpires      int64
	)

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/drive/resolve-path" && r.URL.Query().Get("path") == "/_snapshots":
			atomic.AddInt32(&rootLookupCount, 1)
			writeErrorEnvelope(t, w, http.StatusNotFound, "not_found", "drive path not found: /_snapshots")
		case r.Method == http.MethodGet && r.URL.Path == "/v1/drive/resolve-path" && r.URL.Query().Get("path") == "/_snapshots/repo.snapshot.tar":
			atomic.AddInt32(&childLookupCount, 1)
			writeErrorEnvelope(t, w, http.StatusNotFound, "not_found", "drive path not found: /_snapshots/repo.snapshot.tar")
		case r.Method == http.MethodPost && r.URL.Path == "/v1/drive/folders":
			atomic.AddInt32(&folderCreateCount, 1)
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("decode create folder body: %v", err)
			}
			if body["name"] != "_snapshots" {
				t.Fatalf("unexpected folder payload: %+v", body)
			}
			writeSuccessEnvelope(t, w, map[string]any{"id": "dn_snapshots", "kind": "folder", "name": "_snapshots"})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/drive/files/presign":
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("decode presign body: %v", err)
			}
			if body["name"] != "repo.snapshot.tar" || body["parent_id"] != "dn_snapshots" {
				t.Fatalf("unexpected presign payload: %+v", body)
			}
			writeSuccessEnvelope(t, w, map[string]any{
				"upload_session_id": "upl_snapshot",
				"file_id":           "dn_snapshot_file",
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
			writeSuccessEnvelope(t, w, map[string]any{
				"id":   "dn_snapshot_file",
				"name": "repo.snapshot.tar",
				"size": uploaded.Len(),
			})
		case r.Method == http.MethodPut && r.URL.Path == "/v1/drive/nodes/dn_snapshot_file/share":
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("decode share body: %v", err)
			}
			sharePassword = body["password"].(string)
			shareExpires = int64(body["expires_in_seconds"].(float64))
			writeSuccessEnvelope(t, w, map[string]any{
				"url":        "https://drive.anycap.cloud/s/share-token",
				"expires_at": "2026-04-27T12:00:00Z",
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
	cmd.SetArgs([]string{"snapshot", "create", "--target", "app", "--target", "app/main.go", "--target", "README.md", "--name", "repo"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute snapshot create: %v", err)
	}

	if atomic.LoadInt32(&rootLookupCount) != 1 {
		t.Fatalf("expected 1 root lookup, got %d", rootLookupCount)
	}
	if atomic.LoadInt32(&childLookupCount) != 1 {
		t.Fatalf("expected 1 child lookup, got %d", childLookupCount)
	}
	if atomic.LoadInt32(&folderCreateCount) != 1 {
		t.Fatalf("expected 1 folder creation, got %d", folderCreateCount)
	}
	if shareExpires != 7*24*60*60 {
		t.Fatalf("expected default expires 7d, got %d", shareExpires)
	}
	if sharePassword == "" {
		t.Fatal("expected generated share password")
	}

	entries := readTarEntryNames(t, uploaded.Bytes())
	if !containsString(entries, ".anycap-snapshot/manifest.json") {
		t.Fatalf("manifest missing from archive: %v", entries)
	}
	if !containsString(entries, "app/") || !containsString(entries, "app/main.go") || !containsString(entries, "README.md") {
		t.Fatalf("expected main archive entries, got %v", entries)
	}
	if containsString(entries, "app/node_modules/") || containsString(entries, "app/node_modules/left-pad/index.js") {
		t.Fatalf("technical exclusions should not be archived: %v", entries)
	}

	out := stdout.String()
	if !strings.Contains(out, `"status":"success"`) || !strings.Contains(out, `#password=`) {
		t.Fatalf("unexpected output: %s", out)
	}
	if !strings.Contains(out, `"snapshot_name":"repo"`) || !strings.Contains(out, `"archive_name":"repo.snapshot.tar"`) {
		t.Fatalf("expected snapshot metadata in output: %s", out)
	}
	if !strings.Contains(out, `already covered by directory target`) {
		t.Fatalf("expected dedupe warning in output: %s", out)
	}
}

func TestSnapshotCreateRejectsExistingNameWithoutOverwrite(t *testing.T) {
	tmpDir := t.TempDir()
	if err := os.WriteFile(filepath.Join(tmpDir, "README.md"), []byte("hello"), 0644); err != nil {
		t.Fatalf("write README: %v", err)
	}

	origDir, _ := os.Getwd()
	if err := os.Chdir(tmpDir); err != nil {
		t.Fatalf("chdir: %v", err)
	}
	defer os.Chdir(origDir)

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/drive/resolve-path" && r.URL.Query().Get("path") == "/_snapshots":
			writeSuccessEnvelope(t, w, map[string]any{
				"id":   "dn_snapshots",
				"kind": "folder",
				"name": "_snapshots",
			})
		case r.Method == http.MethodGet && r.URL.Path == "/v1/drive/resolve-path" && r.URL.Query().Get("path") == "/_snapshots/repo.snapshot.tar":
			writeSuccessEnvelope(t, w, map[string]any{
				"id":   "dn_existing",
				"kind": "file",
				"name": "repo.snapshot.tar",
			})
		default:
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.String())
		}
	}))
	defer server.Close()

	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Endpoint:  server.URL,
		Stdout:    &bytes.Buffer{},
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"snapshot", "create", "--target", "README.md", "--name", "repo"})
	err := cmd.Execute()
	if err == nil || !strings.Contains(err.Error(), `snapshot "repo" already exists; use --overwrite to replace it`) {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestSnapshotCreateOverwriteFlow(t *testing.T) {
	tmpDir := t.TempDir()
	if err := os.WriteFile(filepath.Join(tmpDir, "README.md"), []byte("hello"), 0644); err != nil {
		t.Fatalf("write README: %v", err)
	}

	origDir, _ := os.Getwd()
	if err := os.Chdir(tmpDir); err != nil {
		t.Fatalf("chdir: %v", err)
	}
	defer os.Chdir(origDir)

	var (
		uploadedName string
		renameCalled bool
		deleteCalled bool
	)

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/drive/resolve-path" && r.URL.Query().Get("path") == "/_snapshots":
			writeSuccessEnvelope(t, w, map[string]any{
				"id":   "dn_snapshots",
				"kind": "folder",
				"name": "_snapshots",
			})
		case r.Method == http.MethodGet && r.URL.Path == "/v1/drive/resolve-path" && r.URL.Query().Get("path") == "/_snapshots/repo.snapshot.tar":
			writeSuccessEnvelope(t, w, map[string]any{
				"id":   "dn_existing",
				"kind": "file",
				"name": "repo.snapshot.tar",
			})
		case r.Method == http.MethodPost && r.URL.Path == "/v1/drive/files/presign":
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("decode presign body: %v", err)
			}
			gotName, _ := body["name"].(string)
			uploadedName = gotName
			if !strings.HasPrefix(gotName, "repo.uploading-") || !strings.HasSuffix(gotName, ".snapshot.tar") {
				t.Fatalf("unexpected temp upload name: %q", gotName)
			}
			writeSuccessEnvelope(t, w, map[string]any{
				"upload_session_id": "upl_snapshot",
				"file_id":           "dn_snapshot_file",
				"upload_url":        server.URL + "/mock-upload",
			})
		case r.Method == http.MethodPut && r.URL.Path == "/mock-upload":
			w.WriteHeader(http.StatusOK)
		case r.Method == http.MethodPost && r.URL.Path == "/v1/drive/files/complete":
			writeSuccessEnvelope(t, w, map[string]any{
				"id":   "dn_snapshot_file",
				"name": uploadedName,
				"size": 5,
			})
		case r.Method == http.MethodDelete && r.URL.Path == "/v1/drive/nodes/dn_existing":
			deleteCalled = true
			writeSuccessEnvelope(t, w, map[string]any{"deleted": true})
		case r.Method == http.MethodPatch && r.URL.Path == "/v1/drive/nodes/dn_snapshot_file":
			renameCalled = true
			var body map[string]any
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				t.Fatalf("decode patch body: %v", err)
			}
			if body["name"] != "repo.snapshot.tar" {
				t.Fatalf("unexpected rename payload: %+v", body)
			}
			writeSuccessEnvelope(t, w, map[string]any{
				"id":   "dn_snapshot_file",
				"name": "repo.snapshot.tar",
				"kind": "file",
			})
		case r.Method == http.MethodPut && r.URL.Path == "/v1/drive/nodes/dn_snapshot_file/share":
			writeSuccessEnvelope(t, w, map[string]any{
				"url":        "https://drive.anycap.cloud/s/share-token",
				"expires_at": "2026-04-27T12:00:00Z",
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
	cmd.SetArgs([]string{"snapshot", "create", "--target", "README.md", "--name", "repo", "--overwrite"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute snapshot overwrite: %v", err)
	}

	if !deleteCalled {
		t.Fatal("expected existing snapshot to be deleted during overwrite")
	}
	if !renameCalled {
		t.Fatal("expected uploaded temp snapshot to be renamed during overwrite")
	}
	if !strings.Contains(stdout.String(), `"archive_name":"repo.snapshot.tar"`) {
		t.Fatalf("unexpected output: %s", stdout.String())
	}
}

func TestSnapshotRestoreFlow(t *testing.T) {
	tmpDir := t.TempDir()
	restoreDir := filepath.Join(tmpDir, "restored")
	archive := buildSnapshotArchive(t, map[string]string{
		".anycap-snapshot/manifest.json": `{
  "format_version": "1",
  "created_at": "2026-04-20T12:00:00Z",
  "expires_at": "2026-04-27T12:00:00Z",
  "target_count": 1,
  "entries": [
    {"original_target":"README.md","archive_path":"README.md","kind":"file","size":5,"checksum":"abc"},
    {"original_target":"app","archive_path":"app","kind":"directory"},
    {"original_target":"app/main.go","archive_path":"app/main.go","kind":"file","size":12,"checksum":"def"}
  ],
  "handoff_present": false
}`,
		"README.md":   "hello",
		"app/main.go": "package main",
	}, []string{"app"})

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet || r.URL.Path != "/s/token" || r.URL.Query().Get("raw") != "1" {
			t.Fatalf("unexpected request: %s %s", r.Method, r.URL.String())
		}
		if got := r.Header.Get("X-Anycap-Share-Password"); got != "restore-secret" {
			t.Fatalf("unexpected password header: %q", got)
		}
		w.Header().Set("Content-Type", "application/x-tar")
		_, _ = w.Write(archive)
	}))
	defer server.Close()

	stdout := &bytes.Buffer{}
	cmd := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "test"},
		Stdout:    stdout,
		Stderr:    &bytes.Buffer{},
		Stdin:     strings.NewReader(""),
	})
	cmd.SetArgs([]string{"snapshot", "restore", server.URL + "/s/token#password=restore-secret", "--target", restoreDir})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("execute snapshot restore: %v", err)
	}

	readme, err := os.ReadFile(filepath.Join(restoreDir, "README.md"))
	if err != nil {
		t.Fatalf("read restored README: %v", err)
	}
	if string(readme) != "hello" {
		t.Fatalf("unexpected README contents: %q", string(readme))
	}
	mainGo, err := os.ReadFile(filepath.Join(restoreDir, "app", "main.go"))
	if err != nil {
		t.Fatalf("read restored main.go: %v", err)
	}
	if string(mainGo) != "package main" {
		t.Fatalf("unexpected main.go contents: %q", string(mainGo))
	}
	if !strings.Contains(stdout.String(), `"status":"success"`) {
		t.Fatalf("unexpected output: %s", stdout.String())
	}
}

func TestPageDeployWithoutNameAndPublish(t *testing.T) {
	tmpDir := t.TempDir()

	// Change CWD to tmpDir so projectconfig reads/writes are isolated
	origDir, _ := os.Getwd()
	os.Chdir(tmpDir)
	defer os.Chdir(origDir)

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

	if len(createdName) != 6 {
		t.Fatalf("expected 6-char random site name, got: %s", createdName)
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
		case r.Method == http.MethodGet && r.URL.Path == "/v1/pages/pg_9/versions/by-number/1":
			writeSuccessEnvelope(t, w, map[string]any{
				"id": "pv_101", "version_no": 1, "status": "archived",
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

func readTarEntryNames(t *testing.T, archive []byte) []string {
	t.Helper()

	reader := tar.NewReader(bytes.NewReader(archive))
	names := make([]string, 0)
	for {
		header, err := reader.Next()
		if err == io.EOF {
			return names
		}
		if err != nil {
			t.Fatalf("read tar entry: %v", err)
		}
		names = append(names, header.Name)
	}
}

func containsString(items []string, target string) bool {
	for _, item := range items {
		if item == target {
			return true
		}
	}
	return false
}

func buildSnapshotArchive(t *testing.T, files map[string]string, directories []string) []byte {
	t.Helper()

	var buffer bytes.Buffer
	writer := tar.NewWriter(&buffer)

	for _, name := range directories {
		header := &tar.Header{
			Name:     name + "/",
			Typeflag: tar.TypeDir,
			Mode:     0755,
			ModTime:  time.Unix(0, 0).UTC(),
		}
		if err := writer.WriteHeader(header); err != nil {
			t.Fatalf("write tar dir header: %v", err)
		}
	}

	for name, contents := range files {
		header := &tar.Header{
			Name:     name,
			Typeflag: tar.TypeReg,
			Mode:     0644,
			Size:     int64(len(contents)),
			ModTime:  time.Unix(0, 0).UTC(),
		}
		if err := writer.WriteHeader(header); err != nil {
			t.Fatalf("write tar file header: %v", err)
		}
		if _, err := writer.Write([]byte(contents)); err != nil {
			t.Fatalf("write tar file body: %v", err)
		}
	}

	if err := writer.Close(); err != nil {
		t.Fatalf("close tar writer: %v", err)
	}
	return buffer.Bytes()
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

func writeErrorEnvelope(t *testing.T, w http.ResponseWriter, statusCode int, code string, message string) {
	t.Helper()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(map[string]any{
		"error": map[string]any{
			"code":    code,
			"message": message,
		},
	}); err != nil {
		t.Fatalf("write error envelope: %v", err)
	}
}
