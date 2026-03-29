package handlers

import (
	"context"
	"encoding/json"

	modelrouteapp "gitlab.knoffice.tech/engineering/anycap/internal/application/modelroute"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type ModelRouteHandler struct {
	service *modelrouteapp.Service
	mapper  ExternalIDMapper
}

type ModelRouteHandlerOption func(*ModelRouteHandler)

func WithModelRouteExternalIDMapper(mapper ExternalIDMapper) ModelRouteHandlerOption {
	return func(h *ModelRouteHandler) {
		h.mapper = mapper
	}
}

func NewModelRouteHandler(service *modelrouteapp.Service, options ...ModelRouteHandlerOption) *ModelRouteHandler {
	handler := &ModelRouteHandler{service: service}
	for _, option := range options {
		if option != nil {
			option(handler)
		}
	}
	return handler
}

func (h *ModelRouteHandler) RegisterRoutes(group *route.RouterGroup) {
	group.GET("/admin/model-routes", h.List)
	group.POST("/admin/model-routes", h.Create)
	group.GET("/admin/model-routes/:id", h.Get)
	group.PUT("/admin/model-routes/:id", h.Update)
	group.DELETE("/admin/model-routes/:id", h.Delete)
}

type modelRouteDTO struct {
	ID          string         `json:"id"`
	ModelID     string         `json:"model_id"`
	Capability  string         `json:"capability"`
	Operation   string         `json:"operation"`
	AbilityKey  string         `json:"ability_key"`
	AlgoType    string         `json:"algo_type,omitempty"`
	DisplayName string         `json:"display_name,omitempty"`
	RouteType   string         `json:"route_type,omitempty"`
	Region      string         `json:"region,omitempty"`
	Tier        string         `json:"tier,omitempty"`
	Env         string         `json:"env,omitempty"`
	Priority    int            `json:"priority"`
	Enabled     bool           `json:"enabled"`
	Status      string         `json:"status"`
	Extra       map[string]any `json:"extra,omitempty"`
	CreatedAt   string         `json:"created_at"`
	UpdatedAt   string         `json:"updated_at"`
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
	if h.mapper == nil {
		writeSuccess(ctx, map[string]any{
			"items": items,
			"total": len(items),
		})
		return
	}

	presentedItems, err := h.presentModelRoutes(c, items)
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

	id, err := h.resolveModelRouteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_model_route_id", err)
		return
	}

	item, err := h.service.Get(c, id)
	if err != nil {
		writeError(ctx, consts.StatusNotFound, "model_route_not_found", err.Error())
		return
	}
	presented, err := h.presentModelRoute(c, item)
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
	presented, err := h.presentModelRoute(c, item)
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

	id, err := h.resolveModelRouteID(c, string(ctx.Param("id")))
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
	presented, err := h.presentModelRoute(c, item)
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

	id, err := h.resolveModelRouteID(c, string(ctx.Param("id")))
	if err != nil {
		writeIDResolveError(ctx, "invalid_model_route_id", err)
		return
	}

	if err := h.service.Delete(c, id); err != nil {
		writeError(ctx, statusCodeForModelRouteError(err), "delete_model_route_failed", err.Error())
		return
	}
	responseID := any(id)
	if h.mapper != nil {
		ids, resolveErr := h.mapper.ResolveModelRouteExternalIDs(c, []int64{id})
		if resolveErr != nil {
			writeError(ctx, consts.StatusInternalServerError, "resolve_model_route_id_failed", resolveErr.Error())
			return
		}
		responseID = ids[id]
	}
	writeSuccess(ctx, map[string]any{"id": responseID, "deleted": true})
}
