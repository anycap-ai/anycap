package page

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type fakeVersionRepo struct {
	versions map[int64]*model.PageVersion
	byPage   map[int64][]int64
	nextID   int64
}

func (r *fakeVersionRepo) CreateDraft(_ context.Context, pageID int64, createdBy string, assetPrefix string) (*model.PageVersion, error) {
	if r.versions == nil {
		r.versions = map[int64]*model.PageVersion{}
	}
	if r.byPage == nil {
		r.byPage = map[int64][]int64{}
	}

	r.nextID++
	versionNo := int64(1)
	for _, id := range r.byPage[pageID] {
		if version, ok := r.versions[id]; ok && version.VersionNo >= versionNo {
			versionNo = version.VersionNo + 1
		}
	}

	version := &model.PageVersion{
		ID:          r.nextID,
		PageID:      pageID,
		VersionNo:   versionNo,
		Status:      model.PageVersionStatusDraft,
		AssetPrefix: fmt.Sprintf("%s/%d", strings.TrimRight(assetPrefix, "/"), versionNo),
		CreatedBy:   createdBy,
		CreatedAt:   time.Now().UTC(),
	}
	r.versions[version.ID] = version
	r.byPage[pageID] = append(r.byPage[pageID], version.ID)

	cloned := *version
	return &cloned, nil
}

func (r *fakeVersionRepo) CreateDraftFromSource(_ context.Context, pageID int64, createdBy string, assetPrefix string, sourceVersionID int64) (*model.PageVersion, error) {
	version, err := r.CreateDraft(context.Background(), pageID, createdBy, assetPrefix)
	if err != nil {
		return nil, err
	}
	version.SourceVersionID = &sourceVersionID
	if existing, ok := r.versions[version.ID]; ok {
		existing.SourceVersionID = &sourceVersionID
	}
	return version, nil
}

func (r *fakeVersionRepo) GetByID(_ context.Context, id int64) (*model.PageVersion, error) {
	version, ok := r.versions[id]
	if !ok {
		return nil, nil
	}
	cloned := *version
	return &cloned, nil
}

func (r *fakeVersionRepo) UpdateStatus(_ context.Context, id int64, status model.PageVersionStatus) (*model.PageVersion, error) {
	version, ok := r.versions[id]
	if !ok {
		return nil, nil
	}
	version.Status = status
	cloned := *version
	return &cloned, nil
}

func (r *fakeVersionRepo) ListByPageID(_ context.Context, filter model.ListPageVersionsFilter) ([]model.PageVersion, int, error) {
	ids := r.byPage[filter.PageID]
	items := make([]model.PageVersion, 0, len(ids))
	for i := len(ids) - 1; i >= 0; i-- {
		version, ok := r.versions[ids[i]]
		if !ok {
			continue
		}
		items = append(items, *version)
	}
	total := len(items)
	if filter.Offset >= len(items) {
		return []model.PageVersion{}, total, nil
	}
	end := filter.Offset + filter.Limit
	if end > len(items) || filter.Limit <= 0 {
		end = len(items)
	}
	return items[filter.Offset:end], total, nil
}

func (r *fakeVersionRepo) GetByPageIDAndVersionNo(_ context.Context, pageID, versionNo int64) (*model.PageVersion, error) {
	for _, version := range r.versions {
		if version.PageID == pageID && version.VersionNo == versionNo {
			cloned := *version
			return &cloned, nil
		}
	}
	return nil, nil
}

type fakeVersionUploadSessionRepo struct {
	sessions map[int64]*model.UploadSession
	nextID   int64
}

func (r *fakeVersionUploadSessionRepo) Create(_ context.Context, input model.UploadSession) (*model.UploadSession, error) {
	if r.sessions == nil {
		r.sessions = map[int64]*model.UploadSession{}
	}
	r.nextID++
	session := input
	session.ID = r.nextID
	session.CreatedAt = time.Now().UTC()
	r.sessions[session.ID] = &session
	cloned := session
	return &cloned, nil
}

