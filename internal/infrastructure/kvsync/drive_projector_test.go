package kvsync

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeProjectorDriveNodeRepo struct {
	node     *model.DriveNode
	children []model.DriveNode
}

type fakeProjectorStorageObjectRepo struct {
	object *model.StorageObject
}

func (r *fakeProjectorDriveNodeRepo) CreateFolder(context.Context, model.CreateDriveFolderInput) (*model.DriveNode, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorDriveNodeRepo) CreateFile(context.Context, model.CreateDriveFileInput) (*model.DriveNode, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorDriveNodeRepo) GetByID(_ context.Context, _ int64) (*model.DriveNode, error) {
	if r.node == nil {
		return nil, nil
	}
	cloned := *r.node
	return &cloned, nil
}
func (r *fakeProjectorDriveNodeRepo) ResolveByPath(context.Context, int64, string) (*model.DriveNode, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorDriveNodeRepo) ListByParent(_ context.Context, _ model.ListDriveNodesFilter) ([]model.DriveNode, int, error) {
	return r.children, len(r.children), nil
}
func (r *fakeProjectorDriveNodeRepo) Update(context.Context, model.UpdateDriveNodeInput) (*model.DriveNode, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorDriveNodeRepo) AttachStorageObject(context.Context, model.AttachDriveNodeStorageInput) (*model.DriveNode, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorDriveNodeRepo) ExistsInSubtree(context.Context, int64, int64, int64) (bool, error) {
	return false, fmt.Errorf("not implemented")
}
func (r *fakeProjectorDriveNodeRepo) SoftDeleteSubtree(context.Context, int64, int64) (*model.SoftDeleteResult, error) {
	return &model.SoftDeleteResult{}, fmt.Errorf("not implemented")
}
func (r *fakeProjectorDriveNodeRepo) SoftDeleteSubtreeWithStorageDecrement(context.Context, int64, int64) (*model.SoftDeleteResult, error) {
	return &model.SoftDeleteResult{}, fmt.Errorf("not implemented")
}
func (r *fakeProjectorDriveNodeRepo) SoftDeleteOrphanFileNodes(context.Context, int64, []int64) (int64, error) {
	return 0, fmt.Errorf("not implemented")
}

func (r *fakeProjectorStorageObjectRepo) Create(context.Context, model.StorageObject) (*model.StorageObject, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorStorageObjectRepo) GetByID(_ context.Context, _ int64) (*model.StorageObject, error) {
	if r.object == nil {
		return nil, nil
	}
	cloned := *r.object
	return &cloned, nil
}
func (r *fakeProjectorStorageObjectRepo) ListByPrefix(context.Context, int64, string) ([]model.StorageObject, error) {
	return nil, fmt.Errorf("not implemented")
}

type fakeProjectorDriveShareRepo struct {
	link *model.DriveShareLink
}

func (r *fakeProjectorDriveShareRepo) GetActiveByNodeID(context.Context, int64) (*model.DriveShareLink, error) {
	if r.link == nil {
		return nil, nil
	}
	cloned := *r.link
	return &cloned, nil
}
func (r *fakeProjectorDriveShareRepo) Create(context.Context, model.DriveShareLink) (*model.DriveShareLink, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorDriveShareRepo) Update(context.Context, model.DriveShareLink) (*model.DriveShareLink, error) {
	return nil, fmt.Errorf("not implemented")
}
func (r *fakeProjectorDriveShareRepo) RevokeActiveByNodeID(context.Context, int64) error {
	return fmt.Errorf("not implemented")
}

func TestDriveProjector_FileMetaSync(t *testing.T) {
	size := int64(12)
	mime := "text/plain"
	parentID := int64(2)
	nodeRepo := &fakeProjectorDriveNodeRepo{node: &model.DriveNode{
		ID:          9,
		SpaceID:     100,
		ParentID:    &parentID,
		Kind:        model.DriveNodeKindFile,
		Name:        "a.txt",
		Size:        &size,
		MIME:        &mime,
		EdgeVersion: 3,
		UpdatedAt:   time.Now().UTC(),
	}}
	kv := &fakeKVClient{}
	projector := NewDriveProjector(kv, nodeRepo, &fakeProjectorDriveShareRepo{}, nil)

	payload := model.KVSyncDriveFileMetaPayload{
		FileID:    9,
		SpaceID:   100,
		ParentID:  &parentID,
		Name:      "a.txt",
		ObjectKey: "drive/spaces/100/nodes/9/o1",
		MIME:      "text/plain",
		Size:      12,
		ETag:      "e1",
	}
	data, _ := json.Marshal(payload)
	result, err := projector.Project(context.Background(), model.KVSyncJob{
		JobType:     model.KVSyncJobTypeDriveFileMetaSync,
		TargetID:    "9",
		EdgeVersion: 3,
		Payload:     data,
	})
	if err != nil {
		t.Fatalf("Project() error = %v", err)
	}
	if result != ProjectResultDone {
		t.Fatalf("expected done result, got %v", result)
	}
	if _, ok := kv.values["drive:file:9"]; !ok {
		t.Fatal("expected drive:file:9 kv value")
	}
}

