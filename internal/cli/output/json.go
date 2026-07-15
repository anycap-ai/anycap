package output

import (
	"encoding/json"
	"fmt"
	"io"
	"sync"
)

// --- Trace ID (per-invocation, set once at CLI startup) ---

var (
	traceIDMu     sync.Mutex
	globalTraceID string
)

// SetTraceID sets the global trace ID for this CLI invocation.
// Call once at startup; the value is injected into all JSON output.
func SetTraceID(id string) {
	traceIDMu.Lock()
	globalTraceID = id
	traceIDMu.Unlock()
}

// TraceID returns the current global trace ID.
func TraceID() string {
	traceIDMu.Lock()
	defer traceIDMu.Unlock()
	return globalTraceID
}

// WriteJSON writes raw JSON payload to the writer.
// Used for local commands that don't have a server request_id.
// Automatically injects trace_id and _system_reminder if set.
func WriteJSON(w io.Writer, payload []byte) error {
	payload = injectTraceID(payload)
	payload = injectReminder(payload)
	_, err := fmt.Fprintln(w, string(payload))
	return err
}

// WriteServerJSON writes a server JSON response, injecting request_id.
func WriteServerJSON(w io.Writer, payload []byte, requestID string) error {
	payload = injectRequestID(payload, requestID)
	payload = promoteInvocationDiagnostics(payload)
	return WriteJSON(w, payload)
}

// WriteServerContent extracts the "content" field from the server envelope
// and writes a clean JSON object with request_id and credit_cost.
//
// Server response shape: {"status":"success","data":{"content":"...","model":"...","usage":{...},"credit_cost":5}}
// CLI output:            {"content":"...","credit_cost":5,"request_id":"req_..."}
func WriteServerContent(w io.Writer, payload []byte, requestID string) error {
	var env struct {
		Status string `json:"status"`
		Data   struct {
			Content    string `json:"content"`
			CreditCost int64  `json:"credit_cost"`
		} `json:"data"`
		Error       json.RawMessage       `json:"error,omitempty"`
		Diagnostics invocationDiagnostics `json:"diagnostics"`
	}
	if err := json.Unmarshal(payload, &env); err != nil {
		return WriteServerJSON(w, payload, requestID)
	}

	// Pass through error responses as-is
	if env.Status == "error" {
		return WriteServerJSON(w, payload, requestID)
	}

	out := map[string]any{"status": "success", "content": env.Data.Content}
	if env.Data.CreditCost > 0 {
		out["credit_cost"] = env.Data.CreditCost
	}
	if requestID != "" {
		out["request_id"] = requestID
	}
	applyInvocationDiagnostics(out, env.Diagnostics)
	data, err := json.Marshal(out)
	if err != nil {
		return WriteServerJSON(w, payload, requestID)
	}

	return WriteJSON(w, data)
}

type InvocationDiagnostics struct {
	TraceID           string `json:"trace_id"`
	RequestID         string `json:"request_id"`
	TaskID            string `json:"task_id"`
	UpstreamRequestID string `json:"upstream_request_id"`
	Stage             string `json:"stage"`
}

type invocationDiagnostics = InvocationDiagnostics

func promoteInvocationDiagnostics(payload []byte) []byte {
	var envelope struct {
		Diagnostics invocationDiagnostics `json:"diagnostics"`
	}
	if err := json.Unmarshal(payload, &envelope); err != nil {
		return payload
	}
	var out map[string]any
	if err := json.Unmarshal(payload, &out); err != nil {
		return payload
	}
	applyInvocationDiagnostics(out, envelope.Diagnostics)
	promoted, err := json.Marshal(out)
	if err != nil {
		return payload
	}
	return promoted
}

func applyInvocationDiagnostics(out map[string]any, diagnostics invocationDiagnostics) {
	if diagnostics.TraceID != "" {
		out["trace_id"] = diagnostics.TraceID
	}
	if diagnostics.RequestID != "" {
		out["request_id"] = diagnostics.RequestID
	}
	if diagnostics.TaskID != "" {
		out["task_id"] = diagnostics.TaskID
	}
	if diagnostics.UpstreamRequestID != "" {
		out["upstream_request_id"] = diagnostics.UpstreamRequestID
	}
	if diagnostics.Stage != "" {
		out["stage"] = diagnostics.Stage
	}
}

// WriteError writes a structured JSON error to the writer.
// When hint or requestID are non-empty, they are included in the output.
// trace_id is injected automatically by WriteJSON.
func WriteError(w io.Writer, code, message, hint, requestID string) error {
	return WriteErrorWithDiagnostics(w, code, message, hint, InvocationDiagnostics{RequestID: requestID})
}

// WriteErrorWithDiagnostics writes a structured error with safe invocation identifiers.
func WriteErrorWithDiagnostics(w io.Writer, code, message, hint string, diagnostics InvocationDiagnostics) error {
	obj := map[string]string{"error": code, "message": message}
	if hint != "" {
		obj["hint"] = hint
	}
	applyInvocationDiagnosticsString(obj, diagnostics)
	data, _ := json.Marshal(obj)
	return WriteJSON(w, data)
}

func applyInvocationDiagnosticsString(out map[string]string, diagnostics InvocationDiagnostics) {
	for key, value := range map[string]string{
		"trace_id":            diagnostics.TraceID,
		"request_id":          diagnostics.RequestID,
		"task_id":             diagnostics.TaskID,
		"upstream_request_id": diagnostics.UpstreamRequestID,
		"stage":               diagnostics.Stage,
	} {
		if value != "" {
			out[key] = value
		}
	}
}

// injectTraceID adds a trace_id field to a JSON object payload using the global trace ID.
// Returns the original payload unchanged if trace ID is empty or payload is not a JSON object.
func injectTraceID(payload []byte) []byte {
	tid := TraceID()
	if tid == "" {
		return payload
	}
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(payload, &obj); err != nil {
		return payload
	}
	enc, _ := json.Marshal(tid)
	obj["trace_id"] = enc
	out, err := json.Marshal(obj)
	if err != nil {
		return payload
	}
	return out
}

// injectRequestID adds a request_id field to a JSON object payload.
// Returns the original payload unchanged if requestID is empty or payload is not a JSON object.
func injectRequestID(payload []byte, requestID string) []byte {
	if requestID == "" {
		return payload
	}
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(payload, &obj); err != nil {
		return payload
	}
	rid, _ := json.Marshal(requestID)
	obj["request_id"] = rid
	out, err := json.Marshal(obj)
	if err != nil {
		return payload
	}
	return out
}
