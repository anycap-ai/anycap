package kvsync

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

type DriveProjector struct {
	kvClient          KVClient
	nodeRepo          port.DriveNodeRepository
	shareRepo         port.DriveShareRepository
	storageObjectRepo port.StorageObjectRepository
}

func NewDriveProjector(kvClient KVClient, nodeRepo port.DriveNodeRepository, shareRepo port.DriveShareRepository, storageObjectRepo port.StorageObjectRepository) *DriveProjector {
	return &DriveProjector{
		kvClient:          kvClient,
		nodeRepo:          nodeRepo,
		shareRepo:         shareRepo,
		storageObjectRepo: storageObjectRepo,
	}
}

func (p *DriveProjector) Project(ctx context.Context, job model.KVSyncJob) (ProjectResult, error) {
	if p == nil || p.kvClient == nil || p.nodeRepo == nil {
		return ProjectResultDone, fmt.Errorf("drive projector is not configured")
	}

	switch job.JobType {
	case model.KVSyncJobTypeDriveFileMetaSync:
		return p.projectFileMeta(ctx, job)
	case model.KVSyncJobTypeDriveDirMetaSync:
		return p.projectDirMeta(ctx, job)
	case model.KVSyncJobTypeDriveDirChildrenSync:
		return p.projectDirChildren(ctx, job)
	case model.KVSyncJobTypeDriveShareSync:
		return p.projectShare(ctx, job)
	case model.KVSyncJobTypeDriveDirTreeDelete:
		return p.projectDirTreeDelete(ctx, job)
	default:
		return ProjectResultDone, fmt.Errorf("unsupported drive job type: %s", job.JobType)
	}
}

func (p *DriveProjector) projectFileMeta(ctx context.Context, job model.KVSyncJob) (ProjectResult, error) {
	var payload model.KVSyncDriveFileMetaPayload
	if err := json.Unmarshal(job.Payload, &payload); err != nil {
		return ProjectResultDone, fmt.Errorf("decode drive file meta payload: %w", err)
	}
	if payload.FileID <= 0 {
		fileID, err := strconv.ParseInt(job.TargetID, 10, 64)
		if err == nil {
			payload.FileID = fileID
		}
	}
	if payload.FileID <= 0 {
		return ProjectResultDone, fmt.Errorf("invalid drive file id")
	}

	node, err := p.nodeRepo.GetByID(ctx, payload.FileID)
	if err != nil {
		return ProjectResultDone, err
	}
	key := fmt.Sprintf("drive:file:%d", payload.FileID)
	if node == nil {
		if err := p.kvClient.Delete(ctx, key); err != nil {
			return ProjectResultDone, err
		}
		return ProjectResultDone, nil
	}
	if job.EdgeVersion < node.EdgeVersion {
		return ProjectResultObsolete, nil
	}
	if node.Kind != model.DriveNodeKindFile {
		return ProjectResultObsolete, nil
	}
	if payload.ObjectKey == "" && node.StorageObjectID != nil && p.storageObjectRepo != nil {
		object, err := p.storageObjectRepo.GetByID(ctx, *node.StorageObjectID)
		if err != nil {
			return ProjectResultDone, err
		}
		if object != nil {
			payload.ObjectKey = object.ObjectKey
			if payload.MIME == "" {
				payload.MIME = object.MIME
			}
			if payload.Size <= 0 {
				payload.Size = object.Size
			}
			if payload.ETag == "" {
				payload.ETag = object.ETag
			}
		}
	}

	value, err := json.Marshal(map[string]any{
		"id":           node.ID,
		"parent_id":    node.ParentID,
		"space_id":     node.SpaceID,
		"name":         node.Name,
		"object_key":   payload.ObjectKey,
		"mime":         payload.MIME,
		"size":         payload.Size,
		"etag":         payload.ETag,
		"edge_version": node.EdgeVersion,
		"updated_at":   node.UpdatedAt,
	})
	if err != nil {
		return ProjectResultDone, fmt.Errorf("marshal drive file meta payload: %w", err)
	}
	if err := p.kvClient.Put(ctx, key, value); err != nil {
		return ProjectResultDone, err
	}
	return ProjectResultDone, nil
}

