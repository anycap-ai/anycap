package lark

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/logging"
)

// WebhookNotifier sends feedback notifications via a Lark message proxy service.
type WebhookNotifier struct {
	msgAPI        string
	webhookURL    string
	webhookSecret string
	client        *http.Client
}

// NewWebhookNotifier creates a Lark webhook notifier using the message proxy.
func NewWebhookNotifier(msgAPI, webhookURL, webhookSecret string) *WebhookNotifier {
	return &WebhookNotifier{
		msgAPI:        msgAPI,
		webhookURL:    webhookURL,
		webhookSecret: webhookSecret,
		client:        &http.Client{Timeout: 10 * time.Second},
	}
}

func (n *WebhookNotifier) Notify(ctx context.Context, fb model.Feedback) error {
	title, markdown := buildFeedbackMessage(fb)

	payload := map[string]string{
		"title":            title,
		"markdown_content": markdown,
		"webhook_url":      n.webhookURL,
		"secret":           n.webhookSecret,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("lark notify: marshal: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, n.msgAPI, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("lark notify: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := n.client.Do(req)
	if err != nil {
		return fmt.Errorf("lark notify: send: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("lark notify: status %d body=%s", resp.StatusCode, string(respBody))
	}
	return nil
}

// buildFeedbackMessage builds a title and markdown body for the feedback notification.
func buildFeedbackMessage(fb model.Feedback) (string, string) {
	typeLabel := map[string]string{
		"bug":     "Bug Report",
		"feature": "Feature Request",
		"other":   "Other Feedback",
	}
	label, ok := typeLabel[fb.Type]
	if !ok {
		label = fb.Type
	}

	title := fmt.Sprintf("[AnyCap] %s", label)

	env := ""
	if fb.Metadata != nil {
		if v, ok := fb.Metadata["env"]; ok {
			env = fmt.Sprintf("%v", v)
			title = fmt.Sprintf("[AnyCap/%s] %s", env, label)
		}
	}

	md := fmt.Sprintf("**Type:** %s\n**ID:** `%s`\n", label, fb.ID)

	if fb.UserID != "" {
		md += fmt.Sprintf("**User:** %s\n", fb.UserID)
	}
	diagnostics := feedbackDiagnostics(fb)
	for _, field := range []struct {
		label string
		value string
	}{
		{"Trace ID", diagnostics.TraceID},
		{"Request ID", diagnostics.RequestID},
		{"Task ID", diagnostics.TaskID},
		{"Upstream Request ID", diagnostics.UpstreamRequestID},
		{"Capability", diagnostics.Capability},
		{"Model", diagnostics.Model},
		{"Stage", diagnostics.Stage},
		{"Error Code", diagnostics.ErrorCode},
		{"Invoked At", diagnostics.InvokedAt},
	} {
		if field.value != "" {
			md += fmt.Sprintf("**%s:** `%s`\n", field.label, sanitizeInlineCode(field.value))
		}
	}

	md += fmt.Sprintf("\n---\n\n%s\n", fb.Message)

	if fb.Context != nil {
		ctxJSON, _ := json.MarshalIndent(fb.Context, "", "  ")
		md += fmt.Sprintf("\n**Context:**\n```json\n%s\n```\n", string(ctxJSON))
	}

	if fb.Metadata != nil {
		if v, ok := fb.Metadata["cli_version"]; ok {
			if osVal, ok2 := fb.Metadata["os"]; ok2 {
				md += fmt.Sprintf("\n> CLI %v | %v | %s", v, osVal, fb.CreatedAt.Format(time.RFC3339))
			}
		}
	}

	return title, md
}

func sanitizeInlineCode(value string) string {
	value = strings.ReplaceAll(value, "`", "'")
	value = strings.ReplaceAll(value, "\r", " ")
	return strings.ReplaceAll(value, "\n", " ")
}

// feedbackTaskID extracts an upstream gateway task id from feedback context,
// if the client attached one (e.g. --context '{"task_id":"..."}').
func feedbackTaskID(fb model.Feedback) string {
	if fb.Context == nil {
		return ""
	}
	if v, ok := fb.Context["task_id"]; ok {
		if s := fmt.Sprintf("%v", v); s != "" {
			return s
		}
	}
	return ""
}

func feedbackDiagnostics(fb model.Feedback) model.FeedbackDiagnostics {
	diagnostics := fb.Diagnostics
	if diagnostics.RequestID == "" {
		diagnostics.RequestID = fb.RequestID
	}
	if diagnostics.TaskID == "" {
		diagnostics.TaskID = feedbackTaskID(fb)
	}
	if diagnostics.TraceID == "" && fb.Metadata != nil {
		if value, ok := fb.Metadata["trace_id"]; ok {
			diagnostics.TraceID = fmt.Sprintf("%v", value)
		}
	}
	if fb.Metadata != nil {
		if raw, ok := fb.Metadata["diagnostics"]; ok {
			data, err := json.Marshal(raw)
			if err == nil {
				var stored model.FeedbackDiagnostics
				if json.Unmarshal(data, &stored) == nil {
					diagnostics = mergeFeedbackDiagnostics(diagnostics, stored)
				}
			}
		}
	}
	return diagnostics
}

func mergeFeedbackDiagnostics(primary, fallback model.FeedbackDiagnostics) model.FeedbackDiagnostics {
	fields := []*string{&primary.TraceID, &primary.RequestID, &primary.TaskID, &primary.UpstreamRequestID, &primary.Capability, &primary.Model, &primary.Stage, &primary.ErrorCode, &primary.InvokedAt}
	values := []string{fallback.TraceID, fallback.RequestID, fallback.TaskID, fallback.UpstreamRequestID, fallback.Capability, fallback.Model, fallback.Stage, fallback.ErrorCode, fallback.InvokedAt}
	for i, field := range fields {
		if *field == "" {
			*field = values[i]
		}
	}
	return primary
}

// StubNotifier is a no-op notifier that just logs feedback.
type StubNotifier struct{}

func NewStubNotifier() *StubNotifier {
	return &StubNotifier{}
}

func (n *StubNotifier) Notify(_ context.Context, fb model.Feedback) error {
	logging.WithFields(logging.Fields{
		"feedback_id": fb.ID,
		"type":        fb.Type,
		"message":     fb.Message,
	}).Info("feedback notification stub")
	return nil
}
