package middleware

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func Recover() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		defer func() {
			if recovered := recover(); recovered != nil {
				c.JSON(
					consts.StatusInternalServerError,
					dto.ErrorEnvelope(GetRequestID(c), "INTERNAL_ERROR", fmt.Sprint(recovered)),
				)
			}
		}()

		c.Next(ctx)
	}
}
