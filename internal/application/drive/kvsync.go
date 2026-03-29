package drive

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func (s *Service) enqueueDriveFileMetaSync(ctx context.Context, node *model.DriveNode, object *model.StorageObject) (int64, error) {
	if s == nil || node == nil {
		return 0, nil
	}
	var payload model.KVSyncDriveFileMetaPayload
	payload.SpaceID = node.SpaceID
	payload.FileID = node.ID
	payload.ParentID = node.ParentID
	payload.Name = node.Name
	if node.Size != nil {
		payload.Size = *node.Size
	}
	if node.MIME != nil {
		payload.MIME = *node.MIME
	}
	if object != nil {
		payload.ObjectKey = object.ObjectKey
		payload.MIME = object.MIME
		payload.Size = object.Size
		payload.ETag = object.ETag
	}
	return s.enqueueKVSyncJob(ctx, model.KVSyncJobTypeDriveFileMetaSync, node.ID, node.EdgeVersion, payload)
}

func (s *Service) enqueueDriveDirMetaSync(ctx context.Context, node *model.DriveNode) (int64, error) {
	if s == nil || node == nil || node.Kind != model.DriveNodeKindFolder {
		return 0, nil
	}
	return s.enqueueKVSyncJob(ctx, model.KVSyncJobTypeDriveDirMetaSync, node.ID, node.EdgeVersion, model.KVSyncDriveDirMetaPayload{
		DirID: node.ID,
	})
}

func (s *Service) enqueueDriveDirChildrenSync(ctx context.Context, dirID int64) (int64, error) {
	if s == nil || dirID <= 0 || s.nodeRepo == nil {
		return 0, nil
	}
	dir, err := s.nodeRepo.GetByID(ctx, dirID)
	if err != nil {
		return 0, err
	}
	if dir == nil || dir.Kind != model.DriveNodeKindFolder {
		return 0, nil
	}
	return s.enqueueKVSyncJob(ctx, model.KVSyncJobTypeDriveDirChildrenSync, dirID, dir.EdgeVersion, model.KVSyncDriveDirChildrenPayload{
		SpaceID: dir.SpaceID,
		DirID:   dirID,
	})
}

func (s *Service) enqueueDriveShareSync(ctx context.Context, node *model.DriveNode, link *model.DriveShareLink, action model.KVSyncDriveShareAction) (int64, error) {
	if s == nil || node == nil || link == nil {
		return 0, nil
	}
	payload := model.KVSyncDriveSharePayload{
		Action:       action,
		NodeID:       node.ID,
		Token:        link.Token,
		RootNodeID:   node.ID,
		RootNodeKind: string(node.Kind),
		ExpiresAt:    link.ExpiresAt,
		HasPassword:  link.PasswordHash != nil && link.PasswordSalt != nil,
		PasswordHash: link.PasswordHash,
		PasswordSalt: link.PasswordSalt,
	}
	return s.enqueueKVSyncJob(ctx, model.KVSyncJobTypeDriveShareSync, node.ID, link.EdgeVersion, payload)
}

func (s *Service) collectDriveSubtreeNodeIDs(ctx context.Context, spaceID int64, rootID int64) ([]int64, []int64, error) {
	if s == nil || s.nodeRepo == nil {
		return nil, nil, fmt.Errorf("drive service is not configured")
	}
	if spaceID <= 0 || rootID <= 0 {
		return nil, nil, fmt.Errorf("invalid subtree root")
	}

	dirIDs := []int64{rootID}
	fileIDs := make([]int64, 0)

	queue := []int64{rootID}
	for len(queue) > 0 {
		currentDirID := queue[0]
		queue = queue[1:]

		parentID := currentDirID
		children, err := s.nodeRepo.ListByParent(ctx, model.ListDriveNodesFilter{
			SpaceID:  spaceID,
			ParentID: &parentID,
		})
		if err != nil {
			return nil, nil, err
		}
		for _, child := range children {
			if child.Kind == model.DriveNodeKindFolder {
				dirIDs = append(dirIDs, child.ID)
				queue = append(queue, child.ID)
				continue
			}
			fileIDs = append(fileIDs, child.ID)
		}
	}

	return dirIDs, fileIDs, nil
}
