package lark

import (
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestBuildFeedbackMessageRendersOriginalInvocationDiagnostics(t *testing.T) {
	_, markdown := buildFeedbackMessage(model.Feedback{
		ID: "fb_1", Type: "bug", Message: "silent result", RequestID: "feedback_submission_request",
		Diagnostics: model.FeedbackDiagnostics{
			TraceID: "trc_original", RequestID: "req_original", TaskID: "task_original",
			UpstreamRequestID: "gateway_original", Capability: "music.generate", Model: "suno-v5",
			Stage: "validate_result", ErrorCode: "UPSTREAM_EMPTY_RESULT", InvokedAt: "2026-07-15T01:30:59Z",
		},
	})
	for _, value := range []string{"trc_original", "req_original", "task_original", "gateway_original", "music.generate", "suno-v5", "validate_result", "UPSTREAM_EMPTY_RESULT", "2026-07-15T01:30:59Z"} {
		if !strings.Contains(markdown, value) {
			t.Fatalf("markdown missing %q: %s", value, markdown)
		}
	}
	if strings.Contains(markdown, "feedback_submission_request") {
		t.Fatalf("markdown used feedback submission request instead of original invocation: %s", markdown)
	}
}

func TestBuildFeedbackMessageSanitizesDiagnosticMarkdown(t *testing.T) {
	_, markdown := buildFeedbackMessage(model.Feedback{ID: "fb_1", Type: "bug", Message: "broken", Diagnostics: model.FeedbackDiagnostics{TaskID: "task`injected\nline"}})
	if strings.Contains(markdown, "task`injected\nline") || !strings.Contains(markdown, "task'injected line") {
		t.Fatalf("diagnostics were not sanitized: %s", markdown)
	}
}
