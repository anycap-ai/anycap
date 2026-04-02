package config

import (
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/dconf"
	"gitlab.knoffice.tech/open/common-go/logging"
)

// Code-level safe defaults for the preview period.
const (
	defaultStorageQuotaBytes       int64 = 10 * 1024 * 1024 * 1024 // 10 GB
	defaultMaxDriveFileSizeBytes   int64 = 1024 * 1024 * 1024      // 1 GB
	defaultMaxDriveNodes           int   = 10000
	defaultMaxPageAssetSizeBytes   int64 = 512 * 1024 * 1024 // 512 MB
	defaultMaxPageSites            int   = 50
	defaultMaxPageVersionsPerSite  int   = 200
	defaultMaxFilesPerPageVersion  int   = 2000
	defaultMaxPendingDriveSessions int   = 50
	defaultMaxPendingPageSessions  int   = 100

	defaultStorageQuotaDConfGroup  = "anycap"
	defaultStorageQuotaDConfDataID = "storage_quota"
)

// StorageQuotaDConfConfig is the JSON shape of the dconf payload.
type StorageQuotaDConfConfig struct {
	StorageQuotaBytes       int64 `json:"storage_quota_bytes"`
	MaxDriveFileSizeBytes   int64 `json:"max_drive_file_size_bytes"`
	MaxDriveNodes           int   `json:"max_drive_nodes"`
	MaxPageAssetSizeBytes   int64 `json:"max_page_asset_size_bytes"`
	MaxPageSites            int   `json:"max_page_sites"`
	MaxPageVersionsPerSite  int   `json:"max_page_versions_per_site"`
	MaxFilesPerPageVersion  int   `json:"max_files_per_page_version"`
	MaxPendingDriveSessions int   `json:"max_pending_drive_sessions"`
	MaxPendingPageSessions  int   `json:"max_pending_page_sessions"`
}

// StorageQuotaDConfContainer provides access to the latest dconf config.
type StorageQuotaDConfContainer interface {
	Get() *StorageQuotaDConfConfig
}

// StorageQuotaProvider resolves quota limits for a user.
// Implements port.StorageQuotaProvider.
type StorageQuotaProvider struct {
	fallback  Config
	container StorageQuotaDConfContainer
}

var loadStorageQuotaDConfContainer = func(cfg Config) (StorageQuotaDConfContainer, error) {
	return dconf.LoadJson[StorageQuotaDConfConfig](cfg.StorageQuotaDConfGroup, cfg.StorageQuotaDConfDataID)
}

// NewStorageQuotaProvider creates a StorageQuotaProvider.
// If dconf is enabled, it loads the container; otherwise falls back to env/code defaults.
func NewStorageQuotaProvider(cfg Config) *StorageQuotaProvider {
	if !cfg.StorageQuotaDConfEnabled {
		return &StorageQuotaProvider{fallback: cfg}
	}

	container, err := loadStorageQuotaDConfContainer(cfg)
	if err != nil {
		logging.WithError(err).WithFields(logging.Fields{
			"group":   cfg.StorageQuotaDConfGroup,
			"data_id": cfg.StorageQuotaDConfDataID,
		}).Warn("storage-quota failed to load dconf config; using env fallback")
		return &StorageQuotaProvider{fallback: cfg}
	}

	logging.WithFields(logging.Fields{
		"group":   cfg.StorageQuotaDConfGroup,
		"data_id": cfg.StorageQuotaDConfDataID,
	}).Info("storage-quota using dconf config")
	logStorageQuotaDConfSnapshot(cfg, container)
	return &StorageQuotaProvider{
		fallback:  cfg,
		container: container,
	}
}

// NewStorageQuotaProviderWithContainer creates a provider with a pre-built container (for testing).
func NewStorageQuotaProviderWithContainer(cfg Config, container StorageQuotaDConfContainer) *StorageQuotaProvider {
	return &StorageQuotaProvider{
		fallback:  cfg,
		container: container,
	}
}

