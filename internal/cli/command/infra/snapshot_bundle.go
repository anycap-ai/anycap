package infra

import (
	"archive/tar"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

const (
	snapshotFormatVersion = "1"
	snapshotMetaDir       = ".anycap-snapshot"
	snapshotManifestPath  = ".anycap-snapshot/manifest.json"
	snapshotHandoffMDPath = ".anycap-snapshot/handoff.md"
	snapshotHandoffJSON   = ".anycap-snapshot/handoff.json"
)

var snapshotTechnicalExcludeDirs = map[string]bool{
	".git":         true,
	".next":        true,
	".venv":        true,
	".cache":       true,
	"__pycache__":  true,
	"build":        true,
	"cache":        true,
	"dist":         true,
	"node_modules": true,
	"temp":         true,
	"tmp":          true,
	"venv":         true,
}

type snapshotManifest struct {
	FormatVersion  string                  `json:"format_version"`
	CreatedAt      string                  `json:"created_at"`
	ExpiresAt      string                  `json:"expires_at,omitempty"`
	TargetCount    int                     `json:"target_count"`
	ArchiveRoot    string                  `json:"archive_root_name,omitempty"`
	Entries        []snapshotManifestEntry `json:"entries"`
	Warnings       []string                `json:"warnings,omitempty"`
	HandoffPresent bool                    `json:"handoff_present"`
}

type snapshotManifestEntry struct {
	OriginalTarget string `json:"original_target"`
	ArchivePath    string `json:"archive_path"`
	Kind           string `json:"kind"`
	Size           int64  `json:"size,omitempty"`
	Checksum       string `json:"checksum,omitempty"`
}

type snapshotNormalizedTarget struct {
	Input        string
	ResolvedPath string
	ArchiveBase  string
	Kind         string
}

type snapshotCollectedItem struct {
	OriginalTarget string
	SourcePath     string
	ArchivePath    string
	Kind           string
	Size           int64
	Checksum       string
}

type snapshotPrepareResult struct {
	Targets  []snapshotNormalizedTarget
	Warnings []string
}

type snapshotCollectResult struct {
	Items            []snapshotCollectedItem
	Warnings         []string
	SensitiveMatches []string
}

func prepareSnapshotTargets(cwd string, inputs []string) (*snapshotPrepareResult, error) {
	if len(inputs) == 0 {
		return nil, fmt.Errorf("at least one --target is required")
	}

	absCWD, err := filepath.Abs(cwd)
	if err != nil {
		return nil, err
	}

	candidates := make([]snapshotNormalizedTarget, 0, len(inputs))
	for _, raw := range inputs {
		trimmed := strings.TrimSpace(raw)
		if trimmed == "" {
			return nil, fmt.Errorf("target must not be empty")
		}

		absPath := trimmed
		if !filepath.IsAbs(absPath) {
			absPath = filepath.Join(absCWD, trimmed)
		}
		absPath = filepath.Clean(absPath)

		resolvedPath, err := filepath.EvalSymlinks(absPath)
		if err != nil {
			return nil, fmt.Errorf("resolve target %q: %w", trimmed, err)
		}

		info, err := os.Stat(resolvedPath)
		if err != nil {
			return nil, fmt.Errorf("stat target %q: %w", trimmed, err)
		}

		archiveBase, err := snapshotArchiveBase(absCWD, absPath, resolvedPath)
		if err != nil {
			return nil, fmt.Errorf("normalize target %q: %w", trimmed, err)
		}

		kind := "file"
		if info.IsDir() {
			kind = "directory"
		}
		candidates = append(candidates, snapshotNormalizedTarget{
			Input:        trimmed,
			ResolvedPath: resolvedPath,
			ArchiveBase:  archiveBase,
			Kind:         kind,
		})
	}

	sort.Slice(candidates, func(i, j int) bool {
		di := snapshotPathDepth(candidates[i].ResolvedPath)
		dj := snapshotPathDepth(candidates[j].ResolvedPath)
		if di != dj {
			return di < dj
		}
		if candidates[i].ResolvedPath != candidates[j].ResolvedPath {
			return candidates[i].ResolvedPath < candidates[j].ResolvedPath
		}
		if candidates[i].ArchiveBase != candidates[j].ArchiveBase {
			return candidates[i].ArchiveBase < candidates[j].ArchiveBase
		}
		return candidates[i].Input < candidates[j].Input
	})

	result := &snapshotPrepareResult{
		Targets:  make([]snapshotNormalizedTarget, 0, len(candidates)),
		Warnings: make([]string, 0),
	}
	seen := make(map[string]snapshotNormalizedTarget)
	for _, candidate := range candidates {
		if existing, ok := seen[candidate.ResolvedPath]; ok {
			result.Warnings = append(result.Warnings, fmt.Sprintf("ignored duplicate target %q; same path as %q", candidate.Input, existing.Input))
			continue
		}

		droppedByParent := false
		for _, kept := range result.Targets {
			if kept.Kind != "directory" {
				continue
			}
			if snapshotPathContains(kept.ResolvedPath, candidate.ResolvedPath) {
				result.Warnings = append(result.Warnings, fmt.Sprintf("ignored target %q; already covered by directory target %q", candidate.Input, kept.Input))
				droppedByParent = true
				break
			}
		}
		if droppedByParent {
			continue
		}

		seen[candidate.ResolvedPath] = candidate
		result.Targets = append(result.Targets, candidate)
	}

	archiveBases := make(map[string]string)
	for _, target := range result.Targets {
		key := target.ArchiveBase
		if key == "" {
			key = "."
		}
		if existing, ok := archiveBases[key]; ok && existing != target.ResolvedPath {
			return nil, fmt.Errorf("conflicting archive root path %q from %q and %q", target.ArchiveBase, existing, target.ResolvedPath)
		}
		archiveBases[key] = target.ResolvedPath
	}

	sort.Slice(result.Targets, func(i, j int) bool {
		if result.Targets[i].ArchiveBase != result.Targets[j].ArchiveBase {
			return result.Targets[i].ArchiveBase < result.Targets[j].ArchiveBase
		}
		return result.Targets[i].ResolvedPath < result.Targets[j].ResolvedPath
	})
	return result, nil
}

func snapshotArchiveBase(absCWD string, absInput string, resolvedPath string) (string, error) {
	rel, err := filepath.Rel(absCWD, absInput)
	if err == nil && rel != ".." && !strings.HasPrefix(rel, ".."+string(os.PathSeparator)) {
		cleaned := filepath.ToSlash(filepath.Clean(rel))
		if cleaned == "." {
			return "", nil
		}
		return cleaned, nil
	}

	base := filepath.Base(resolvedPath)
	if base == "." || base == string(filepath.Separator) || base == "" {
		return "", fmt.Errorf("unable to derive archive name from %q", resolvedPath)
	}
	return filepath.ToSlash(base), nil
}

func snapshotPathDepth(value string) int {
	cleaned := filepath.Clean(value)
	if cleaned == "." || cleaned == string(filepath.Separator) {
		return 0
	}
	return len(strings.Split(cleaned, string(filepath.Separator)))
}

func snapshotPathContains(parent string, child string) bool {
	if parent == child {
		return true
	}
	rel, err := filepath.Rel(parent, child)
	if err != nil {
		return false
	}
	return rel != ".." && !strings.HasPrefix(rel, ".."+string(filepath.Separator))
}

func collectSnapshotItems(targets []snapshotNormalizedTarget) (*snapshotCollectResult, error) {
	result := &snapshotCollectResult{
		Items:            make([]snapshotCollectedItem, 0),
		Warnings:         make([]string, 0),
		SensitiveMatches: make([]string, 0),
	}

	for _, target := range targets {
		info, err := os.Lstat(target.ResolvedPath)
		if err != nil {
			return nil, fmt.Errorf("stat target %q: %w", target.Input, err)
		}
		if info.Mode()&os.ModeSymlink != 0 {
			return nil, fmt.Errorf("snapshot does not support symlink targets: %s", target.Input)
		}

		if info.IsDir() {
			if target.ArchiveBase != "" {
				result.Items = append(result.Items, snapshotCollectedItem{
					OriginalTarget: target.Input,
					SourcePath:     target.ResolvedPath,
					ArchivePath:    target.ArchiveBase,
					Kind:           "directory",
				})
			}
			err := filepath.WalkDir(target.ResolvedPath, func(current string, d fs.DirEntry, walkErr error) error {
				if walkErr != nil {
					return walkErr
				}
				if current == target.ResolvedPath {
					return nil
				}

				name := strings.ToLower(d.Name())
				if d.IsDir() && snapshotTechnicalExcludeDirs[name] {
					result.Warnings = append(result.Warnings, fmt.Sprintf("excluded technical directory %q", filepath.ToSlash(current)))
					return filepath.SkipDir
				}
				if d.Type()&os.ModeSymlink != 0 {
					return fmt.Errorf("snapshot does not support symlink entries: %s", filepath.ToSlash(current))
				}

				rel, err := filepath.Rel(target.ResolvedPath, current)
				if err != nil {
					return err
				}
				archivePath := snapshotJoinArchivePath(target.ArchiveBase, filepath.ToSlash(rel))
				info, err := d.Info()
				if err != nil {
					return err
				}
				if d.IsDir() {
					result.Items = append(result.Items, snapshotCollectedItem{
						OriginalTarget: target.Input,
						SourcePath:     current,
						ArchivePath:    archivePath,
						Kind:           "directory",
					})
					return nil
				}
				if !info.Mode().IsRegular() {
					return fmt.Errorf("snapshot does not support non-regular file %s", filepath.ToSlash(current))
				}

				checksum, err := snapshotChecksumFile(current)
				if err != nil {
					return err
				}
				result.Items = append(result.Items, snapshotCollectedItem{
					OriginalTarget: target.Input,
					SourcePath:     current,
					ArchivePath:    archivePath,
					Kind:           "file",
					Size:           info.Size(),
					Checksum:       checksum,
				})
				if snapshotSensitiveFile(current) {
					result.SensitiveMatches = append(result.SensitiveMatches, filepath.ToSlash(current))
				}
				return nil
			})
			if err != nil {
				return nil, err
			}
			continue
		}

		if !info.Mode().IsRegular() {
			return nil, fmt.Errorf("snapshot does not support non-regular file target: %s", target.Input)
		}
		checksum, err := snapshotChecksumFile(target.ResolvedPath)
		if err != nil {
			return nil, err
		}
		result.Items = append(result.Items, snapshotCollectedItem{
			OriginalTarget: target.Input,
			SourcePath:     target.ResolvedPath,
			ArchivePath:    target.ArchiveBase,
			Kind:           "file",
			Size:           info.Size(),
			Checksum:       checksum,
		})
		if snapshotSensitiveFile(target.ResolvedPath) {
			result.SensitiveMatches = append(result.SensitiveMatches, filepath.ToSlash(target.ResolvedPath))
		}
	}

	sort.Slice(result.Items, func(i, j int) bool {
		if result.Items[i].ArchivePath != result.Items[j].ArchivePath {
			return result.Items[i].ArchivePath < result.Items[j].ArchivePath
		}
		return result.Items[i].Kind < result.Items[j].Kind
	})
	sort.Strings(result.SensitiveMatches)
	return result, nil
}

func snapshotChecksumFile(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, f); err != nil {
		return "", err
	}
	return hex.EncodeToString(hash.Sum(nil)), nil
}

