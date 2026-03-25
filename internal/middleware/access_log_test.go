package middleware

import (
	"bytes"
	"context"
	"errors"
	"log"
	"net/http"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

func TestAccessLog_IncludesErrorDetails(t *testing.T) {
	var buf bytes.Buffer
	originalWriter := log.Writer()
	originalFlags := log.Flags()
	log.SetOutput(&buf)
	log.SetFlags(0)
	t.Cleanup(func() {
		log.SetOutput(originalWriter)
		log.SetFlags(originalFlags)
	})

	h := server.Default(server.WithHostPorts(":0"))
	h.Use(RequestID(), AccessLog())
	h.POST("/boom", func(ctx context.Context, c *app.RequestContext) {
		ReportError(c, errors.New("credit service timeout"))
		c.JSON(http.StatusInternalServerError, dto.ErrorEnvelope(GetRequestID(c), "INTERNAL_ERROR", "internal error"))
	})

	resp := ut.PerformRequest(h.Engine, http.MethodPost, "/boom", nil)
	if resp.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d body=%s", resp.Code, resp.Body.String())
	}

	logLine := buf.String()
	for _, want := range []string{
		"method=POST",
		"path=/boom",
		"status=500",
		"error_code=INTERNAL_ERROR",
		`error_message="internal error"`,
		`internal_error="credit service timeout"`,
	} {
		if !strings.Contains(logLine, want) {
			t.Fatalf("expected log to contain %q, got: %s", want, logLine)
		}
	}
}
