package presenter

import (
	"context"
	"testing"
)

func TestPassthroughIDMapperAgentControlIDs(t *testing.T) {
	mapper := PassthroughIDMapper{}
	ctx := context.Background()

	imBindingIDs, err := mapper.ResolveIMBindingExternalIDs(ctx, []int64{11, 22})
	if err != nil {
		t.Fatalf("ResolveIMBindingExternalIDs returned error: %v", err)
	}
	if got := imBindingIDs[11]; got != "11" {
		t.Fatalf("expected im binding id 11, got %q", got)
	}

	runnerIDs, err := mapper.ResolveRunnerExternalIDs(ctx, []int64{33})
	if err != nil {
		t.Fatalf("ResolveRunnerExternalIDs returned error: %v", err)
	}
	if got := runnerIDs[33]; got != "33" {
		t.Fatalf("expected runner id 33, got %q", got)
	}

	conversationIDs, err := mapper.ResolveAgentConversationExternalIDs(ctx, []int64{44})
	if err != nil {
		t.Fatalf("ResolveAgentConversationExternalIDs returned error: %v", err)
	}
	if got := conversationIDs[44]; got != "44" {
		t.Fatalf("expected conversation id 44, got %q", got)
	}

	taskIDs, err := mapper.ResolveAgentTaskExternalIDs(ctx, []int64{55})
	if err != nil {
		t.Fatalf("ResolveAgentTaskExternalIDs returned error: %v", err)
	}
	if got := taskIDs[55]; got != "55" {
		t.Fatalf("expected task id 55, got %q", got)
	}

	sessionIDs, err := mapper.ResolveAgentSessionExternalIDs(ctx, []int64{66})
	if err != nil {
		t.Fatalf("ResolveAgentSessionExternalIDs returned error: %v", err)
	}
	if got := sessionIDs[66]; got != "66" {
		t.Fatalf("expected session id 66, got %q", got)
	}

	mailboxIDs, err := mapper.ResolveAgentMailboxMessageExternalIDs(ctx, []int64{77})
	if err != nil {
		t.Fatalf("ResolveAgentMailboxMessageExternalIDs returned error: %v", err)
	}
	if got := mailboxIDs[77]; got != "77" {
		t.Fatalf("expected mailbox message id 77, got %q", got)
	}
}
