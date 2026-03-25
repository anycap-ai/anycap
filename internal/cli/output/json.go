package output

import (
	"encoding/json"
	"fmt"
	"io"
)

// WriteJSON writes raw JSON payload to the writer.
func WriteJSON(w io.Writer, payload []byte) error {
	_, err := fmt.Fprintln(w, string(payload))
	return err
}

// WriteContent extracts the "content" field from the server envelope
// and writes a clean JSON object: {"content": "..."}.
//
// Server response shape: {"status":"success","data":{"content":"...","model":"...","usage":{...}}}
// CLI output:            {"content":"..."}
func WriteContent(w io.Writer, payload []byte) error {
	var env struct {
		Status string `json:"status"`
		Data   struct {
			Content string `json:"content"`
		} `json:"data"`
		Error json.RawMessage `json:"error,omitempty"`
	}
	if err := json.Unmarshal(payload, &env); err != nil {
		return WriteJSON(w, payload)
	}

	// Pass through error responses as-is
	if env.Status == "error" {
		return WriteJSON(w, payload)
	}

	out, err := json.Marshal(map[string]string{"content": env.Data.Content})
	if err != nil {
		return WriteJSON(w, payload)
	}

	_, err = fmt.Fprintln(w, string(out))
	return err
}
