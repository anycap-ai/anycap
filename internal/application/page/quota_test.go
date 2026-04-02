package page

import (
	"context"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// staticQuotaProvider returns fixed quota values for testing.
type staticQuotaProvider struct {
	quota model.StorageQuota
}

func (p *staticQuotaProvider) ResolveQuota(_ *model.Principal) model.StorageQuota {
	return p.quota
}

// fakeQuotaSpaceRepo implements port.SpaceRepository for page quota tests.
type fakeQuotaSpaceRepo struct {
	space *model.Space
}

func (r *fakeQuotaSpaceRepo) GetByOwnerUserID(_ context.Context, _ int64) (*model.Space, error) {
	return r.space, nil
}
func (r *fakeQuotaSpaceRepo) CreatePersonalSpace(_ context.Context, _ int64, _ string) (*model.Space, error) {
	return r.space, nil
}
func (r *fakeQuotaSpaceRepo) IncrementStorageAndMarkSessionCompleted(_ context.Context, _ int64, _ int64, _ int64, _ int, _ int64) (bool, error) {
	return true, nil
}
func (r *fakeQuotaSpaceRepo) IncrementDriveNodeCount(_ context.Context, _ int64, _ int) (bool, error) {
	return true, nil
}
func (r *fakeQuotaSpaceRepo) DecrementDriveStorage(_ context.Context, _ int64, _ int64, _ int) error {
	return nil
}
func (r *fakeQuotaSpaceRepo) IncrementPageSiteCount(_ context.Context, spaceID int64, maxSites int) (bool, error) {
	if r.space.PageSiteCount >= maxSites {
		return false, nil
	}
	r.space.PageSiteCount++
	return true, nil
}
func (r *fakeQuotaSpaceRepo) DecrementPageSiteStorage(_ context.Context, _ int64, _ int64) error {
	r.space.PageSiteCount--
	if r.space.PageSiteCount < 0 {
		r.space.PageSiteCount = 0
	}
	return nil
}

func pageTestQuota() model.StorageQuota {
	return model.StorageQuota{
		StorageQuotaBytes:       10 * 1024 * 1024 * 1024,
		MaxDriveFileSizeBytes:   1024 * 1024 * 1024,
		MaxDriveNodes:           10000,
		MaxPageAssetSizeBytes:   512 * 1024 * 1024,
		MaxPageSites:            50,
		MaxPageVersionsPerSite:  200,
		MaxFilesPerPageVersion:  2000,
		MaxPendingDriveSessions: 50,
		MaxPendingPageSessions:  100,
	}
}

func TestCreateSite_RejectsPageSiteLimitReached(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: 1, PageSiteCount: 5}

	quota := pageTestQuota()
	quota.MaxPageSites = 5 // exactly at limit

	siteRepo := &fakePageSiteRepo{}
	slugRepo := &fakePageSlugRepo{}
	spaceRepo := &fakeQuotaSpaceRepo{space: space}

	service := NewService(
		&fakePageSpaceService{space: space},
		siteRepo,
		slugRepo,
		"pepper-xyz",
		WithQuota(&staticQuotaProvider{quota: quota}, spaceRepo),
	)

	_, err := service.CreateSite(context.Background(), 1, "My Site")
	if err == nil {
		t.Fatal("expected error for page site limit reached")
	}
	if !strings.Contains(err.Error(), "page_site_limit_reached") {
		t.Fatalf("expected page_site_limit_reached error, got: %v", err)
	}
}

func TestCreateSite_IncrementsCountAfterSuccess(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: 1, PageSiteCount: 3}

	quota := pageTestQuota()
	quota.MaxPageSites = 10

	siteRepo := &fakePageSiteRepo{}
	slugRepo := &fakePageSlugRepo{}
	spaceRepo := &fakeQuotaSpaceRepo{space: space}

	service := NewService(
		&fakePageSpaceService{space: space},
		siteRepo,
		slugRepo,
		"pepper-xyz",
		WithQuota(&staticQuotaProvider{quota: quota}, spaceRepo),
	)

	_, err := service.CreateSite(context.Background(), 1, "My Site")
	if err != nil {
		t.Fatalf("CreateSite() error = %v", err)
	}

	// Counter should have been incremented after successful creation
	if spaceRepo.space.PageSiteCount != 4 {
		t.Fatalf("expected page_site_count=4 after creation, got %d", spaceRepo.space.PageSiteCount)
	}
}

func TestCreateVersion_RejectsVersionLimitReached(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: 1}
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {ID: 1, SpaceID: 200, Name: "Docs Site", PageName: "docs-site-abc"},
		},
	}

	// Pre-fill versions to reach the limit
	versionRepo := &fakeVersionRepo{}
	for i := 0; i < 5; i++ {
		_, _ = versionRepo.CreateDraft(context.Background(), 1, "1", "page/spaces/200/sites/1/versions")
	}

	quota := pageTestQuota()
	quota.MaxPageVersionsPerSite = 5 // exactly at limit

	service := NewService(
		&fakePageSpaceService{space: space},
		siteRepo,
		&fakePageSlugRepo{},
		"pepper-xyz",
		WithVersioning(versionRepo, &fakeVersionUploadSessionRepo{}, &fakeVersionStorageObjectRepo{}, &fakeVersionCloudObjectStore{}),
		WithQuota(&staticQuotaProvider{quota: quota}, &fakeQuotaSpaceRepo{space: space}),
	)

	_, err := service.CreateVersion(context.Background(), 1, 1)
	if err == nil {
		t.Fatal("expected error for version limit reached")
	}
	if !strings.Contains(err.Error(), "page_version_limit_reached") {
		t.Fatalf("expected page_version_limit_reached error, got: %v", err)
	}
}

