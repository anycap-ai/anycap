package drive

import (
	"context"
	"encoding/json"
	"errors"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) resolveOptionalDriveNodeIDFromRaw(ctx context.Context, raw json.RawMessage) (*int64, error) {
	value, err := idresolver.ParseOptionalIDRaw(raw)
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

func (h *Handler) resolveRequiredDriveNodeIDFromRaw(ctx context.Context, raw json.RawMessage) (int64, error) {
	value, err := idresolver.ParseRequiredIDRaw(raw, "file_id")
	if err != nil {
		return 0, err
	}
	return h.resolver.ResolveDriveNodeID(ctx, value)
}

func (h *Handler) resolveRequiredUploadSessionIDFromRaw(ctx context.Context, raw json.RawMessage) (int64, error) {
	value, err := idresolver.ParseRequiredIDRaw(raw, "upload_session_id")
	if err != nil {
		return 0, err
	}
	return h.resolver.ResolveUploadSessionID(ctx, value)
}

func (h *Handler) resolveOptionalDriveNodeIDFromQuery(ctx context.Context, raw string) (*int64, error) {
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

func (h *Handler) resolveDriveNodeID(ctx context.Context, raw string) (int64, error) {
	return h.resolver.ResolveDriveNodeID(ctx, strings.TrimSpace(raw))
}

func (h *Handler) presentDriveNode(ctx context.Context, node *model.DriveNode) (presenter.DriveNodeDTO, error) {
	return presenter.PresentDriveNode(ctx, h.mapper, node)
}

func (h *Handler) presentDriveNodes(ctx context.Context, nodes []model.DriveNode) ([]presenter.DriveNodeDTO, error) {
	return presenter.PresentDriveNodes(ctx, h.mapper, nodes)
}

func (h *Handler) presentDrivePresign(ctx context.Context, input *model.DriveFilePresignResult) (presenter.DriveFilePresignDTO, error) {
	return presenter.PresentDrivePresign(ctx, h.mapper, input)
}

func (h *Handler) presentDriveShareView(ctx context.Context, view *model.DriveShareView) (presenter.DriveShareViewDTO, error) {
	return presenter.PresentDriveShareView(ctx, h.mapper, view)
}

func statusCodeForDriveError(err error) int {
	if err == nil {
		return consts.StatusOK
	}
	var domainErr *model.DomainError
	if errors.As(err, &domainErr) {
		switch domainErr.Code {
		case "validation", "quota_exceeded", "limit_reached":
			return consts.StatusBadRequest
		case "not_found":
			return consts.StatusNotFound
		case "conflict":
			return consts.StatusConflict
		case "not_configured":
			return consts.StatusServiceUnavailable
		case "payload_too_large":
			return consts.StatusRequestEntityTooLarge
		case "too_many_requests":
			return consts.StatusTooManyRequests
		}
	}
	return consts.StatusInternalServerError
}

// writeDriveError writes a structured error response, using the DomainError code
// when available (e.g. "quota_exceeded", "payload_too_large") for precise client-side matching,
// falling back to the handler-level operation code otherwise.
func writeDriveError(c context.Context, ctx *app.RequestContext, err error, fallbackCode string) {
	code := fallbackCode
	var domainErr *model.DomainError
	if errors.As(err, &domainErr) {
		code = domainErr.Code
	}
	handlers.WriteError(c, ctx, statusCodeForDriveError(err), code, err.Error())
}
