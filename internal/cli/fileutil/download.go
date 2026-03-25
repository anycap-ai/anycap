// Package fileutil provides file download and path utilities for CLI commands.
package fileutil

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"time"
)

// DownloadFile downloads a URL to a local file path and returns the absolute path.
// It creates parent directories as needed.
func DownloadFile(fileURL, savePath string) (string, error) {
	// Ensure parent directory exists.
	dir := filepath.Dir(savePath)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return "", fmt.Errorf("create directory: %w", err)
		}
	}

	absPath, err := filepath.Abs(savePath)
	if err != nil {
		return "", err
	}

	client := &http.Client{Timeout: 300 * time.Second}
	resp, err := client.Get(fileURL)
	if err != nil {
		return "", fmt.Errorf("download failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("download failed: HTTP %d", resp.StatusCode)
	}

	f, err := os.Create(absPath)
	if err != nil {
		return "", fmt.Errorf("create file: %w", err)
	}
	defer f.Close()

	if _, err := io.Copy(f, resp.Body); err != nil {
		os.Remove(absPath)
		return "", fmt.Errorf("write file: %w", err)
	}

	return absPath, nil
}

// FilenameFromURL extracts a filename from a URL, falling back to "download" if none found.
func FilenameFromURL(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil {
		return "download"
	}
	base := path.Base(u.Path)
	if base == "" || base == "." || base == "/" {
		return "download"
	}
	return base
}
