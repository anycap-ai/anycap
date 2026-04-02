package model

// StorageQuota holds resolved limits for a specific user/space.
// All values are resolved at runtime from dconf or env fallbacks.
type StorageQuota struct {
	StorageQuotaBytes       int64
	MaxDriveFileSizeBytes   int64
	MaxDriveNodes           int
	MaxPageAssetSizeBytes   int64
	MaxPageSites            int
	MaxPageVersionsPerSite  int
	MaxFilesPerPageVersion  int
	MaxPendingDriveSessions int
	MaxPendingPageSessions  int
}

// SoftDeleteResult contains aggregated data from a Drive subtree soft-delete.
// Used by DeleteNode to decrement storage counters and enqueue KV sync jobs.
type SoftDeleteResult struct {
	DeletedCount  int64    // total nodes soft-deleted
	TotalBytes    int64    // sum of size for nodes with storage_object_id IS NOT NULL
	RealNodeCount int      // folders + files with storage_object_id IS NOT NULL
	DirIDs        []int64  // directory IDs for KV sync
	FileIDs       []int64  // file IDs for KV sync
	ObjectKeys    []string // R2 object keys for cleanup after delete
}

// ExpiredSessionInfo carries target_id for orphan cleanup after session expiry.
type ExpiredSessionInfo struct {
	SessionID int64
	TargetID  int64
}