func (r *fakeVersionUploadSessionRepo) GetByID(_ context.Context, id int64) (*model.UploadSession, error) {
	session, ok := r.sessions[id]
	if !ok {
		return nil, nil
	}
	cloned := *session
	return &cloned, nil
}

func (r *fakeVersionUploadSessionRepo) MarkCompleted(_ context.Context, id int64) error {
	session, ok := r.sessions[id]
	if !ok {
		return nil
	}
	session.Status = model.UploadSessionStatusCompleted
	return nil
}

func (r *fakeVersionUploadSessionRepo) CountCompletedByTarget(_ context.Context, targetType model.UploadTargetType, targetID int64) (int64, error) {
	var count int64
	for _, session := range r.sessions {
		if session.TargetType == targetType && session.TargetID == targetID && session.Status == model.UploadSessionStatusCompleted {
			count++
		}
	}
	return count, nil
}

type fakeVersionStorageObjectRepo struct {
	objects map[int64]*model.StorageObject
	nextID  int64
}

func (r *fakeVersionStorageObjectRepo) Create(_ context.Context, input model.StorageObject) (*model.StorageObject, error) {
	if r.objects == nil {
		r.objects = map[int64]*model.StorageObject{}
	}
	r.nextID++
	obj := input
	obj.ID = r.nextID
	obj.CreatedAt = time.Now().UTC()
	r.objects[obj.ID] = &obj
	cloned := obj
	return &cloned, nil
}

func (r *fakeVersionStorageObjectRepo) GetByID(_ context.Context, id int64) (*model.StorageObject, error) {
	obj, ok := r.objects[id]
	if !ok {
		return nil, nil
	}
	cloned := *obj
	return &cloned, nil
}

func (r *fakeVersionStorageObjectRepo) ListByPrefix(_ context.Context, spaceID int64, objectKeyPrefix string) ([]model.StorageObject, error) {
	items := make([]model.StorageObject, 0)
	prefix := strings.TrimSpace(objectKeyPrefix)
	for _, object := range r.objects {
		if object.SpaceID != spaceID {
			continue
		}
		if strings.HasPrefix(object.ObjectKey, prefix) {
			cloned := *object
			items = append(items, cloned)
		}
	}
	return items, nil
}

type fakeVersionCloudObjectStore struct {
	headByKey map[string]*model.StorageObjectHead
}

func (s *fakeVersionCloudObjectStore) PresignPutObject(_ context.Context, objectKey, contentType string, contentLength int64) (model.PresignResult, error) {
	if s.headByKey == nil {
		s.headByKey = map[string]*model.StorageObjectHead{}
	}
	s.headByKey[objectKey] = &model.StorageObjectHead{
		Size: contentLength,
		MIME: contentType,
		ETag: "etag-1",
	}
	return model.PresignResult{
		UploadURL: "https://upload.example.com/put",
		ObjectURL: "https://cdn.example.com/obj",
		ObjectKey: objectKey,
		ExpiresIn: 600,
	}, nil
}

func (s *fakeVersionCloudObjectStore) PresignGetObject(_ context.Context, objectKey string, _ time.Duration) (string, error) {
	return "https://download.example.com/" + objectKey, nil
}

func (s *fakeVersionCloudObjectStore) HeadObject(_ context.Context, objectKey string) (*model.StorageObjectHead, error) {
	head, ok := s.headByKey[objectKey]
	if !ok {
		return nil, nil
	}
	cloned := *head
	return &cloned, nil
}

func (s *fakeVersionCloudObjectStore) CopyObject(_ context.Context, sourceObjectKey, targetObjectKey string) error {
	if s.headByKey == nil {
		s.headByKey = map[string]*model.StorageObjectHead{}
	}
	source, ok := s.headByKey[sourceObjectKey]
	if !ok {
		return fmt.Errorf("source object not found")
	}
	cloned := *source
	s.headByKey[targetObjectKey] = &cloned
	return nil
}