func TestPresignVersionAsset_RejectsAssetTooLarge(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: 1}
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {ID: 1, SpaceID: 200, Name: "Docs Site", PageName: "docs-site-abc"},
		},
	}

	versionRepo := &fakeVersionRepo{}
	uploadRepo := &fakeVersionUploadSessionRepo{}
	storageRepo := &fakeVersionStorageObjectRepo{}
	objectStore := &fakeVersionCloudObjectStore{}

	quota := pageTestQuota()
	quota.MaxPageAssetSizeBytes = 50 * 1024 * 1024 // 50 MB

	service := NewService(
		&fakePageSpaceService{space: space},
		siteRepo,
		&fakePageSlugRepo{},
		"pepper-xyz",
		WithVersioning(versionRepo, uploadRepo, storageRepo, objectStore),
		WithQuota(&staticQuotaProvider{quota: quota}, &fakeQuotaSpaceRepo{space: space}),
	)

	version, err := service.CreateVersion(context.Background(), 1, 1)
	if err != nil {
		t.Fatalf("CreateVersion() error = %v", err)
	}

	_, err = service.PresignVersionAsset(context.Background(), 1, 1, version.ID, "assets/huge.bin", "application/octet-stream", 100*1024*1024)
	if err == nil {
		t.Fatal("expected error for asset too large")
	}
	if !strings.Contains(err.Error(), "page_asset_too_large") {
		t.Fatalf("expected page_asset_too_large error, got: %v", err)
	}
}

func TestPresignVersionAsset_RejectsStorageQuotaExceeded(t *testing.T) {
	// 9.5 GB used, 10 GB limit -> only 0.5 GB remains
	space := &model.Space{ID: 200, OwnerUserID: 1, StorageUsedBytes: 10*1024*1024*1024 - 256*1024*1024}
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {ID: 1, SpaceID: 200, Name: "Docs Site", PageName: "docs-site-abc"},
		},
	}

	versionRepo := &fakeVersionRepo{}
	uploadRepo := &fakeVersionUploadSessionRepo{}
	storageRepo := &fakeVersionStorageObjectRepo{}
	objectStore := &fakeVersionCloudObjectStore{}

	quota := pageTestQuota()
	quota.StorageQuotaBytes = 10 * 1024 * 1024 * 1024 // 10 GB limit

	service := NewService(
		&fakePageSpaceService{space: space},
		siteRepo,
		&fakePageSlugRepo{},
		"pepper-xyz",
		WithVersioning(versionRepo, uploadRepo, storageRepo, objectStore),
		WithQuota(&staticQuotaProvider{quota: quota}, &fakeQuotaSpaceRepo{space: space}),
	)

	version, err := service.CreateVersion(context.Background(), 1, 1)
	if err != nil {
		t.Fatalf("CreateVersion() error = %v", err)
	}

	// Try to upload 400 MB (within per-asset 512MB limit but exceeds remaining 256 MB quota)
	_, err = service.PresignVersionAsset(context.Background(), 1, 1, version.ID, "assets/big.bin", "application/octet-stream", 400*1024*1024)
	if err == nil {
		t.Fatal("expected error for storage quota exceeded")
	}
	if !strings.Contains(err.Error(), "storage_quota_exceeded") {
		t.Fatalf("expected storage_quota_exceeded error, got: %v", err)
	}
}

func TestPresignVersionAsset_AllowsWithinQuota(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: 1, StorageUsedBytes: 1024}
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {ID: 1, SpaceID: 200, Name: "Docs Site", PageName: "docs-site-abc"},
		},
	}

	versionRepo := &fakeVersionRepo{}
	uploadRepo := &fakeVersionUploadSessionRepo{}
	storageRepo := &fakeVersionStorageObjectRepo{}
	objectStore := &fakeVersionCloudObjectStore{}

	service := NewService(
		&fakePageSpaceService{space: space},
		siteRepo,
		&fakePageSlugRepo{},
		"pepper-xyz",
		WithVersioning(versionRepo, uploadRepo, storageRepo, objectStore),
		WithQuota(&staticQuotaProvider{quota: pageTestQuota()}, &fakeQuotaSpaceRepo{space: space}),
	)

	version, err := service.CreateVersion(context.Background(), 1, 1)
	if err != nil {
		t.Fatalf("CreateVersion() error = %v", err)
	}

	result, err := service.PresignVersionAsset(context.Background(), 1, 1, version.ID, "assets/ok.html", "text/html", 1024)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if result.UploadURL == "" {
		t.Fatal("expected upload URL")
	}
}
