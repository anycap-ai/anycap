package feedback

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"testing"

	feedbackapp "gitlab.knoffice.tech/engineering/anycap/internal/application/feedback"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	commonconsts "gitlab.knoffice.tech/open/common-go/consts"
	commonmw "gitlab.knoffice.tech/open/common-go/hertz/middleware"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
)

type captureFeedbackRepo struct {
	inserted model.Feedback
}

func (r *captureFeedbackRepo) Insert(_ context.Context, fb model.Feedback) error {
	r.inserted = fb
	return nil
}

func TestHandler_Submit_PersistsClientTraceIDInMetadata(t *testing.T) {
	repo := &captureFeedbackRepo{}
	handler := NewHandler(feedbackapp.NewService(repo, nil, "test"))

	h := server.Default(server.WithHostPorts(":0"))
	h.Use(commonmw.TraceMiddleware())
	h.POST("/v1/feedback", handler.Submit)

	body := []byte(`{"type":"bug","message":"broken","request_id":"req_prev_1","trace_id":"trc_prev_1","metadata":{"cli_version":"0.1.0"}}`)
	w := ut.PerformRequest(
		h.Engine,
		http.MethodPost,
		"/v1/feedback",
		&ut.Body{Body: bytes.NewReader(body), Len: len(body)},
		ut.Header{Key: "Content-Type", Value: "application/json"},
		ut.Header{Key: commonconsts.Header_TraceID, Value: "trace-feedback-submit-1"},
	)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	if repo.inserted.RequestID != "req_prev_1" {
		t.Fatalf("expected request_id req_prev_1, got %q", repo.inserted.RequestID)
	}
	if repo.inserted.Metadata["trace_id"] != "trc_prev_1" {
		t.Fatalf("expected metadata trace_id trc_prev_1, got %#v", repo.inserted.Metadata["trace_id"])
	}

	var resp map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if resp["id"] != "trace-feedback-submit-1" {
		t.Fatalf("expected response id trace-feedback-submit-1, got %#v", resp["id"])
	}
}
