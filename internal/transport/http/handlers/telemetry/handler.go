package telemetry

import (
	"context"
	"encoding/json"

	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/route"
)

const (
	// maxBodySize is the maximum accepted request body size (16 KB).
	maxBodySize = 16 * 1024

	// logType is the fixed log_type value for SLS filtering.
	logType = "cli_telemetry"
)

// Handler handles POST /v1/telemetry.
// No authentication required — the endpoint is a fire-and-forget sink
// for CLI telemetry events. Events are logged as structured JSON to stdout;
// SAE log collection pushes them to SLS automatically.
type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) RegisterRoutes(group *route.RouterGroup) {
	group.POST("/telemetry", h.Ingest)
}

func (h *Handler) Ingest(c context.Context, ctx *app.RequestContext) {
	reqID := trace.GetTraceID(c)

	body := ctx.Request.Body()
	if len(body) > maxBodySize {
		ctx.JSON(413, dto.ErrorEnvelope(reqID, "PAYLOAD_TOO_LARGE", "request body exceeds 16KB limit"))
		return
	}
	if len(body) == 0 {
		ctx.JSON(400, dto.ErrorEnvelope(reqID, "INVALID_PARAM", "empty request body"))
		return
	}

	var event dto.TelemetryEvent
	if err := json.Unmarshal(body, &event); err != nil {
		ctx.JSON(400, dto.ErrorEnvelope(reqID, "INVALID_PARAM", "invalid json request body"))
		return
	}

	if event.Type == "" {
		ctx.JSON(400, dto.ErrorEnvelope(reqID, "INVALID_PARAM", "type is required"))
		return
	}

	// Structured log entry for SLS.
	// All fields are top-level so SLS can index them directly.
	logging.WithContext(c).WithFields(logging.Fields{
		"log_type":       logType,
		"event_type":     event.Type,
		"device_id":      event.DeviceID,
		"command":        event.Command,
		"args":           event.Args,
		"duration_ms":    event.DurationMs,
		"cli_version":    event.Version,
		"cli_os":         event.OS,
		"cli_arch":       event.Arch,
		"ci":             event.CI,
		"cli_trace_id":   event.TraceID,
		"error_msg":      event.Error,
		"error_code":     event.ErrorCode,
		"cli_request_id": event.RequestID,
		"event_ts":       event.Timestamp,
	}).Info("cli telemetry event")

	ctx.JSON(200, dto.SuccessEnvelope(reqID, nil))
}
