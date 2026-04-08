package agentcontrol

import (
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

func TestParseCommandAcceptsSlashRun(t *testing.T) {
	parsed, err := ParseCommand("/run codex fix parser panic on empty input")
	if err != nil {
		t.Fatalf("ParseCommand() error = %v", err)
	}
	if parsed.Agent != "codex" {
		t.Fatalf("expected agent codex, got %q", parsed.Agent)
	}
	if parsed.Intent != model.AgentIntentExecuteTask {
		t.Fatalf("expected intent %q, got %q", model.AgentIntentExecuteTask, parsed.Intent)
	}
	if parsed.TaskText != "fix parser panic on empty input" {
		t.Fatalf("unexpected task text %q", parsed.TaskText)
	}
	if parsed.WorkspaceHint != nil {
		t.Fatalf("expected nil workspace hint, got %#v", parsed.WorkspaceHint)
	}
}

func TestParseCommandAcceptsChineseFormWithWorkspaceHint(t *testing.T) {
	parsed, err := ParseCommand("让 codex 在 anycap 里去修 parser 空输入崩溃")
	if err != nil {
		t.Fatalf("ParseCommand() error = %v", err)
	}
	if parsed.Agent != "codex" {
		t.Fatalf("expected agent codex, got %q", parsed.Agent)
	}
	if parsed.WorkspaceHint == nil || *parsed.WorkspaceHint != "anycap" {
		t.Fatalf("expected workspace hint anycap, got %#v", parsed.WorkspaceHint)
	}
	if parsed.TaskText != "修 parser 空输入崩溃" {
		t.Fatalf("unexpected task text %q", parsed.TaskText)
	}
}

func TestParseCommandRejectsAmbiguousText(t *testing.T) {
	_, err := ParseCommand("codex 修这个 bug")
	if err == nil {
		t.Fatal("expected parse error")
	}
}

func TestParseChatCommandAcceptsContinueText(t *testing.T) {
	parsed, err := ParseChatCommand("帮我看下 anycap 这个 bug")
	if err != nil {
		t.Fatalf("ParseChatCommand() error = %v", err)
	}
	if parsed.Action != model.AgentChatActionContinue {
		t.Fatalf("expected continue action, got %q", parsed.Action)
	}
	if parsed.Message == nil || *parsed.Message != "帮我看下 anycap 这个 bug" {
		t.Fatalf("unexpected message %#v", parsed.Message)
	}
}

func TestParseChatCommandAcceptsSystemCommands(t *testing.T) {
	tests := []struct {
		name   string
		raw    string
		action string
	}{
		{name: "bind", raw: "/bind bind_abc", action: model.AgentChatActionBind},
		{name: "new", raw: "/new", action: model.AgentChatActionNew},
		{name: "reset", raw: "/reset", action: model.AgentChatActionReset},
		{name: "status", raw: "/status", action: model.AgentChatActionStatus},
		{name: "stop", raw: "/stop", action: model.AgentChatActionStop},
		{name: "fork", raw: "/fork", action: model.AgentChatActionFork},
		{name: "fire", raw: "/fire", action: model.AgentChatActionFire},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			parsed, err := ParseChatCommand(tt.raw)
			if err != nil {
				t.Fatalf("ParseChatCommand() error = %v", err)
			}
			if parsed.Action != tt.action {
				t.Fatalf("expected action %q, got %q", tt.action, parsed.Action)
			}
		})
	}
}
