package skill

import (
	"os"
	"path/filepath"
	"testing"
)

func TestParseVersionFromContent(t *testing.T) {
	tests := []struct {
		name    string
		content string
		want    string
		wantErr bool
	}{
		{
			name: "quoted version string",
			content: `---
name: anycap-cli
metadata:
  version: "0.2.0"
---
# Content`,
			want: "0.2.0",
		},
		{
			name: "dev version",
			content: `---
name: anycap-cli
metadata:
  version: "dev"
---`,
			want: "dev",
		},
		{
			name: "valid yaacli front matter",
			content: `---
name: anycap-cli
description: test
metadata:
  version: 0.2.0
---
# Content`,
			want: "0.2.0",
		},
		{
			name: "version with extra fields",
			content: `---
name: anycap-cli
metadata:
  version: 1.0.0
  author: test
---`,
			want: "1.0.0",
		},
		{
			name:    "no front matter",
			content: "# Just markdown\nNo front matter here.",
			wantErr: true,
		},
		{
			name: "no metadata block",
			content: `---
name: anycap-cli
description: test
---`,
			wantErr: true,
		},
		{
			name: "no version in metadata",
			content: `---
name: anycap-cli
metadata:
  author: test
---`,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ParseVersionFromContent(tt.content)
			if tt.wantErr {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != tt.want {
				t.Errorf("got %q, want %q", got, tt.want)
			}
		})
	}
}

func TestCompareVersions(t *testing.T) {
	tests := []struct {
		a, b string
		want int
	}{
		{"0.1.0", "0.1.0", 0},
		{"0.1.0", "0.2.0", -1},
		{"0.2.0", "0.1.0", 1},
		{"1.0.0", "0.9.0", 1},
		{"0.9.0", "0.10.0", -1},
		{"1.0.0", "1.0.1", -1},
		{"v1.0.0", "1.0.0", 0},
		{"0.0.1", "0.0.1", 0},
		{"dev", "0.1.0", 0},
		{"0.1.0", "dev", 0},
		{"dev", "dev", 0},
	}

	for _, tt := range tests {
		t.Run(tt.a+"_vs_"+tt.b, func(t *testing.T) {
			got := CompareVersions(tt.a, tt.b)
			if got != tt.want {
				t.Errorf("CompareVersions(%q, %q) = %d, want %d", tt.a, tt.b, got, tt.want)
			}
		})
	}
}

func TestParseVersion(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "SKILL.md")

	content := `---
name: test
metadata:
  version: 0.3.0
---
# Test`

	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	got, err := ParseVersion(path)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != "0.3.0" {
		t.Errorf("got %q, want %q", got, "0.3.0")
	}
}

func TestParseVersionFileNotFound(t *testing.T) {
	_, err := ParseVersion("/nonexistent/SKILL.md")
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}

func TestResolveSkillPath(t *testing.T) {
	dir := t.TempDir()
	skillFile := filepath.Join(dir, "SKILL.md")
	if err := os.WriteFile(skillFile, []byte("test"), 0644); err != nil {
		t.Fatal(err)
	}

	got := ResolveSkillPath(dir)
	if got != filepath.Join(dir, "SKILL.md") {
		t.Errorf("directory: got %q, want %q", got, filepath.Join(dir, "SKILL.md"))
	}

	got = ResolveSkillPath(skillFile)
	if got != skillFile {
		t.Errorf("file: got %q, want %q", got, skillFile)
	}

	got = ResolveSkillPath("/does/not/exist")
	if got != "/does/not/exist" {
		t.Errorf("nonexistent: got %q, want %q", got, "/does/not/exist")
	}
}

func TestEmbeddedSkill(t *testing.T) {
	data, err := embeddedSkills.ReadFile("embedded/anycap-cli/SKILL.md")
	if err != nil {
		t.Fatalf("embedded SKILL.md not found: %v", err)
	}
	if len(data) == 0 {
		t.Fatal("embedded skill content is empty")
	}

	if _, err := ParseVersionFromContent(string(data)); err != nil {
		t.Fatalf("embedded content has no parseable version: %v", err)
	}
}

func TestEmbeddedSkillReferences(t *testing.T) {
	refs := []string{
		"embedded/anycap-cli/references/generation.md",
		"embedded/anycap-cli/references/actions.md",
	}
	for _, ref := range refs {
		data, err := embeddedSkills.ReadFile(ref)
		if err != nil {
			t.Fatalf("embedded %s not found: %v", ref, err)
		}
		if len(data) == 0 {
			t.Fatalf("embedded %s is empty", ref)
		}
	}
}

func TestInstallEmbeddedFallback(t *testing.T) {
	dir := t.TempDir()
	target := filepath.Join(dir, "skills")

	source, err := Install(target)
	if err != nil {
		t.Fatalf("Install failed: %v", err)
	}

	skillPath := filepath.Join(target, "anycap-cli", "SKILL.md")
	data, err := os.ReadFile(skillPath)
	if err != nil {
		t.Fatalf("SKILL.md not found at %s: %v", skillPath, err)
	}
	if len(data) == 0 {
		t.Fatal("SKILL.md is empty")
	}

	// LICENSE should also be installed.
	licensePath := filepath.Join(target, "LICENSE")
	if _, err := os.Stat(licensePath); os.IsNotExist(err) {
		t.Error("LICENSE not found")
	}

	if source != "github" && source != "embedded" {
		t.Errorf("unexpected source: %q", source)
	}
}
