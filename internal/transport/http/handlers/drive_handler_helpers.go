package handlers

import (
	"context"
	"encoding/json"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

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
	id, err := h.resolver.ResolveDriveNodeID(ctx, *value)
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
	return h.resolver.ResolveDriveNodeID(ctx, value)
}

func (h *DriveHandler) resolveRequiredUploadSessionIDFromRaw(ctx context.Context, raw json.RawMessage) (int64, error) {
	value, err := parseRequiredIDRaw(raw, "upload_session_id")
	if err != nil {
		return 0, err
	}
	return h.resolver.ResolveUploadSessionID(ctx, value)
}

func (h *DriveHandler) resolveOptionalDriveNodeIDFromQuery(ctx context.Context, raw string) (*int64, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return nil, nil
	}
	id, err := h.resolver.ResolveDriveNodeID(ctx, trimmed)
	if err != nil {
		return nil, err
	}
	return &id, nil
}

func (h *DriveHandler) resolveDriveNodeID(ctx context.Context, raw string) (int64, error) {
	return h.resolver.ResolveDriveNodeID(ctx, strings.TrimSpace(raw))
}

func (h *DriveHandler) presentDriveNode(ctx context.Context, node *model.DriveNode) (presenter.DriveNodeDTO, error) {
	return presenter.PresentDriveNode(ctx, h.mapper, node)
}

func (h *DriveHandler) presentDriveNodes(ctx context.Context, nodes []model.DriveNode) ([]presenter.DriveNodeDTO, error) {
	return presenter.PresentDriveNodes(ctx, h.mapper, nodes)
}

func (h *DriveHandler) presentDrivePresign(ctx context.Context, input *model.DriveFilePresignResult) (presenter.DriveFilePresignDTO, error) {
	return presenter.PresentDrivePresign(ctx, h.mapper, input)
}

func (h *DriveHandler) presentDriveShareView(ctx context.Context, view *model.DriveShareView) (presenter.DriveShareViewDTO, error) {
	return presenter.PresentDriveShareView(ctx, h.mapper, view)
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