func snapshotSensitiveFile(path string) bool {
	name := strings.ToLower(filepath.Base(path))
	switch {
	case name == ".env":
		return true
	case strings.HasPrefix(name, ".env."):
		return true
	case strings.HasSuffix(name, ".pem"):
		return true
	case strings.HasSuffix(name, ".key"):
		return true
	case strings.HasSuffix(name, ".p12"):
		return true
	case strings.HasSuffix(name, ".pfx"):
		return true
	case name == "id_rsa":
		return true
	case name == "id_ed25519":
		return true
	default:
		return false
	}
}

func snapshotJoinArchivePath(base string, rel string) string {
	if base == "" {
		return rel
	}
	if rel == "" {
		return base
	}
	return path.Join(base, rel)
}

func writeSnapshotArchive(outputPath string, targets []snapshotNormalizedTarget, collected *snapshotCollectResult, handoffPath string, expiresAt time.Time, warnings []string, archiveRoot string) (*snapshotManifest, error) {
	handoffBytes, handoffEntry, err := loadSnapshotHandoff(handoffPath)
	if err != nil {
		return nil, err
	}

	manifest := &snapshotManifest{
		FormatVersion:  snapshotFormatVersion,
		CreatedAt:      time.Now().UTC().Format(time.RFC3339),
		ExpiresAt:      expiresAt.UTC().Format(time.RFC3339),
		TargetCount:    len(targets),
		ArchiveRoot:    archiveRoot,
		Entries:        make([]snapshotManifestEntry, 0, len(collected.Items)),
		Warnings:       append([]string{}, warnings...),
		HandoffPresent: handoffBytes != nil,
	}
	manifest.Warnings = append(manifest.Warnings, collected.Warnings...)
	for _, item := range collected.Items {
		entry := snapshotManifestEntry{
			OriginalTarget: item.OriginalTarget,
			ArchivePath:    item.ArchivePath,
			Kind:           item.Kind,
			Size:           item.Size,
			Checksum:       item.Checksum,
		}
		manifest.Entries = append(manifest.Entries, entry)
	}

	file, err := os.Create(outputPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	writer := tar.NewWriter(file)
	defer writer.Close()

	if err := writeTarDir(writer, snapshotMetaDir); err != nil {
		return nil, err
	}

	manifestBytes, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return nil, err
	}
	if err := writeTarBytes(writer, snapshotManifestPath, manifestBytes, 0644); err != nil {
		return nil, err
	}
	if handoffBytes != nil {
		if err := writeTarBytes(writer, handoffEntry, handoffBytes, 0644); err != nil {
			return nil, err
		}
	}

	for _, item := range collected.Items {
		switch item.Kind {
		case "directory":
			if err := writeTarDir(writer, item.ArchivePath); err != nil {
				return nil, err
			}
		case "file":
			if err := writeTarFile(writer, item.ArchivePath, item.SourcePath, item.Size); err != nil {
				return nil, err
			}
		default:
			return nil, fmt.Errorf("unsupported snapshot item kind %q", item.Kind)
		}
	}
	return manifest, nil
}

