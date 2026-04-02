package config

import (
	"crypto/rand"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// deviceIDFileName returns the device ID file name, respecting environment isolation.
func deviceIDFileName() string {
	if env := ResolvedEnvironment(); env != "" {
		return ".device_id." + env
	}
	return ".device_id"
}

// deviceIDPath returns the full path to the device ID file.
func deviceIDPath() (string, error) {
	dir, err := configDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, deviceIDFileName()), nil
}

// LoadOrCreateDeviceID returns the stored device ID, creating a random one if none exists.
// The device ID is either a user external ID (set after login) or a random UUID.
func LoadOrCreateDeviceID() string {
	path, err := deviceIDPath()
	if err != nil {
		return generateDeviceID()
	}

	data, err := os.ReadFile(path)
	if err == nil {
		if id := strings.TrimSpace(string(data)); id != "" {
			return id
		}
	}

	// Generate and persist a new device ID.
	id := generateDeviceID()
	_ = os.WriteFile(path, []byte(id+"\n"), 0600)
	return id
}

// SetDeviceUserID overwrites the device ID file with the logged-in user's external ID.
func SetDeviceUserID(userID string) {
	if userID == "" {
		return
	}
	path, err := deviceIDPath()
	if err != nil {
		return
	}
	_ = os.WriteFile(path, []byte(userID+"\n"), 0600)
}

// ResetDeviceID removes the device ID file so the next LoadOrCreateDeviceID call
// generates a fresh random ID.
func ResetDeviceID() {
	path, err := deviceIDPath()
	if err != nil {
		return
	}
	_ = os.Remove(path)
}

// generateDeviceID returns a random UUID v4 string.
func generateDeviceID() string {
	var uuid [16]byte
	_, _ = rand.Read(uuid[:])
	uuid[6] = (uuid[6] & 0x0f) | 0x40 // version 4
	uuid[8] = (uuid[8] & 0x3f) | 0x80 // variant RFC 4122
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		uuid[0:4], uuid[4:6], uuid[6:8], uuid[8:10], uuid[10:16])
}
