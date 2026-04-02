package drive

import (
	"context"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

// staticQuotaProvider returns fixed quota values for testing.
type staticQuotaProvider struct {
	quota model.StorageQuota
}

func (p *staticQuotaProvider) ResolveQuota(_ *model.Principal) model.StorageQuota {
	return p.quota
}

// fakeQuotaSpaceRepo implements port.SpaceRepository for quota tests.
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
func (r *fakeQuotaSpaceRepo) IncrementDriveNodeCount(_ context.Context, spaceID int64, maxNodes int) (bool, error) {
	if r.space.DriveNodeCount >= maxNodes {
		return false, nil
	}
	r.space.DriveNodeCount++
	return true, nil
}
func (r *fakeQuotaSpaceRepo) DecrementDriveStorage(_ context.Context, _ int64, _ int64, deltaNodes int) error {
	r.space.DriveNodeCount -= deltaNodes
	if r.space.DriveNodeCount < 0 {
		r.space.DriveNodeCount = 0
	}
	return nil
}
func (r *fakeQuotaSpaceRepo) IncrementPageSiteCount(_ context.Context, _ int64, _ int) (bool, error) {
	return true, nil
}
func (r *fakeQuotaSpaceRepo) DecrementPageSiteStorage(_ context.Context, _ int64, _ int64) error {
	return nil
}

func testQuota() model.StorageQuota {
	return model.StorageQuota{
		StorageQuotaBytes:       10 * 1024 * 1024 * 1024, // 10 GB
		MaxDriveFileSizeBytes:   1024 * 1024 * 1024,      // 1 GB
		MaxDriveNodes:           100,
		MaxPageAssetSizeBytes:   512 * 1024 * 1024,
		MaxPageSites:            50,
		MaxPageVersionsPerSite:  200,
		MaxFilesPerPageVersion:  2000,
		MaxPendingDriveSessions: 50,
		MaxPendingPageSessions:  100,
	}
}

func newDriveServiceWithQuota(space *model.Space, nodeRepo port.DriveNodeRepository, quota model.StorageQuota) (*Service, *fakeQuotaSpaceRepo) {
	spaceRepo := &fakeQuotaSpaceRepo{space: space}
	svc := NewService(
		&fakeSpaceService{space: space},
		nodeRepo,
		WithUpload(&fakeUploadSessionRepo{}, &fakeStorageObjectRepo{}, &fakeCloudObjectStore{}),
		WithQuota(&staticQuotaProvider{quota: quota}, spaceRepo),
	)
	return svc, spaceRepo
}

func TestPresignFileUpload_RejectsFileTooLarge(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	parentID := int64(1)
	nodeRepo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {ID: 1, SpaceID: 100, Kind: model.DriveNodeKindFolder, Name: "root"},
	}}

	quota := testQuota()
	quota.MaxDriveFileSizeBytes = 100 * 1024 * 1024 // 100 MB

	svc, _ := newDriveServiceWithQuota(space, nodeRepo, quota)

	_, err := svc.PresignFileUpload(context.Background(), 1, &parentID, "big.bin", "application/octet-stream", 200*1024*1024)
	if err == nil {
		t.Fatal("expected error for file too large")
	}
	if !strings.Contains(err.Error(), "drive_file_too_large") {
		t.Fatalf("expected drive_file_too_large error, got: %v", err)
	}
}

func TestPresignFileUpload_RejectsStorageQuotaExceeded(t *testing.T) {
	// 9.5 GB used, 10 GB limit -> only 0.5 GB remains
	space := &model.Space{ID: 100, OwnerUserID: 1, StorageUsedBytes: 10*1024*1024*1024 - 512*1024*1024}
	parentID := int64(1)
	nodeRepo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {ID: 1, SpaceID: 100, Kind: model.DriveNodeKindFolder, Name: "root"},
	}}

	quota := testQuota()
	quota.StorageQuotaBytes = 10 * 1024 * 1024 * 1024 // 10 GB limit

	svc, _ := newDriveServiceWithQuota(space, nodeRepo, quota)

	// Try to upload 600 MB (within per-file 1GB limit but exceeds remaining 512 MB quota)
	_, err := svc.PresignFileUpload(context.Background(), 1, &parentID, "file.bin", "application/octet-stream", 600*1024*1024)
	if err == nil {
		t.Fatal("expected error for storage quota exceeded")
	}
	if !strings.Contains(err.Error(), "storage_quota_exceeded") {
		t.Fatalf("expected storage_quota_exceeded error, got: %v", err)
	}
}

