package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/url"
	"os"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/command"
	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
	"gitlab.knoffice.tech/engineering/anycap/pkg/feature"
)

func main() {
	endpointOverride := parseEndpointFromArgs()
	syncServerFeatures(endpointOverride)

	cmd := command.NewRootCmd(command.Options{
		BuildInfo: buildinfo.Current(),
		Endpoint:  endpointOverride,
	})

	if err := cmd.Execute(); err != nil {
		code, message, hint, requestID := classifyError(err)
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
	if requestID != "" {
		return fmt.Sprintf("server error; report with: anycap feedback --type bug -m '<describe>' --request-id '%s'", requestID)
	}
	return "server error; report with: anycap feedback --type bug -m '<describe>'"
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

// localOnlyCommands are commands that never need server connectivity.
// All other invocations (including --help) do preflight feature sync.
var localOnlyCommands = map[string]bool{
	"config":     true,
	"credential": true,
	"skill":      true,
	"update":     true,
}

// shouldSkipPreflight returns true only for purely local operations
// that never contact the server.
func shouldSkipPreflight() bool {
	for _, arg := range os.Args[1:] {
		if arg == "--version" || arg == "-v" {
			return true
		}
		if strings.HasPrefix(arg, "-") {
			continue
		}
		return localOnlyCommands[arg]
	}
	return false
}

// syncServerFeatures fetches the server's feature flags and applies them
// to the local feature registry before the command tree is built.
// Fails silently on any error so offline usage is not blocked.
func syncServerFeatures(endpointOverride string) {
	if shouldSkipPreflight() {
		return
	}

	endpoint := cliconfig.ResolveEndpoint(endpointOverride)
	client := httpclient.New(endpoint)
	credential := cliconfig.LoadCredential()

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if credential != nil && credential.Token() != "" {
		authClient := httpclient.New(endpoint, httpclient.WithCredential(credential))
		if features, ok := fetchFeatures(ctx, authClient, api.MeFeaturesPath); ok {
			feature.SetAll(features)
			return
		}
	}

	features, ok := fetchFeatures(ctx, client, api.FeaturesPath)
	if !ok {
		// Server unreachable — disable all features so only local
		// commands (config, credential, skill, login, etc.) are visible.
		feature.DisableAll()
		return
	}
	feature.SetAll(features)
}

func fetchFeatures(ctx context.Context, client *httpclient.Client, path string) (map[string]bool, bool) {
	if client == nil {
		return nil, false
	}

	resp, err := client.Get(ctx, path)
	if err != nil {
		return nil, false
	}

	var env struct {
		Data struct {
			Features map[string]bool `json:"features"`
		} `json:"data"`
	}
	if json.Unmarshal(resp.Body, &env) == nil && env.Data.Features != nil {
		return env.Data.Features, true
	}
	return nil, false
}
