package idresolver

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	commonconsts "gitlab.knoffice.tech/open/common-go/consts"
	commonmw "gitlab.knoffice.tech/open/common-go/hertz/middleware"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

func TestWriteIDResolveError_UsesTraceIDFromContext(t *testing.T) {
	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware())
	h.GET("/test", func(c context.Context, ctx *app.RequestContext) {
		WriteIDResolveError(c, ctx, "invalid_parent_id", fmt.Errorf("%w: bad id", ErrExternalIDInvalid))
	})

	w := ut.PerformRequest(
		h.Engine,
		http.MethodGet,
		"/test",
		nil,
		ut.Header{Key: commonconsts.Header_TraceID, Value: "trace-from-header"},
	)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
	}

	var body map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to parse body: %v", err)
	}

	if body["id"] != "trace-from-header" {
		t.Fatalf("expected response id trace-from-header, got %#v", body["id"])
	}
}
