package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	modelrouteapp "gitlab.knoffice.tech/engineering/anycap/internal/application/modelroute"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type ModelRouteHandler struct {
	service *modelrouteapp.Service
}

func NewModelRouteHandler(service *modelrouteapp.Service) *ModelRouteHandler {
	return &ModelRouteHandler{service: service}
}

func (h *ModelRouteHandler) RegisterRoutes(group *route.RouterGroup) {
	group.GET("/admin/model-routes", h.List)
	group.POST("/admin/model-routes", h.Create)
	group.GET("/admin/model-routes/:id", h.Get)
	group.PUT("/admin/model-routes/:id", h.Update)
	group.DELETE("/admin/model-routes/:id", h.Delete)
}

func (h *ModelRouteHandler) List(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	items, err := h.service.List(c, model.ListModelRoutesFilter{
		Capability: ctx.DefaultQuery("capability", ""),
		Status:     ctx.DefaultQuery("status", ""),
		Search:     ctx.DefaultQuery("search", ""),
	})
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "list_model_routes_failed", err.Error())
		return
	}

	writeSuccess(ctx, map[string]any{
		"items": items,
		"total": len(items),
	})
}

func (h *ModelRouteHandler) Get(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	id, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_model_route_id", err.Error())
		return
	}

	item, err := h.service.Get(c, id)
	if err != nil {
		writeError(ctx, consts.StatusNotFound, "model_route_not_found", err.Error())
		return
	}
	writeSuccess(ctx, item)
}

func (h *ModelRouteHandler) Create(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	var req model.CreateModelRouteInput
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	item, err := h.service.Create(c, req)
	if err != nil {
		writeError(ctx, statusCodeForModelRouteError(err), "create_model_route_failed", err.Error())
		return
	}
	writeSuccess(ctx, item)
}

func (h *ModelRouteHandler) Update(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	id, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_model_route_id", err.Error())
		return
	}

	var req model.UpdateModelRouteInput
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	item, err := h.service.Update(c, id, req)
	if err != nil {
		writeError(ctx, statusCodeForModelRouteError(err), "update_model_route_failed", err.Error())
		return
	}
	writeSuccess(ctx, item)
}

func (h *ModelRouteHandler) Delete(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	id, err := parsePathID(ctx.Param("id"))
	if err != nil {
		writeError(ctx, consts.StatusBadRequest, "invalid_model_route_id", err.Error())
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		writeError(ctx, statusCodeForModelRouteError(err), "delete_model_route_failed", err.Error())
		return
	}
	writeSuccess(ctx, map[string]any{
		"id":      id,
		"deleted": true,
	})
}

func parsePathID(raw string) (int64, error) {
	id, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || id <= 0 {
		return 0, fmt.Errorf("id must be a positive integer")
	}
	return id, nil
}

func statusCodeForModelRouteError(err error) int {
	switch {
	case err == nil:
		return consts.StatusOK
	case containsAny(err.Error(), "required", "must be"):
		return consts.StatusBadRequest
	case containsAny(err.Error(), "not found"):
		return consts.StatusNotFound
	case containsAny(err.Error(), "duplicate"):
		return consts.StatusConflict
	case containsAny(err.Error(), "not configured"):
		return consts.StatusServiceUnavailable
	default:
		return consts.StatusInternalServerError
	}
}

func containsAny(input string, keywords ...string) bool {
	for _, keyword := range keywords {
		if keyword != "" && input != "" && strings.Contains(input, keyword) {
			return true
		}
	}
	return false
}
