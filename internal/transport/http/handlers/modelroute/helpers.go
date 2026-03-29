package modelroute

import (
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/handlers"

	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

func statusCodeForModelRouteError(err error) int {
	switch {
	case err == nil:
		return consts.StatusOK
	case handlers.ContainsAny(err.Error(), "required", "must be"):
		return consts.StatusBadRequest
	case handlers.ContainsAny(err.Error(), "not found"):
		return consts.StatusNotFound
	case handlers.ContainsAny(err.Error(), "duplicate"):
		return consts.StatusConflict
	case handlers.ContainsAny(err.Error(), "not configured"):
		return consts.StatusServiceUnavailable
	default:
		return consts.StatusInternalServerError
	}
}
