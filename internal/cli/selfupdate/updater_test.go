package selfupdate

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"crypto/sha256"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"testing"
	"time"
)

// fakeRelease builds a tar.gz asset containing a fake binary and a
// checksums.txt file, keyed by filename. The archive name matches the
// current OS/arch so FindAsset() finds it.
func fakeRelease(t *testing.T, version string) map[string][]byte {
	t.Helper()

	binaryContent := []byte("#!/bin/sh\necho fake-anycap-" + version)
	archiveName := fmt.Sprintf("anycap_%s_%s_%s.tar.gz", version, runtime.GOOS, runtime.GOARCH)

	// Build tar.gz archive containing the binary.
	var archiveBuf bytes.Buffer
	gw := gzip.NewWriter(&archiveBuf)
	tw := tar.NewWriter(gw)
	if err := tw.WriteHeader(&tar.Header{
		Name: "anycap",
		Mode: 0755,
		Size: int64(len(binaryContent)),
	}); err != nil {
		t.Fatal(err)
	}
	if _, err := tw.Write(binaryContent); err != nil {
		t.Fatal(err)
	}
	tw.Close()
	gw.Close()
	archiveData := archiveBuf.Bytes()

	// Build checksums.txt.
	hash := sha256.Sum256(archiveData)
	checksumLine := fmt.Sprintf("%x  %s\n", hash, archiveName)

	return map[string][]byte{
		archiveName:     archiveData,
		"checksums.txt": []byte(checksumLine),
	}
}

// newRedirectServer creates a test server that returns a 302 redirect for
// /releases/latest and serves asset files from the assets map.
func newRedirectServer(t *testing.T, tag string, assets map[string][]byte) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		latestPath := fmt.Sprintf("/%s/%s/releases/latest", GitHubOwner, GitHubRepo)
		if r.URL.Path == latestPath {
			tagURL := fmt.Sprintf("http://%s/%s/%s/releases/tag/%s",
				r.Host, GitHubOwner, GitHubRepo, tag)
			http.Redirect(w, r, tagURL, http.StatusFound)
			return
		}
		// Serve asset downloads by filename.
		name := filepath.Base(r.URL.Path)
		if data, ok := assets[name]; ok {
			w.Write(data)
			return
		}
		http.NotFound(w, r)
	}))
}

func TestCheckLatest(t *testing.T) {
	srv := newRedirectServer(t, "v1.2.3", nil)
	defer srv.Close()

	u := &Updater{
		GitHubBase: srv.URL,
		ConfigDir:  t.TempDir(),
	}

	rel, err := u.CheckLatest(context.Background())
	if err != nil {
		t.Fatalf("CheckLatest: %v", err)
	}
	if rel.Version != "1.2.3" {
		t.Errorf("expected version 1.2.3, got %s", rel.Version)
	}
	if rel.TagName != "v1.2.3" {
		t.Errorf("expected tag v1.2.3, got %s", rel.TagName)
	}
	if len(rel.Assets) != 2 {
		t.Errorf("expected 2 assets, got %d", len(rel.Assets))
	}
}

func TestCheckLatest_NotFound(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer srv.Close()

	u := &Updater{
		GitHubBase: srv.URL,
		ConfigDir:  t.TempDir(),
	}

	_, err := u.CheckLatest(context.Background())
	if err == nil {
		t.Fatal("expected error for 404")
	}
}

func TestShouldCheck_NoFile(t *testing.T) {
	u := &Updater{ConfigDir: t.TempDir()}
	if !u.ShouldCheck() {
		t.Error("expected ShouldCheck=true when no timestamp file exists")
	}
}

func TestShouldCheck_RecentFile(t *testing.T) {
	dir := t.TempDir()
	u := &Updater{ConfigDir: dir}
	u.RecordCheck()

	if u.ShouldCheck() {
		t.Error("expected ShouldCheck=false immediately after RecordCheck")
	}
}

func TestShouldCheck_StaleFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, timestampFile)
	if err := os.WriteFile(path, []byte("old"), 0644); err != nil {
		t.Fatal(err)
	}
	// Set mtime to 25 hours ago.
	old := time.Now().Add(-25 * time.Hour)
	if err := os.Chtimes(path, old, old); err != nil {
		t.Fatal(err)
	}

	u := &Updater{ConfigDir: dir}
	if !u.ShouldCheck() {
		t.Error("expected ShouldCheck=true for stale timestamp")
	}
}

func TestVerifyChecksum_Valid(t *testing.T) {
	data := []byte("hello world")
	hash := sha256.Sum256(data)
	checksumFile := fmt.Sprintf("%x  test.tar.gz\n", hash)

	if err := verifyChecksum(data, "test.tar.gz", []byte(checksumFile)); err != nil {
		t.Fatalf("expected valid checksum, got: %v", err)
	}
}

