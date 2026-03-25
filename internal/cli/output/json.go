package output

import (
	"encoding/json"
	"fmt"
	"io"
)

// WriteJSON writes raw JSON payload to the writer.
// Used for local commands that don't have a server request_id.
func WriteJSON(w io.Writer, payload []byte) error {
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

	out := map[string]string{"content": env.Data.Content}
	if requestID != "" {
		out["request_id"] = requestID
	}
	data, err := json.Marshal(out)
	if err != nil {
		return WriteServerJSON(w, payload, requestID)
	}

	_, err = fmt.Fprintln(w, string(data))
	return err
}

// WriteError writes a structured JSON error to the writer.
// When hint is non-empty, it is included to guide agents on recovery.
func WriteError(w io.Writer, code, message, hint string) error {
	obj := map[string]string{"error": code, "message": message}
	if hint != "" {
		obj["hint"] = hint
	}
	data, _ := json.Marshal(obj)
	_, err := fmt.Fprintln(w, string(data))
	return err
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
