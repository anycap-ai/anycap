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
	return WriteJSON(w, injectRequestID(payload, requestID))
}

// WriteServerContent extracts the "content" field from the server envelope
// and writes a clean JSON object with request_id.
//
// Server response shape: {"status":"success","data":{"content":"...","model":"...","usage":{...}}}
// CLI output:            {"content":"...","request_id":"req_..."}
func WriteServerContent(w io.Writer, payload []byte, requestID string) error {
	var env struct {
		Status string `json:"status"`
		Data   struct {
			Content string `json:"content"`
		} `json:"data"`
		Error json.RawMessage `json:"error,omitempty"`
	}
	if err := json.Unmarshal(payload, &env); err != nil {
		return WriteServerJSON(w, payload, requestID)
	}

	// Pass through error responses as-is
	if env.Status == "error" {
		return WriteServerJSON(w, payload, requestID)
	}

	out := map[string]string{"status": "success", "content": env.Data.Content}
	if requestID != "" {
		out["request_id"] = requestID
	}
	data, err := json.Marshal(out)
	if err != nil {
		return WriteServerJSON(w, payload, requestID)
	}

	return WriteJSON(w, data)
}

// WriteError writes a structured JSON error to the writer.
// When hint or requestID are non-empty, they are included in the output.
// trace_id is injected automatically by WriteJSON.
func WriteError(w io.Writer, code, message, hint, requestID string) error {
	obj := map[string]string{"error": code, "message": message}
	if hint != "" {
		obj["hint"] = hint
	}
	if requestID != "" {
		obj["request_id"] = requestID
	}
	data, _ := json.Marshal(obj)
	return WriteJSON(w, data)
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
