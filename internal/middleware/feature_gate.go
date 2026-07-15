package middleware

import (
	"context"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
)

type FeatureAccessProvider interface {
	EnabledFor(principal *model.Principal, feature string) (allowed bool, globallyEnabled bool)
}

// capabilityPrefixes lists capabilities that follow the /v1/{cap}/{operation} pattern.
// Adding a new capability here automatically enables dynamic feature gating
// for all its operations (generate, edit, upscale, etc.).
var capabilityPrefixes = []string{"image", "video", "music"}

// featureRule maps a URL path prefix to a feature flag name.
// Used only for non-standard paths that don't follow the /v1/{cap}/{op} pattern.
type featureRule struct {
	prefix  string
	feature string
}

// FeatureGate returns a Hertz middleware that blocks requests to disabled
// capability endpoints. When a request matches a disabled feature, it
// responds with 503 and a structured FEATURE_DISABLED error.
//
// Feature names are resolved dynamically from the URL path:
//   - /v1/{cap}/{operation}[/...]  -> {cap}.{operation}  (e.g. image.generate, image.edit)
//   - /v1/capabilities/{cap}/read  -> {cap}.read
//   - /v1/drive/...                -> drive
//   - /v1/pages...                 -> page
func FeatureGate(provider FeatureAccessProvider) app.HandlerFunc {
	// Static rules for paths that don't follow the /v1/{cap}/{op} pattern.
	staticRules := []featureRule{
		{"/v1/capabilities/image/read", "image.read"},
		{"/v1/capabilities/video/read", "video.read"},
		{"/v1/capabilities/audio/read", "audio.read"},
		{"/v1/drive/", "drive"},
		{"/v1/pages", "page"},
		{"/v1/agent/", "agent.control"},
		{"/im/events/", "agent.control"},
	}

	return func(c context.Context, ctx *app.RequestContext) {
		path := string(ctx.Path())

		// 1. Try dynamic capability operation pattern: /v1/{cap}/{op}[/...]
		if feat := resolveCapabilityFeature(path); feat != "" {
			checkFeatureAccess(c, ctx, provider, feat)
			return
		}

		// 2. Fall back to static rules for non-standard paths.
		for _, r := range staticRules {
			if strings.HasPrefix(path, r.prefix) {
				checkFeatureAccess(c, ctx, provider, r.feature)
				return
			}
		}

		ctx.Next(c)
	}
}

// resolveCapabilityFeature extracts a feature name from paths matching
// /v1/{cap}/{operation}[/...] for known capability prefixes.
// Returns empty string if the path doesn't match.
func resolveCapabilityFeature(path string) string {
	for _, cap := range capabilityPrefixes {
		prefix := "/v1/" + cap + "/"
		if !strings.HasPrefix(path, prefix) {
			continue
		}
		rest := path[len(prefix):]
		if rest == "" {
			continue
		}
		// Extract the first path segment as the operation.
		// /v1/image/generate       -> "generate"
		// /v1/image/edit           -> "edit"
		// /v1/image/models         -> "models"
		// /v1/image/models/x/schema -> "models"
		op := rest
		if idx := strings.IndexByte(rest, '/'); idx >= 0 {
			op = rest[:idx]
		}
		return cap + "." + op
	}
	return ""
}

// checkFeatureAccess checks if the feature is enabled and allowed for the
// current user. Responds with 503 (disabled) or 403 (not allowed) and
// aborts the request chain if access is denied. Otherwise calls ctx.Next.
func checkFeatureAccess(c context.Context, ctx *app.RequestContext, provider FeatureAccessProvider, feat string) {
	SetCapability(ctx, feat)
	principal, _ := GetPrincipal(ctx)
	allowed, enabled := provider.EnabledFor(principal, feat)
	if !enabled {
		requestID := trace.GetTraceID(c)
		payload := map[string]any{
			"id":     requestID,
			"status": "error",
			"error": map[string]any{
				"code":    "FEATURE_DISABLED",
				"message": feat + " is not available on this server",
			},
			"hint": "this feature is not yet available; use 'anycap feedback --type feature -m \"<describe your use case>\"' to request access",
		}
		if diagnostics := invocationDiagnostics(c, ctx); diagnostics != nil {
			payload["diagnostics"] = diagnostics
		}
		ctx.JSON(503, payload)
		ctx.Abort()
		return
	}
	if !allowed {
		requestID := trace.GetTraceID(c)
		payload := map[string]any{
			"id":     requestID,
			"status": "error",
			"error": map[string]any{
				"code":    "FEATURE_NOT_ALLOWED",
				"message": feat + " is not allowed for the current user",
			},
			"hint": "you don't have access to this feature; use 'anycap feedback --type feature -m \"<describe your use case>\"' to request access",
		}
		if diagnostics := invocationDiagnostics(c, ctx); diagnostics != nil {
			payload["diagnostics"] = diagnostics
		}
		ctx.JSON(403, payload)
		ctx.Abort()
		return
	}
	ctx.Next(c)
}
