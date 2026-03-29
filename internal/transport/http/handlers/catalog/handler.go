package catalog

import (
	"context"
	"fmt"

	catalogapp "gitlab.knoffice.tech/engineering/anycap/internal/application/catalog"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

// Handler 提供模型目录 discovery 端点。
// 支持 /v1/{capability}/models 和 /v1/{capability}/models/{model}/schema
type Handler struct {
	service    *catalogapp.Service
	capability model.Capability
}

func NewHandler(service *catalogapp.Service, capability model.Capability) *Handler {
	return &Handler{service: service, capability: capability}
}

// RegisterRoutes 将 discovery 端点注册到所属 capability 的 sub-group。
// 例如传入 /v1 group 后，image handler 会注册:
//   - GET /v1/image/models
//   - GET /v1/image/models/:model/schema
func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	g := group.Group(fmt.Sprintf("/%s", h.capability))
	g.GET("/models", h.ListModels)
	g.GET("/models/:model/schema", h.GetModelSchema)
}

func (h *Handler) ListModels(c context.Context, ctx *app.RequestContext) {
	summaries, err := h.service.ListModels(c, h.capability)
	if err != nil {
		ctx.JSON(consts.StatusInternalServerError, map[string]any{
			"status": "error",
			"error": map[string]any{
				"code":    "LIST_MODELS_FAILED",
				"message": err.Error(),
			},
		})
		return
	}

	ctx.JSON(consts.StatusOK, map[string]any{
		"status":     "success",
		"capability": h.capability,
		"models":     summaries,
	})
}

func (h *Handler) GetModelSchema(c context.Context, ctx *app.RequestContext) {
	modelID := ctx.Param("model")
	operation := ctx.DefaultQuery("operation", "generate")

	schema, err := h.service.GetModelSchema(c, h.capability, modelID, operation)
	if err != nil {
		ctx.JSON(consts.StatusNotFound, map[string]any{
			"status": "error",
			"error": map[string]any{
				"code":    "SCHEMA_NOT_FOUND",
				"message": err.Error(),
			},
		})
		return
	}

	ctx.JSON(consts.StatusOK, map[string]any{
		"status": "success",
		"data":   schema,
	})
}
