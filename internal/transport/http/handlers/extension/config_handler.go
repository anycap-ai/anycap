package extension

import (
	"context"

	extensionapp "gitlab.knoffice.tech/engineering/anycap/internal/application/extension"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/route"
)

type ConfigHandler struct {
	service *extensionapp.ConfigService
}

func NewConfigHandler(service *extensionapp.ConfigService) *ConfigHandler {
	return &ConfigHandler{service: service}
}

func (h *ConfigHandler) RegisterRoutes(group *route.RouterGroup) {
	group.GET("/extension/config", h.Get)
}

func (h *ConfigHandler) Get(c context.Context, ctx *app.RequestContext) {
	ctx.JSON(200, dto.SuccessEnvelope(trace.GetTraceID(c), h.service.Current()))
}