func (s *fakeVersionCloudObjectStore) DeleteObject(_ context.Context, _ string) error {
	return nil
}

func (s *fakeVersionCloudObjectStore) BucketName() string {
	return "anycap-cloud"
}

var _ port.PageVersionRepository = (*fakeVersionRepo)(nil)
var _ port.UploadSessionRepository = (*fakeVersionUploadSessionRepo)(nil)
var _ port.StorageObjectRepository = (*fakeVersionStorageObjectRepo)(nil)
var _ port.CloudObjectStore = (*fakeVersionCloudObjectStore)(nil)

func TestVersionFlow_PresignCompleteFinalize(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: "u-1"}
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {
				ID:         1,
				SpaceID:    200,
				Name:       "Docs Site",
				PageName:   "docs-site-a1b2c3d4",
				AccessMode: model.PageAccessModePublic,
			},
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
	)

	version, err := service.CreateVersion(context.Background(), "u-1", 1)
	if err != nil {
		t.Fatalf("CreateVersion() error = %v", err)
	}
	if version.Status != model.PageVersionStatusDraft {
		t.Fatalf("expected draft status, got %s", version.Status)
	}
	if !strings.Contains(version.AssetPrefix, "page/spaces/200/sites/1/versions/") {
		t.Fatalf("unexpected asset prefix %q", version.AssetPrefix)
	}

	presign, err := service.PresignVersionAsset(context.Background(), "u-1", 1, version.ID, "assets/index.html", "text/html", 42)
	if err != nil {
		t.Fatalf("PresignVersionAsset() error = %v", err)
	}
	if presign.UploadSessionID <= 0 {
		t.Fatalf("expected upload session id, got %d", presign.UploadSessionID)
	}
	if !strings.HasSuffix(presign.ObjectKey, "/assets/index.html") {
		t.Fatalf("expected object key suffix /assets/index.html, got %q", presign.ObjectKey)
	}

	completed, err := service.CompleteVersionAsset(context.Background(), "u-1", 1, version.ID, presign.UploadSessionID)
	if err != nil {
		t.Fatalf("CompleteVersionAsset() error = %v", err)
	}
	if completed.Status != model.PageVersionStatusDraft {
		t.Fatalf("expected status to remain draft after complete, got %s", completed.Status)
	}
	if len(storageRepo.objects) != 1 {
		t.Fatalf("expected 1 storage object, got %d", len(storageRepo.objects))
	}

	finalized, err := service.FinalizeVersion(context.Background(), "u-1", 1, version.ID)
	if err != nil {
		t.Fatalf("FinalizeVersion() error = %v", err)
	}
	if finalized.Status != model.PageVersionStatusVerified {
		t.Fatalf("expected verified status, got %s", finalized.Status)
	}

	versions, _, err := service.ListVersions(context.Background(), "u-1", 1, model.ListPageVersionsFilter{Limit: 50})
	if err != nil {
		t.Fatalf("ListVersions() error = %v", err)
	}
	if len(versions) != 1 {
		t.Fatalf("expected 1 version, got %d", len(versions))
	}
	if versions[0].Status != model.PageVersionStatusVerified {
		t.Fatalf("expected listed version verified, got %s", versions[0].Status)
	}
}