// ResolveQuota returns the resolved storage quota for the given principal.
// For the preview period, the principal is ignored (uniform limits for all users).
func (p *StorageQuotaProvider) ResolveQuota(principal *model.Principal) model.StorageQuota {
	if p == nil {
		return envFallbackQuota(Config{})
	}

	if p.fallback.StorageQuotaDConfEnabled {
		if q, ok := p.resolveFromDConf(); ok {
			return q
		}
	}

	return envFallbackQuota(p.fallback)
}

func (p *StorageQuotaProvider) resolveFromDConf() (model.StorageQuota, bool) {
	if p.container == nil {
		return model.StorageQuota{}, false
	}

	current := p.container.Get()
	if current == nil {
		return model.StorageQuota{}, false
	}

	return model.StorageQuota{
		StorageQuotaBytes:       current.StorageQuotaBytes,
		MaxDriveFileSizeBytes:   current.MaxDriveFileSizeBytes,
		MaxDriveNodes:           current.MaxDriveNodes,
		MaxPageAssetSizeBytes:   current.MaxPageAssetSizeBytes,
		MaxPageSites:            current.MaxPageSites,
		MaxPageVersionsPerSite:  current.MaxPageVersionsPerSite,
		MaxFilesPerPageVersion:  current.MaxFilesPerPageVersion,
		MaxPendingDriveSessions: current.MaxPendingDriveSessions,
		MaxPendingPageSessions:  current.MaxPendingPageSessions,
	}, true
}

// envFallbackQuota resolves quota from Config env fields with code-level defaults.
func envFallbackQuota(cfg Config) model.StorageQuota {
	return model.StorageQuota{
		StorageQuotaBytes:       fallbackInt64(cfg.StorageQuotaBytes, defaultStorageQuotaBytes),
		MaxDriveFileSizeBytes:   fallbackInt64(cfg.MaxDriveFileSizeBytes, defaultMaxDriveFileSizeBytes),
		MaxDriveNodes:           fallbackInt(cfg.MaxDriveNodes, defaultMaxDriveNodes),
		MaxPageAssetSizeBytes:   fallbackInt64(cfg.MaxPageAssetSizeBytes, defaultMaxPageAssetSizeBytes),
		MaxPageSites:            fallbackInt(cfg.MaxPageSites, defaultMaxPageSites),
		MaxPageVersionsPerSite:  fallbackInt(cfg.MaxPageVersionsPerSite, defaultMaxPageVersionsPerSite),
		MaxFilesPerPageVersion:  fallbackInt(cfg.MaxFilesPerPageVersion, defaultMaxFilesPerPageVersion),
		MaxPendingDriveSessions: fallbackInt(cfg.MaxPendingDriveSessions, defaultMaxPendingDriveSessions),
		MaxPendingPageSessions:  fallbackInt(cfg.MaxPendingPageSessions, defaultMaxPendingPageSessions),
	}
}

func fallbackInt64(value int64, defaultValue int64) int64 {
	if value > 0 {
		return value
	}
	return defaultValue
}

func fallbackInt(value int, defaultValue int) int {
	if value > 0 {
		return value
	}
	return defaultValue
}

func logStorageQuotaDConfSnapshot(cfg Config, container StorageQuotaDConfContainer) {
	if container == nil {
		return
	}
	current := container.Get()
	if current == nil {
		logging.WithFields(logging.Fields{
			"group":   cfg.StorageQuotaDConfGroup,
			"data_id": cfg.StorageQuotaDConfDataID,
		}).Warn("storage-quota dconf snapshot unavailable")
		return
	}
	payload, err := json.Marshal(current)
	if err != nil {
		logging.WithError(err).WithFields(logging.Fields{
			"group":   cfg.StorageQuotaDConfGroup,
			"data_id": cfg.StorageQuotaDConfDataID,
		}).Warn("storage-quota failed to marshal dconf snapshot")
		return
	}
	logging.WithFields(logging.Fields{
		"group":   cfg.StorageQuotaDConfGroup,
		"data_id": cfg.StorageQuotaDConfDataID,
		"payload": string(payload),
	}).Info("storage-quota dconf snapshot")
}
