package drive

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeUploadSessionRepo struct {
	sessions map[int64]*model.UploadSession
	nextID   int64
}

func (r *fakeUploadSessionRepo) Create(_ context.Context, input model.UploadSession) (*model.UploadSession, error) {
	if r.sessions == nil {
		r.sessions = map[int64]*model.UploadSession{}
	}
	r.nextID++
	session := input
	session.ID = r.nextID
	session.CreatedAt = time.Now().UTC()
	r.sessions[session.ID] = &session
	return cloneUploadSession(&session), nil
}

func (r *fakeUploadSessionRepo) GetByID(_ context.Context, id int64) (*model.UploadSession, error) {
	session, ok := r.sessions[id]
	if !ok {
		return nil, nil
	}
	return cloneUploadSession(session), nil
}

func (r *fakeUploadSessionRepo) MarkCompleted(_ context.Context, id int64) error {
	session, ok := r.sessions[id]
	if !ok {
		return nil
	}
	session.Status = model.UploadSessionStatusCompleted
	return nil
}

func (r *fakeUploadSessionRepo) CountCompletedByTarget(_ context.Context, targetType model.UploadTargetType, targetID int64) (int64, error) {
	var count int64
	for _, session := range r.sessions {
		if session.TargetType == targetType && session.TargetID == targetID && session.Status == model.UploadSessionStatusCompleted {
			count++
		}
	}
	return count, nil
}

func (r *fakeUploadSessionRepo) ExpireStaleBySpace(_ context.Context, _ int64, _ model.UploadTargetType, _ time.Time) ([]model.ExpiredSessionInfo, error) {
	return nil, nil
}

func (r *fakeUploadSessionRepo) CountPendingBySpaceAndType(_ context.Context, _ int64, _ model.UploadTargetType) (int64, error) {
	return 0, nil
}

func (r *fakeUploadSessionRepo) CountByTargetAndStatuses(_ context.Context, _ model.UploadTargetType, _ int64, _ []model.UploadSessionStatus) (int64, error) {
	return 0, nil
}

type fakeStorageObjectRepo struct {
	objects map[int64]*model.StorageObject
	nextID  int64
}

func (r *fakeStorageObjectRepo) Create(_ context.Context, input model.StorageObject) (*model.StorageObject, error) {
	if r.objects == nil {
		r.objects = map[int64]*model.StorageObject{}
	}
	r.nextID++
	obj := input
	obj.ID = r.nextID
	obj.CreatedAt = time.Now().UTC()
	r.objects[obj.ID] = &obj
	return &obj, nil
}

func (r *fakeStorageObjectRepo) GetByID(_ context.Context, id int64) (*model.StorageObject, error) {
	obj, ok := r.objects[id]
	if !ok {
		return nil, nil
	}
	cloned := *obj
	return &cloned, nil
}

func (r *fakeStorageObjectRepo) ListByPrefix(_ context.Context, spaceID int64, objectKeyPrefix string) ([]model.StorageObject, error) {
	items := make([]model.StorageObject, 0)
	for _, object := range r.objects {
		if object.SpaceID != spaceID {
			continue
		}
		if strings.HasPrefix(object.ObjectKey, objectKeyPrefix) {
			items = append(items, *object)
		}
	}
	return items, nil
}

type fakeCloudObjectStore struct {
	headByKey map[string]*model.StorageObjectHead
}

