package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *DriveHandler) resolveOptionalDriveNodeIDFromRaw(ctx context.Context, raw json.RawMessage) (*int64, error) {
	value, err := parseOptionalIDRaw(raw)
	if err != nil {
		return nil, err
	}
	if value == nil {
		return nil, nil
	}
	id, err := h.resolveDriveNodeID(ctx, *value)
	if err != nil {
		return nil, err
	}
	return &id, nil
}

func (h *DriveHandler) resolveRequiredDriveNodeIDFromRaw(ctx context.Context, raw json.RawMessage) (int64, error) {
	value, err := parseRequiredIDRaw(raw, "file_id")
	if err != nil {
		return 0, err
	}
	return h.resolveDriveNodeID(ctx, value)
}

func (h *DriveHandler) resolveRequiredUploadSessionIDFromRaw(ctx context.Context, raw json.RawMessage) (int64, error) {
	value, err := parseRequiredIDRaw(raw, "upload_session_id")
	if err != nil {
		return 0, err
	}
	if h.mapper == nil {
		return parsePathID(value)
	}
	return h.mapper.ResolveUploadSessionID(ctx, value)
}

func (h *DriveHandler) resolveOptionalDriveNodeIDFromQuery(ctx context.Context, raw string) (*int64, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return nil, nil
	}
	id, err := h.resolveDriveNodeID(ctx, trimmed)
	if err != nil {
		return nil, err
	}
	return &id, nil
}

func (h *DriveHandler) resolveDriveNodeID(ctx context.Context, raw string) (int64, error) {
	if h.mapper == nil {
		return parsePathID(raw)
	}
	return h.mapper.ResolveDriveNodeID(ctx, strings.TrimSpace(raw))
}

func (h *DriveHandler) presentDriveNode(ctx context.Context, node *model.DriveNode) (any, error) {
	if h.mapper == nil || node == nil {
		return node, nil
	}
	items, err := h.presentDriveNodes(ctx, []model.DriveNode{*node})
	if err != nil {
		return nil, err
	}
	if len(items) == 0 {
		return nil, fmt.Errorf("drive node not found")
	}
	return items[0], nil
}

func (h *DriveHandler) presentDriveNodes(ctx context.Context, nodes []model.DriveNode) ([]driveNodeDTO, error) {
	if h.mapper == nil || len(nodes) == 0 {
		return nil, nil
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

	nodeMap, err := h.mapper.ResolveDriveNodeExternalIDs(ctx, nodeIDs)
	if err != nil {
		return nil, err
	}
	spaceMap, err := h.mapper.ResolveSpaceExternalIDs(ctx, spaceIDs)
	if err != nil {
		return nil, err
	}
	userMap, err := h.mapper.ResolveUserExternalIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	result := make([]driveNodeDTO, 0, len(nodes))
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

		dto := driveNodeDTO{
			ID:          externalID,
			SpaceID:     spaceExternalID,
			ParentID:    parentExternalID,
			Kind:        string(item.Kind),
			Name:        item.Name,
			Size:        item.Size,
			MIME:        item.MIME,
			EdgeVersion: item.EdgeVersion,
			CreatedBy:   createdBy,
			CreatedAt:   item.CreatedAt.UTC().Format(timeLayoutRFC3339Nano),
			UpdatedAt:   item.UpdatedAt.UTC().Format(timeLayoutRFC3339Nano),
		}
		if item.DeletedAt != nil {
			value := item.DeletedAt.UTC().Format(timeLayoutRFC3339Nano)
			dto.DeletedAt = &value
		}
		result = append(result, dto)
	}
	return result, nil
}

func (h *DriveHandler) presentDrivePresign(ctx context.Context, input *model.DriveFilePresignResult) (any, error) {
	if h.mapper == nil || input == nil {
		return input, nil
	}
	uploadMap, err := h.mapper.ResolveUploadSessionExternalIDs(ctx, []int64{input.UploadSessionID})
	if err != nil {
		return nil, err
	}
	fileMap, err := h.mapper.ResolveDriveNodeExternalIDs(ctx, []int64{input.FileID})
	if err != nil {
		return nil, err
	}
	uploadID := uploadMap[input.UploadSessionID]
	fileID := fileMap[input.FileID]
	if uploadID == "" || fileID == "" {
		return nil, fmt.Errorf("failed to resolve drive presign external ids")
	}
	return driveFilePresignDTO{
		UploadSessionID: uploadID,
		FileID:          fileID,
		UploadURL:       input.UploadURL,
		ObjectURL:       input.ObjectURL,
		ObjectKey:       input.ObjectKey,
		ExpiresIn:       input.ExpiresIn,
	}, nil
}

func (h *DriveHandler) presentDriveShareView(ctx context.Context, view *model.DriveShareView) (any, error) {
	if h.mapper == nil || view == nil {
		return view, nil
	}
	nodeMap, err := h.mapper.ResolveDriveNodeExternalIDs(ctx, []int64{view.NodeID})
	if err != nil {
		return nil, err
	}
	nodeID := nodeMap[view.NodeID]
	if nodeID == "" {
		return nil, fmt.Errorf("failed to resolve drive share node id")
	}
	result := driveShareViewDTO{
		NodeID:      nodeID,
		Token:       view.Token,
		URL:         view.URL,
		HasPassword: view.HasPassword,
		Status:      view.Status,
	}
	if view.ExpiresAt != nil {
		value := view.ExpiresAt.UTC().Format(timeLayoutRFC3339Nano)
		result.ExpiresAt = &value
	}
	return result, nil
}

func statusCodeForDriveError(err error) int {
	switch {
	case err == nil:
		return consts.StatusOK
	case containsAny(err.Error(), "required", "must be", "invalid"):
		return consts.StatusBadRequest
	case containsAny(err.Error(), "not found"):
		return consts.StatusNotFound
	case containsAny(err.Error(), "duplicate", "unique"):
		return consts.StatusConflict
	case containsAny(err.Error(), "not configured"):
		return consts.StatusServiceUnavailable
	default:
		return consts.StatusInternalServerError
	}
}

func parseOptionalInt64Query(raw string) (*int64, error) {
	if raw == "" {
		return nil, nil
	}
	parsed, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || parsed <= 0 {
		return nil, fmt.Errorf("must be a positive integer")
	}
	return &parsed, nil
}
