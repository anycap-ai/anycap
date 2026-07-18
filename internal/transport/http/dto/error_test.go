package dto

import (
	"encoding/json"
	"errors"
	"strings"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestInvocationDiagnosticsEnvelopeIncludesKnownIdentifiers(t *testing.T) {
	diagnostics := NewInvocationDiagnostics("trc_123", "req_123", model.InvocationMeta{
		TaskID:            "task_123",
		UpstreamRequestID: "upreq_123",
		Stage:             model.InvocationStagePoll,
	})
	envelope := SuccessInvocationEnvelope("req_123", map[string]any{"ok": true}, diagnostics)

	data, err := json.Marshal(envelope)
	if err != nil {
		t.Fatal(err)
	}
	jsonBody := string(data)
	for _, want := range []string{
		`"trace_id":"trc_123"`,
		`"request_id":"req_123"`,
		`"task_id":"task_123"`,
		`"upstream_request_id":"upreq_123"`,
		`"stage":"poll"`,
	} {
		if !strings.Contains(jsonBody, want) {
			t.Fatalf("body %s does not contain %s", jsonBody, want)
		}
	}
}

func TestInvocationDiagnosticsEnvelopeOmitsUnknownOptionalFields(t *testing.T) {
	diagnostics := NewInvocationDiagnostics("trc_123", "req_123", model.InvocationMeta{})
	envelope := SuccessInvocationEnvelope("req_123", map[string]any{"ok": true}, diagnostics)

	data, err := json.Marshal(envelope)
	if err != nil {
		t.Fatal(err)
	}
	jsonBody := string(data)
	for _, unwanted := range []string{"task_id", "upstream_request_id", "stage", "provider_status"} {
		if strings.Contains(jsonBody, unwanted) {
			t.Fatalf("body %s unexpectedly contains %q", jsonBody, unwanted)
		}
	}
}

func TestMapDomainErrorMapsInvocationCodes(t *testing.T) {
	tests := []struct {
		name       string
		code       string
		wantStatus int
	}{
		{name: "timeout", code: model.InvocationErrorCodeUpstreamTimeout, wantStatus: 504},
		{name: "empty result", code: model.InvocationErrorCodeUpstreamEmptyResult, wantStatus: 502},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cause := errors.New("private provider detail")
			err := model.WrapInvocationError(tt.code, cause, model.InvocationMeta{
				TaskID: "task_123",
				Stage:  model.InvocationStageValidateResult,
			})

			status, envelope := MapDomainError(err)
			if status != tt.wantStatus {
				t.Fatalf("status = %d, want %d", status, tt.wantStatus)
			}
			if envelope.Error == nil || envelope.Error.Code != tt.code {
				t.Fatalf("error = %+v, want code %s", envelope.Error, tt.code)
			}
			if strings.Contains(envelope.Error.Message, "private provider detail") {
				t.Fatalf("unsafe provider detail leaked: %q", envelope.Error.Message)
			}
		})
	}
}

func TestMapDomainErrorMapsAudioProviderNotConfigured(t *testing.T) {
	status, envelope := MapDomainError(model.ErrAudioExecutionNotConfigured)
	if status != 503 {
		t.Fatalf("status = %d, want 503", status)
	}
	if envelope.Error == nil || envelope.Error.Code != "AUDIO_PROVIDER_NOT_CONFIGURED" {
		t.Fatalf("error = %+v", envelope.Error)
	}
}
