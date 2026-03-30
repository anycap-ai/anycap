// Package projectconfig reads and writes anycap.toml, a project-level
// configuration file that binds a working directory to AnyCap resources
// (page sites, drive folders). The file is safe to commit to version control.
package projectconfig

import (
	"os"

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
	SiteID string `toml:"site_id,omitempty"`
	Name   string `toml:"name,omitempty"`
}

// DriveConfig holds drive folder bindings.
type DriveConfig struct {
	FolderID string `toml:"folder_id,omitempty"`
	Path     string `toml:"path,omitempty"`
}

// Load reads anycap.toml from the current working directory.
// Returns a zero Config (no error) if the file does not exist.
func Load() (*Config, error) {
	var cfg Config
	if _, err := toml.DecodeFile(Filename, &cfg); err != nil {
		if os.IsNotExist(err) {
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

// SavePage updates only the [page] section, preserving other sections.
func SavePage(page PageConfig) error {
	cfg, err := Load()
	if err != nil {
		return err
	}
	cfg.Page = &page
	return Save(cfg)
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
