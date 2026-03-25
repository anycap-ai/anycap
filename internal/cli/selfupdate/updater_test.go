package selfupdate

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// fakeRelease builds a GitHub-style release JSON with a tar.gz asset
// containing a fake binary, plus a checksums.txt asset.
func fakeRelease(t *testing.T, version string) (releaseJSON []byte, assets map[string][]byte) {
	t.Helper()

	binaryContent := []byte("#!/bin/sh\necho fake-anycap-" + version)
	archiveName := fmt.Sprintf("anycap_%s_darwin_arm64.tar.gz", version)

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

	assets = map[string][]byte{
		archiveName:     archiveData,
		"checksums.txt": []byte(checksumLine),
	}

	rel := githubRelease{
		TagName: "v" + version,
		Assets: []Asset{
			{Name: archiveName, DownloadURL: "PLACEHOLDER/" + archiveName},
			{Name: "checksums.txt", DownloadURL: "PLACEHOLDER/checksums.txt"},
		},
	}
	releaseJSON, _ = json.Marshal(rel)
	return releaseJSON, assets
}

func TestCheckLatest(t *testing.T) {
	relJSON, _ := fakeRelease(t, "1.2.3")

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == fmt.Sprintf("/repos/%s/%s/releases/latest", GitHubOwner, GitHubRepo) {
			w.Header().Set("Content-Type", "application/json")
			w.Write(relJSON)
			return
		}
		http.NotFound(w, r)
	}))
	defer srv.Close()

	u := &Updater{
		GitHubAPIBase: srv.URL,
		ConfigDir:     t.TempDir(),
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
		GitHubAPIBase: srv.URL,
		ConfigDir:     t.TempDir(),
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
	relJSON, assets := fakeRelease(t, "2.0.0")

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Serve release API.
		if r.URL.Path == fmt.Sprintf("/repos/%s/%s/releases/latest", GitHubOwner, GitHubRepo) {
			w.Header().Set("Content-Type", "application/json")
			w.Write(relJSON)
			return
		}
		// Serve asset downloads.
		name := filepath.Base(r.URL.Path)
		if data, ok := assets[name]; ok {
			w.Write(data)
			return
		}
		http.NotFound(w, r)
	}))
	defer srv.Close()

	// Patch asset download URLs to point to our test server.
	var rel githubRelease
	json.Unmarshal(relJSON, &rel)
	for i := range rel.Assets {
		rel.Assets[i].DownloadURL = srv.URL + "/" + rel.Assets[i].Name
	}

	// Create a fake "current" binary to replace.
	tmpDir := t.TempDir()
	fakeBin := filepath.Join(tmpDir, "anycap")
	if err := os.WriteFile(fakeBin, []byte("old-binary"), 0755); err != nil {
		t.Fatal(err)
	}

	u := &Updater{
		GitHubAPIBase: srv.URL,
		ConfigDir:     t.TempDir(),
	}

	release := &Release{
		Version: "2.0.0",
		TagName: "v2.0.0",
		Assets:  rel.Assets,
	}

	// We can't call u.Update directly because it uses ExecutablePath().
	// Instead, test the lower-level components.
	// Download the asset.
	asset, ok := release.FindAsset()
	if !ok {
		t.Skip("no matching asset for current OS/arch in test fixture")
	}

	archiveData, err := u.download(context.Background(), asset.DownloadURL)
	if err != nil {
		t.Fatalf("download: %v", err)
	}

	// Verify checksum.
	checksumAsset, _ := release.FindChecksumAsset()
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
