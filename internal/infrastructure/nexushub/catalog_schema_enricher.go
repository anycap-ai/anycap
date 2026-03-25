package nexushub

import (
	"context"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/port"
)

// OperationSchemaProvider fetches per-ability operation schema metadata from NexusHub.
type OperationSchemaProvider interface {
	GetOperationSchemas(ctx context.Context, abilityKey string) (map[string]any, error)
}

// CatalogSchemaEnricher decorates a catalog repo with schema metadata sourced from NexusHub atomic nodes.
// Route bindings still come from the underlying repository, while operation_schemas stay in NexusHub.
type CatalogSchemaEnricher struct {
	baseRepo       port.CatalogRepository
	schemaProvider OperationSchemaProvider
}

func NewCatalogSchemaEnricher(baseRepo port.CatalogRepository, schemaProvider OperationSchemaProvider) *CatalogSchemaEnricher {
	return &CatalogSchemaEnricher{
		baseRepo:       baseRepo,
		schemaProvider: schemaProvider,
	}
}

func (r *CatalogSchemaEnricher) ListModels(ctx context.Context, capability model.Capability) ([]model.ModelSpec, error) {
	return r.baseRepo.ListModels(ctx, capability)
}

func (r *CatalogSchemaEnricher) GetModel(ctx context.Context, capability model.Capability, modelID string) (*model.ModelSpec, error) {
	spec, err := r.baseRepo.GetModel(ctx, capability, modelID)
	if err != nil || spec == nil || r.schemaProvider == nil {
		return spec, err
	}

	enriched := cloneModelSpec(spec)
	schemaCache := make(map[string]map[string]any)

	for operation, opSpec := range enriched.Operations {
		if len(opSpec.RequestHints) > 0 || opSpec.SchemaRef != "" {
			continue
		}

		resolvedSchema := r.resolveOperationSchema(ctx, operation, opSpec.Routes, schemaCache)
		if len(resolvedSchema) == 0 {
			continue
		}

		opSpec.RequestHints = cloneMap(resolvedSchema)
		enriched.Operations[operation] = opSpec
	}

	return enriched, nil
}

func (r *CatalogSchemaEnricher) resolveOperationSchema(
	ctx context.Context,
	operation model.Operation,
	routes []model.RouteBinding,
	schemaCache map[string]map[string]any,
) map[string]any {
	for _, route := range routes {
		if route.AbilityKey == "" {
			continue
		}

		schemas, ok := schemaCache[route.AbilityKey]
		if !ok {
			fetchedSchemas, err := r.schemaProvider.GetOperationSchemas(ctx, route.AbilityKey)
			if err != nil {
				schemaCache[route.AbilityKey] = nil
				continue
			}
			schemas = fetchedSchemas
			schemaCache[route.AbilityKey] = fetchedSchemas
		}

		if len(schemas) == 0 {
			continue
		}

		if resolved := selectOperationSchema(schemas, operation, route.AlgoType); len(resolved) > 0 {
			return resolved
		}
	}

	return nil
}

func selectOperationSchema(schemas map[string]any, operation model.Operation, algoType string) map[string]any {
	candidateKeys := make([]string, 0, 1+len(defaultSchemaKeysForOperation(operation)))
	if algoType != "" {
		candidateKeys = append(candidateKeys, algoType)
	}
	candidateKeys = append(candidateKeys, string(operation))
	candidateKeys = append(candidateKeys, defaultSchemaKeysForOperation(operation)...)

	for _, key := range candidateKeys {
		if key == "" {
			continue
		}
		raw, ok := schemas[key]
		if !ok {
			continue
		}
		schema, ok := raw.(map[string]any)
		if ok && len(schema) > 0 {
			return schema
		}
	}

	return nil
}

func defaultSchemaKeysForOperation(operation model.Operation) []string {
	switch operation {
	case model.OperationGenerate:
		return []string{"txt_2_img", "txt_2_video", "text_2_music", "text_2_3d"}
	case model.OperationEdit:
		return []string{"img_2_img", "img_edit", "multi_ref_2_img", "group_img_gen", "edit_video"}
	case model.OperationUpscale:
		return []string{"ultra_img", "ultra_video"}
	case model.OperationFromImage:
		return []string{"img_2_video", "ref_2_video", "first_last_2_video", "img_2_3d"}
	case model.OperationSpeak:
		return []string{"speak"}
	default:
		return nil
	}
}

func cloneModelSpec(spec *model.ModelSpec) *model.ModelSpec {
	cloned := *spec
	cloned.Operations = make(map[model.Operation]model.OperationSpec, len(spec.Operations))

	for operation, opSpec := range spec.Operations {
		clonedOpSpec := opSpec
		clonedOpSpec.Routes = append([]model.RouteBinding(nil), opSpec.Routes...)
		clonedOpSpec.RequestHints = cloneMap(opSpec.RequestHints)
		cloned.Operations[operation] = clonedOpSpec
	}

	return &cloned
}

func cloneMap(src map[string]any) map[string]any {
	if len(src) == 0 {
		return nil
	}

	cloned := make(map[string]any, len(src))
	for key, value := range src {
		cloned[key] = value
	}
	return cloned
}
