package idresolver

import (
	"context"
	"testing"
)

func TestPassthroughIDResolverAgentControlIDs(t *testing.T) {
	resolver := PassthroughIDResolver{}
	ctx := context.Background()

	imBindingID, err := resolver.ResolveIMBindingID(ctx, "11")
	if err != nil {
		t.Fatalf("ResolveIMBindingID returned error: %v", err)
	}
	if imBindingID != 11 {
		t.Fatalf("expected im binding id 11, got %d", imBindingID)
	}

	runnerID, err := resolver.ResolveRunnerID(ctx, "22")
	if err != nil {
		t.Fatalf("ResolveRunnerID returned error: %v", err)
	}
	if runnerID != 22 {
		t.Fatalf("expected runner id 22, got %d", runnerID)
	}

	conversationID, err := resolver.ResolveAgentConversationID(ctx, "33")
	if err != nil {
		t.Fatalf("ResolveAgentConversationID returned error: %v", err)
	}
	if conversationID != 33 {
		t.Fatalf("expected agent conversation id 33, got %d", conversationID)
	}

	taskID, err := resolver.ResolveAgentTaskID(ctx, "44")
	if err != nil {
		t.Fatalf("ResolveAgentTaskID returned error: %v", err)
	}
	if taskID != 44 {
		t.Fatalf("expected agent task id 44, got %d", taskID)
	}

	sessionID, err := resolver.ResolveAgentSessionID(ctx, "55")
	if err != nil {
		t.Fatalf("ResolveAgentSessionID returned error: %v", err)
	}
	if sessionID != 55 {
		t.Fatalf("expected agent session id 55, got %d", sessionID)
	}

	mailboxID, err := resolver.ResolveAgentMailboxMessageID(ctx, "66")
	if err != nil {
		t.Fatalf("ResolveAgentMailboxMessageID returned error: %v", err)
	}
	if mailboxID != 66 {
		t.Fatalf("expected agent mailbox message id 66, got %d", mailboxID)
	}
}
