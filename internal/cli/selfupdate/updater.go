// Package selfupdate provides self-update functionality for the anycap CLI
// by checking GitHub Releases for newer versions.
package selfupdate

import (
	"archive/tar"
	"archive/zip"
	"bytes"
	"compress/gzip"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"time"
)

const (
	// GitHubOwner is the GitHub repository owner.
	GitHubOwner = "anycap-ai"
	// GitHubRepo is the GitHub repository name.
	GitHubRepo = "anycap"

	// CheckInterval is the minimum duration between automatic update checks.
	CheckInterval = 24 * time.Hour

	// checkTimeout is the HTTP timeout for the version check API call.
	checkTimeout = 5 * time.Second
	// downloadTimeout is the HTTP timeout for downloading assets.
	downloadTimeout = 120 * time.Second

	timestampFile = ".last_update_check"

	// semverPattern matches clean semver versions like "0.1.2" or "1.0.0".
	// No pre-release suffixes, no commit hashes, no "-dirty".
	semverPattern = `^\d+\.\d+\.\d+$`
)

// Release holds information about an available release.
type Release struct {
	Version string
	TagName string
	Assets  []Asset
}

// Asset is a single downloadable file attached to a release.
type Asset struct {
	Name        string `json:"name"`
	DownloadURL string `json:"browser_download_url"`
}

// githubRelease is the subset of the GitHub API response we care about.
type githubRelease struct {
	TagName string  `json:"tag_name"`
	Assets  []Asset `json:"assets"`
}

// Updater performs update checks and binary replacement.
type Updater struct {
	// GitHubAPIBase can be overridden for testing (default: https://api.github.com).
	GitHubAPIBase string
	// ConfigDir is ~/.anycap (override for testing).
	ConfigDir string
	// Verbose enables debug logging to Logger.
	Verbose bool
	// Logger receives verbose output. Defaults to io.Discard.
	Logger io.Writer
}

// NewUpdater returns an Updater with production defaults.
func NewUpdater() *Updater {
	return &Updater{
		GitHubAPIBase: "https://api.github.com",
		ConfigDir:     defaultConfigDir(),
		Logger:        io.Discard,
	}
}

func (u *Updater) logf(format string, args ...any) {
	if u.Verbose && u.Logger != nil {
		fmt.Fprintf(u.Logger, "[update] "+format+"\n", args...)
	}
}

// IsNPMInstall returns true if the current binary is installed via npm
// (i.e. lives inside a node_modules directory).
func IsNPMInstall() bool {
	exe, err := ExecutablePath()
	if err != nil {
		return false
	}
	return strings.Contains(exe, "node_modules")
}

var semverRe = regexp.MustCompile(semverPattern)

// IsDevVersion returns true if the version string does not look like a
// clean release semver (e.g. "0.0.2"). Local builds produce versions
// like "dev", "af0055f-dirty", or "v0.0.2-3-gaf0055f".
func IsDevVersion(version string) bool {
	if version == "" || version == "dev" {
		return true
	}
	v := strings.TrimPrefix(version, "v")
	return !semverRe.MatchString(v)
}

// ShouldCheck returns true if enough time has passed since the last check.
func (u *Updater) ShouldCheck() bool {
	path := filepath.Join(u.ConfigDir, timestampFile)
	info, err := os.Stat(path)
	if err != nil {
		u.logf("no previous check recorded, should check")
		return true
	}
	age := time.Since(info.ModTime())
	should := age >= CheckInterval
	u.logf("last check %s ago, interval=%s, should_check=%v", age.Round(time.Second), CheckInterval, should)
	return should
}

// RecordCheck saves the current time as the last check timestamp.
func (u *Updater) RecordCheck() {
	path := filepath.Join(u.ConfigDir, timestampFile)
	_ = os.MkdirAll(u.ConfigDir, 0755)
	_ = os.WriteFile(path, []byte(time.Now().UTC().Format(time.RFC3339)), 0644)
}

// CheckLatest queries GitHub for the latest release.
func (u *Updater) CheckLatest(ctx context.Context) (*Release, error) {
	ctx, cancel := context.WithTimeout(ctx, checkTimeout)
	defer cancel()

	url := fmt.Sprintf("%s/repos/%s/%s/releases/latest", u.GitHubAPIBase, GitHubOwner, GitHubRepo)
	u.logf("checking latest release: GET %s", url)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github: unexpected status %d", resp.StatusCode)
	}

	var gh githubRelease
	if err := json.NewDecoder(resp.Body).Decode(&gh); err != nil {
		return nil, fmt.Errorf("github: decode response: %w", err)
	}

	version := strings.TrimPrefix(gh.TagName, "v")
	u.logf("latest release: %s (%d assets)", gh.TagName, len(gh.Assets))
	return &Release{
		Version: version,
		TagName: gh.TagName,
		Assets:  gh.Assets,
	}, nil
}

// FindAsset returns the archive asset matching the current OS/arch.
func (rel *Release) FindAsset() (Asset, bool) {
	suffix := fmt.Sprintf("_%s_%s", runtime.GOOS, runtime.GOARCH)
	ext := ".tar.gz"
	if runtime.GOOS == "windows" {
		ext = ".zip"
	}

	for _, a := range rel.Assets {
		if strings.Contains(a.Name, suffix) && strings.HasSuffix(a.Name, ext) {
			return a, true
		}
	}
	return Asset{}, false
}

// FindChecksumAsset returns the checksums.txt asset.
func (rel *Release) FindChecksumAsset() (Asset, bool) {
	for _, a := range rel.Assets {
		if a.Name == "checksums.txt" {
			return a, true
		}
	}
	return Asset{}, false
}