func (p *DriveProjector) projectDirMeta(ctx context.Context, job model.KVSyncJob) (ProjectResult, error) {
	var payload model.KVSyncDriveDirMetaPayload
	if err := json.Unmarshal(job.Payload, &payload); err != nil {
		return ProjectResultDone, fmt.Errorf("decode drive dir meta payload: %w", err)
	}
	if payload.DirID <= 0 {
		dirID, err := strconv.ParseInt(job.TargetID, 10, 64)
		if err == nil {
			payload.DirID = dirID
		}
	}
	if payload.DirID <= 0 {
		return ProjectResultDone, fmt.Errorf("invalid drive dir id")
	}

	node, err := p.nodeRepo.GetByID(ctx, payload.DirID)
	if err != nil {
		return ProjectResultDone, err
	}
	key := fmt.Sprintf("drive:dir:%d:meta", payload.DirID)
	if node == nil {
		if err := p.kvClient.Delete(ctx, key); err != nil {
			return ProjectResultDone, err
		}
		return ProjectResultDone, nil
	}
	if job.EdgeVersion < node.EdgeVersion {
		return ProjectResultObsolete, nil
	}
	if node.Kind != model.DriveNodeKindFolder {
		return ProjectResultObsolete, nil
	}

	value, err := json.Marshal(map[string]any{
		"dir_id":       node.ID,
		"parent_id":    node.ParentID,
		"space_id":     node.SpaceID,
		"name":         node.Name,
		"edge_version": node.EdgeVersion,
		"updated_at":   node.UpdatedAt,
	})
	if err != nil {
		return ProjectResultDone, fmt.Errorf("marshal drive dir meta payload: %w", err)
	}
	if err := p.kvClient.Put(ctx, key, value); err != nil {
		return ProjectResultDone, err
	}
	return ProjectResultDone, nil
}

func (p *DriveProjector) projectDirChildren(ctx context.Context, job model.KVSyncJob) (ProjectResult, error) {
	var payload model.KVSyncDriveDirChildrenPayload
	if err := json.Unmarshal(job.Payload, &payload); err != nil {
		return ProjectResultDone, fmt.Errorf("decode drive dir children payload: %w", err)
	}
	if payload.DirID <= 0 {
		dirID, err := strconv.ParseInt(job.TargetID, 10, 64)
		if err == nil {
			payload.DirID = dirID
		}
	}
	if payload.DirID <= 0 {
		return ProjectResultDone, fmt.Errorf("invalid drive dir id")
	}

	dirNode, err := p.nodeRepo.GetByID(ctx, payload.DirID)
	if err != nil {
		return ProjectResultDone, err
	}
	key := fmt.Sprintf("drive:dir:%d:children", payload.DirID)
	if dirNode == nil {
		if err := p.kvClient.Delete(ctx, key); err != nil {
			return ProjectResultDone, err
		}
		return ProjectResultDone, nil
	}
	if job.EdgeVersion < dirNode.EdgeVersion {
		return ProjectResultObsolete, nil
	}
	if dirNode.Kind != model.DriveNodeKindFolder {
		return ProjectResultObsolete, nil
	}

	children, _, err := p.nodeRepo.ListByParent(ctx, model.ListDriveNodesFilter{
		SpaceID:  dirNode.SpaceID,
		ParentID: &payload.DirID,
		Limit:    10000,
	})
	if err != nil {
		return ProjectResultDone, err
	}

	items := make([]map[string]any, 0, len(children))
	for _, child := range children {
		items = append(items, map[string]any{
			"id":           child.ID,
			"kind":         child.Kind,
			"name":         child.Name,
			"parent_id":    child.ParentID,
			"size":         child.Size,
			"mime":         child.MIME,
			"edge_version": child.EdgeVersion,
			"updated_at":   child.UpdatedAt,
		})
	}

	value, err := json.Marshal(map[string]any{
		"dir_id":       payload.DirID,
		"space_id":     dirNode.SpaceID,
		"items":        items,
		"edge_version": dirNode.EdgeVersion,
		"updated_at":   dirNode.UpdatedAt,
	})
	if err != nil {
		return ProjectResultDone, fmt.Errorf("marshal drive dir children payload: %w", err)
	}
	if err := p.kvClient.Put(ctx, key, value); err != nil {
		return ProjectResultDone, err
	}
	return ProjectResultDone, nil
}

