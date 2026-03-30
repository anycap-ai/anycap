package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type NexusHubClient interface {
	GenerateImage(ctx context.Context, req model.GenerateImageRequest, route model.RouteBinding) (model.GenerateImageResult, error)
	GenerateVideo(ctx context.Context, req model.GenerateVideoRequest, route model.RouteBinding) (model.GenerateVideoResult, error)
	GenerateMusic(ctx context.Context, req model.GenerateMusicRequest, route model.RouteBinding) (model.GenerateMusicResult, error)
	GetSubmitResult(ctx context.Context, taskID string) (model.ProviderTaskResult, error)
}
