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

func (c *StubClient) ImageRead(_ context.Context, req model.ImageReadRequest) (model.UnderstandResult, error) {
	var source string
	if len(req.Images) > 0 {
		source = fmt.Sprintf("%d images", len(req.Images))
	} else if req.URL != "" {
		source = req.URL
	} else {
		source = fmt.Sprintf("base64 (%s, %d bytes)", req.MIMEType, len(req.Data))
	}

	instruction := req.Instruction
	if instruction == "" {
		instruction = "Describe this image"
	}

	return model.UnderstandResult{
		Content: fmt.Sprintf("[stub] Analyzed image from %s. Instruction: %q. This is a placeholder response for local development.", source, instruction),
		Model:   "stub",
		Usage: model.Usage{
			InputTokens:  10,
			OutputTokens: 20,
			TotalTokens:  30,
		},
		DurationMs: 1,
	}, nil
}

func (c *StubClient) VideoRead(_ context.Context, req model.VideoReadRequest) (model.UnderstandResult, error) {
	instruction := req.Instruction
	if instruction == "" {
		instruction = "Describe this video"
	}

	return model.UnderstandResult{
		Content: fmt.Sprintf("[stub] Analyzed video from %s. Instruction: %q. This is a placeholder response for local development.", req.URL, instruction),
		Model:   "stub",
		Usage: model.Usage{
			InputTokens:  50,
			OutputTokens: 30,
			TotalTokens:  80,
		},
		DurationMs: 1,
	}, nil
}

func (c *StubClient) AudioRead(_ context.Context, req model.AudioReadRequest) (model.UnderstandResult, error) {
	instruction := req.Instruction
	if instruction == "" {
		instruction = "Describe this audio"
	}

	return model.UnderstandResult{
		Content: fmt.Sprintf("[stub] Analyzed audio from %s. Instruction: %q. This is a placeholder response for local development.", req.URL, instruction),
		Model:   "stub",
		Usage: model.Usage{
			InputTokens:  40,
			OutputTokens: 25,
			TotalTokens:  65,
		},
		DurationMs: 1,
	}, nil
}
