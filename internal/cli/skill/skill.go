package skill

import (
	"bufio"
	"embed"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

//go:embed all:embedded
var embeddedSkills embed.FS

// SkillsRepo is the public GitHub repository that contains skill files.
const SkillsRepo = "https://github.com/anycap-ai/anycap.git"

// ParseVersion reads a skill file and extracts metadata.version from YAML front matter.
func ParseVersion(path string) (string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return ParseVersionFromContent(string(data))
}

// ParseVersionFromContent extracts metadata.version from YAML front matter content.
func ParseVersionFromContent(content string) (string, error) {
	scanner := bufio.NewScanner(strings.NewReader(content))
	inFrontMatter := false
	inMetadata := false

	for scanner.Scan() {
		line := scanner.Text()
		trimmed := strings.TrimSpace(line)

		if trimmed == "---" {
			if inFrontMatter {
				break
			}
			inFrontMatter = true
			continue
		}

		if !inFrontMatter {
			continue
		}

		if trimmed == "metadata:" {
			inMetadata = true
			continue
		}

		if inMetadata && strings.HasPrefix(trimmed, "version:") {
			v := strings.TrimPrefix(trimmed, "version:")
			v = strings.TrimSpace(v)
			v = strings.Trim(v, `"'`)
			return v, nil
		}

		// Left metadata block if line is not indented.
		if inMetadata && len(line) > 0 && line[0] != ' ' && line[0] != '\t' {
			inMetadata = false
		}
	}

	return "", fmt.Errorf("metadata.version not found")
}

// CompareVersions compares two semver version strings (without "v" prefix).
// Returns -1 if a < b, 0 if a == b, 1 if a > b.
// Non-semver values like "dev" are treated as equal to any version (returns 0).
func CompareVersions(a, b string) int {
	if a == b {
		return 0
	}
	// Treat non-semver values (e.g., "dev") as always up-to-date.
	if !isSemver(a) || !isSemver(b) {
		return 0
	}
	ap := parseSemver(a)
	bp := parseSemver(b)
	for i := 0; i < 3; i++ {
		if ap[i] < bp[i] {
			return -1
		}
		if ap[i] > bp[i] {
			return 1
		}
	}
	return 0
}

// isSemver checks if a version string looks like semver (starts with a digit).
func isSemver(v string) bool {
	v = strings.TrimPrefix(v, "v")
	if len(v) == 0 {
		return false
	}
	return v[0] >= '0' && v[0] <= '9'
}

func parseSemver(v string) [3]int {
	v = strings.TrimPrefix(v, "v")
	parts := strings.SplitN(v, ".", 3)
	var result [3]int
	for i := 0; i < len(parts) && i < 3; i++ {
		clean := strings.SplitN(parts[i], "-", 2)[0]
		n, _ := strconv.Atoi(clean)
		result[i] = n
	}
	return result
}

// ResolveSkillPath resolves a target to the actual SKILL.md file path.
// If the path is a directory, appends "SKILL.md".
func ResolveSkillPath(path string) string {
	info, err := os.Stat(path)
	if err != nil {
		return path
	}
	if info.IsDir() {
		return filepath.Join(path, "SKILL.md")
	}
	return path
}

// Install clones the skills repo from GitHub and copies the skills/ directory to target.
// Falls back to writing embedded content if git is unavailable or clone fails.
func Install(target string) (source string, err error) {
	tmpDir, err := os.MkdirTemp("", "anycap-skills-*")
	if err != nil {
		return "embedded", installEmbedded(target)
	}
	defer os.RemoveAll(tmpDir)

	gitPath, err := exec.LookPath("git")
	if err != nil {
		return "embedded", installEmbedded(target)
	}

	cmd := exec.Command(gitPath, "clone", "--depth", "1", SkillsRepo, tmpDir)
	if err := cmd.Run(); err != nil {
		return "embedded", installEmbedded(target)
	}

	// Copy only the skills/ subdirectory from the cloned repo.
	skillsDir := filepath.Join(tmpDir, "skills")
	if info, err := os.Stat(skillsDir); err == nil && info.IsDir() {
		return "github", copyDir(skillsDir, target)
	}

	// Fallback: repo has no skills/ directory, use embedded.
	return "embedded", installEmbedded(target)
}

func installEmbedded(target string) error {
	if err := os.MkdirAll(target, 0755); err != nil {
		return fmt.Errorf("create directory %s: %w", target, err)
	}

	return fs.WalkDir(embeddedSkills, "embedded", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		rel, err := filepath.Rel("embedded", path)
		if err != nil {
			return err
		}
		if rel == "." {
			return nil
		}

		dst := filepath.Join(target, rel)
		if d.IsDir() {
			return os.MkdirAll(dst, 0755)
		}

		data, err := embeddedSkills.ReadFile(path)
		if err != nil {
			return err
		}
		return os.WriteFile(dst, data, 0644)
	})
}

// copyDir copies all files from src to dst recursively.
func copyDir(src, dst string) error {
	if err := os.MkdirAll(dst, 0755); err != nil {
		return fmt.Errorf("create target directory: %w", err)
	}

	return filepath.WalkDir(src, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		rel, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		if rel == "." {
			return nil
		}

		to := filepath.Join(dst, rel)
		if d.IsDir() {
			return os.MkdirAll(to, 0755)
		}

		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		return os.WriteFile(to, data, 0644)
	})
}
