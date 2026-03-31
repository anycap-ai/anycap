// Package projectconfig reads and writes anycap.toml, a project-level
// configuration file that binds a working directory to AnyCap resources
// (page sites, drive folders). The file is safe to commit to version control.
package projectconfig

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/BurntSushi/toml"
)

// Filename is the project config file name looked up in the working directory.
const Filename = "anycap.toml"

// Config is the top-level project configuration.
type Config struct {
	Page  *PageConfig  `toml:"page,omitempty"`
	Drive *DriveConfig `toml:"drive,omitempty"`
}

// PageConfig holds page site bindings.
type PageConfig struct {
	SiteID  string                `toml:"site_id,omitempty"`
	Name    string                `toml:"name,omitempty"`
	Targets map[string]PageTarget `toml:"targets,omitempty"`
}

// PageTarget holds a named page site binding.
type PageTarget struct {
	SiteID string `toml:"site_id,omitempty"`
	Name   string `toml:"name,omitempty"`
}

// DriveConfig holds drive folder bindings.
type DriveConfig struct {
	FolderID string                 `toml:"folder_id,omitempty"`
	Path     string                 `toml:"path,omitempty"`
	Targets  map[string]DriveTarget `toml:"targets,omitempty"`
}

// DriveTarget holds a named drive folder binding.
type DriveTarget struct {
	FolderID string `toml:"folder_id,omitempty"`
	Path     string `toml:"path,omitempty"`
}

// Load reads anycap.toml from the current working directory.
// Returns a zero Config (no error) if the file does not exist.
func Load() (*Config, error) {
	var cfg Config
	if _, err := toml.DecodeFile(Filename, &cfg); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return &Config{}, nil
		}
		return nil, err
	}
	return &cfg, nil
}

// Save writes cfg to anycap.toml in the current working directory.
func Save(cfg *Config) error {
	f, err := os.OpenFile(Filename, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		return err
	}
	defer f.Close()

	if _, err := f.WriteString("# AnyCap project configuration\n"); err != nil {
		return err
	}
	if _, err := f.WriteString("# Safe to commit -- contains only external IDs and display names.\n\n"); err != nil {
		return err
	}
	return toml.NewEncoder(f).Encode(cfg)
}

// SavePage updates the [page] section (including targets), preserving other sections.
func SavePage(page PageConfig) error {
	cfg, err := Load()
	if err != nil {
		return err
	}
	cfg.Page = &page
	return Save(cfg)
}

// SavePageTarget updates a named target under [page.targets.<name>],
// preserving all other sections and targets.
func SavePageTarget(name string, target PageTarget) error {
	cfg, err := Load()
	if err != nil {
		return err
	}
	if cfg.Page == nil {
		cfg.Page = &PageConfig{}
	}
	if cfg.Page.Targets == nil {
		cfg.Page.Targets = make(map[string]PageTarget)
	}
	cfg.Page.Targets[name] = target
	return Save(cfg)
}

// ResolvePageTarget looks up a named target from config.
// Returns the site ID and display name.
func ResolvePageTarget(cfg *Config, targetName string) (siteID string, name string, err error) {
	if cfg.Page == nil || cfg.Page.Targets == nil {
		return "", "", fmt.Errorf("target %q not found in anycap.toml", targetName)
	}
	t, ok := cfg.Page.Targets[targetName]
	if !ok {
		return "", "", fmt.Errorf("target %q not found in anycap.toml", targetName)
	}
	if t.SiteID == "" {
		return "", "", fmt.Errorf("target %q has no site_id in anycap.toml", targetName)
	}
	return t.SiteID, t.Name, nil
}

// AutoTargetName generates a timestamp-based target name.
// Format: deploy-YYYYMMDD-HHMM
func AutoTargetName() string {
	return time.Now().Format("deploy-20060102-1504")
}

// SaveDrive updates only the [drive] section, preserving other sections.
func SaveDrive(drive DriveConfig) error {
	cfg, err := Load()
	if err != nil {
		return err
	}
	cfg.Drive = &drive
	return Save(cfg)
}

// SaveDriveTarget updates a named target under [drive.targets.<name>],
// preserving all other sections and targets.
func SaveDriveTarget(name string, target DriveTarget) error {
	cfg, err := Load()
	if err != nil {
		return err
	}
	if cfg.Drive == nil {
		cfg.Drive = &DriveConfig{}
	}
	if cfg.Drive.Targets == nil {
		cfg.Drive.Targets = make(map[string]DriveTarget)
	}
	cfg.Drive.Targets[name] = target
	return Save(cfg)
}

// ResolveDriveTarget looks up a named drive target from config.
// Returns the folder ID and path.
func ResolveDriveTarget(cfg *Config, targetName string) (folderID string, path string, err error) {
	if cfg.Drive == nil || cfg.Drive.Targets == nil {
		return "", "", fmt.Errorf("drive target %q not found in anycap.toml", targetName)
	}
	t, ok := cfg.Drive.Targets[targetName]
	if !ok {
		return "", "", fmt.Errorf("drive target %q not found in anycap.toml", targetName)
	}
	return t.FolderID, t.Path, nil
}