func TestFinalizeVersion_RequiresCompletedUploads(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: "u-1"}
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {
				ID:         1,
				SpaceID:    200,
				Name:       "Docs Site",
				PageName:   "docs-site-a1b2c3d4",
				AccessMode: model.PageAccessModePublic,
			},
		},
	}

	service := NewService(
		&fakePageSpaceService{space: space},
		siteRepo,
		&fakePageSlugRepo{},
		"pepper-xyz",
		WithVersioning(&fakeVersionRepo{}, &fakeVersionUploadSessionRepo{}, &fakeVersionStorageObjectRepo{}, &fakeVersionCloudObjectStore{}),
	)

	version, err := service.CreateVersion(context.Background(), "u-1", 1)
	if err != nil {
		t.Fatalf("CreateVersion() error = %v", err)
	}

	_, err = service.FinalizeVersion(context.Background(), "u-1", 1, version.ID)
	if err == nil || !strings.Contains(err.Error(), "no completed uploads") {
		t.Fatalf("expected no completed uploads error, got %v", err)
	}
}

func TestPresignVersionAsset_InvalidAssetPath(t *testing.T) {
	space := &model.Space{ID: 200, OwnerUserID: "u-1"}
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {
				ID:         1,
				SpaceID:    200,
				Name:       "Docs Site",
				PageName:   "docs-site-a1b2c3d4",
				AccessMode: model.PageAccessModePublic,
			},
		},
	}

	service := NewService(
		&fakePageSpaceService{space: space},
		siteRepo,
		&fakePageSlugRepo{},
		"pepper-xyz",
		WithVersioning(&fakeVersionRepo{}, &fakeVersionUploadSessionRepo{}, &fakeVersionStorageObjectRepo{}, &fakeVersionCloudObjectStore{}),
	)

	version, err := service.CreateVersion(context.Background(), "u-1", 1)
	if err != nil {
		t.Fatalf("CreateVersion() error = %v", err)
	}

	_, err = service.PresignVersionAsset(context.Background(), "u-1", 1, version.ID, "../index.html", "text/html", 42)
	if err == nil || !strings.Contains(err.Error(), "invalid characters") {
		t.Fatalf("expected invalid asset path error, got %v", err)
	}
}

func TestPublishAndUnpublishVersion(t *testing.T) {
	service, _, _, _, _, _ := newVersionServiceFor3C()

	v1 := createAndFinalizeVersion(t, service, 1, "index.html")
	publishedV1, err := service.PublishVersion(context.Background(), "u-1", 1, v1.ID)
	if err != nil {
		t.Fatalf("PublishVersion(v1) error = %v", err)
	}
	if publishedV1.Status != model.PageVersionStatusPublished {
		t.Fatalf("expected v1 status published, got %s", publishedV1.Status)
	}

	v2 := createAndFinalizeVersion(t, service, 1, "about.html")
	publishedV2, err := service.PublishVersion(context.Background(), "u-1", 1, v2.ID)
	if err != nil {
		t.Fatalf("PublishVersion(v2) error = %v", err)
	}
	if publishedV2.Status != model.PageVersionStatusPublished {
		t.Fatalf("expected v2 status published, got %s", publishedV2.Status)
	}

	_, err = service.PublishVersion(context.Background(), "u-1", 1, v1.ID)
	if err == nil || !strings.Contains(err.Error(), "move forward") {
		t.Fatalf("expected move forward error, got %v", err)
	}

	site, err := service.Unpublish(context.Background(), "u-1", 1)
	if err != nil {
		t.Fatalf("Unpublish() error = %v", err)
	}
	if site.CurrentVersionID != nil {
		t.Fatalf("expected current_version_id nil after unpublish, got %v", *site.CurrentVersionID)
	}
}

