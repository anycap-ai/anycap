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
