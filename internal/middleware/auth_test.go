package middleware

import (
	"context"

	"net/http"
	"testing"

	"github.com/cloudwego/hertz/pkg/app"

	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/apikey"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

func TestAuthMiddleware_RejectMissingBearer(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(RequestID())
	h.GET("/protected", Auth(apikey.NewMemoryService()), func(ctx context.Context, c *app.RequestContext) { c.String(200, "ok") })

	resp := ut.PerformRequest(h.Engine, http.MethodGet, "/protected", nil)
	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d body=%s", resp.Code, resp.Body.String())
	}
}
