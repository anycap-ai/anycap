package middleware

import (
	"context"
	"fmt"
	"runtime/debug"

	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func Recover() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		defer func() {
			if recovered := recover(); recovered != nil {
				ReportError(c, fmt.Errorf("%v", recovered))
				logging.WithContext(ctx).WithFields(logging.Fields{
					"panic": recovered,
					"stack": string(debug.Stack()),
				}).Error("panic recovered")
				c.JSON(
					consts.StatusInternalServerError,
					dto.ErrorEnvelope(trace.GetTraceID(ctx), "INTERNAL_ERROR", fmt.Sprint(recovered)),
				)
			}
		}()

		c.Next(ctx)
	}
}
