package command

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func TestSkillCheckUpToDate(t *testing.T) {
	dir := t.TempDir()
	skillFile := filepath.Join(dir, "SKILL.md")

	content := "---\nname: test\nmetadata:\n  version: " + buildinfo.Version + "\n---\n# Test\n"
	if err := os.WriteFile(skillFile, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	var stdout, stderr bytes.Buffer
	root := NewRootCmd(Options{
		BuildInfo: buildinfo.Current(),
		Stdout:    &stdout,
		Stderr:    &stderr,
	})
	root.SetArgs([]string{"skill", "check", "--target", skillFile})

	if err := root.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	var result map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
		t.Fatalf("invalid JSON output: %v\nraw: %s", err, stdout.String())
	}

	if result["status"] != "up_to_date" {
		t.Errorf("expected up_to_date, got %v", result["status"])
	}
}

func TestSkillCheckNotInstalled(t *testing.T) {
	var stdout, stderr bytes.Buffer
	root := NewRootCmd(Options{
		BuildInfo: buildinfo.Current(),
		Stdout:    &stdout,
		Stderr:    &stderr,
	})
	root.SetArgs([]string{"skill", "check", "--target", "/nonexistent/path/SKILL.md"})

	if err := root.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	var result map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
		t.Fatalf("invalid JSON output: %v\nraw: %s", err, stdout.String())
	}

	if result["status"] != "not_installed" {
		t.Errorf("expected not_installed, got %v", result["status"])
	}
}

func TestSkillCheckSkillOutdated(t *testing.T) {
	// Temporarily set buildinfo.Version to simulate a newer CLI.
	orig := buildinfo.Version
	buildinfo.Version = "99.0.0"
	defer func() { buildinfo.Version = orig }()

	dir := t.TempDir()
	skillFile := filepath.Join(dir, "SKILL.md")
	content := "---\nname: test\nmetadata:\n  version: 0.0.1\n---\n# Test\n"
	if err := os.WriteFile(skillFile, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	var stdout, stderr bytes.Buffer
	root := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "99.0.0"},
		Stdout:    &stdout,
		Stderr:    &stderr,
	})
	root.SetArgs([]string{"skill", "check", "--target", skillFile})

	if err := root.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	var result map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
		t.Fatalf("invalid JSON: %v\nraw: %s", err, stdout.String())
	}

	if result["status"] != "skill_outdated" {
		t.Errorf("expected skill_outdated, got %v", result["status"])
	}
	if result["skill_version"] != "0.0.1" {
		t.Errorf("expected skill_version 0.0.1, got %v", result["skill_version"])
	}
}

func TestSkillCheckCLIOutdated(t *testing.T) {
	orig := buildinfo.Version
	buildinfo.Version = "0.0.1"
	defer func() { buildinfo.Version = orig }()

	dir := t.TempDir()
	skillFile := filepath.Join(dir, "SKILL.md")
	content := "---\nname: test\nmetadata:\n  version: 99.0.0\n---\n# Test\n"
	if err := os.WriteFile(skillFile, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	var stdout, stderr bytes.Buffer
	root := NewRootCmd(Options{
		BuildInfo: buildinfo.Info{Version: "0.0.1"},
		Stdout:    &stdout,
		Stderr:    &stderr,
	})
	root.SetArgs([]string{"skill", "check", "--target", skillFile})

	if err := root.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	var result map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
		t.Fatalf("invalid JSON: %v\nraw: %s", err, stdout.String())
	}

	if result["status"] != "cli_outdated" {
		t.Errorf("expected cli_outdated, got %v", result["status"])
	}
}

func TestSkillCheckTargetDirectory(t *testing.T) {
	dir := t.TempDir()
	skillFile := filepath.Join(dir, "SKILL.md")
	content := "---\nname: test\nmetadata:\n  version: " + buildinfo.Version + "\n---\n"
	if err := os.WriteFile(skillFile, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	var stdout, stderr bytes.Buffer
	root := NewRootCmd(Options{
		BuildInfo: buildinfo.Current(),
		Stdout:    &stdout,
		Stderr:    &stderr,
	})
	// Pass directory, not file -- should auto-resolve to SKILL.md inside.
	root.SetArgs([]string{"skill", "check", "--target", dir})

	if err := root.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	var result map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["status"] != "up_to_date" {
		t.Errorf("expected up_to_date, got %v", result["status"])
	}
}

func TestSkillShow(t *testing.T) {
	var stdout, stderr bytes.Buffer
	root := NewRootCmd(Options{
		BuildInfo: buildinfo.Current(),
		Stdout:    &stdout,
		Stderr:    &stderr,
	})
	root.SetArgs([]string{"skill", "show"})

	if err := root.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if stdout.Len() == 0 {
		t.Fatal("show output is empty")
	}

	// Should contain YAML front matter.
	if !bytes.Contains(stdout.Bytes(), []byte("metadata:")) {
		t.Error("show output missing metadata block")
	}
}

func TestSkillCheckMissingTarget(t *testing.T) {
	var stdout, stderr bytes.Buffer
	root := NewRootCmd(Options{
		BuildInfo: buildinfo.Current(),
		Stdout:    &stdout,
		Stderr:    &stderr,
	})
	root.SetArgs([]string{"skill", "check"})

	err := root.Execute()
	if err == nil {
		t.Fatal("expected error for missing --target")
	}
}
