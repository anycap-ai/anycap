package meta

import (
	"encoding/json"
	"fmt"
	"io"
	"runtime"

	cliconfig "gitlab.knoffice.tech/engineering/anycap/internal/cli/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/spf13/cobra"
)

// feedbackTypes is the allowed set of feedback type values.
var feedbackTypes = []string{"bug", "feature", "other"}

// NewFeedbackCmd creates the "feedback" command for submitting bug reports
// and feature requests to the AnyCap team.
func NewFeedbackCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		feedbackType string
		message      string
		context      string
		requestID    string
		traceID      string
	)

	cmd := &cobra.Command{
		Use:   "feedback",
		Short: "Submit a bug report or feature request",
		RunE: func(cmd *cobra.Command, args []string) error {
			// Check if feedback is disabled in config
			cfg, _ := cliconfig.Load()
			if !cfg.IsFeedbackEnabled() {
				return fmt.Errorf("feedback is disabled in config (set feedback = true in %s to re-enable)", cliconfig.ConfigPath())
			}

			// Validate type
			if !isValidType(feedbackType) {
				return fmt.Errorf("invalid feedback type %q: must be one of %v", feedbackType, feedbackTypes)
			}

			// Validate context JSON if provided
			var contextJSON json.RawMessage
			if context != "" {
				if !json.Valid([]byte(context)) {
					return fmt.Errorf("--context must be valid JSON, got: %s", context)
				}
				contextJSON = json.RawMessage(context)
			}

			// Build request payload
			payload := map[string]any{
				"type":    feedbackType,
				"message": message,
				"metadata": map[string]string{
					"cli_version": buildinfo.Version,
					"os":          runtime.GOOS + "/" + runtime.GOARCH,
				},
			}
			if contextJSON != nil {
				payload["context"] = contextJSON
			}
			if requestID != "" {
				payload["request_id"] = requestID
			}
			if traceID != "" {
				payload["trace_id"] = traceID
			}

			resp, err := clientFactory().PostJSON(cmd.Context(), api.FeedbackPath, payload)
			if err != nil {
				return err
			}

			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	cmd.Flags().StringVar(&feedbackType, "type", "", "Feedback type: bug, feature, or other")
	cmd.Flags().StringVarP(&message, "message", "m", "", "Feedback message")
	cmd.Flags().StringVar(&context, "context", "", "Additional context as JSON")
	cmd.Flags().StringVar(&requestID, "request-id", "", "Related request ID from a previous command")
	cmd.Flags().StringVar(&traceID, "trace-id", "", "Related trace ID from a previous command invocation")
	_ = cmd.MarkFlagRequired("type")
	_ = cmd.MarkFlagRequired("message")

	return cmd
}

func isValidType(t string) bool {
	for _, v := range feedbackTypes {
		if t == v {
			return true
		}
	}
	return false
}
