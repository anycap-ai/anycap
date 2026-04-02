package config

import (
	"fmt"
	"testing"
)

type fakeStorageQuotaDConfContainer struct {
	current *StorageQuotaDConfConfig
}

func (f fakeStorageQuotaDConfContainer) Get() *StorageQuotaDConfConfig {
	return f.current
}

func TestStorageQuotaProvider_UseCodeDefaultsWhenDConfDisabledAndNoEnv(t *testing.T) {
	provider := NewStorageQuotaProvider(Config{StorageQuotaDConfEnabled: false})

	q := provider.ResolveQuota(nil)
	if q.StorageQuotaBytes != defaultStorageQuotaBytes {
		t.Fatalf("expected default %d, got %d", defaultStorageQuotaBytes, q.StorageQuotaBytes)
	}
	if q.MaxDriveFileSizeBytes != defaultMaxDriveFileSizeBytes {
		t.Fatalf("expected default %d, got %d", defaultMaxDriveFileSizeBytes, q.MaxDriveFileSizeBytes)
	}
	if q.MaxDriveNodes != defaultMaxDriveNodes {
		t.Fatalf("expected default %d, got %d", defaultMaxDriveNodes, q.MaxDriveNodes)
	}
	if q.MaxPageSites != defaultMaxPageSites {
		t.Fatalf("expected default %d, got %d", defaultMaxPageSites, q.MaxPageSites)
	}
	if q.MaxPageVersionsPerSite != defaultMaxPageVersionsPerSite {
		t.Fatalf("expected default %d, got %d", defaultMaxPageVersionsPerSite, q.MaxPageVersionsPerSite)
	}
	if q.MaxFilesPerPageVersion != defaultMaxFilesPerPageVersion {
		t.Fatalf("expected default %d, got %d", defaultMaxFilesPerPageVersion, q.MaxFilesPerPageVersion)
	}
	if q.MaxPendingDriveSessions != defaultMaxPendingDriveSessions {
		t.Fatalf("expected default %d, got %d", defaultMaxPendingDriveSessions, q.MaxPendingDriveSessions)
	}
	if q.MaxPendingPageSessions != defaultMaxPendingPageSessions {
		t.Fatalf("expected default %d, got %d", defaultMaxPendingPageSessions, q.MaxPendingPageSessions)
	}
}

func TestStorageQuotaProvider_EnvOverridesCodeDefaults(t *testing.T) {
	provider := NewStorageQuotaProvider(Config{
		StorageQuotaDConfEnabled: false,
		StorageQuotaBytes:        5 * 1024 * 1024 * 1024,
		MaxDriveFileSizeBytes:    256 * 1024 * 1024,
		MaxDriveNodes:            500,
		MaxPageSites:             10,
	})

	q := provider.ResolveQuota(nil)
	if q.StorageQuotaBytes != 5*1024*1024*1024 {
		t.Fatalf("expected 5GB, got %d", q.StorageQuotaBytes)
	}
	if q.MaxDriveFileSizeBytes != 256*1024*1024 {
		t.Fatalf("expected 256MB, got %d", q.MaxDriveFileSizeBytes)
	}
	if q.MaxDriveNodes != 500 {
		t.Fatalf("expected 500, got %d", q.MaxDriveNodes)
	}
	if q.MaxPageSites != 10 {
		t.Fatalf("expected 10, got %d", q.MaxPageSites)
	}
	// Unset fields should use code defaults
	if q.MaxPageAssetSizeBytes != defaultMaxPageAssetSizeBytes {
		t.Fatalf("expected default %d for unset field, got %d", defaultMaxPageAssetSizeBytes, q.MaxPageAssetSizeBytes)
	}
}

func TestStorageQuotaProvider_DConfOverridesEnv(t *testing.T) {
	originalLoader := loadStorageQuotaDConfContainer
	t.Cleanup(func() { loadStorageQuotaDConfContainer = originalLoader })

	loadStorageQuotaDConfContainer = func(cfg Config) (StorageQuotaDConfContainer, error) {
		return fakeStorageQuotaDConfContainer{
			current: &StorageQuotaDConfConfig{
				StorageQuotaBytes:       20 * 1024 * 1024 * 1024,
				MaxDriveFileSizeBytes:   2 * 1024 * 1024 * 1024,
				MaxDriveNodes:           99999,
				MaxPageAssetSizeBytes:   1024 * 1024 * 1024,
				MaxPageSites:            200,
				MaxPageVersionsPerSite:  500,
				MaxFilesPerPageVersion:  5000,
				MaxPendingDriveSessions: 100,
				MaxPendingPageSessions:  200,
			},
		}, nil
	}

	provider := NewStorageQuotaProvider(Config{
		StorageQuotaDConfEnabled: true,
		StorageQuotaBytes:        5 * 1024 * 1024 * 1024, // env: 5GB
	})

	q := provider.ResolveQuota(nil)
	if q.StorageQuotaBytes != 20*1024*1024*1024 {
		t.Fatalf("expected dconf 20GB, got %d", q.StorageQuotaBytes)
	}
	if q.MaxDriveNodes != 99999 {
		t.Fatalf("expected dconf 99999, got %d", q.MaxDriveNodes)
	}
	if q.MaxPageSites != 200 {
		t.Fatalf("expected dconf 200, got %d", q.MaxPageSites)
	}
}

func TestStorageQuotaProvider_DConfLoadFailureFallsBackToEnv(t *testing.T) {
	originalLoader := loadStorageQuotaDConfContainer
	t.Cleanup(func() { loadStorageQuotaDConfContainer = originalLoader })

	loadStorageQuotaDConfContainer = func(cfg Config) (StorageQuotaDConfContainer, error) {
		return nil, errForTest
	}

	provider := NewStorageQuotaProvider(Config{
		StorageQuotaDConfEnabled: true,
		StorageQuotaBytes:        7 * 1024 * 1024 * 1024,
	})

	q := provider.ResolveQuota(nil)
	if q.StorageQuotaBytes != 7*1024*1024*1024 {
		t.Fatalf("expected env fallback 7GB, got %d", q.StorageQuotaBytes)
	}
}

func TestStorageQuotaProvider_DConfContainerReturnsNilFallsBackToEnv(t *testing.T) {
	provider := NewStorageQuotaProviderWithContainer(
		Config{
			StorageQuotaDConfEnabled: true,
			MaxDriveNodes:            777,
		},
		fakeStorageQuotaDConfContainer{current: nil},
	)

	q := provider.ResolveQuota(nil)
	if q.MaxDriveNodes != 777 {
		t.Fatalf("expected env fallback 777, got %d", q.MaxDriveNodes)
	}
}

func TestStorageQuotaProvider_NilProviderReturnsCodeDefaults(t *testing.T) {
	var provider *StorageQuotaProvider
	q := provider.ResolveQuota(nil)
	if q.StorageQuotaBytes != defaultStorageQuotaBytes {
		t.Fatalf("expected code default %d, got %d", defaultStorageQuotaBytes, q.StorageQuotaBytes)
	}
}

var errForTest = fmt.Errorf("test dconf load error")
