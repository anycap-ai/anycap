package handlers

import (
	"context"
	"encoding/json"
	"strings"

	loginapp "gitlab.knoffice.tech/engineering/anycap/internal/application/login"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/middleware"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/route"
)

type LoginHandler struct {
	service *loginapp.Service
}

func NewLoginHandler(service *loginapp.Service) *LoginHandler {
	return &LoginHandler{service: service}
}

func (h *LoginHandler) RegisterRootRoutes(group *route.RouterGroup) {
	group.GET("/device", h.DevicePage)
	group.POST("/device", h.DeviceAuthorize)
	group.GET("/auth/callback", h.WebCallback)
}

func (h *LoginHandler) RegisterRoutes(group *route.RouterGroup) {
	loginGroup := group.Group("/login")
	loginGroup.POST("/init", h.Init)
	loginGroup.POST("/callback", h.Callback)
	loginGroup.POST("/poll", h.Poll)

	authGroup := group.Group("/auth")
	authGroup.POST("/login", h.Init)
	authGroup.POST("/browser-bind", h.BrowserBind)
	authGroup.POST("/browser-complete", h.BrowserComplete)
	authGroup.POST("/callback", h.Callback)
	authGroup.POST("/device-code", h.DeviceCode)
	authGroup.POST("/device-code-check", h.DeviceCodeCheck)
	authGroup.POST("/poll", h.Poll)
	authGroup.POST("/device-poll", h.Poll)
}

func (h *LoginHandler) RegisterProtectedRoutes(group *route.RouterGroup) {
	group.POST("/auth/device-verify", h.DeviceVerify)
}

func (h *LoginHandler) Init(c context.Context, ctx *app.RequestContext) {
	var req dto.LoginInitRequest
	if len(ctx.Request.Body()) != 0 {
		if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
			ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
			return
		}
	}
	result, err := h.service.Init(c, req.Method, req.RedirectPort, req.RedirectURL)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) DevicePage(_ context.Context, ctx *app.RequestContext) {
	ctx.Data(200, "text/html; charset=utf-8", []byte(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>AnyCap Device Login</title></head>
<body>
<main style="max-width:480px;margin:48px auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<h1>AnyCap Device Login</h1>
<p>Enter the one-time code shown in your terminal to continue.</p>
<form method="post" action="/device">
<label for="user_code">One-time code</label><br/>
<input id="user_code" name="user_code" type="text" style="width:100%;padding:12px;margin:12px 0;" autofocus />
<button type="submit">Continue</button>
</form>
</main>
</body>
</html>`))
}

func (h *LoginHandler) DeviceAuthorize(c context.Context, ctx *app.RequestContext) {
	userCode := strings.TrimSpace(ctx.PostForm("user_code"))
	authURL, err := h.service.BeginDeviceAuthorization(c, userCode)
	if err != nil {
		status, _ := dto.MapDomainError(err)
		ctx.Data(status, "text/html; charset=utf-8", []byte("<!doctype html><html><body><p>Unable to continue login. "+err.Error()+`</p><p>Please return to the terminal and run <code>anycap login --headless</code> again.</p></body></html>`))
		return
	}
	ctx.Redirect(302, []byte(authURL))
}

func (h *LoginHandler) WebCallback(c context.Context, ctx *app.RequestContext) {
	code := ctx.Query("code")
	state := ctx.Query("state")
	err := h.service.CompleteDeviceAuthorization(c, code, state)
	if err != nil {
		status, _ := dto.MapDomainError(err)
		ctx.Data(status, "text/html; charset=utf-8", []byte("<!doctype html><html><body><p>Login failed. "+err.Error()+`</p><p>Please return to the terminal and retry.</p></body></html>`))
		return
	}
	ctx.Data(200, "text/html; charset=utf-8", []byte(`<!doctype html><html><body><p>Login complete. You can return to the terminal.</p></body></html>`))
}

func (h *LoginHandler) Callback(c context.Context, ctx *app.RequestContext) {
	var req dto.LoginCallbackRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	result, err := h.service.Callback(c, req.LoginSessionID, req.Code, req.State, req.RedirectURI)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) DeviceCode(c context.Context, ctx *app.RequestContext) {
	result, err := h.service.Init(c, "device", 0, "")
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) DeviceCodeCheck(c context.Context, ctx *app.RequestContext) {
	var req dto.DeviceCodeCheckRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	result, err := h.service.CheckDeviceCode(c, strings.TrimSpace(req.UserCode))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) BrowserBind(c context.Context, ctx *app.RequestContext) {
	var req dto.BrowserBindRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	result, err := h.service.BrowserBind(c, strings.TrimSpace(req.BrowserToken))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) BrowserComplete(c context.Context, ctx *app.RequestContext) {
	var req dto.BrowserCompleteRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	err := h.service.BrowserComplete(
		c,
		req.LoginSessionID,
		strings.TrimSpace(req.BrowserToken),
		req.Code,
		req.State,
		req.RedirectURI,
	)
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), map[string]string{"status": "authorized"}))
}

func (h *LoginHandler) Poll(c context.Context, ctx *app.RequestContext) {
	var req dto.LoginPollRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	result, err := h.service.Poll(c, req.LoginSessionID, strings.TrimSpace(req.PollToken))
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}

func (h *LoginHandler) DeviceVerify(c context.Context, ctx *app.RequestContext) {
	principal, ok := middleware.GetPrincipal(ctx)
	if !ok {
		status, payload := dto.MapDomainError(model.ErrAuthInvalid)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}

	var req dto.DeviceVerifyRequest
	if err := json.Unmarshal(ctx.Request.Body(), &req); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(middleware.GetRequestID(ctx), "INVALID_PARAM", "invalid json request body"))
		return
	}

	result, err := h.service.VerifyDeviceCode(c, strings.TrimSpace(req.UserCode), *principal, model.AuthUser{
		UserID:  principal.UserID,
		Email:   strings.TrimSpace(req.User.Email),
		Name:    strings.TrimSpace(req.User.Name),
		Picture: "",
	})
	if err != nil {
		middleware.ReportError(ctx, err)
		status, payload := dto.MapDomainError(err)
		payload.ID = middleware.GetRequestID(ctx)
		ctx.JSON(status, payload)
		return
	}
	ctx.JSON(200, dto.SuccessEnvelope(middleware.GetRequestID(ctx), result))
}
