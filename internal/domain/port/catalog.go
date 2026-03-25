package port

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

// CatalogRepository 提供模型目录的读取能力。
// 实现方负责从数据源（NexusHub Platform API / 静态配置 / DB）
// 获取原始数据并转换为 AnyCap 领域模型。
type CatalogRepository interface {
	// ListModels 按 capability 列出可用模型。
	ListModels(ctx context.Context, capability model.Capability) ([]model.ModelSpec, error)

	// GetModel 获取单个模型的完整配置（含 RouteBinding）。
	GetModel(ctx context.Context, capability model.Capability, modelID string) (*model.ModelSpec, error)
}
