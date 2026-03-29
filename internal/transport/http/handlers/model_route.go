package handlers

import (
	"context"
	"encoding/json"
	"strings"

	modelrouteapp "gitlab.knoffice.tech/engineering/anycap/internal/application/modelroute"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type ModelRouteHandler struct {
	service  *modelrouteapp.Service
	resolver IDResolver
	mapper   presenter.IDMapper
}

func NewModelRouteHandler(service *modelrouteapp.Service, resolver IDResolver, mapper presenter.IDMapper) *ModelRouteHandler {
	return &ModelRouteHandler{service: service, resolver: resolver, mapper: mapper}
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

	presentedItems, err := presenter.PresentModelRoutes(c, h.mapper, items)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_model_routes_failed", err.Error())
		return
	}

	writeSuccess(ctx, map[string]any{
		"items": presentedItems,
		"total": len(presentedItems),
	})
}

func (h *ModelRouteHandler) Get(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	id, err := h.resolver.ResolveModelRouteID(c, strings.TrimSpace(string(ctx.Param("id"))))
	if err != nil {
		writeIDResolveError(ctx, "invalid_model_route_id", err)
		return
	}

	item, err := h.service.Get(c, id)
	if err != nil {
		writeError(ctx, consts.StatusNotFound, "model_route_not_found", err.Error())
		return
	}
	presented, err := presenter.PresentModelRoute(c, h.mapper, item)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_model_route_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
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
	presented, err := presenter.PresentModelRoute(c, h.mapper, item)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_model_route_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
}

func (h *ModelRouteHandler) Update(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	id, err := h.resolver.ResolveModelRouteID(c, strings.TrimSpace(string(ctx.Param("id"))))
	if err != nil {
		writeIDResolveError(ctx, "invalid_model_route_id", err)
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
	presented, err := presenter.PresentModelRoute(c, h.mapper, item)
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "present_model_route_failed", err.Error())
		return
	}
	writeSuccess(ctx, presented)
}

func (h *ModelRouteHandler) Delete(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		writeError(ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	id, err := h.resolver.ResolveModelRouteID(c, strings.TrimSpace(string(ctx.Param("id"))))
	if err != nil {
		writeIDResolveError(ctx, "invalid_model_route_id", err)
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		writeError(ctx, statusCodeForModelRouteError(err), "delete_model_route_failed", err.Error())
		return
	}

	ids, err := h.mapper.ResolveModelRouteExternalIDs(c, []int64{id})
	if err != nil {
		writeError(ctx, consts.StatusInternalServerError, "resolve_model_route_id_failed", err.Error())
		return
	}
	writeSuccess(ctx, map[string]any{"id": ids[id], "deleted": true})
}