// Update downloads the release asset, verifies its checksum, extracts the
// binary, and atomically replaces the current executable.
func (u *Updater) Update(ctx context.Context, rel *Release) error {
	asset, ok := rel.FindAsset()
	if !ok {
		return fmt.Errorf("no matching asset for %s/%s", runtime.GOOS, runtime.GOARCH)
	}
	u.logf("matched asset: %s", asset.Name)

	checksumAsset, hasChecksum := rel.FindChecksumAsset()

	ctx, cancel := context.WithTimeout(ctx, downloadTimeout)
	defer cancel()

	// Download archive.
	u.logf("downloading %s", asset.DownloadURL)
	archiveData, err := u.download(ctx, asset.DownloadURL)
	if err != nil {
		return fmt.Errorf("download asset: %w", err)
	}

	// Verify checksum if available.
	if hasChecksum {
		u.logf("downloading checksums.txt")
		checksumData, err := u.download(ctx, checksumAsset.DownloadURL)
		if err != nil {
			return fmt.Errorf("download checksums: %w", err)
		}
		u.logf("verifying SHA256 checksum")
		if err := verifyChecksum(archiveData, asset.Name, checksumData); err != nil {
			return fmt.Errorf("checksum verification failed: %w", err)
		}
		u.logf("checksum OK")
	}

	// Extract binary from archive.
	binaryData, err := extractBinary(archiveData, asset.Name)
	if err != nil {
		return fmt.Errorf("extract binary: %w", err)
	}

	// Replace current executable.
	exePath, err := ExecutablePath()
	if err != nil {
		return fmt.Errorf("locate executable: %w", err)
	}
	u.logf("replacing binary at %s", exePath)

	if err := replaceBinary(exePath, binaryData); err != nil {
		return fmt.Errorf("replace binary: %w", err)
	}
	u.logf("binary replaced successfully")

	return nil
}

func (u *Updater) download(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status %d for %s", resp.StatusCode, url)
	}

	return io.ReadAll(resp.Body)
}

// verifyChecksum checks SHA256 of data against the checksums file content.
func verifyChecksum(data []byte, filename string, checksumFile []byte) error {
	hash := sha256.Sum256(data)
	actual := hex.EncodeToString(hash[:])

	for _, line := range strings.Split(string(checksumFile), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		// Format: "<hash>  <filename>" (goreleaser uses two spaces)
		parts := strings.Fields(line)
		if len(parts) >= 2 && parts[1] == filename {
			if parts[0] == actual {
				return nil
			}
			return fmt.Errorf("sha256 mismatch: expected %s, got %s", parts[0], actual)
		}
	}

	return fmt.Errorf("no checksum entry found for %s", filename)
}

// extractBinary pulls the "anycap" (or "anycap.exe") executable out of the archive.
func extractBinary(archiveData []byte, archiveName string) ([]byte, error) {
	binaryName := "anycap"
	if runtime.GOOS == "windows" {
		binaryName = "anycap.exe"
	}

	if strings.HasSuffix(archiveName, ".zip") {
		return extractFromZip(archiveData, binaryName)
	}
	return extractFromTarGz(archiveData, binaryName)
}

func extractFromTarGz(data []byte, binaryName string) ([]byte, error) {
	gz, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	defer gz.Close()

	tr := tar.NewReader(gz)
	for {
		hdr, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}
		// Match the binary name regardless of directory prefix.
		if filepath.Base(hdr.Name) == binaryName && hdr.Typeflag == tar.TypeReg {
			return io.ReadAll(tr)
		}
	}
	return nil, fmt.Errorf("%s not found in archive", binaryName)
}

func extractFromZip(data []byte, binaryName string) ([]byte, error) {
	r, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	if err != nil {
		return nil, err
	}
	for _, f := range r.File {
		if filepath.Base(f.Name) == binaryName {
			rc, err := f.Open()
			if err != nil {
				return nil, err
			}
			defer rc.Close()
			return io.ReadAll(rc)
		}
	}
	return nil, fmt.Errorf("%s not found in archive", binaryName)
}

// replaceBinary atomically replaces the executable at exePath with newData.
//
// Strategy: write to a temp file next to the target, then rename over it.
// On Windows, the running executable is locked, so we first rename the old
// binary to a .old suffix before renaming the new one into place.
func replaceBinary(exePath string, newData []byte) error {
	dir := filepath.Dir(exePath)
	base := filepath.Base(exePath)

	// Get existing file mode to preserve it.
	info, err := os.Stat(exePath)
	if err != nil {
		return err
	}
	mode := info.Mode()

	// Write new binary to temp file.
	tmpFile, err := os.CreateTemp(dir, base+".update-*")
	if err != nil {
		return err
	}
	tmpPath := tmpFile.Name()

	if _, err := tmpFile.Write(newData); err != nil {
		tmpFile.Close()
		os.Remove(tmpPath)
		return err
	}
	if err := tmpFile.Chmod(mode); err != nil {
		tmpFile.Close()
		os.Remove(tmpPath)
		return err
	}
	if err := tmpFile.Close(); err != nil {
		os.Remove(tmpPath)
		return err
	}

	// On Windows, rename old binary out of the way first.
	if runtime.GOOS == "windows" {
		oldPath := exePath + ".old"
		_ = os.Remove(oldPath)
		if err := os.Rename(exePath, oldPath); err != nil {
			os.Remove(tmpPath)
			return err
		}
	}

	// Atomic rename.
	if err := os.Rename(tmpPath, exePath); err != nil {
		os.Remove(tmpPath)
		return err
	}

	return nil
}

// ExecutablePath returns the resolved path to the current executable.
func ExecutablePath() (string, error) {
	exe, err := os.Executable()
	if err != nil {
		return "", err
	}
	return filepath.EvalSymlinks(exe)
}

func defaultConfigDir() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return filepath.Join(home, ".anycap")
}