func loadSnapshotHandoff(path string) ([]byte, string, error) {
	trimmed := strings.TrimSpace(path)
	if trimmed == "" {
		return nil, "", nil
	}
	data, err := os.ReadFile(trimmed)
	if err != nil {
		return nil, "", err
	}
	if strings.EqualFold(filepath.Ext(trimmed), ".json") {
		return data, snapshotHandoffJSON, nil
	}
	return data, snapshotHandoffMDPath, nil
}

func writeTarDir(writer *tar.Writer, archivePath string) error {
	name := strings.TrimSuffix(path.Clean(archivePath), "/") + "/"
	header := &tar.Header{
		Name:     name,
		Mode:     0755,
		Typeflag: tar.TypeDir,
		ModTime:  time.Now().UTC(),
	}
	return writer.WriteHeader(header)
}

func writeTarBytes(writer *tar.Writer, archivePath string, data []byte, mode int64) error {
	header := &tar.Header{
		Name:    path.Clean(archivePath),
		Mode:    mode,
		Size:    int64(len(data)),
		ModTime: time.Now().UTC(),
	}
	if err := writer.WriteHeader(header); err != nil {
		return err
	}
	_, err := writer.Write(data)
	return err
}

func writeTarFile(writer *tar.Writer, archivePath string, sourcePath string, size int64) error {
	file, err := os.Open(sourcePath)
	if err != nil {
		return err
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		return err
	}
	header := &tar.Header{
		Name:    path.Clean(archivePath),
		Mode:    int64(info.Mode().Perm()),
		Size:    size,
		ModTime: info.ModTime().UTC(),
	}
	if err := writer.WriteHeader(header); err != nil {
		return err
	}
	_, err = io.Copy(writer, file)
	return err
}

