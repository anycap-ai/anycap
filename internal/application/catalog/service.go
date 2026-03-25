package catalog

import (
	"context"
	"fmt"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

// Service 提供模型目录的业务逻辑，是 handler 与 CatalogRepository 之间的桥梁。
type Service struct {
	repo port.CatalogRepository
}

func NewService(repo port.CatalogRepository) *Service {
	return &Service{repo: repo}
}

// ListModels 按 capability 列出可用模型的公共摘要。
func (s *Service) ListModels(ctx context.Context, capability model.Capability) ([]model.ModelSummary, error) {
	specs, err := s.repo.ListModels(ctx, capability)
	if err != nil {
		return nil, err
	}

	summaries := make([]model.ModelSummary, 0, len(specs))
	for i := range specs {
		summaries = append(summaries, specs[i].ToSummary())
	}
	return summaries, nil
}

// GetModelSchema 获取指定模型 + operation 的 schema 信息。
func (s *Service) GetModelSchema(ctx context.Context, capability model.Capability, modelID, operation string) (*model.ModelSchema, error) {
	spec, err := s.repo.GetModel(ctx, capability, modelID)
	if err != nil {
		return nil, err
	}

	op := model.Operation(operation)
	opSpec, ok := spec.Operations[op]
	if !ok {
		return nil, fmt.Errorf("operation %q not supported by model %q", operation, modelID)
	}

	schema := &model.ModelSchema{
		Capability:   capability,
		ModelID:      modelID,
		Operation:    operation,
		RequestHints: opSpec.RequestHints,
	}

	if len(opSpec.RequestHints) > 0 {
		schema.Schema = opSpec.RequestHints
	}

	if opSpec.SchemaRef != "" {
		schema.Schema = map[string]any{"$ref": opSpec.SchemaRef}
	}

	return schema, nil
}

// GetModel 获取完整的 ModelSpec（含 RouteBinding，仅内部使用）。
func (s *Service) GetModel(ctx context.Context, capability model.Capability, modelID string) (*model.ModelSpec, error) {
	return s.repo.GetModel(ctx, capability, modelID)
}
