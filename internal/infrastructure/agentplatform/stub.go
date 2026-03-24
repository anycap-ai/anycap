package agentplatform

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// StubClient returns canned responses for local development without agent-platform credentials.
type StubClient struct{}

func NewStubClient() *StubClient {
	return &StubClient{}
}

func (c *StubClient) ImageUnderstand(_ context.Context, req model.ImageUnderstandRequest) (model.UnderstandResult, error) {
	source := req.URL
	if source == "" {
		source = fmt.Sprintf("base64 (%s, %d bytes)", req.MIMEType, len(req.Data))
	}

	instruction := req.Instruction
	if instruction == "" {
		instruction = "Describe this image"
	}

	return model.UnderstandResult{
		Content:    fmt.Sprintf("[stub] Analyzed image from %s. Instruction: %q. This is a placeholder response for local development.", source, instruction),
		Model:      "stub",
		DurationMs: 1,
	}, nil
}

func (c *StubClient) VideoRead(_ context.Context, req model.VideoReadRequest) (model.UnderstandResult, error) {
	instruction := req.Instruction
	if instruction == "" {
		instruction = "Describe this video"
	}

	return model.UnderstandResult{
		Content:    fmt.Sprintf("[stub] Analyzed video from %s. Instruction: %q. This is a placeholder response for local development.", req.URL, instruction),
		Model:      "stub",
		DurationMs: 1,
	}, nil
}
