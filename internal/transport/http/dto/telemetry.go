package dto

// TelemetryEvent is the JSON body for POST /v1/telemetry.
// All fields are optional except Type; the handler validates minimally
// and logs the event as structured JSON for SLS ingestion.
type TelemetryEvent struct {
	Type       string   `json:"type"`
	DeviceID   string   `json:"device_id,omitempty"`
	Command    string   `json:"command,omitempty"`
	Args       []string `json:"args,omitempty"`
	DurationMs int64    `json:"duration_ms,omitempty"`
	Version    string   `json:"version,omitempty"`
	OS         string   `json:"os,omitempty"`
	Arch       string   `json:"arch,omitempty"`
	CI         bool     `json:"ci,omitempty"`
	TraceID    string   `json:"trace_id,omitempty"`
	Error      string   `json:"error,omitempty"`
	ErrorCode  string   `json:"error_code,omitempty"`
	RequestID  string   `json:"request_id,omitempty"`
	Timestamp  int64    `json:"timestamp,omitempty"`
}
