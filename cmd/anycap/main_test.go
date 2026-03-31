package main

import (
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
