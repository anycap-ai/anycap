package output

import (
	"encoding/json"
)

// SystemReminder is injected into JSON output as "_system_reminder" to
// notify AI agents of actions they should take (e.g. update skills after
// a CLI self-update).
type SystemReminder struct {
	Description string   `json:"description"`
	Commands    []string `json:"commands"`
}

// globalReminder holds the current system reminder, if any.
// Safe to use as a package-level var because the CLI is single-process,
// single-goroutine.
var globalReminder *SystemReminder

// SetSystemReminder sets the global system reminder to be injected into
// all subsequent JSON output.
func SetSystemReminder(r *SystemReminder) {
	globalReminder = r
}

// injectReminder adds "_system_reminder" to a JSON object payload.
// Returns the original payload unchanged if no reminder is set or
// payload is not a JSON object.
func injectReminder(payload []byte) []byte {
	if globalReminder == nil {
		return payload
	}
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(payload, &obj); err != nil {
		return payload
	}
	rem, err := json.Marshal(globalReminder)
	if err != nil {
		return payload
	}
	obj["_system_reminder"] = rem
	out, err := json.Marshal(obj)
	if err != nil {
		return payload
	}
	return out
}
