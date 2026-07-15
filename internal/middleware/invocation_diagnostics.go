package middleware

import (
	"context"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
)

func invocationErrorEnvelope(ctx context.Context, c *app.RequestContext, payload dto.Envelope) dto.Envelope {
	diagnostics := invocationDiagnostics(ctx, c)
	if diagnostics == nil {
		return payload
	}
	payload.Diagnostics = diagnostics
	return payload
}

func invocationDiagnostics(ctx context.Context, c *app.RequestContext) *dto.InvocationDiagnostics {
	capability, ok := ResolveCapability(c)
	if !ok || !isModelInvocationCapability(capability) {
		return nil
	}
	requestID := trace.GetTraceID(ctx)
	diagnostics := dto.NewInvocationDiagnostics(requestID, requestID, model.InvocationMeta{Stage: model.InvocationStagePrepare})
	return &diagnostics
}

func isModelInvocationCapability(capability string) bool {
	if strings.HasPrefix(capability, "image.") && capability != "image.models" {
		return true
	}
	switch capability {
	case "video.generate", "music.generate", "image.read", "video.read", "audio.read", "web.search", "web.crawl":
		return true
	default:
		return false
	}
}
