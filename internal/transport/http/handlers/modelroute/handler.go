// Package modelroute exposes the legacy /v1/admin/model-routes admin
// endpoints backed by the Postgres anycap_model_routes table.
//
// Deprecated: the public catalog read path now goes through
// curatedcatalog (dconf-curated list + NexusHub Discovery). These
// admin endpoints are retained only for ad-hoc inspection of the
// historical table and should not be extended.
package modelroute

import (
	"context"
	"encoding/json"
	"strings"

	modelrouteapp "gitlab.knoffice.tech/engineering/anycap/internal/application/modelroute"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type Handler struct {
	service  *modelrouteapp.Service
	resolver idresolver.IDResolver
	mapper   presenter.IDMapper
}

func NewHandler(service *modelrouteapp.Service, resolver idresolver.IDResolver, mapper presenter.IDMapper) *Handler {
	return &Handler{service: service, resolver: resolver, mapper: mapper}
}

func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	group.GET("/admin/model-routes", h.List)
	group.POST("/admin/model-routes", h.Create)
	group.GET("/admin/model-routes/:id", h.Get)
	group.PUT("/admin/model-routes/:id", h.Update)
	group.DELETE("/admin/model-routes/:id", h.Delete)
}

func (h *Handler) List(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	items, err := h.service.List(c, model.ListModelRoutesFilter{
		Capability: ctx.DefaultQuery("capability", ""),
		Status:     ctx.DefaultQuery("status", ""),
		Search:     ctx.DefaultQuery("search", ""),
	})
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "list_model_routes_failed", err.Error())
		return
	}

	presentedItems, err := presenter.PresentModelRoutes(c, h.mapper, items)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_model_routes_failed", err.Error())
		return
	}

	handlers.WriteSuccess(c, ctx, map[string]any{
		"items": presentedItems,
		"total": len(presentedItems),
	})
}

func (h *Handler) Get(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	id, err := h.resolver.ResolveModelRouteID(c, strings.TrimSpace(string(ctx.Param("id"))))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_model_route_id", err)
		return
	}

	item, err := h.service.Get(c, id)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusNotFound, "model_route_not_found", err.Error())
		return
	}
	presented, err := presenter.PresentModelRoute(c, h.mapper, item)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_model_route_failed", err.Error())
		return
	}
	handlers.WriteSuccess(c, ctx, presented)
}

func (h *Handler) Create(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	var req model.CreateModelRouteInput
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	item, err := h.service.Create(c, req)
	if err != nil {
		handlers.WriteError(c, ctx, statusCodeForModelRouteError(err), "create_model_route_failed", err.Error())
		return
	}
	presented, err := presenter.PresentModelRoute(c, h.mapper, item)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_model_route_failed", err.Error())
		return
	}
	handlers.WriteSuccess(c, ctx, presented)
}

func (h *Handler) Update(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	id, err := h.resolver.ResolveModelRouteID(c, strings.TrimSpace(string(ctx.Param("id"))))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_model_route_id", err)
		return
	}

	var req model.UpdateModelRouteInput
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		handlers.WriteError(c, ctx, consts.StatusBadRequest, "invalid_request_body", "invalid json request body")
		return
	}

	item, err := h.service.Update(c, id, req)
	if err != nil {
		handlers.WriteError(c, ctx, statusCodeForModelRouteError(err), "update_model_route_failed", err.Error())
		return
	}
	presented, err := presenter.PresentModelRoute(c, h.mapper, item)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_model_route_failed", err.Error())
		return
	}
	handlers.WriteSuccess(c, ctx, presented)
}

func (h *Handler) Delete(c context.Context, ctx *app.RequestContext) {
	if h.service == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "model_route_service_unavailable", "model route service is not configured")
		return
	}

	rawID := strings.TrimSpace(string(ctx.Param("id")))
	id, err := h.resolver.ResolveModelRouteID(c, rawID)
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "invalid_model_route_id", err)
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		handlers.WriteError(c, ctx, statusCodeForModelRouteError(err), "delete_model_route_failed", err.Error())
		return
	}

	handlers.WriteSuccess(c, ctx, map[string]any{"id": rawID, "deleted": true})
}