func readSnapshotManifest(archivePath string) (*snapshotManifest, error) {
	file, err := os.Open(archivePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := tar.NewReader(file)
	for {
		header, err := reader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}
		if path.Clean(header.Name) != snapshotManifestPath {
			continue
		}
		var manifest snapshotManifest
		if err := json.NewDecoder(reader).Decode(&manifest); err != nil {
			return nil, err
		}
		if manifest.FormatVersion == "" {
			return nil, fmt.Errorf("snapshot manifest format_version is required")
		}
		return &manifest, nil
	}
	return nil, fmt.Errorf("snapshot manifest not found")
}

func extractSnapshotArchive(archivePath string, targetDir string) (*snapshotManifest, error) {
	parentDir := filepath.Dir(targetDir)
	if err := os.MkdirAll(parentDir, 0755); err != nil {
		return nil, err
	}

	stageDir, err := os.MkdirTemp(parentDir, ".snapshot-*")
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = os.RemoveAll(stageDir)
	}()

	file, err := os.Open(archivePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := tar.NewReader(file)
	for {
		header, err := reader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		name, err := validateSnapshotArchivePath(header.Name)
		if err != nil {
			return nil, err
		}
		destPath, err := snapshotDestinationPath(stageDir, name)
		if err != nil {
			return nil, err
		}

		switch header.Typeflag {
		case tar.TypeDir:
			if err := os.MkdirAll(destPath, 0755); err != nil {
				return nil, err
			}
		case tar.TypeReg, tar.TypeRegA:
			if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
				return nil, err
			}
			out, err := os.OpenFile(destPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, fs.FileMode(header.Mode))
			if err != nil {
				return nil, err
			}
			if _, err := io.Copy(out, reader); err != nil {
				out.Close()
				return nil, err
			}
			if err := out.Close(); err != nil {
				return nil, err
			}
		default:
			return nil, fmt.Errorf("snapshot archive entry type is not supported: %s", header.Name)
		}
	}

	manifestPath := filepath.Join(stageDir, filepath.FromSlash(snapshotManifestPath))
	manifestBytes, err := os.ReadFile(manifestPath)
	if err != nil {
		return nil, fmt.Errorf("read snapshot manifest: %w", err)
	}
	var manifest snapshotManifest
	if err := json.Unmarshal(manifestBytes, &manifest); err != nil {
		return nil, fmt.Errorf("decode snapshot manifest: %w", err)
	}
	if manifest.FormatVersion == "" {
		return nil, fmt.Errorf("snapshot manifest format_version is required")
	}
	for _, entry := range manifest.Entries {
		if entry.ArchivePath == "" {
			return nil, fmt.Errorf("snapshot manifest contains empty archive_path")
		}
		if _, err := os.Stat(filepath.Join(stageDir, filepath.FromSlash(entry.ArchivePath))); err != nil {
			return nil, fmt.Errorf("snapshot entry missing after extract: %s", entry.ArchivePath)
		}
	}

	if _, err := os.Stat(targetDir); err == nil {
		if err := os.Remove(targetDir); err != nil {
			return nil, err
		}
	}
	if err := os.Rename(stageDir, targetDir); err != nil {
		return nil, err
	}
	return &manifest, nil
}

