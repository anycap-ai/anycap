package drive

import (
	"context"
	"strings"
	"testing"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeSpaceService struct {
	space *model.Space
}

func (s *fakeSpaceService) GetOrCreatePersonalSpace(_ context.Context, _ int64) (*model.Space, error) {
	return s.space, nil
}

type fakeDriveNodeRepo struct {
	nodes             map[int64]*model.DriveNode
	nextID            int64
	spaceForDecrement *model.Space // optional: set to simulate atomic counter decrement
}

func (r *fakeDriveNodeRepo) CreateFolder(_ context.Context, input model.CreateDriveFolderInput) (*model.DriveNode, error) {
	if r.nodes == nil {
		r.nodes = map[int64]*model.DriveNode{}
	}
	r.nextID++
	node := &model.DriveNode{
		ID:          r.nextID,
		SpaceID:     input.SpaceID,
		ParentID:    input.ParentID,
		Kind:        model.DriveNodeKindFolder,
		Name:        input.Name,
		CreatedBy:   input.CreatedBy,
		EdgeVersion: 1,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
	r.nodes[node.ID] = node
	return cloneDriveNode(node), nil
}

func (r *fakeDriveNodeRepo) CreateFile(_ context.Context, input model.CreateDriveFileInput) (*model.DriveNode, error) {
	if r.nodes == nil {
		r.nodes = map[int64]*model.DriveNode{}
	}
	r.nextID++
	node := &model.DriveNode{
		ID:          r.nextID,
		SpaceID:     input.SpaceID,
		ParentID:    input.ParentID,
		Kind:        model.DriveNodeKindFile,
		Name:        input.Name,
		CreatedBy:   input.CreatedBy,
		Size:        input.Size,
		MIME:        input.MIME,
		EdgeVersion: 1,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
	r.nodes[node.ID] = node
	return cloneDriveNode(node), nil
}

func (r *fakeDriveNodeRepo) GetByID(_ context.Context, id int64) (*model.DriveNode, error) {
	node, ok := r.nodes[id]
	if !ok || node.DeletedAt != nil {
		return nil, nil
	}
	return cloneDriveNode(node), nil
}

func (r *fakeDriveNodeRepo) ResolveByPath(_ context.Context, spaceID int64, nodePath string) (*model.DriveNode, error) {
	currentParent := (*int64)(nil)
	for _, segment := range strings.Split(strings.TrimPrefix(strings.TrimSpace(nodePath), "/"), "/") {
		if segment == "" {
			continue
		}
		var matched *model.DriveNode
		for _, node := range r.nodes {
			if node.DeletedAt != nil || node.SpaceID != spaceID || node.Name != segment {
				continue
			}
			if !sameNullableInt64(node.ParentID, currentParent) {
				continue
			}
			candidate := cloneDriveNode(node)
			matched = candidate
			break
		}
		if matched == nil {
			return nil, nil
		}
		currentParent = &matched.ID
	}
	if currentParent == nil {
		return nil, nil
	}
	return r.GetByID(context.Background(), *currentParent)
}

func (r *fakeDriveNodeRepo) ListByParent(_ context.Context, filter model.ListDriveNodesFilter) ([]model.DriveNode, int, error) {
	items := make([]model.DriveNode, 0)
	for _, node := range r.nodes {
		if node.DeletedAt != nil || node.SpaceID != filter.SpaceID {
			continue
		}
		if !sameNullableInt64(node.ParentID, filter.ParentID) {
			continue
		}
		if filter.Name != nil && node.Name != *filter.Name {
			continue
		}
		items = append(items, *cloneDriveNode(node))
	}
	total := len(items)
	if filter.Limit > 0 {
		if filter.Offset >= len(items) {
			return []model.DriveNode{}, total, nil
		}
		end := filter.Offset + filter.Limit
		if end > len(items) {
			end = len(items)
		}
		items = items[filter.Offset:end]
	}
	return items, total, nil
}

func (r *fakeDriveNodeRepo) Update(_ context.Context, input model.UpdateDriveNodeInput) (*model.DriveNode, error) {
	node, ok := r.nodes[input.ID]
	if !ok || node.DeletedAt != nil || node.SpaceID != input.SpaceID {
		return nil, nil
	}
	if input.Name != nil {
		node.Name = *input.Name
	}
	if input.UpdateParent {
		node.ParentID = input.ParentID
	}
	node.EdgeVersion++
	node.UpdatedAt = time.Now().UTC()
	return cloneDriveNode(node), nil
}

func (r *fakeDriveNodeRepo) AttachStorageObject(_ context.Context, input model.AttachDriveNodeStorageInput) (*model.DriveNode, error) {
	node, ok := r.nodes[input.NodeID]
	if !ok || node.DeletedAt != nil || node.SpaceID != input.SpaceID {
		return nil, nil
	}
	node.StorageObjectID = &input.StorageObjectID
	node.Size = &input.Size
	node.MIME = &input.MIME
	node.EdgeVersion++
	node.UpdatedAt = time.Now().UTC()
	return cloneDriveNode(node), nil
}

func (r *fakeDriveNodeRepo) ExistsInSubtree(_ context.Context, spaceID, rootID, targetID int64) (bool, error) {
	visited := map[int64]bool{}
	queue := []int64{rootID}
	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]
		if visited[current] {
			continue
		}
		visited[current] = true
		if current == targetID {
			return true, nil
		}
		for _, node := range r.nodes {
			if node.DeletedAt != nil || node.SpaceID != spaceID || node.ParentID == nil {
				continue
			}
			if *node.ParentID == current {
				queue = append(queue, node.ID)
			}
		}
	}
	return false, nil
}

func (r *fakeDriveNodeRepo) SoftDeleteSubtree(_ context.Context, spaceID, rootID int64) (*model.SoftDeleteResult, error) {
	toDelete := []int64{rootID}
	result := &model.SoftDeleteResult{}

	for len(toDelete) > 0 {
		current := toDelete[0]
		toDelete = toDelete[1:]

		node, ok := r.nodes[current]
		if !ok || node.DeletedAt != nil || node.SpaceID != spaceID {
			continue
		}

		now := time.Now().UTC()
		node.DeletedAt = &now
		node.UpdatedAt = now
		node.EdgeVersion++
		result.DeletedCount++

		if node.Kind == model.DriveNodeKindFolder {
			result.DirIDs = append(result.DirIDs, node.ID)
			result.RealNodeCount++
		} else {
			result.FileIDs = append(result.FileIDs, node.ID)
			if node.StorageObjectID != nil {
				if node.Size != nil {
					result.TotalBytes += *node.Size
				}
				result.RealNodeCount++
			}
		}

		for _, child := range r.nodes {
			if child.DeletedAt != nil || child.SpaceID != spaceID || child.ParentID == nil {
				continue
			}
			if *child.ParentID == current {
				toDelete = append(toDelete, child.ID)
			}
		}
	}

	return result, nil
}

func (r *fakeDriveNodeRepo) SoftDeleteSubtreeWithStorageDecrement(ctx context.Context, spaceID, rootID int64) (*model.SoftDeleteResult, error) {
	result, err := r.SoftDeleteSubtree(ctx, spaceID, rootID)
	if err != nil {
		return nil, err
	}
	// Simulate atomic counter decrement if space is wired
	if r.spaceForDecrement != nil {
		r.spaceForDecrement.StorageUsedBytes -= result.TotalBytes
		if r.spaceForDecrement.StorageUsedBytes < 0 {
			r.spaceForDecrement.StorageUsedBytes = 0
		}
		r.spaceForDecrement.DriveNodeCount -= result.RealNodeCount
		if r.spaceForDecrement.DriveNodeCount < 0 {
			r.spaceForDecrement.DriveNodeCount = 0
		}
	}
	return result, nil
}

func (r *fakeDriveNodeRepo) SoftDeleteOrphanFileNodes(_ context.Context, spaceID int64, nodeIDs []int64) (int64, error) {
	var count int64
	for _, id := range nodeIDs {
		node, ok := r.nodes[id]
		if !ok || node.DeletedAt != nil || node.SpaceID != spaceID || node.StorageObjectID != nil {
			continue
		}
		now := time.Now().UTC()
		node.DeletedAt = &now
		count++
	}
	return count, nil
}

func TestCreateFolder_RejectsFileParent(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	parentID := int64(1)
	repo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {
			ID:      1,
			SpaceID: 100,
			Kind:    model.DriveNodeKindFile,
			Name:    "a.txt",
		},
	}}
	service := NewService(&fakeSpaceService{space: space}, repo)

	_, err := service.CreateFolder(context.Background(), 1, &parentID, "docs")
	if err == nil || !strings.Contains(err.Error(), "parent node must be a folder") {
		t.Fatalf("expected parent folder validation error, got %v", err)
	}
}

