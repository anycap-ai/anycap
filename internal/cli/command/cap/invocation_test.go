package cap

import (
	"bytes"
	"encoding/json"
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

func TestWriteInvocationStartedWritesOneJSONLineToStderr(t *testing.T) {
	output.SetTraceID("trc_cli_1")
	t.Cleanup(func() { output.SetTraceID("") })
	var stderr bytes.Buffer
	cmd := &cobra.Command{}
	cmd.SetErr(&stderr)

	if err := writeInvocationStarted(cmd, "music.generate", "suno-v5"); err != nil {
		t.Fatal(err)
	}
	if got := bytes.Count(stderr.Bytes(), []byte("\n")); got != 1 {
		t.Fatalf("newline count = %d, output = %q", got, stderr.String())
	}
	var event map[string]string
	if err := json.Unmarshal(stderr.Bytes(), &event); err != nil {
		t.Fatal(err)
	}
	if event["event"] != "invocation_started" || event["trace_id"] != "trc_cli_1" || event["capability"] != "music.generate" || event["model"] != "suno-v5" {
		t.Fatalf("event = %#v", event)
	}
}

func TestParseMusicResponsePreservesInvocationDiagnostics(t *testing.T) {
	result, err := parseMusicResponse([]byte(`{"status":"success","data":{"id":"task_data","model":"suno-v5","outputs":[],"credit_cost":1},"diagnostics":{"trace_id":"trc_1","request_id":"req_1","task_id":"task_diag","upstream_request_id":"gateway_1","stage":"validate_result"}}`))
	if err != nil {
		t.Fatal(err)
	}
	if result.TaskID != "task_diag" || result.Diagnostics.TraceID != "trc_1" || result.Diagnostics.RequestID != "req_1" || result.Diagnostics.UpstreamRequestID != "gateway_1" || result.Diagnostics.Stage != "validate_result" {
		t.Fatalf("result = %+v", result)
	}
	var stdout bytes.Buffer
	if err := writeMusicResult(&stdout, result, "header_request"); err != nil {
		t.Fatal(err)
	}
	var out map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	if out["task_id"] != "task_diag" || out["request_id"] != "req_1" || out["upstream_request_id"] != "gateway_1" || out["stage"] != "validate_result" {
		t.Fatalf("output = %#v", out)
	}
}
