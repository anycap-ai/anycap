package cap

import (
	"encoding/json"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

type cliInvocationDiagnostics struct {
	TraceID           string `json:"trace_id"`
	RequestID         string `json:"request_id"`
	TaskID            string `json:"task_id"`
	UpstreamRequestID string `json:"upstream_request_id"`
	Stage             string `json:"stage"`
}

func writeInvocationStarted(cmd *cobra.Command, capability, model string) error {
	event := map[string]string{
		"event":      "invocation_started",
		"trace_id":   output.TraceID(),
		"capability": capability,
		"model":      model,
	}
	return writeJSONLine(cmd.ErrOrStderr(), event)
}

func writeJSONLine(w io.Writer, value any) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	_, err = w.Write(append(data, '\n'))
	return err
}

func applyCLIDiagnostics(result map[string]any, diagnostics cliInvocationDiagnostics, fallbackRequestID string) {
	requestID := diagnostics.RequestID
	if requestID == "" {
		requestID = fallbackRequestID
	}
	for key, value := range map[string]string{
		"trace_id":            diagnostics.TraceID,
		"request_id":          requestID,
		"task_id":             diagnostics.TaskID,
		"upstream_request_id": diagnostics.UpstreamRequestID,
		"stage":               diagnostics.Stage,
	} {
		if value != "" {
			result[key] = value
		}
	}
}
