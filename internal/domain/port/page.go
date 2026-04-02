package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type PageSiteRepository interface {
	Create(ctx context.Context, input model.CreatePageSiteInput) (*model.PageSite, error)
	ListBySpace(ctx context.Context, filter model.ListPageSitesFilter) ([]model.PageSite, int, error)
	GetByID(ctx context.Context, id int64) (*model.PageSite, error)
	Update(ctx context.Context, input model.UpdatePageSiteInput) (*model.PageSite, error)
	SetCurrentVersion(ctx context.Context, spaceID, id int64, versionID *int64) (*model.PageSite, error)
	SoftDelete(ctx context.Context, spaceID, id int64) error
	// SumCompletedStorageByPageID returns total bytes of completed uploads for a page site.
	SumCompletedStorageByPageID(ctx context.Context, spaceID, pageID int64) (int64, error)
}

type PageVersionRepository interface {
	CreateDraft(ctx context.Context, pageID int64, createdBy string, assetPrefix string) (*model.PageVersion, error)
	CreateDraftFromSource(ctx context.Context, pageID int64, createdBy string, assetPrefix string, sourceVersionID int64) (*model.PageVersion, error)
	GetByID(ctx context.Context, id int64) (*model.PageVersion, error)
	GetByPageIDAndVersionNo(ctx context.Context, pageID, versionNo int64) (*model.PageVersion, error)
	UpdateStatus(ctx context.Context, id int64, status model.PageVersionStatus) (*model.PageVersion, error)
	ListByPageID(ctx context.Context, filter model.ListPageVersionsFilter) ([]model.PageVersion, int, error)
	// CountByPageID returns the total number of versions for a page site.
	// Used by CreateVersion for quota enforcement (MaxPageVersionsPerSite).
	CountByPageID(ctx context.Context, pageID int64) (int64, error)
}

type PageSlugRepository interface {
	Create(ctx context.Context, slug string, pageID int64) error
	MarkTombstone(ctx context.Context, slug string, pageID int64) error
}

type PageService interface {
	CreateSite(ctx context.Context, userID, name string) (*model.PageSite, error)
	ListSites(ctx context.Context, userID string, filter model.ListPageSitesFilter) ([]model.PageSite, int, error)
	GetSite(ctx context.Context, userID string, siteID int64) (*model.PageSite, error)
	UpdateSite(ctx context.Context, userID string, input model.UpdatePageSiteInput) (*model.PageSite, error)
	DeleteSite(ctx context.Context, userID string, siteID int64) (*model.PageSite, error)
	CreateVersion(ctx context.Context, userID string, pageID int64) (*model.PageVersion, error)
	PresignVersionAsset(ctx context.Context, userID string, pageID int64, versionID int64, assetPath, contentType string, contentLength int64) (*model.PageVersionPresignResult, error)
	CompleteVersionAsset(ctx context.Context, userID string, pageID int64, versionID int64, uploadSessionID int64) (*model.PageVersion, error)
	FinalizeVersion(ctx context.Context, userID string, pageID int64, versionID int64) (*model.PageVersion, error)
	PublishVersion(ctx context.Context, userID string, pageID int64, versionID int64) (*model.PageVersion, error)
	Unpublish(ctx context.Context, userID string, pageID int64) (*model.PageSite, error)
	RollbackCloneVersion(ctx context.Context, userID string, pageID int64, versionID int64) (*model.PageVersion, error)
	ListVersions(ctx context.Context, userID string, pageID int64, filter model.ListPageVersionsFilter) ([]model.PageVersion, int, error)
	GetVersionByNumber(ctx context.Context, userID string, pageID, versionNo int64) (*model.PageVersion, error)
	CreatePreviewHost(ctx context.Context, userID string, pageID int64, versionID int64) (*model.PagePreviewHost, error)
}