func validateSnapshotArchivePath(raw string) (string, error) {
	cleaned := path.Clean(strings.TrimSpace(raw))
	switch {
	case cleaned == ".":
		return "", fmt.Errorf("snapshot archive entry has invalid path %q", raw)
	case strings.HasPrefix(cleaned, "/"):
		return "", fmt.Errorf("snapshot archive entry must be relative: %s", raw)
	case cleaned == "..":
		return "", fmt.Errorf("snapshot archive entry escapes target directory: %s", raw)
	case strings.HasPrefix(cleaned, "../"):
		return "", fmt.Errorf("snapshot archive entry escapes target directory: %s", raw)
	default:
		return cleaned, nil
	}
}

func snapshotDestinationPath(root string, archivePath string) (string, error) {
	dest := filepath.Join(root, filepath.FromSlash(archivePath))
	rel, err := filepath.Rel(root, dest)
	if err != nil {
		return "", err
	}
	if rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", fmt.Errorf("snapshot archive entry escapes target directory: %s", archivePath)
	}
	return dest, nil
}

func ensureSnapshotRestoreTarget(targetDir string) error {
	info, err := os.Stat(targetDir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	if !info.IsDir() {
		return fmt.Errorf("restore target must be a directory: %s", targetDir)
	}
	entries, err := os.ReadDir(targetDir)
	if err != nil {
		return err
	}
	if len(entries) > 0 {
		return fmt.Errorf("restore target directory must be empty: %s", targetDir)
	}
	return nil
}

func defaultSnapshotArchiveRootName(cwd string, targets []snapshotNormalizedTarget) string {
	for _, target := range targets {
		if target.ArchiveBase == "" {
			base := filepath.Base(cwd)
			if base != "." && base != string(filepath.Separator) {
				return base
			}
		}
		if target.ArchiveBase != "" {
			return path.Base(target.ArchiveBase)
		}
	}
	return ""
}
