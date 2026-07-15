package model

import (
	"errors"
	"testing"
)

func TestInvocationErrorUnwrapsCauseAndPreservesMetadata(t *testing.T) {
	cause := errors.New("provider unavailable")
	err := &InvocationError{
		Code:  "UPSTREAM_TIMEOUT",
		Cause: cause,
		Meta: InvocationMeta{
			TaskID:            "task_123",
			UpstreamRequestID: "upreq_456",
			ProviderStatus:    "processing",
			Stage:             InvocationStagePoll,
		},
	}

	if !errors.Is(err, cause) {
		t.Fatal("InvocationError must unwrap its cause")
	}
	var got *InvocationError
	if !errors.As(err, &got) {
		t.Fatal("errors.As must find InvocationError")
	}
	if got.Code != "UPSTREAM_TIMEOUT" {
		t.Fatalf("Code = %q, want UPSTREAM_TIMEOUT", got.Code)
	}
	if got.Meta.TaskID != "task_123" || got.Meta.UpstreamRequestID != "upreq_456" {
		t.Fatalf("metadata was not preserved: %+v", got.Meta)
	}
	if got.Error() != cause.Error() {
		t.Fatalf("Error() = %q, want %q", got.Error(), cause.Error())
	}
}

func TestMergeInvocationMetaPreservesKnownIdentifiersAndAdvancesState(t *testing.T) {
	known := InvocationMeta{
		TaskID:            "task_known",
		UpstreamRequestID: "upreq_known",
		ProviderStatus:    "submitted",
		Stage:             InvocationStageSubmit,
	}
	update := InvocationMeta{
		TaskID:         "",
		ProviderStatus: "success",
		Stage:          InvocationStageValidateResult,
	}

	got := MergeInvocationMeta(known, update)
	if got.TaskID != "task_known" || got.UpstreamRequestID != "upreq_known" {
		t.Fatalf("known identifiers were erased: %+v", got)
	}
	if got.ProviderStatus != "success" || got.Stage != InvocationStageValidateResult {
		t.Fatalf("execution state did not advance: %+v", got)
	}
}

func TestWrapInvocationErrorMergesExistingMetadata(t *testing.T) {
	cause := errors.New("decode failed")
	inner := WrapInvocationError("UPSTREAM_BAD_RESPONSE", cause, InvocationMeta{
		TaskID:         "task_789",
		ProviderStatus: "success",
		Stage:          InvocationStageDecodeResult,
	})

	wrapped := WrapInvocationError("", inner, InvocationMeta{Stage: InvocationStagePublish})
	meta, ok := InvocationMetaFromError(wrapped)
	if !ok {
		t.Fatal("expected invocation metadata")
	}
	if meta.TaskID != "task_789" || meta.Stage != InvocationStagePublish {
		t.Fatalf("metadata = %+v, want retained task and publish stage", meta)
	}
	var invocationErr *InvocationError
	if !errors.As(wrapped, &invocationErr) {
		t.Fatal("expected typed invocation error")
	}
	if invocationErr.Code != "UPSTREAM_BAD_RESPONSE" {
		t.Fatalf("Code = %q, want inherited UPSTREAM_BAD_RESPONSE", invocationErr.Code)
	}
	if !errors.Is(wrapped, cause) {
		t.Fatal("wrapped invocation error must retain original cause")
	}
}

func TestInvocationStagesAreStablePublicValues(t *testing.T) {
	stages := []InvocationStage{
		InvocationStagePrepare,
		InvocationStageSubmit,
		InvocationStagePoll,
		InvocationStageDecodeResult,
		InvocationStageValidateResult,
		InvocationStagePublish,
		InvocationStageBilling,
	}
	want := []string{"prepare", "submit", "poll", "decode_result", "validate_result", "publish", "billing"}
	for i := range stages {
		if string(stages[i]) != want[i] {
			t.Fatalf("stage[%d] = %q, want %q", i, stages[i], want[i])
		}
	}
}
