package skill

import (
	"bufio"
	_ "embed"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

//go:embed embedded/yaacli/anycap-cli/SKILL.md
var EmbeddedSkill string

// SkillsRepo is the public GitHub repository for AnyCap skill files.
const SkillsRepo = "https://github.com/anycap-ai/anycap-skills.git"

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
func CompareVersions(a, b string) int {
	if a == b {
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

// Install clones the skills repo from GitHub and copies files to target.
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

	return "github", copyRepoFiles(tmpDir, target)
}

func installEmbedded(target string) error {
	if err := os.MkdirAll(target, 0755); err != nil {
		return fmt.Errorf("create directory %s: %w", target, err)
	}
	return os.WriteFile(filepath.Join(target, "SKILL.md"), []byte(EmbeddedSkill), 0644)
}

func copyRepoFiles(repoDir, target string) error {
	if err := os.MkdirAll(target, 0755); err != nil {
		return fmt.Errorf("create target directory: %w", err)
	}

	return filepath.WalkDir(repoDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		rel, err := filepath.Rel(repoDir, path)
		if err != nil {
			return err
		}

		// Skip .git directory.
		if rel == ".git" || strings.HasPrefix(rel, ".git/") {
			if d.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		dst := filepath.Join(target, rel)
		if d.IsDir() {
			return os.MkdirAll(dst, 0755)
		}

		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		return os.WriteFile(dst, data, 0644)
	})
}