func TestVerifyChecksum_Mismatch(t *testing.T) {
	data := []byte("hello world")
	checksumFile := "0000000000000000000000000000000000000000000000000000000000000000  test.tar.gz\n"

	err := verifyChecksum(data, "test.tar.gz", []byte(checksumFile))
	if err == nil {
		t.Fatal("expected mismatch error")
	}
	if got := err.Error(); !contains(got, "mismatch") {
		t.Errorf("expected mismatch in error, got: %s", got)
	}
}

func TestVerifyChecksum_MissingEntry(t *testing.T) {
	data := []byte("hello world")
	checksumFile := "abcd1234  other.tar.gz\n"

	err := verifyChecksum(data, "test.tar.gz", []byte(checksumFile))
	if err == nil {
		t.Fatal("expected missing entry error")
	}
}

func TestExtractFromTarGz(t *testing.T) {
	content := []byte("binary-content-here")

	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	tw := tar.NewWriter(gw)
	tw.WriteHeader(&tar.Header{
		Name: "anycap_1.0.0_darwin_arm64/anycap",
		Mode: 0755,
		Size: int64(len(content)),
	})
	tw.Write(content)
	tw.Close()
	gw.Close()

	got, err := extractFromTarGz(buf.Bytes(), "anycap")
	if err != nil {
		t.Fatalf("extractFromTarGz: %v", err)
	}
	if !bytes.Equal(got, content) {
		t.Errorf("content mismatch: got %q", got)
	}
}

func TestExtractFromTarGz_NotFound(t *testing.T) {
	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	tw := tar.NewWriter(gw)
	tw.WriteHeader(&tar.Header{Name: "readme.txt", Mode: 0644, Size: 5})
	tw.Write([]byte("hello"))
	tw.Close()
	gw.Close()

	_, err := extractFromTarGz(buf.Bytes(), "anycap")
	if err == nil {
		t.Fatal("expected not found error")
	}
}

func TestUpdate_FullFlow(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("full flow test uses tar.gz; skipping on Windows")
	}

	version := "2.0.0"
	tag := "v" + version
	assets := fakeRelease(t, version)

	srv := newRedirectServer(t, tag, assets)
	defer srv.Close()

	u := &Updater{
		GitHubBase: srv.URL,
		ConfigDir:  t.TempDir(),
	}

	// Resolve latest release via redirect.
	rel, err := u.CheckLatest(context.Background())
	if err != nil {
		t.Fatalf("CheckLatest: %v", err)
	}
	if rel.Version != version {
		t.Fatalf("expected version %s, got %s", version, rel.Version)
	}

	// We can't call u.Update directly because it uses ExecutablePath().
	// Instead, test the lower-level components.
	asset, ok := rel.FindAsset()
	if !ok {
		t.Skip("no matching asset for current OS/arch in test fixture")
	}

	archiveData, err := u.download(context.Background(), asset.DownloadURL)
	if err != nil {
		t.Fatalf("download: %v", err)
	}

	// Verify checksum.
	checksumAsset, _ := rel.FindChecksumAsset()
	checksumData, err := u.download(context.Background(), checksumAsset.DownloadURL)
	if err != nil {
		t.Fatalf("download checksums: %v", err)
	}

	if err := verifyChecksum(archiveData, asset.Name, checksumData); err != nil {
		t.Fatalf("checksum: %v", err)
	}

	// Extract binary.
	binaryData, err := extractBinary(archiveData, asset.Name)
	if err != nil {
		t.Fatalf("extract: %v", err)
	}

	// Create a fake "current" binary to replace.
	tmpDir := t.TempDir()
	fakeBin := filepath.Join(tmpDir, "anycap")
	if err := os.WriteFile(fakeBin, []byte("old-binary"), 0755); err != nil {
		t.Fatal(err)
	}

	// Replace binary.
	if err := replaceBinary(fakeBin, binaryData); err != nil {
		t.Fatalf("replace: %v", err)
	}

	// Verify the replacement.
	got, err := os.ReadFile(fakeBin)
	if err != nil {
		t.Fatal(err)
	}
	if bytes.Equal(got, []byte("old-binary")) {
		t.Error("binary was not replaced")
	}

	// Verify permissions preserved.
	info, err := os.Stat(fakeBin)
	if err != nil {
		t.Fatal(err)
	}
	if info.Mode().Perm()&0111 == 0 {
		t.Error("expected executable permission to be preserved")
	}
}

func TestFindAsset_NoMatch(t *testing.T) {
	rel := &Release{
		Assets: []Asset{
			{Name: "anycap_1.0.0_freebsd_mips.tar.gz"},
		},
	}
	_, ok := rel.FindAsset()
	if ok {
		t.Error("expected no match for non-existent platform")
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && bytes.Contains([]byte(s), []byte(substr))
}
