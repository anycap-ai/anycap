package middleware

import (
	"context"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"

	"github.com/cloudwego/hertz/pkg/app"
)

// featureRule maps a URL path prefix to a feature flag name.
type featureRule struct {
	prefix  string
	feature string
}

type FeatureAccessProvider interface {
	EnabledFor(principal *model.Principal, feature string) (allowed bool, globallyEnabled bool)
}

// FeatureGate returns a Hertz middleware that blocks requests to disabled
// capability endpoints. When a request matches a disabled feature, it
// responds with 503 and a structured FEATURE_DISABLED error.
//
// The features map is typically the same map passed to the system service
// at bootstrap time. It is read-only after server startup.
func FeatureGate(provider FeatureAccessProvider) app.HandlerFunc {
	rules := []featureRule{
		{"/v1/image/generate", "image.generate"},
		{"/v1/image/models", "image.models"},
		{"/v1/video/generate", "video.generate"},
		{"/v1/video/models", "video.models"},
		{"/v1/music/generate", "music.generate"},
		{"/v1/music/models", "music.models"},
		{"/v1/capabilities/image/read", "image.read"},
		{"/v1/capabilities/video/read", "video.read"},
		{"/v1/capabilities/audio/read", "audio.read"},
		{"/v1/drive/", "drive"},
		{"/v1/pages", "page"},
	}

	return func(c context.Context, ctx *app.RequestContext) {
		path := string(ctx.Path())
		for _, r := range rules {
			if strings.HasPrefix(path, r.prefix) {
				principal, _ := GetPrincipal(ctx)
				allowed, enabled := provider.EnabledFor(principal, r.feature)
				if !enabled {
					requestID := GetRequestID(ctx)
					ctx.JSON(503, map[string]any{
						"id":         requestID,
						"request_id": requestID,
						"status":     "error",
						"error": map[string]any{
							"code":    "FEATURE_DISABLED",
							"message": r.feature + " is not available on this server",
						},
						"hint": "run 'anycap status' to see available features",
					})
					ctx.Abort()
					return
				}
				if !allowed {
					requestID := GetRequestID(ctx)
					ctx.JSON(403, map[string]any{
						"id":         requestID,
						"request_id": requestID,
						"status":     "error",
						"error": map[string]any{
							"code":    "FEATURE_NOT_ALLOWED",
							"message": r.feature + " is not allowed for the current user",
						},
					})
					ctx.Abort()
					return
				}
				break
			}
		}
		ctx.Next(c)
	}
}