func TestDriveProjector_FileMetaSyncPreservesObjectKeyOnRename(t *testing.T) {
	size := int64(12)
	mime := "application/x-tar"
	parentID := int64(2)
	storageObjectID := int64(88)
	nodeRepo := &fakeProjectorDriveNodeRepo{node: &model.DriveNode{
		ID:              9,
		SpaceID:         100,
		ParentID:        &parentID,
		Kind:            model.DriveNodeKindFile,
		Name:            "repo.snapshot.tar",
		StorageObjectID: &storageObjectID,
		Size:            &size,
		MIME:            &mime,
		EdgeVersion:     4,
		UpdatedAt:       time.Now().UTC(),
	}}
	storageRepo := &fakeProjectorStorageObjectRepo{object: &model.StorageObject{
		ID:        storageObjectID,
		SpaceID:   100,
		ObjectKey: "drive/spaces/100/nodes/9/object",
		Size:      12,
		MIME:      "application/x-tar",
		ETag:      "etag-rename",
	}}
	kv := &fakeKVClient{}
	projector := NewDriveProjector(kv, nodeRepo, &fakeProjectorDriveShareRepo{}, storageRepo)

	payload := model.KVSyncDriveFileMetaPayload{
		FileID:   9,
		SpaceID:  100,
		ParentID: &parentID,
		Name:     "repo.snapshot.tar",
	}
	data, _ := json.Marshal(payload)
	result, err := projector.Project(context.Background(), model.KVSyncJob{
		JobType:     model.KVSyncJobTypeDriveFileMetaSync,
		TargetID:    "9",
		EdgeVersion: 4,
		Payload:     data,
	})
	if err != nil {
		t.Fatalf("Project() error = %v", err)
	}
	if result != ProjectResultDone {
		t.Fatalf("expected done result, got %v", result)
	}

	var got map[string]any
	if err := json.Unmarshal(kv.values["drive:file:9"], &got); err != nil {
		t.Fatalf("unmarshal kv payload: %v", err)
	}
	if got["object_key"] != "drive/spaces/100/nodes/9/object" {
		t.Fatalf("expected object_key preserved, got %#v", got["object_key"])
	}
}

func TestDriveProjector_ShareSync(t *testing.T) {
	hash := "pbkdf2_sha256$100000$v1$abc"
	salt := "salt-b64"
	shareRepo := &fakeProjectorDriveShareRepo{link: &model.DriveShareLink{
		ID:           1,
		NodeID:       7,
		Token:        "tkn-1",
		Status:       model.DriveShareStatusActive,
		PasswordHash: &hash,
		PasswordSalt: &salt,
		EdgeVersion:  5,
	}}
	kv := &fakeKVClient{}
	projector := NewDriveProjector(kv, &fakeProjectorDriveNodeRepo{}, shareRepo, nil)

	payload := model.KVSyncDriveSharePayload{
		Action:       model.KVSyncDriveShareActionUpsert,
		NodeID:       7,
		Token:        "tkn-1",
		RootNodeID:   7,
		RootNodeKind: "file",
		HasPassword:  true,
		PasswordHash: &hash,
		PasswordSalt: &salt,
	}
	data, _ := json.Marshal(payload)
	result, err := projector.Project(context.Background(), model.KVSyncJob{
		JobType:     model.KVSyncJobTypeDriveShareSync,
		TargetID:    "7",
		EdgeVersion: 5,
		Payload:     data,
	})
	if err != nil {
		t.Fatalf("Project() error = %v", err)
	}
	if result != ProjectResultDone {
		t.Fatalf("expected done result, got %v", result)
	}
	if _, ok := kv.values["drive:share:tkn-1"]; !ok {
		t.Fatal("expected drive share kv value")
	}
	var got map[string]any
	if err := json.Unmarshal(kv.values["drive:share:tkn-1"], &got); err != nil {
		t.Fatalf("unmarshal kv payload: %v", err)
	}
	if got["password_hash"] != hash {
		t.Fatalf("expected password_hash %q, got %#v", hash, got["password_hash"])
	}
	if got["password_salt"] != salt {
		t.Fatalf("expected password_salt %q, got %#v", salt, got["password_salt"])
	}
}

func TestDriveProjector_DirTreeDelete(t *testing.T) {
	kv := &fakeKVClient{
		values: map[string][]byte{
			"drive:dir:1:meta":     []byte(`{}`),
			"drive:dir:1:children": []byte(`{}`),
			"drive:dir:2:meta":     []byte(`{}`),
			"drive:dir:2:children": []byte(`{}`),
			"drive:file:3":         []byte(`{}`),
			"drive:file:4":         []byte(`{}`),
		},
	}
	projector := NewDriveProjector(kv, &fakeProjectorDriveNodeRepo{}, &fakeProjectorDriveShareRepo{}, nil)

	payload := model.KVSyncDriveDirTreeDeletePayload{
		RootID:  1,
		DirIDs:  []int64{1, 2},
		FileIDs: []int64{3, 4},
	}
	data, _ := json.Marshal(payload)
	result, err := projector.Project(context.Background(), model.KVSyncJob{
		JobType:     model.KVSyncJobTypeDriveDirTreeDelete,
		TargetID:    "1",
		EdgeVersion: 1,
		Payload:     data,
	})
	if err != nil {
		t.Fatalf("Project() error = %v", err)
	}
	if result != ProjectResultDone {
		t.Fatalf("expected done result, got %v", result)
	}
	for _, key := range []string{
		"drive:dir:1:meta",
		"drive:dir:1:children",
		"drive:dir:2:meta",
		"drive:dir:2:children",
		"drive:file:3",
		"drive:file:4",
	} {
		if _, exists := kv.values[key]; exists {
			t.Fatalf("expected key deleted: %s", key)
		}
	}
}
