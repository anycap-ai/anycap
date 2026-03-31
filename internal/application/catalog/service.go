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

// GetModelSchemas 获取指定模型的 schema 信息列表。
// operation 和 mode 是可选筛选参数。返回每个 (operation, mode) 对应一条 schema。
func (s *Service) GetModelSchemas(ctx context.Context, capability model.Capability, modelID, operation, mode string) ([]model.ModelSchema, error) {
	spec, err := s.repo.GetModel(ctx, capability, modelID)
	if err != nil {
		return nil, err
	}

	var schemas []model.ModelSchema
	for op, opSpec := range spec.Operations {
		if operation != "" && string(op) != operation {
			continue
		}

		// If this operation has modes, emit one schema per mode.
		if len(opSpec.Modes) > 0 {
			for _, ms := range opSpec.Modes {
				if mode != "" && string(ms.Mode) != mode {
					continue
				}
				schema := model.ModelSchema{
					Capability: capability,
					ModelID:    modelID,
					Operation:  string(op),
					Mode:       string(ms.Mode),
				}
				// Prefer per-mode schema, fall back to operation-level RequestHints.
				if modeSchema, ok := opSpec.ModeSchemas[ms.Mode]; ok && len(modeSchema) > 0 {
					schema.Schema = modeSchema
				} else if len(opSpec.RequestHints) > 0 {
					schema.Schema = opSpec.RequestHints
				}
				if opSpec.SchemaRef != "" {
					schema.Schema = map[string]any{"$ref": opSpec.SchemaRef}
				}
				schemas = append(schemas, schema)
			}
			continue
		}

		// No modes: single schema for the operation (legacy).
		if mode != "" {
			continue // mode filter specified but this operation has no modes
		}
		schema := model.ModelSchema{
			Capability: capability,
			ModelID:    modelID,
			Operation:  string(op),
		}
		if len(opSpec.RequestHints) > 0 {
			schema.Schema = opSpec.RequestHints
		}
		if opSpec.SchemaRef != "" {
			schema.Schema = map[string]any{"$ref": opSpec.SchemaRef}
		}
		schemas = append(schemas, schema)
	}

	if len(schemas) == 0 {
		filterDesc := fmt.Sprintf("operation=%q", operation)
		if mode != "" {
			filterDesc += fmt.Sprintf(" mode=%q", mode)
		}
		return nil, fmt.Errorf("no schemas found for model %q with %s", modelID, filterDesc)
	}

	return schemas, nil
}

// GetModelSchema 获取指定模型 + operation 的 schema 信息（向后兼容）。
func (s *Service) GetModelSchema(ctx context.Context, capability model.Capability, modelID, operation string) (*model.ModelSchema, error) {
	schemas, err := s.GetModelSchemas(ctx, capability, modelID, operation, "")
	if err != nil {
		return nil, err
	}
	if len(schemas) == 0 {
		return nil, fmt.Errorf("operation %q not supported by model %q", operation, modelID)
	}
	return &schemas[0], nil
}
