package handlers

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func Ping(_ context.Context, ctx *app.RequestContext) {
	ctx.JSON(consts.StatusOK, utils.H{
		"message": "pong",
	})
}

func Healthz(_ context.Context, ctx *app.RequestContext) {
	ctx.JSON(consts.StatusOK, utils.H{
		"service": "anycap",
		"status":  "ok",
	})
}
