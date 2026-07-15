package handlers

import (
	"encoding/json"
	"errors"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/transport/http/dto"
	"gitlab.knoffice.tech/open/common-go/trace"

	"github.com/cloudwego/hertz/pkg/app"
)

func TestWriteInvocationSuccessUsesContextTrace(t *testing.T) {
	c := trace.SetTraceID(t.Context(), "trc_success")
	ctx := app.NewContext(0)

	WriteInvocationSuccess(c, ctx, map[string]any{"ok": true}, model.InvocationMeta{
		TaskID: "task_success",
		Stage:  model.InvocationStageValidateResult,
	})

	var envelope dto.Envelope
	if err := json.Unmarshal(ctx.Response.Body(), &envelope); err != nil {
		t.Fatal(err)
	}
	if envelope.Diagnostics == nil || envelope.Diagnostics.TraceID != "trc_success" || envelope.Diagnostics.TaskID != "task_success" {
		t.Fatalf("diagnostics = %+v", envelope.Diagnostics)
	}
}

func TestWriteInvocationErrorMapsErrorAndMetadata(t *testing.T) {
	c := trace.SetTraceID(t.Context(), "trc_error")
	ctx := app.NewContext(0)
	err := model.WrapInvocationError(model.InvocationErrorCodeUpstreamTimeout, errors.New("timed out"), model.InvocationMeta{
		TaskID: "task_error",
		Stage:  model.InvocationStagePoll,
	})

	WriteInvocationError(c, ctx, err)

	if ctx.Response.StatusCode() != 504 {
		t.Fatalf("status = %d, want 504", ctx.Response.StatusCode())
	}
	var envelope dto.Envelope
	if unmarshalErr := json.Unmarshal(ctx.Response.Body(), &envelope); unmarshalErr != nil {
		t.Fatal(unmarshalErr)
	}
	if envelope.Error == nil || envelope.Error.Code != model.InvocationErrorCodeUpstreamTimeout {
		t.Fatalf("error = %+v", envelope.Error)
	}
	if envelope.Diagnostics == nil || envelope.Diagnostics.TaskID != "task_error" || envelope.Diagnostics.Stage != "poll" {
		t.Fatalf("diagnostics = %+v", envelope.Diagnostics)
	}
}

func TestWriteInvocationErrorDefaultsPreProviderFailureToPrepare(t *testing.T) {
	c := trace.SetTraceID(t.Context(), "trc_prepare")
	ctx := app.NewContext(0)
	WriteInvocationError(c, ctx, model.ErrPromptRequired)

	var envelope dto.Envelope
	if err := json.Unmarshal(ctx.Response.Body(), &envelope); err != nil {
		t.Fatal(err)
	}
	if envelope.Diagnostics == nil || envelope.Diagnostics.TraceID != "trc_prepare" || envelope.Diagnostics.Stage != model.InvocationStagePrepare {
		t.Fatalf("diagnostics = %+v", envelope.Diagnostics)
	}
}