func TestListNodes_RejectsFileParent(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	parentID := int64(1)
	repo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {
			ID:      1,
			SpaceID: 100,
			Kind:    model.DriveNodeKindFile,
			Name:    "a.txt",
		},
	}}
	service := NewService(&fakeSpaceService{space: space}, repo)

	_, _, err := service.ListNodes(context.Background(), 1, &parentID, model.ListDriveNodesFilter{Limit: 50})
	if err == nil || !strings.Contains(err.Error(), "parent node must be a folder") {
		t.Fatalf("expected parent folder validation error, got %v", err)
	}
}

func TestResolvePath_FindsNestedNode(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	rootID := int64(1)
	repo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {ID: 1, SpaceID: 100, Kind: model.DriveNodeKindFolder, Name: "_snapshots"},
		2: {ID: 2, SpaceID: 100, ParentID: &rootID, Kind: model.DriveNodeKindFile, Name: "repo.snapshot.tar"},
	}}
	service := NewService(&fakeSpaceService{space: space}, repo)

	node, err := service.ResolvePath(context.Background(), 1, "/_snapshots/repo.snapshot.tar")
	if err != nil {
		t.Fatalf("ResolvePath() error = %v", err)
	}
	if node == nil || node.ID != 2 {
		t.Fatalf("expected node id 2, got %#v", node)
	}
}

