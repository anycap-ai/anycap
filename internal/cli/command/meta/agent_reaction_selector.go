package meta

import (
	"context"
	"fmt"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/im"
)

const daemonReactionSelectionTimeout = 8 * time.Second

func newCodexReactionSelector(executor *codexExecExecutor) func(context.Context, im.NormalizedInboundEvent) (string, error) {
	if executor == nil {
		return nil
	}
	return func(ctx context.Context, event im.NormalizedInboundEvent) (string, error) {
		selectionCtx, cancel := context.WithTimeout(ctx, daemonReactionSelectionTimeout)
		defer cancel()

		runResult, err := executor.runPrompt(selectionCtx, buildFeishuReactionSelectionPrompt(event.Message), "")
		if err != nil {
			return "", err
		}
		reactionType := im.NormalizeReactionEmojiType(runResult.FinalMessage)
		if !im.IsAllowedReactionEmojiType(reactionType) {
			return "", fmt.Errorf("unsupported reaction emoji type %q", strings.TrimSpace(runResult.FinalMessage))
		}
		return reactionType, nil
	}
}

func buildFeishuReactionSelectionPrompt(message string) string {
	return fmt.Sprintf(`You are choosing a Feishu reaction emoji for an immediate acknowledgment.

Rules:
- Output exactly one emoji type from this allowlist: %s
- Do not output any explanation, punctuation, markdown, or extra text.
- Pick the emoji that best matches the tone of the user's message.
- This is only an acknowledgment that the task was received, not the final answer.

User message:
%s
`, strings.Join(im.AllowedReactionEmojiTypes(), ", "), strings.TrimSpace(message))
}