func (s *fakeCloudObjectStore) PresignPutObject(_ context.Context, objectKey, contentType string, contentLength int64) (model.PresignResult, error) {
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

func (s *fakeCloudObjectStore) PresignGetObject(_ context.Context, objectKey string, _ time.Duration) (string, error) {
	return "https://download.example.com/" + objectKey, nil
}

func (s *fakeCloudObjectStore) HeadObject(_ context.Context, objectKey string) (*model.StorageObjectHead, error) {
	head, ok := s.headByKey[objectKey]
	if !ok {
		return nil, nil
	}
	cloned := *head
	return &cloned, nil
}

func (s *fakeCloudObjectStore) CopyObject(_ context.Context, sourceObjectKey, targetObjectKey string) error {
	if s.headByKey == nil {
		s.headByKey = map[string]*model.StorageObjectHead{}
	}
	head, ok := s.headByKey[sourceObjectKey]
	if !ok {
		return fmt.Errorf("source object not found")
	}
	cloned := *head
	s.headByKey[targetObjectKey] = &cloned
	return nil
}

func (s *fakeCloudObjectStore) DeleteObject(_ context.Context, _ string) error {
	return nil
}

func (s *fakeCloudObjectStore) BucketName() string {
	return "anycap-cloud"
}

type fakeDriveShareRepo struct {
	links  map[int64]*model.DriveShareLink
	nextID int64
}

type fakeDriveEdgeGrantStore struct {
	key        string
	value      []byte
	ttlSeconds int64
	err        error
}

func (s *fakeDriveEdgeGrantStore) PutJSON(_ context.Context, key string, value []byte, ttlSeconds int64) error {
	s.key = key
	s.value = append([]byte(nil), value...)
	s.ttlSeconds = ttlSeconds
	return s.err
}

func (r *fakeDriveShareRepo) GetActiveByNodeID(_ context.Context, nodeID int64) (*model.DriveShareLink, error) {
	link, ok := r.links[nodeID]
	if !ok || link.Status != model.DriveShareStatusActive {
		return nil, nil
	}
	return cloneDriveShare(link), nil
}

func (r *fakeDriveShareRepo) Create(_ context.Context, link model.DriveShareLink) (*model.DriveShareLink, error) {
	if r.links == nil {
		r.links = map[int64]*model.DriveShareLink{}
	}
	r.nextID++
	now := time.Now().UTC()
	link.ID = r.nextID
	link.CreatedAt = now
	link.UpdatedAt = now
	r.links[link.NodeID] = &link
	return cloneDriveShare(&link), nil
}

func (r *fakeDriveShareRepo) Update(_ context.Context, link model.DriveShareLink) (*model.DriveShareLink, error) {
	existing, ok := r.links[link.NodeID]
	if !ok {
		return nil, nil
	}
	existing.Token = link.Token
	existing.ExpiresAt = link.ExpiresAt
	existing.PasswordHash = link.PasswordHash
	existing.PasswordSalt = link.PasswordSalt
	existing.EdgeVersion++
	existing.UpdatedAt = time.Now().UTC()
	return cloneDriveShare(existing), nil
}

func (r *fakeDriveShareRepo) RevokeActiveByNodeID(_ context.Context, nodeID int64) error {
	link, ok := r.links[nodeID]
	if !ok {
		return nil
	}
	link.Status = model.DriveShareStatusRevoked
	link.EdgeVersion++
	link.UpdatedAt = time.Now().UTC()
	return nil
}

func TestPresignAndCompleteFileUpload(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	parentID := int64(1)
	nodeRepo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {
			ID:      1,
			SpaceID: 100,
			Kind:    model.DriveNodeKindFolder,
			Name:    "root",
		},
	}}
	uploadRepo := &fakeUploadSessionRepo{}
	storageRepo := &fakeStorageObjectRepo{}
	objectStore := &fakeCloudObjectStore{}

	svc := NewService(
		&fakeSpaceService{space: space},
		nodeRepo,
		WithUpload(uploadRepo, storageRepo, objectStore),
	)

	presign, err := svc.PresignFileUpload(context.Background(), 1, &parentID, "a.txt", "text/plain", 123)
	if err != nil {
		t.Fatalf("PresignFileUpload() error = %v", err)
	}
	if presign.FileID <= 0 || presign.UploadSessionID <= 0 {
		t.Fatalf("expected allocated file and upload session ids, got file=%d session=%d", presign.FileID, presign.UploadSessionID)
	}

	node, err := svc.CompleteFileUpload(context.Background(), 1, presign.UploadSessionID, presign.FileID)
	if err != nil {
		t.Fatalf("CompleteFileUpload() error = %v", err)
	}
	if node.StorageObjectID == nil {
		t.Fatal("expected storage_object_id to be attached")
	}
	if node.Size == nil || *node.Size != 123 {
		t.Fatalf("expected size=123, got %#v", node.Size)
	}

	session, _ := uploadRepo.GetByID(context.Background(), presign.UploadSessionID)
	if session == nil || session.Status != model.UploadSessionStatusCompleted {
		t.Fatalf("expected upload session completed, got %#v", session)
	}
}

