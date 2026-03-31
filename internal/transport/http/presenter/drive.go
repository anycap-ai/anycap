package presenter

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type DriveNodeDTO struct {
	ID          string  `json:"id"`
	SpaceID     string  `json:"space_id"`
	ParentID    *string `json:"parent_id,omitempty"`
	Kind        string  `json:"kind"`
	Name        string  `json:"name"`
	Size        *int64  `json:"size,omitempty"`
	MIME        *string `json:"mime,omitempty"`
	EdgeVersion int64   `json:"edge_version"`
	CreatedBy   string  `json:"created_by"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
	DeletedAt   *string `json:"deleted_at,omitempty"`
	HasShare    bool    `json:"has_share"`
}

type DriveFilePresignDTO struct {
	UploadSessionID string `json:"upload_session_id"`
	FileID          string `json:"file_id"`
	UploadURL       string `json:"upload_url"`
	ObjectURL       string `json:"object_url"`
	ExpiresIn       int    `json:"expires_in"`
}

type DriveShareViewDTO struct {
	NodeID      string  `json:"node_id"`
	Token       string  `json:"token"`
	URL         string  `json:"url"`
	ExpiresAt   *string `json:"expires_at,omitempty"`
	HasPassword bool    `json:"has_password"`
	Status      string  `json:"status"`
}

func PresentDriveNode(ctx context.Context, mapper IDMapper, node *model.DriveNode) (DriveNodeDTO, error) {
	items, err := PresentDriveNodes(ctx, mapper, []model.DriveNode{*node})
	if err != nil {
		return DriveNodeDTO{}, err
	}
	if len(items) == 0 {
		return DriveNodeDTO{}, fmt.Errorf("drive node not found")
	}
	return items[0], nil
}

func PresentDriveNodes(ctx context.Context, mapper IDMapper, nodes []model.DriveNode) ([]DriveNodeDTO, error) {
	if len(nodes) == 0 {
		return []DriveNodeDTO{}, nil
	}

	nodeIDs := make([]int64, 0, len(nodes)*2)
	spaceIDs := make([]int64, 0, len(nodes))
	userIDs := make([]string, 0, len(nodes))
	for _, item := range nodes {
		nodeIDs = append(nodeIDs, item.ID)
		if item.ParentID != nil {
			nodeIDs = append(nodeIDs, *item.ParentID)
		}
		spaceIDs = append(spaceIDs, item.SpaceID)
		userIDs = append(userIDs, item.CreatedBy)
	}

	nodeMap, err := mapper.ResolveDriveNodeExternalIDs(ctx, nodeIDs)
	if err != nil {
		return nil, err
	}
	spaceMap, err := mapper.ResolveSpaceExternalIDs(ctx, spaceIDs)
	if err != nil {
		return nil, err
	}
	userMap, err := mapper.ResolveUserExternalIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	result := make([]DriveNodeDTO, 0, len(nodes))
	for _, item := range nodes {
		externalID := nodeMap[item.ID]
		spaceExternalID := spaceMap[item.SpaceID]
		createdBy := userMap[item.CreatedBy]
		if externalID == "" || spaceExternalID == "" || createdBy == "" {
			return nil, fmt.Errorf("failed to resolve drive node external ids")
		}

		var parentExternalID *string
		if item.ParentID != nil {
			value := nodeMap[*item.ParentID]
			if value == "" {
				return nil, fmt.Errorf("failed to resolve drive parent external id")
			}
			parentExternalID = &value
		}

		dto := DriveNodeDTO{
			ID:          externalID,
			SpaceID:     spaceExternalID,
			ParentID:    parentExternalID,
			Kind:        string(item.Kind),
			Name:        item.Name,
			Size:        item.Size,
			MIME:        item.MIME,
			EdgeVersion: item.EdgeVersion,
			CreatedBy:   createdBy,
			CreatedAt:   item.CreatedAt.UTC().Format(TimeLayout),
			UpdatedAt:   item.UpdatedAt.UTC().Format(TimeLayout),
			HasShare:    item.HasShare,
		}
		if item.DeletedAt != nil {
			value := item.DeletedAt.UTC().Format(TimeLayout)
			dto.DeletedAt = &value
		}
		result = append(result, dto)
	}
	return result, nil
}

func PresentDrivePresign(ctx context.Context, mapper IDMapper, input *model.DriveFilePresignResult) (DriveFilePresignDTO, error) {
	uploadMap, err := mapper.ResolveUploadSessionExternalIDs(ctx, []int64{input.UploadSessionID})
	if err != nil {
		return DriveFilePresignDTO{}, err
	}
	fileMap, err := mapper.ResolveDriveNodeExternalIDs(ctx, []int64{input.FileID})
	if err != nil {
		return DriveFilePresignDTO{}, err
	}
	uploadID := uploadMap[input.UploadSessionID]
	fileID := fileMap[input.FileID]
	if uploadID == "" || fileID == "" {
		return DriveFilePresignDTO{}, fmt.Errorf("failed to resolve drive presign external ids")
	}
	return DriveFilePresignDTO{
		UploadSessionID: uploadID,
		FileID:          fileID,
		UploadURL:       input.UploadURL,
		ObjectURL:       input.ObjectURL,
		ExpiresIn:       input.ExpiresIn,
	}, nil
}

func PresentDriveShareView(ctx context.Context, mapper IDMapper, view *model.DriveShareView) (DriveShareViewDTO, error) {
	nodeMap, err := mapper.ResolveDriveNodeExternalIDs(ctx, []int64{view.NodeID})
	if err != nil {
		return DriveShareViewDTO{}, err
	}
	nodeID := nodeMap[view.NodeID]
	if nodeID == "" {
		return DriveShareViewDTO{}, fmt.Errorf("failed to resolve drive share node id")
	}
	result := DriveShareViewDTO{
		NodeID:      nodeID,
		Token:       view.Token,
		URL:         view.URL,
		HasPassword: view.HasPassword,
		Status:      view.Status,
	}
	if view.ExpiresAt != nil {
		value := view.ExpiresAt.UTC().Format(TimeLayout)
		result.ExpiresAt = &value
	}
	return result, nil
}