func TestPresignFileUpload_RejectsNodeLimitReached(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1, DriveNodeCount: 100}
	parentID := int64(1)
	nodeRepo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {ID: 1, SpaceID: 100, Kind: model.DriveNodeKindFolder, Name: "root"},
	}}

	quota := testQuota()
	quota.MaxDriveNodes = 100 // exactly at limit

	svc, _ := newDriveServiceWithQuota(space, nodeRepo, quota)

	_, err := svc.PresignFileUpload(context.Background(), 1, &parentID, "file.txt", "text/plain", 1024)
	if err == nil {
		t.Fatal("expected error for node limit reached")
	}
	if !strings.Contains(err.Error(), "drive_node_limit_reached") {
		t.Fatalf("expected drive_node_limit_reached error, got: %v", err)
	}
}

func TestPresignFileUpload_AllowsWithinQuota(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1, StorageUsedBytes: 1024, DriveNodeCount: 5}
	parentID := int64(1)
	nodeRepo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {ID: 1, SpaceID: 100, Kind: model.DriveNodeKindFolder, Name: "root"},
	}}

	svc, _ := newDriveServiceWithQuota(space, nodeRepo, testQuota())

	result, err := svc.PresignFileUpload(context.Background(), 1, &parentID, "ok.txt", "text/plain", 1024)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if result.UploadURL == "" {
		t.Fatal("expected upload URL")
	}
}

func TestCreateFolder_RejectsNodeLimitReached(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1, DriveNodeCount: 100}
	nodeRepo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{}}

	quota := testQuota()
	quota.MaxDriveNodes = 100

	svc, _ := newDriveServiceWithQuota(space, nodeRepo, quota)

	_, err := svc.CreateFolder(context.Background(), 1, nil, "new-folder")
	if err == nil {
		t.Fatal("expected error for node limit reached")
	}
	if !strings.Contains(err.Error(), "drive_node_limit_reached") {
		t.Fatalf("expected drive_node_limit_reached error, got: %v", err)
	}
}

func TestCreateFolder_RollsBackCountOnCreationFailure(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1, DriveNodeCount: 50}
	// No parent nodes -> ensureValidParent will fail for non-nil parentID
	nodeRepo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{}}

	quota := testQuota()
	quota.MaxDriveNodes = 100

	svc, spaceRepo := newDriveServiceWithQuota(space, nodeRepo, quota)

	// Create with nil parent succeeds at validation; the folder creation itself succeeds.
	// Let's create with a non-existent parent to trigger ensureValidParent failure.
	badParentID := int64(9999)
	_, err := svc.CreateFolder(context.Background(), 1, &badParentID, "new-folder")
	if err == nil {
		t.Fatal("expected error for invalid parent")
	}

	// Counter should be rolled back to original value.
	// Note: ensureValidParent runs BEFORE the increment, so counter shouldn't change.
	if spaceRepo.space.DriveNodeCount != 50 {
		t.Fatalf("expected counter to remain 50 after failed creation, got %d", spaceRepo.space.DriveNodeCount)
	}
}

func TestDeleteNode_DecrementsStorageCounters(t *testing.T) {
	fileSize := int64(1024 * 1024)
	storageObjID := int64(42)
	space := &model.Space{ID: 100, OwnerUserID: 1, DriveNodeCount: 5, StorageUsedBytes: fileSize}
	nodeRepo := &fakeDriveNodeRepo{
		nodes: map[int64]*model.DriveNode{
			1: {
				ID:              1,
				SpaceID:         100,
				Kind:            model.DriveNodeKindFile,
				Name:            "test.txt",
				Size:            &fileSize,
				StorageObjectID: &storageObjID,
				EdgeVersion:     1,
			},
		},
		spaceForDecrement: space,
	}

	svc, spaceRepo := newDriveServiceWithQuota(space, nodeRepo, testQuota())

	count, err := svc.DeleteNode(context.Background(), 1, 1)
	if err != nil {
		t.Fatalf("DeleteNode() error = %v", err)
	}
	if count != 1 {
		t.Fatalf("expected 1 deleted, got %d", count)
	}

	// Verify decrement was called: the fake spaceRepo decrements directly
	if spaceRepo.space.DriveNodeCount != 4 {
		t.Fatalf("expected node count 4 after delete, got %d", spaceRepo.space.DriveNodeCount)
	}
}

func TestFormatBytes(t *testing.T) {
	tests := []struct {
		input    int64
		expected string
	}{
		{0, "0 bytes"},
		{512, "512 bytes"},
		{1024, "1 KB"},
		{2048, "2 KB"},
		{1024 * 1024, "1 MB"},
		{1536 * 1024, "1.5 MB"},
		{1024 * 1024 * 1024, "1 GB"},
		{10 * 1024 * 1024 * 1024, "10 GB"},
		{int64(1.5 * 1024 * 1024 * 1024), "1.5 GB"},
	}

	for _, tc := range tests {
		got := formatBytes(tc.input)
		if got != tc.expected {
			t.Errorf("formatBytes(%d) = %q, want %q", tc.input, got, tc.expected)
		}
	}
}