func TestCreateFolder_RejectsSiblingConflict(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	repo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {ID: 1, SpaceID: 100, Kind: model.DriveNodeKindFolder, Name: "docs"},
	}}
	service := NewService(&fakeSpaceService{space: space}, repo)

	_, err := service.CreateFolder(context.Background(), 1, nil, "docs")
	if err == nil || !strings.Contains(err.Error(), `already exists`) {
		t.Fatalf("expected sibling conflict error, got %v", err)
	}
}

func TestUpdateNode_RejectsRenameConflict(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	repo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {ID: 1, SpaceID: 100, Kind: model.DriveNodeKindFile, Name: "a.txt"},
		2: {ID: 2, SpaceID: 100, Kind: model.DriveNodeKindFile, Name: "b.txt"},
	}}
	service := NewService(&fakeSpaceService{space: space}, repo)

	name := "a.txt"
	_, err := service.UpdateNode(context.Background(), 1, 2, &name, nil, false)
	if err == nil || !strings.Contains(err.Error(), `already exists`) {
		t.Fatalf("expected rename conflict error, got %v", err)
	}
}

func TestUpdateNode_RejectsMoveFolderIntoSubtree(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	childParentID := int64(1)
	dstParentID := int64(2)
	repo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {
			ID:      1,
			SpaceID: 100,
			Kind:    model.DriveNodeKindFolder,
			Name:    "root-folder",
		},
		2: {
			ID:       2,
			SpaceID:  100,
			ParentID: &childParentID,
			Kind:     model.DriveNodeKindFolder,
			Name:     "child-folder",
		},
	}}
	service := NewService(&fakeSpaceService{space: space}, repo)

	_, err := service.UpdateNode(context.Background(), 1, 1, nil, &dstParentID, true)
	if err == nil || !strings.Contains(err.Error(), "cannot move folder into its subtree") {
		t.Fatalf("expected subtree validation error, got %v", err)
	}
}

func TestDeleteNode_DeletesSubtree(t *testing.T) {
	space := &model.Space{ID: 100, OwnerUserID: 1}
	childParentID := int64(1)
	repo := &fakeDriveNodeRepo{nodes: map[int64]*model.DriveNode{
		1: {
			ID:      1,
			SpaceID: 100,
			Kind:    model.DriveNodeKindFolder,
			Name:    "root-folder",
		},
		2: {
			ID:       2,
			SpaceID:  100,
			ParentID: &childParentID,
			Kind:     model.DriveNodeKindFile,
			Name:     "file.txt",
		},
	}}
	service := NewService(&fakeSpaceService{space: space}, repo)

	deletedCount, err := service.DeleteNode(context.Background(), 1, 1)
	if err != nil {
		t.Fatalf("DeleteNode() error = %v", err)
	}
	if deletedCount != 2 {
		t.Fatalf("expected deleted_count=2, got %d", deletedCount)
	}
	if repo.nodes[1].DeletedAt == nil || repo.nodes[2].DeletedAt == nil {
		t.Fatal("expected subtree nodes to be soft deleted")
	}
}

func sameNullableInt64(a, b *int64) bool {
	if a == nil && b == nil {
		return true
	}
	if a == nil || b == nil {
		return false
	}
	return *a == *b
}

func cloneDriveNode(node *model.DriveNode) *model.DriveNode {
	if node == nil {
		return nil
	}
	cloned := *node
	if node.ParentID != nil {
		v := *node.ParentID
		cloned.ParentID = &v
	}
	if node.StorageObjectID != nil {
		v := *node.StorageObjectID
		cloned.StorageObjectID = &v
	}
	if node.Size != nil {
		v := *node.Size
		cloned.Size = &v
	}
	if node.MIME != nil {
		v := *node.MIME
		cloned.MIME = &v
	}
	if node.DeletedAt != nil {
		v := *node.DeletedAt
		cloned.DeletedAt = &v
	}
	return &cloned
}
