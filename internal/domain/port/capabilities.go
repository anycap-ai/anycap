package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// CapabilitiesProvider calls the upstream capabilities API (e.g. agent-platform).
type CapabilitiesProvider interface {
	ImageUnderstand(ctx context.Context, req model.ImageUnderstandRequest) (model.UnderstandResult, error)
	VideoRead(ctx context.Context, req model.VideoReadRequest) (model.UnderstandResult, error)
}

// CapabilitiesService is the application-level interface for capabilities.
type CapabilitiesService interface {
	Presign(ctx context.Context, req model.PresignRequest) (model.PresignResult, error)
	ImageUnderstand(ctx context.Context, req model.ImageUnderstandRequest) (model.UnderstandResult, error)
	VideoRead(ctx context.Context, req model.VideoReadRequest) (model.UnderstandResult, error)
}
