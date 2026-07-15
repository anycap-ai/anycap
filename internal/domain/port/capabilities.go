package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// CapabilitiesProvider calls the upstream capabilities API (e.g. agent-platform).
type CapabilitiesProvider interface {
	ImageRead(ctx context.Context, req model.ImageReadRequest) (model.InvocationResult[model.UnderstandResult], error)
	VideoRead(ctx context.Context, req model.VideoReadRequest) (model.InvocationResult[model.UnderstandResult], error)
	AudioRead(ctx context.Context, req model.AudioReadRequest) (model.InvocationResult[model.UnderstandResult], error)
}

// CapabilitiesService is the application-level interface for capabilities.
type CapabilitiesService interface {
	Presign(ctx context.Context, req model.PresignRequest) (model.PresignResult, error)
	ImageRead(ctx context.Context, req model.ImageReadRequest) (model.InvocationResult[model.UnderstandResult], error)
	VideoRead(ctx context.Context, req model.VideoReadRequest) (model.InvocationResult[model.UnderstandResult], error)
	AudioRead(ctx context.Context, req model.AudioReadRequest) (model.InvocationResult[model.UnderstandResult], error)
}

// UploadRefResolver resolves anycap://upload/ references to presigned HTTP URLs.
// Used by generate services to convert CLI-uploaded file references before
// forwarding to upstream providers.
type UploadRefResolver interface {
	ResolveReferenceURLs(ctx context.Context, urls []string) ([]string, error)
}
