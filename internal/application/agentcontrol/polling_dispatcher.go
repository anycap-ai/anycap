package agentcontrol

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// PollingDispatcher is a phase-1 dispatcher that relies on runner-side polling.
// Task durability and state transition happen on the server; runners fetch work
// via the protected next-task endpoint.
type PollingDispatcher struct{}

func NewPollingDispatcher() *PollingDispatcher {
	return &PollingDispatcher{}
}

func (d *PollingDispatcher) DispatchTask(_ context.Context, _ model.AgentRunner, _ model.AgentTask) error {
	return nil
}