func (p *DriveProjector) projectShare(ctx context.Context, job model.KVSyncJob) (ProjectResult, error) {
	if p.shareRepo == nil {
		return ProjectResultDone, fmt.Errorf("drive share projector is not configured")
	}

	var payload model.KVSyncDriveSharePayload
	if err := json.Unmarshal(job.Payload, &payload); err != nil {
		return ProjectResultDone, fmt.Errorf("decode drive share payload: %w", err)
	}
	if payload.NodeID <= 0 {
		nodeID, err := strconv.ParseInt(job.TargetID, 10, 64)
		if err == nil {
			payload.NodeID = nodeID
		}
	}
	if payload.Token == "" {
		return ProjectResultObsolete, nil
	}

	key := "drive:share:" + payload.Token
	if payload.Action == model.KVSyncDriveShareActionDelete {
		if err := p.kvClient.Delete(ctx, key); err != nil {
			return ProjectResultDone, err
		}
		return ProjectResultDone, nil
	}

	active, err := p.shareRepo.GetActiveByNodeID(ctx, payload.NodeID)
	if err != nil {
		return ProjectResultDone, err
	}
	if active == nil {
		return ProjectResultObsolete, nil
	}
	if job.EdgeVersion < active.EdgeVersion {
		return ProjectResultObsolete, nil
	}
	if active.Token != payload.Token {
		return ProjectResultObsolete, nil
	}

	value, err := json.Marshal(map[string]any{
		"root_node_id":   payload.RootNodeID,
		"root_node_kind": payload.RootNodeKind,
		"expires_at":     payload.ExpiresAt,
		"has_password":   payload.HasPassword,
		"password_hash":  payload.PasswordHash,
		"password_salt":  payload.PasswordSalt,
		"edge_version":   active.EdgeVersion,
	})
	if err != nil {
		return ProjectResultDone, fmt.Errorf("marshal drive share payload: %w", err)
	}
	if err := p.kvClient.Put(ctx, key, value); err != nil {
		return ProjectResultDone, err
	}
	return ProjectResultDone, nil
}

func (p *DriveProjector) projectDirTreeDelete(ctx context.Context, job model.KVSyncJob) (ProjectResult, error) {
	var payload model.KVSyncDriveDirTreeDeletePayload
	if err := json.Unmarshal(job.Payload, &payload); err != nil {
		return ProjectResultDone, fmt.Errorf("decode drive dir tree delete payload: %w", err)
	}
	if payload.RootID <= 0 {
		rootID, err := strconv.ParseInt(job.TargetID, 10, 64)
		if err == nil {
			payload.RootID = rootID
		}
	}
	if payload.RootID <= 0 {
		return ProjectResultDone, fmt.Errorf("invalid dir tree delete root id")
	}

	if len(payload.DirIDs) == 0 {
		payload.DirIDs = []int64{payload.RootID}
	}

	for _, dirID := range payload.DirIDs {
		if dirID <= 0 {
			continue
		}
		metaKey := fmt.Sprintf("drive:dir:%d:meta", dirID)
		childrenKey := fmt.Sprintf("drive:dir:%d:children", dirID)
		if err := p.kvClient.Delete(ctx, metaKey); err != nil {
			return ProjectResultDone, err
		}
		if err := p.kvClient.Delete(ctx, childrenKey); err != nil {
			return ProjectResultDone, err
		}
	}

	for _, fileID := range payload.FileIDs {
		if fileID <= 0 {
			continue
		}
		if err := p.kvClient.Delete(ctx, fmt.Sprintf("drive:file:%d", fileID)); err != nil {
			return ProjectResultDone, err
		}
	}
	return ProjectResultDone, nil
}
