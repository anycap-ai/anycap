package projectconfig

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadMissing(t *testing.T) {
	dir := t.TempDir()
	origDir, _ := os.Getwd()
	defer os.Chdir(origDir)
	os.Chdir(dir)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load missing file: %v", err)
	}
	if cfg.Page != nil {
		t.Errorf("expected nil Page, got %+v", cfg.Page)
	}
	if cfg.Drive != nil {
		t.Errorf("expected nil Drive, got %+v", cfg.Drive)
	}
}

func TestLoadFullConfig(t *testing.T) {
	dir := t.TempDir()
	origDir, _ := os.Getwd()
	defer os.Chdir(origDir)
	os.Chdir(dir)

	content := `
[page]
site_id = "pg_abc123"
name = "My Site"

[drive]
folder_id = "dn_xyz789"
path = "/docs"
`
	os.WriteFile(Filename, []byte(content), 0644)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}

	if cfg.Page == nil {
		t.Fatal("expected Page section")
	}
	if cfg.Page.SiteID != "pg_abc123" {
		t.Errorf("SiteID = %q, want %q", cfg.Page.SiteID, "pg_abc123")
	}
	if cfg.Page.Name != "My Site" {
		t.Errorf("Name = %q, want %q", cfg.Page.Name, "My Site")
	}

	if cfg.Drive == nil {
		t.Fatal("expected Drive section")
	}
	if cfg.Drive.FolderID != "dn_xyz789" {
		t.Errorf("FolderID = %q, want %q", cfg.Drive.FolderID, "dn_xyz789")
	}
	if cfg.Drive.Path != "/docs" {
		t.Errorf("Path = %q, want %q", cfg.Drive.Path, "/docs")
	}
}

func TestSaveRoundTrip(t *testing.T) {
	dir := t.TempDir()
	origDir, _ := os.Getwd()
	defer os.Chdir(origDir)
	os.Chdir(dir)

	original := &Config{
		Page: &PageConfig{
			SiteID: "pg_test1",
			Name:   "Test Site",
		},
		Drive: &DriveConfig{
			FolderID: "dn_test2",
			Path:     "/assets",
		},
	}

	if err := Save(original); err != nil {
		t.Fatalf("Save: %v", err)
	}

	// Verify file exists with correct permissions
	info, err := os.Stat(filepath.Join(dir, Filename))
	if err != nil {
		t.Fatalf("Stat: %v", err)
	}
	if info.Mode().Perm() != 0644 {
		t.Errorf("permissions = %o, want 0644", info.Mode().Perm())
	}

	loaded, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}

	if loaded.Page == nil || loaded.Page.SiteID != "pg_test1" || loaded.Page.Name != "Test Site" {
		t.Errorf("Page round-trip failed: %+v", loaded.Page)
	}
	if loaded.Drive == nil || loaded.Drive.FolderID != "dn_test2" || loaded.Drive.Path != "/assets" {
		t.Errorf("Drive round-trip failed: %+v", loaded.Drive)
	}
}

func TestSavePagePreservesDrive(t *testing.T) {
	dir := t.TempDir()
	origDir, _ := os.Getwd()
	defer os.Chdir(origDir)
	os.Chdir(dir)

	// Write initial config with drive section
	initial := &Config{
		Drive: &DriveConfig{
			FolderID: "dn_keep",
			Path:     "/keep-me",
		},
	}
	if err := Save(initial); err != nil {
		t.Fatalf("Save initial: %v", err)
	}

	// SavePage should preserve drive
	if err := SavePage(PageConfig{SiteID: "pg_new", Name: "New Site"}); err != nil {
		t.Fatalf("SavePage: %v", err)
	}

	loaded, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if loaded.Page == nil || loaded.Page.SiteID != "pg_new" {
		t.Errorf("Page not saved: %+v", loaded.Page)
	}
	if loaded.Drive == nil || loaded.Drive.FolderID != "dn_keep" || loaded.Drive.Path != "/keep-me" {
		t.Errorf("Drive section lost: %+v", loaded.Drive)
	}
}

func TestSaveDrivePreservesPage(t *testing.T) {
	dir := t.TempDir()
	origDir, _ := os.Getwd()
	defer os.Chdir(origDir)
	os.Chdir(dir)

	// Write initial config with page section
	initial := &Config{
		Page: &PageConfig{
			SiteID: "pg_keep",
			Name:   "Keep Me",
		},
	}
	if err := Save(initial); err != nil {
		t.Fatalf("Save initial: %v", err)
	}

	// SaveDrive should preserve page
	if err := SaveDrive(DriveConfig{FolderID: "dn_new", Path: "/new"}); err != nil {
		t.Fatalf("SaveDrive: %v", err)
	}

	loaded, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if loaded.Drive == nil || loaded.Drive.FolderID != "dn_new" {
		t.Errorf("Drive not saved: %+v", loaded.Drive)
	}
	if loaded.Page == nil || loaded.Page.SiteID != "pg_keep" || loaded.Page.Name != "Keep Me" {
		t.Errorf("Page section lost: %+v", loaded.Page)
	}
}

func TestSavePageCreatesFile(t *testing.T) {
	dir := t.TempDir()
	origDir, _ := os.Getwd()
	defer os.Chdir(origDir)
	os.Chdir(dir)

	// No anycap.toml exists yet
	if err := SavePage(PageConfig{SiteID: "pg_first", Name: "First"}); err != nil {
		t.Fatalf("SavePage on new file: %v", err)
	}

	loaded, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if loaded.Page == nil || loaded.Page.SiteID != "pg_first" {
		t.Errorf("Page not created: %+v", loaded.Page)
	}
	if loaded.Drive != nil {
		t.Errorf("Drive should be nil, got %+v", loaded.Drive)
	}
}

func TestSaveContainsHeader(t *testing.T) {
	dir := t.TempDir()
	origDir, _ := os.Getwd()
	defer os.Chdir(origDir)
	os.Chdir(dir)

	Save(&Config{Page: &PageConfig{SiteID: "pg_x"}})

	data, err := os.ReadFile(Filename)
	if err != nil {
		t.Fatalf("ReadFile: %v", err)
	}
	content := string(data)
	if !contains(content, "# AnyCap project configuration") {
		t.Error("missing header comment")
	}
	if !contains(content, "Safe to commit") {
		t.Error("missing safety comment")
	}
}

func TestLoadInvalidTOML(t *testing.T) {
	dir := t.TempDir()
	origDir, _ := os.Getwd()
	defer os.Chdir(origDir)
	os.Chdir(dir)

	os.WriteFile(Filename, []byte("not valid [[ toml"), 0644)

	_, err := Load()
	if err == nil {
		t.Fatal("expected error for invalid TOML")
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsSubstr(s, substr))
}

func containsSubstr(s, substr string) bool {
	for i := 0; i+len(substr) <= len(s); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
