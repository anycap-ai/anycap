package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type SpaceRepository interface {
	GetByOwnerUserID(ctx context.Context, ownerUserID int64) (*model.Space, error)
	CreatePersonalSpace(ctx context.Context, ownerUserID int64, name string) (*model.Space, error)

	// IncrementStorageAndMarkSessionCompleted atomically increments storage counters
	// and marks the upload session as completed within the same transaction.
	// Returns false if the increment would exceed quotaBytes.
	// This bundles two aggregates (Space + UploadSession) in one transaction for
	// correctness: prevents double-counting on retry if increment succeeds but
	// session mark fails.
	IncrementStorageAndMarkSessionCompleted(ctx context.Context, spaceID int64, sessionID int64, deltaBytes int64, deltaDriveNodes int, quotaBytes int64) (bool, error)

	// IncrementDriveNodeCount atomically increments drive_node_count if below maxNodes.
	// Used by CreateFolder (no upload session involved). Returns false if limit reached.
	IncrementDriveNodeCount(ctx context.Context, spaceID int64, maxNodes int) (bool, error)

	// DecrementDriveStorage atomically decrements storage_used_bytes and drive_node_count.
	// Used by DeleteNode after SoftDeleteSubtree. Values are clamped to 0 via GREATEST.
	DecrementDriveStorage(ctx context.Context, spaceID int64, deltaBytes int64, deltaRealNodes int) error

	// IncrementPageSiteCount atomically increments page_site_count if below maxSites.
	// Returns false if limit reached.
	IncrementPageSiteCount(ctx context.Context, spaceID int64, maxSites int) (bool, error)

	// DecrementPageSiteStorage atomically decrements storage_used_bytes and page_site_count by 1.
	// Used by DeleteSite. Values are clamped to 0 via GREATEST.
	DecrementPageSiteStorage(ctx context.Context, spaceID int64, deltaBytes int64) error
}

type SpaceService interface {
	GetOrCreatePersonalSpace(ctx context.Context, userID int64) (*model.Space, error)
}