func TestDriveShareUpsertRotateRevoke(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	nodeRepo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {
			ID:      1,
			SpaceID: 100,
			Kind:    model.DriveNodeKindFile,
			Name:    "a.txt",
		},
	}}
	shareRepo := &fakeDriveShareRepo{}
	svc := NewService(
		&fakeSpaceService{space: space},
		nodeRepo,
		WithShare(shareRepo, "pepper-xyz", "https://drive.anycap.cloud/s"),
	)

	expiresIn := int64(3600)
	password := "secret-123"
	view, err := svc.UpsertShare(context.Background(), 1, 1, &expiresIn, false, &password, false)
	if err != nil {
		t.Fatalf("UpsertShare(create) error = %v", err)
	}
	if view.Token == "" || view.URL == "" {
		t.Fatalf("expected token+url, got %#v", view)
	}
	if !view.HasPassword {
		t.Fatal("expected has_password=true")
	}

	rotated, err := svc.RotateShare(context.Background(), 1, 1)
	if err != nil {
		t.Fatalf("RotateShare() error = %v", err)
	}
	if rotated.Token == view.Token {
		t.Fatalf("expected rotated token different, got %q", rotated.Token)
	}

	if err := svc.RevokeShare(context.Background(), 1, 1); err != nil {
		t.Fatalf("RevokeShare() error = %v", err)
	}
	active, _ := shareRepo.GetActiveByNodeID(context.Background(), 1)
	if active != nil {
		t.Fatalf("expected no active share after revoke, got %#v", active)
	}
}

func TestCreateAccessLinks(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	storageObjectID := int64(501)
	nodeRepo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {
			ID:              1,
			SpaceID:         100,
			Kind:            model.DriveNodeKindFile,
			Name:            "a.txt",
			StorageObjectID: &storageObjectID,
		},
	}}
	storageRepo := &fakeStorageObjectRepo{
		objects: map[int64]*model.StorageObject{
			storageObjectID: {
				ID:        storageObjectID,
				SpaceID:   100,
				ObjectKey: "drive/spaces/100/nodes/1/uuid",
				Size:      128,
				MIME:      "text/plain; charset=utf-8",
			},
		},
	}
	grantStore := &fakeDriveEdgeGrantStore{}
	svc := NewService(
		&fakeSpaceService{space: space},
		nodeRepo,
		WithUpload(&fakeUploadSessionRepo{}, storageRepo, &fakeCloudObjectStore{}),
		WithEdgeAccess(grantStore, 300, "https://drive.anycap.dev"),
	)

	result, err := svc.CreateAccessLinks(context.Background(), 1, 1)
	if err != nil {
		t.Fatalf("CreateAccessLinks() error = %v", err)
	}
	if !strings.HasPrefix(result.PreviewURL, "https://drive.anycap.dev/o/drvacc_") {
		t.Fatalf("unexpected preview_url: %q", result.PreviewURL)
	}
	if !strings.Contains(result.DownloadURL, "/raw?download=1") {
		t.Fatalf("unexpected download_url: %q", result.DownloadURL)
	}
	if grantStore.key == "" || !strings.HasPrefix(grantStore.key, "drive:access:drvacc_") {
		t.Fatalf("unexpected grant key: %q", grantStore.key)
	}
	if grantStore.ttlSeconds != 300 {
		t.Fatalf("expected ttl 300, got %d", grantStore.ttlSeconds)
	}
}

func TestCreateAccessLinks_RejectsFolder(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	nodeRepo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {
			ID:      1,
			SpaceID: 100,
			Kind:    model.DriveNodeKindFolder,
			Name:    "docs",
		},
	}}
	svc := NewService(
		&fakeSpaceService{space: space},
		nodeRepo,
		WithUpload(&fakeUploadSessionRepo{}, &fakeStorageObjectRepo{}, &fakeCloudObjectStore{}),
		WithEdgeAccess(&fakeDriveEdgeGrantStore{}, 300, "https://drive.anycap.dev"),
	)

	_, err := svc.CreateAccessLinks(context.Background(), 1, 1)
	if err == nil || !strings.Contains(err.Error(), "must be a file") {
		t.Fatalf("expected file validation error, got %v", err)
	}
}

func cloneUploadSession(session *model.UploadSession) *model.UploadSession {
	if session == nil {
		return nil
	}
	cloned := *session
	return &cloned
}

func cloneDriveShare(link *model.DriveShareLink) *model.DriveShareLink {
	if link == nil {
		return nil
	}
	cloned := *link
	if link.ExpiresAt != nil {
		v := *link.ExpiresAt
		cloned.ExpiresAt = &v
	}
	if link.PasswordHash != nil {
		v := *link.PasswordHash
		cloned.PasswordHash = &v
	}
	if link.PasswordSalt != nil {
		v := *link.PasswordSalt
		cloned.PasswordSalt = &v
	}
	return &cloned
}