func TestPublishArchivedVersion_ClonesAndPublishes(t *testing.T) {
	service, _, _, _, _, _ := newVersionServiceFor3C()

	v1 := createAndFinalizeVersion(t, service, 1, "index.html")
	if _, err := service.PublishVersion(context.Background(), "u-1", 1, v1.ID); err != nil {
		t.Fatalf("PublishVersion(v1) error = %v", err)
	}

	site, err := service.Unpublish(context.Background(), "u-1", 1)
	if err != nil {
		t.Fatalf("Unpublish() error = %v", err)
	}
	if site.CurrentVersionID != nil {
		t.Fatalf("expected current_version_id nil after unpublish, got %v", *site.CurrentVersionID)
	}

	// Re-publish the archived version: should clone into a new version.
	republished, err := service.PublishVersion(context.Background(), "u-1", 1, v1.ID)
	if err != nil {
		t.Fatalf("PublishVersion(archived v1) error = %v", err)
	}
	if republished.Status != model.PageVersionStatusPublished {
		t.Fatalf("expected published, got %s", republished.Status)
	}
	if republished.ID == v1.ID {
		t.Fatalf("expected new version ID, got same as v1 (%d)", v1.ID)
	}
	if republished.VersionNo <= v1.VersionNo {
		t.Fatalf("expected higher version_no than %d, got %d", v1.VersionNo, republished.VersionNo)
	}
	if republished.SourceVersionID == nil || *republished.SourceVersionID != v1.ID {
		t.Fatalf("expected source_version_id=%d, got %+v", v1.ID, republished.SourceVersionID)
	}
}

func TestRollbackCloneVersion_CopiesAssetsAndMarksVerified(t *testing.T) {
	service, _, _, storageRepo, _, objectStore := newVersionServiceFor3C()

	sourceVersion := createAndFinalizeVersion(t, service, 1, "assets/main.js")
	publishedSource, err := service.PublishVersion(context.Background(), "u-1", 1, sourceVersion.ID)
	if err != nil {
		t.Fatalf("PublishVersion(source) error = %v", err)
	}
	if publishedSource.Status != model.PageVersionStatusPublished {
		t.Fatalf("expected source status published, got %s", publishedSource.Status)
	}

	clonedVersion, err := service.RollbackCloneVersion(context.Background(), "u-1", 1, sourceVersion.ID)
	if err != nil {
		t.Fatalf("RollbackCloneVersion() error = %v", err)
	}
	if clonedVersion.Status != model.PageVersionStatusVerified {
		t.Fatalf("expected cloned version verified, got %s", clonedVersion.Status)
	}
	if clonedVersion.SourceVersionID == nil || *clonedVersion.SourceVersionID != sourceVersion.ID {
		t.Fatalf("expected source_version_id=%d, got %+v", sourceVersion.ID, clonedVersion.SourceVersionID)
	}

	clonedObjects, err := storageRepo.ListByPrefix(context.Background(), 200, clonedVersion.AssetPrefix)
	if err != nil {
		t.Fatalf("ListByPrefix(cloned) error = %v", err)
	}
	if len(clonedObjects) == 0 {
		t.Fatal("expected cloned storage objects")
	}
	if _, exists := objectStore.headByKey[clonedObjects[0].ObjectKey]; !exists {
		t.Fatalf("expected cloned object key in cloud store head map, got %q", clonedObjects[0].ObjectKey)
	}
}

func TestRollbackCloneVersion_RequiresSourceAssets(t *testing.T) {
	service, _, versionRepo, _, _, _ := newVersionServiceFor3C()

	sourceVersion, err := versionRepo.CreateDraft(context.Background(), 1, "u-1", "page/spaces/200/sites/1/versions")
	if err != nil {
		t.Fatalf("CreateDraft() error = %v", err)
	}
	if _, err := versionRepo.UpdateStatus(context.Background(), sourceVersion.ID, model.PageVersionStatusVerified); err != nil {
		t.Fatalf("UpdateStatus(verified) error = %v", err)
	}

	_, err = service.RollbackCloneVersion(context.Background(), "u-1", 1, sourceVersion.ID)
	if err == nil || !strings.Contains(err.Error(), "no assets") {
		t.Fatalf("expected no assets error, got %v", err)
	}
}

