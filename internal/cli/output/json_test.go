package output

import (
	"bytes"
	"encoding/json"
	"testing"
)

func TestWriteServerContent_IncludesCreditCost(t *testing.T) {
	payload := []byte(`{"status":"success","data":{"content":"A cat sitting on a mat.","model":"gpt-4o","usage":{"input_tokens":100,"output_tokens":50,"total_tokens":150},"duration_ms":1234,"credit_cost":5}}`)

	var buf bytes.Buffer
	if err := WriteServerContent(&buf, payload, "req-123"); err != nil {
		t.Fatalf("WriteServerContent() error = %v", err)
	}

	var out map[string]any
	if err := json.Unmarshal(buf.Bytes(), &out); err != nil {
		t.Fatalf("unmarshal output: %v", err)
	}

	if out["content"] != "A cat sitting on a mat." {
		t.Fatalf("unexpected content: %v", out["content"])
	}
	if out["credit_cost"] != float64(5) {
		t.Fatalf("expected credit_cost 5, got %v", out["credit_cost"])
	}
	if out["request_id"] != "req-123" {
		t.Fatalf("expected request_id req-123, got %v", out["request_id"])
	}
	if out["status"] != "success" {
		t.Fatalf("expected status success, got %v", out["status"])
	}
}

func TestWriteServerContent_OmitsCreditCostWhenZero(t *testing.T) {
	payload := []byte(`{"status":"success","data":{"content":"Hello","model":"gpt-4o","credit_cost":0}}`)

	var buf bytes.Buffer
	if err := WriteServerContent(&buf, payload, ""); err != nil {
		t.Fatalf("WriteServerContent() error = %v", err)
	}

	var out map[string]any
	if err := json.Unmarshal(buf.Bytes(), &out); err != nil {
		t.Fatalf("unmarshal output: %v", err)
	}

	if _, exists := out["credit_cost"]; exists {
		t.Fatalf("credit_cost should be omitted when zero, got %v", out["credit_cost"])
	}
}

func TestWriteServerContent_PassthroughError(t *testing.T) {
	payload := []byte(`{"status":"error","error":{"code":"insufficient_credit","message":"not enough credits"}}`)

	var buf bytes.Buffer
	if err := WriteServerContent(&buf, payload, "req-err"); err != nil {
		t.Fatalf("WriteServerContent() error = %v", err)
	}

	var out map[string]any
	if err := json.Unmarshal(buf.Bytes(), &out); err != nil {
		t.Fatalf("unmarshal output: %v", err)
	}

	if out["status"] != "error" {
		t.Fatalf("expected error passthrough, got status %v", out["status"])
	}
}

func TestWriteServerJSONPromotesInvocationDiagnostics(t *testing.T) {
	payload := []byte(`{"id":"trc_1","status":"success","data":{"id":"task_1"},"diagnostics":{"trace_id":"trc_1","request_id":"req_1","task_id":"task_1","upstream_request_id":"gateway_1","stage":"decode_result"}}`)
	var buf bytes.Buffer
	if err := WriteServerJSON(&buf, payload, "req_header"); err != nil {
		t.Fatal(err)
	}
	var out map[string]any
	if err := json.Unmarshal(buf.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	for key, want := range map[string]any{
		"trace_id":            "trc_1",
		"request_id":          "req_1",
		"task_id":             "task_1",
		"upstream_request_id": "gateway_1",
		"stage":               "decode_result",
	} {
		if out[key] != want {
			t.Fatalf("%s = %#v, want %#v; output=%#v", key, out[key], want, out)
		}
	}
}

func TestWriteServerContentPromotesInvocationDiagnostics(t *testing.T) {
	payload := []byte(`{"status":"success","data":{"content":"hello"},"diagnostics":{"trace_id":"trc_read","request_id":"req_read","upstream_request_id":"gateway_read","stage":"decode_result"}}`)
	var buf bytes.Buffer
	if err := WriteServerContent(&buf, payload, "header_read"); err != nil {
		t.Fatal(err)
	}
	var out map[string]any
	if err := json.Unmarshal(buf.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	if out["trace_id"] != "trc_read" || out["request_id"] != "req_read" || out["upstream_request_id"] != "gateway_read" || out["stage"] != "decode_result" {
		t.Fatalf("output = %#v", out)
	}
}

func TestWriteErrorWithDiagnosticsPromotesSafeFields(t *testing.T) {
	var buf bytes.Buffer
	if err := WriteErrorWithDiagnostics(&buf, "UPSTREAM_TIMEOUT", "timed out", "retry", InvocationDiagnostics{
		TraceID: "trc_error", RequestID: "req_error", TaskID: "task_error", UpstreamRequestID: "gateway_error", Stage: "poll",
	}); err != nil {
		t.Fatal(err)
	}
	var out map[string]any
	if err := json.Unmarshal(buf.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	if out["trace_id"] != "trc_error" || out["request_id"] != "req_error" || out["task_id"] != "task_error" || out["upstream_request_id"] != "gateway_error" || out["stage"] != "poll" {
		t.Fatalf("output = %#v", out)
	}
}
