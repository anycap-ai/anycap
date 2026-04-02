package drive

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func (h *Handler) CreateAccessLinks(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "drive_service_unavailable", "drive service is not configured")
		return
	}

	principal, ok := middleware.GetPrincipal(ctx)
	if !ok || principal == nil {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}

	userID, ok := handlers.ParseUserID(c, ctx, principal.UserID)
	if !ok {
		return
	}

	nodeID, err := h.resolveDriveNodeID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_drive_node_id", err)
		return
	}

	result, err := h.service.CreateAccessLinks(c, userID, nodeID)
	if err != nil {
		writeDriveError(c, ctx, err, "create_drive_access_links_failed")
		return
	}
	handlers.WriteSuccess(c, ctx, map[string]any{
		"preview_url":  result.PreviewURL,
		"download_url": result.DownloadURL,
		"expires_at":   result.ExpiresAt.UTC().Format("2006-01-02T15:04:05Z07:00"),
	})
}
