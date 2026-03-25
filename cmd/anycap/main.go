package main

import (
	"errors"
	"net"
	"net/url"
	"os"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/command"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func main() {
	cmd := command.NewRootCmd(command.Options{
		BuildInfo: buildinfo.Current(),
	})

	if err := cmd.Execute(); err != nil {
		code, message, hint := classifyError(err)
		_ = output.WriteError(os.Stdout, code, message, hint)
		os.Exit(1)
	}
}

// classifyError maps an error to a machine-readable code, message, and
// an optional hint that tells the agent how to recover.
func classifyError(err error) (code, message, hint string) {
	// Server API error (parsed from JSON envelope)
	var apiErr *httpclient.APIError
	if errors.As(err, &apiErr) {
		return apiErr.Code, apiErr.Message, hintForAPIError(apiErr)
	}

	// Authentication error (401)
	var authErr *httpclient.AuthError
	if errors.As(err, &authErr) {
		return "auth_required", authErr.Error(), "run 'anycap login' to authenticate"
	}

	// Network / connection errors
	var urlErr *url.Error
	var netErr *net.OpError
	if errors.As(err, &urlErr) || errors.As(err, &netErr) {
		return "connection_error", err.Error(), "check that the server is running, or set --endpoint"
	}

	// Cobra / CLI validation errors
	msg := err.Error()

	if strings.Contains(msg, "unknown command") {
		return "unknown_command", msg, "run 'anycap --help' for available commands"
	}
	if strings.Contains(msg, "required flag") ||
		strings.Contains(msg, "flags in the group") ||
		strings.Contains(msg, "none of the others can be") ||
		strings.Contains(msg, "subcommand required") ||
		strings.Contains(msg, "is required") ||
		strings.Contains(msg, "too many") {
		return "invalid_args", msg, ""
	}

	// Default
	return "error", msg, ""
}

// hintForAPIError returns a recovery hint for well-known server error codes.
func hintForAPIError(e *httpclient.APIError) string {
	switch {
	case e.StatusCode == 401:
		return "run 'anycap login' to authenticate"
	case e.StatusCode == 429:
		return "rate limited, retry after a short delay"
	case e.Code == "credit_insufficient":
		return "top up credits at https://anycap.ai/dashboard/billing"
	default:
		return ""
	}
}
