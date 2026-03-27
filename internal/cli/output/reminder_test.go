package output

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"
)

func TestInjectReminder_NoReminder(t *testing.T) {
	payload := []byte(`{"content":"hello"}`)
	result := injectReminder(payload)
	if !bytes.Equal(result, payload) {
		t.Errorf("expected payload unchanged, got %s", result)
	}
}

func TestInjectReminder_WithReminder(t *testing.T) {
	SetSystemReminder(&SystemReminder{
		Description: "CLI was updated.",
		Commands:    []string{"npx skills add anycap-ai/anycap"},
	})
	defer SetSystemReminder(nil)

	payload := []byte(`{"content":"hello"}`)
	result := injectReminder(payload)

	var obj map[string]json.RawMessage
	if err := json.Unmarshal(result, &obj); err != nil {
		t.Fatalf("unmarshal result: %v", err)
	}

	if _, ok := obj["_system_reminder"]; !ok {
		t.Fatal("expected _system_reminder field in output")
	}
	if _, ok := obj["content"]; !ok {
		t.Fatal("expected content field preserved")
	}

	var rem SystemReminder
	if err := json.Unmarshal(obj["_system_reminder"], &rem); err != nil {
		t.Fatalf("unmarshal reminder: %v", err)
	}
	if rem.Description != "CLI was updated." {
		t.Errorf("expected description 'CLI was updated.', got %q", rem.Description)
	}
	if len(rem.Commands) != 1 || rem.Commands[0] != "npx skills add anycap-ai/anycap" {
		t.Errorf("unexpected commands: %v", rem.Commands)
	}
}

func TestInjectReminder_NonJSONPayload(t *testing.T) {
	SetSystemReminder(&SystemReminder{
		Description: "test",
		Commands:    []string{"cmd"},
	})
	defer SetSystemReminder(nil)

	payload := []byte("not json")
	result := injectReminder(payload)
	if !bytes.Equal(result, payload) {
		t.Errorf("expected non-JSON payload unchanged, got %s", result)
	}
}

func TestWriteJSON_InjectsReminder(t *testing.T) {
	SetSystemReminder(&SystemReminder{
		Description: "update skills",
		Commands:    []string{"npx skills add anycap-ai/anycap"},
	})
	defer SetSystemReminder(nil)

	var buf bytes.Buffer
	if err := WriteJSON(&buf, []byte(`{"status":"ok"}`)); err != nil {
		t.Fatal(err)
	}

	output := strings.TrimSpace(buf.String())
	if !strings.Contains(output, `"_system_reminder"`) {
		t.Errorf("expected _system_reminder in output, got %s", output)
	}
	if !strings.Contains(output, `"status"`) {
		t.Errorf("expected status field preserved, got %s", output)
	}
}

func TestWriteJSON_NoReminderWhenNil(t *testing.T) {
	SetSystemReminder(nil)

	var buf bytes.Buffer
	if err := WriteJSON(&buf, []byte(`{"status":"ok"}`)); err != nil {
		t.Fatal(err)
	}

	output := strings.TrimSpace(buf.String())
	if strings.Contains(output, `_system_reminder`) {
		t.Errorf("expected no _system_reminder, got %s", output)
	}
}

func TestWriteError_InjectsReminder(t *testing.T) {
	SetSystemReminder(&SystemReminder{
		Description: "test",
		Commands:    []string{"cmd"},
	})
	defer SetSystemReminder(nil)

	var buf bytes.Buffer
	if err := WriteError(&buf, "auth_required", "not logged in", "run anycap login", ""); err != nil {
		t.Fatal(err)
	}

	output := strings.TrimSpace(buf.String())
	if !strings.Contains(output, `"_system_reminder"`) {
		t.Errorf("expected _system_reminder in error output, got %s", output)
	}
	if !strings.Contains(output, `"auth_required"`) {
		t.Errorf("expected error field preserved, got %s", output)
	}
}
