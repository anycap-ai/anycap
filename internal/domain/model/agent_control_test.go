package model

import "testing"

func TestAgentTaskTransitionTo(t *testing.T) {
	task := AgentTask{Status: AgentTaskStatusQueued}

	if err := task.TransitionTo(AgentTaskStatusDispatched); err != nil {
		t.Fatalf("queued -> dispatched returned error: %v", err)
	}
	if task.Status != AgentTaskStatusDispatched {
		t.Fatalf("expected dispatched, got %q", task.Status)
	}

	if err := task.TransitionTo(AgentTaskStatusRunning); err != nil {
		t.Fatalf("dispatched -> running returned error: %v", err)
	}
	if task.Status != AgentTaskStatusRunning {
		t.Fatalf("expected running, got %q", task.Status)
	}

	if err := task.TransitionTo(AgentTaskStatusSucceeded); err != nil {
		t.Fatalf("running -> succeeded returned error: %v", err)
	}
	if task.Status != AgentTaskStatusSucceeded {
		t.Fatalf("expected succeeded, got %q", task.Status)
	}
}

func TestAgentTaskTransitionToRejectsInvalidTransition(t *testing.T) {
	task := AgentTask{Status: AgentTaskStatusSucceeded}

	if err := task.TransitionTo(AgentTaskStatusRunning); err == nil {
		t.Fatal("expected invalid transition error, got nil")
	}
	if task.Status != AgentTaskStatusSucceeded {
		t.Fatalf("expected status to remain succeeded, got %q", task.Status)
	}
}

func TestAgentControlValidationHelpers(t *testing.T) {
	if err := ValidateIMBindingStatus(IMBindingStatusActive); err != nil {
		t.Fatalf("expected active binding status to validate, got %v", err)
	}
	if err := ValidateAgentRunnerState(AgentRunnerStateIdle); err != nil {
		t.Fatalf("expected idle runner state to validate, got %v", err)
	}
	if err := ValidateAgentTaskStatus(AgentTaskStatusTimedOut); err != nil {
		t.Fatalf("expected timed_out task status to validate, got %v", err)
	}

	if err := ValidateIMBindingStatus("bad_status"); err == nil {
		t.Fatal("expected invalid binding status to fail")
	}
	if err := ValidateAgentRunnerState("bad_state"); err == nil {
		t.Fatal("expected invalid runner state to fail")
	}
	if err := ValidateAgentTaskStatus("bad_task_status"); err == nil {
		t.Fatal("expected invalid task status to fail")
	}
}

func TestAgentConversationValidationHelpers(t *testing.T) {
	if err := ValidateAgentConversationStatus(AgentConversationStatusActive); err != nil {
		t.Fatalf("expected active conversation status to validate, got %v", err)
	}
	if err := ValidateAgentSessionMode(AgentSessionModeContinue); err != nil {
		t.Fatalf("expected continue session mode to validate, got %v", err)
	}
	if err := ValidateAgentSessionStatus(AgentSessionStatusCommitted); err != nil {
		t.Fatalf("expected committed session status to validate, got %v", err)
	}
	if err := ValidateAgentMailboxSourceType(AgentMailboxSourceToolResult); err != nil {
		t.Fatalf("expected tool_result mailbox source to validate, got %v", err)
	}

	if err := ValidateAgentConversationStatus("bad_conversation_status"); err == nil {
		t.Fatal("expected invalid conversation status to fail")
	}
	if err := ValidateAgentSessionMode("bad_mode"); err == nil {
		t.Fatal("expected invalid session mode to fail")
	}
	if err := ValidateAgentSessionStatus("bad_session_status"); err == nil {
		t.Fatal("expected invalid session status to fail")
	}
	if err := ValidateAgentMailboxSourceType("bad_mailbox_source"); err == nil {
		t.Fatal("expected invalid mailbox source to fail")
	}
}

func TestAgentSessionTransitionTo(t *testing.T) {
	session := AgentSession{Status: AgentSessionStatusCreated}

	if err := session.TransitionTo(AgentSessionStatusRunning); err != nil {
		t.Fatalf("created -> running returned error: %v", err)
	}
	if session.Status != AgentSessionStatusRunning {
		t.Fatalf("expected running, got %q", session.Status)
	}

	if err := session.TransitionTo(AgentSessionStatusCommitted); err != nil {
		t.Fatalf("running -> committed returned error: %v", err)
	}
	if session.Status != AgentSessionStatusCommitted {
		t.Fatalf("expected committed, got %q", session.Status)
	}
}

func TestAgentSessionTransitionToRejectsInvalidTransition(t *testing.T) {
	session := AgentSession{Status: AgentSessionStatusCommitted}

	if err := session.TransitionTo(AgentSessionStatusRunning); err == nil {
		t.Fatal("expected invalid transition error, got nil")
	}
	if session.Status != AgentSessionStatusCommitted {
		t.Fatalf("expected status to remain committed, got %q", session.Status)
	}
}
