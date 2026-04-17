package agentcontrol

import (
	"context"

	agentcontrolapp "gitlab.knoffice.tech/engineering/anycap/internal/application/agentcontrol"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers/idresolver"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/presenter"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/cloudwego/hertz/pkg/route"
)

type TaskHandler struct {
	service  *agentcontrolapp.TaskService
	tasks    port.AgentTaskRepository
	resolver idresolver.IDResolver
	mapper   presenter.IDMapper
}

func NewTaskHandler(service *agentcontrolapp.TaskService, tasks port.AgentTaskRepository, resolver idresolver.IDResolver, mapper presenter.IDMapper) *TaskHandler {
	return &TaskHandler{service: service, tasks: tasks, resolver: resolver, mapper: mapper}
}

func (h *TaskHandler) RegisterRoutes(group *route.RouterGroup) {
	group.GET("/agent/tasks/:id", h.GetTask)
	group.POST("/agent/tasks/:id/cancel", h.CancelTask)
}

func (h *TaskHandler) GetTask(c context.Context, ctx *app.RequestContext) {
	if h.tasks == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "task service is not configured")
		return
	}
	if _, ok := middleware.GetPrincipal(ctx); !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	id, err := h.resolver.ResolveAgentTaskID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_task_failed", err)
		return
	}
	task, err := h.tasks.GetTaskByID(c, id)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	if task == nil {
		status, payload := dto.MapDomainError(model.ErrNotFound("agent task not found"))
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentAgentTask(c, h.mapper, task)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_task_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}

func (h *TaskHandler) CancelTask(c context.Context, ctx *app.RequestContext) {
	if h.service == nil || h.resolver == nil || h.mapper == nil {
		handlers.WriteError(c, ctx, consts.StatusServiceUnavailable, "agent_control_unavailable", "task service is not configured")
		return
	}
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		handlers.WriteError(c, ctx, consts.StatusUnauthorized, "auth_invalid", "missing principal")
		return
	}
	id, err := h.resolver.ResolveAgentTaskID(c, string(ctx.Param("id")))
	if err != nil {
		idresolver.WriteIDResolveError(c, ctx, "resolve_agent_task_failed", err)
		return
	}
	task, err := h.service.CancelTask(c, principal, id)
	if err != nil {
		status, payload := dto.MapDomainError(err)
		payload.ID = trace.GetTraceID(c)
		ctx.JSON(status, payload)
		return
	}
	out, err := presenter.PresentAgentTask(c, h.mapper, task)
	if err != nil {
		handlers.WriteError(c, ctx, consts.StatusInternalServerError, "present_agent_task_failed", err.Error())
		return
	}
	ctx.JSON(consts.StatusOK, dto.SuccessEnvelope(trace.GetTraceID(c), out))
}