func TestCreatePreviewHost(t *testing.T) {
	service, _, _, _, _, _ := newVersionServiceFor3C()
	grantStore := &fakePageEdgeGrantStore{}
	service = NewService(
		service.spaceService,
		service.siteRepo,
		service.slugRepo,
		"pepper-xyz",
		WithVersioning(service.versionRepo, service.uploadSessionRepo, service.storageObjectRepo, service.objectStore),
		WithPreviewHost(grantStore, "preview-page-%s.anycap.dev", 300),
	)

	version := createAndFinalizeVersion(t, service, 1, "index.html")
	result, err := service.CreatePreviewHost(context.Background(), "u-1", 1, version.ID)
	if err != nil {
		t.Fatalf("CreatePreviewHost() error = %v", err)
	}
	if !strings.HasPrefix(result.PreviewURL, "https://preview-page-pprv-") {
		t.Fatalf("unexpected preview_url: %q", result.PreviewURL)
	}
	if !strings.Contains(result.PreviewURL, ".anycap.dev/") {
		t.Fatalf("unexpected preview_url domain: %q", result.PreviewURL)
	}
	if grantStore.key == "" || !strings.HasPrefix(grantStore.key, "page:host:preview-page-pprv-") {
		t.Fatalf("unexpected grant key: %q", grantStore.key)
	}
	if grantStore.ttlSeconds != 300 {
		t.Fatalf("expected ttl 300, got %d", grantStore.ttlSeconds)
	}
}

func TestCreatePreviewHost_RejectsDraftVersion(t *testing.T) {
	service, _, versionRepo, _, _, _ := newVersionServiceFor3C()
	grantStore := &fakePageEdgeGrantStore{}
	service = NewService(
		service.spaceService,
		service.siteRepo,
		service.slugRepo,
		"pepper-xyz",
		WithVersioning(versionRepo, service.uploadSessionRepo, service.storageObjectRepo, service.objectStore),
		WithPreviewHost(grantStore, "preview-page-%s.anycap.dev", 300),
	)

	draft, err := versionRepo.CreateDraft(context.Background(), 1, "u-1", "page/spaces/200/sites/1/versions")
	if err != nil {
		t.Fatalf("CreateDraft() error = %v", err)
	}
	_, err = service.CreatePreviewHost(context.Background(), "u-1", 1, draft.ID)
	if err == nil || !strings.Contains(err.Error(), "verified, published, or archived") {
		t.Fatalf("expected status validation error, got %v", err)
	}
}

func newVersionServiceFor3C() (*Service, *fakePageSiteRepo, *fakeVersionRepo, *fakeVersionStorageObjectRepo, *fakeVersionUploadSessionRepo, *fakeVersionCloudObjectStore) {
	space := &model.Space{ID: 200, OwnerUserID: "u-1"}
	siteRepo := &fakePageSiteRepo{
		sites: map[int64]*model.PageSite{
			1: {
				ID:         1,
				SpaceID:    200,
				Name:       "Docs Site",
				PageName:   "docs-site-a1b2c3d4",
				AccessMode: model.PageAccessModePublic,
			},
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
	)
	return service, siteRepo, versionRepo, storageRepo, uploadRepo, objectStore
}

func createAndFinalizeVersion(t *testing.T, service *Service, pageID int64, assetPath string) *model.PageVersion {
	t.Helper()

	version, err := service.CreateVersion(context.Background(), "u-1", pageID)
	if err != nil {
		t.Fatalf("CreateVersion() error = %v", err)
	}
	presign, err := service.PresignVersionAsset(context.Background(), "u-1", pageID, version.ID, assetPath, "text/plain", 32)
	if err != nil {
		t.Fatalf("PresignVersionAsset() error = %v", err)
	}
	if _, err := service.CompleteVersionAsset(context.Background(), "u-1", pageID, version.ID, presign.UploadSessionID); err != nil {
		t.Fatalf("CompleteVersionAsset() error = %v", err)
	}
	finalized, err := service.FinalizeVersion(context.Background(), "u-1", pageID, version.ID)
	if err != nil {
		t.Fatalf("FinalizeVersion() error = %v", err)
	}
	return finalized
}
