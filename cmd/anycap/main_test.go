package main

import (
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
)

func TestHintForAPIError_UpstreamUnavailable(t *testing.T) {
	hint := hintForAPIError(&httpclient.APIError{
		StatusCode: 503,
		Code:       "UPSTREAM_UNAVAILABLE",
		Message:    "upstream service unavailable",
		RequestID:  "req-1",
	})
	if hint == "" {
		t.Fatal("expected non-empty hint for upstream unavailable")
	}
}

func TestHintForAPIErrorIncludesStructuredDiagnostics(t *testing.T) {
	hint := hintForAPIError(&httpclient.APIError{
		StatusCode: 502, Code: "UPSTREAM_EMPTY_RESULT", RequestID: "req_1", TraceID: "trc_1",
		TaskID: "task_1", UpstreamRequestID: "gateway_1", Stage: "validate_result",
	})
	for _, value := range []string{"--diagnostics", `"trace_id":"trc_1"`, `"task_id":"task_1"`, `"upstream_request_id":"gateway_1"`, `"stage":"validate_result"`, `"error_code":"UPSTREAM_EMPTY_RESULT"`} {
		if !strings.Contains(hint, value) {
			t.Fatalf("hint missing %q: %s", value, hint)
		}
	}
}
