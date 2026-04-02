package main

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net"
	"net/url"
	"os"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/command"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/telemetry"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func main() {
	start := time.Now()
	endpointOverride := parseEndpointFromArgs()
	traceID := generateTraceID()
	output.SetTraceID(traceID)

	cmd := command.NewRootCmd(command.Options{
		BuildInfo: buildinfo.Current(),
		Endpoint:  endpointOverride,
		TraceID:   traceID,
	})

	if err := cmd.Execute(); err != nil {
		code, message, hint, requestID := classifyError(err)
		sent := telemetry.ReportError(telemetry.ErrorReport{
			Command:    extractCommand(),
			Args:       os.Args[1:],
			Err:        err,
			ErrorCode:  code,
			RequestID:  requestID,
			TraceID:    traceID,
			DurationMs: time.Since(start).Milliseconds(),
			Endpoint:   endpointOverride,
		})
		if sent {
			// Brief sleep to allow the background telemetry goroutine to fire.
			time.Sleep(100 * time.Millisecond)
		}
		_ = output.WriteError(os.Stdout, code, message, hint, requestID)
		os.Exit(1)
	}
}

// classifyError maps an error to a machine-readable code, message, hint,
// and optional request_id for JSON output.
func classifyError(err error) (code, message, hint, requestID string) {
	// Server API error (parsed from JSON envelope)
	var apiErr *httpclient.APIError
	if errors.As(err, &apiErr) {
		return apiErr.Code, apiErr.Message, hintForAPIError(apiErr), apiErr.RequestID
	}

	// Authentication error (401)
	var authErr *httpclient.AuthError
	if errors.As(err, &authErr) {
		return "auth_required", authErr.Error(), "run 'anycap login' to authenticate (use 'anycap login --headless' in environments without a browser)", ""
	}

	// Network / connection errors
	var urlErr *url.Error
	var netErr *net.OpError
	if errors.As(err, &urlErr) || errors.As(err, &netErr) {
		return "connection_error", err.Error(), "check that the server is running, or set --endpoint", ""
	}

	// Cobra / CLI validation errors
	msg := err.Error()

	if strings.Contains(msg, "unknown command") {
		return "unknown_command", msg, "run 'anycap --help' for available commands, or 'anycap feedback' to request a feature", ""
	}
	if strings.Contains(msg, "required flag") ||
		strings.Contains(msg, "flags in the group") ||
		strings.Contains(msg, "none of the others can be") ||
		strings.Contains(msg, "subcommand required") ||
		strings.Contains(msg, "is required") ||
		strings.Contains(msg, "too many") {
		return "invalid_args", msg, "", ""
	}

	// Default: suggest feedback for unexpected errors
	return "error", msg, "if this is unexpected, report with: anycap feedback --type bug -m '<describe the issue>'", ""
}

// hintForAPIError returns a recovery hint for well-known server error codes.
func hintForAPIError(e *httpclient.APIError) string {
	switch {
	case e.StatusCode == 401:
		return "run 'anycap login' to authenticate (use 'anycap login --headless' in environments without a browser)"
	case e.StatusCode == 429:
		return "rate limited, retry after a short delay"
	case e.Code == "credit_insufficient":
		return "top up credits at https://anycap.ai/dashboard/billing"
	case e.Code == "FEATURE_DISABLED":
		return "this feature is not yet available; use 'anycap feedback --type feature -m \"<describe your use case>\"' to request access"
	case e.Code == "FEATURE_NOT_ALLOWED":
		return "you don't have access to this feature; use 'anycap feedback --type feature -m \"<describe your use case>\"' to request access"
	case e.Code == "UPSTREAM_UNAVAILABLE":
		return "upstream provider unavailable, retry later or check provider quota/configuration"
	case e.StatusCode >= 500:
		return feedbackHint(e.RequestID)
	default:
		return ""
	}
}

// feedbackHint builds a hint suggesting the agent report the error via feedback.
func feedbackHint(requestID string) string {
	parts := "anycap feedback --type bug -m '<describe>'"
	if requestID != "" {
		parts += fmt.Sprintf(" --request-id '%s'", requestID)
	}
	if tid := output.TraceID(); tid != "" {
		parts += fmt.Sprintf(" --trace-id '%s'", tid)
	}
	return "server error; report with: " + parts
}

// generateTraceID creates a unique trace ID for this CLI invocation.
func generateTraceID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return "trc_" + hex.EncodeToString(b)
}

// parseEndpointFromArgs scans os.Args for --endpoint before cobra runs.
// Returns empty string if not found (ResolveEndpoint will use env/config/default).
func parseEndpointFromArgs() string {
	for i, arg := range os.Args {
		if arg == "--endpoint" && i+1 < len(os.Args) {
			return os.Args[i+1]
		}
		if strings.HasPrefix(arg, "--endpoint=") {
			return strings.TrimPrefix(arg, "--endpoint=")
		}
	}
	return ""
}

// extractCommand extracts the subcommand from os.Args, skipping the binary name
// and any flags. For example: ["anycap", "image", "generate", "--model", "x"]
// returns "image generate".
func extractCommand() string {
	var parts []string
	for _, arg := range os.Args[1:] {
		if strings.HasPrefix(arg, "-") {
			break
		}
		parts = append(parts, arg)
	}
	if len(parts) == 0 {
		return "anycap"
	}
	return strings.Join(parts, " ")
}
