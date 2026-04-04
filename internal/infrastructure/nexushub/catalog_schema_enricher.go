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

		// Mode-aware: resolve a schema per mode using each mode's best route's algoType.
		if len(opSpec.Modes) > 0 {
			modeSchemas := r.resolveModeSchemas(ctx, operation, opSpec, schemaCache)
			if len(modeSchemas) > 0 {
				opSpec.ModeSchemas = modeSchemas
				// Also set RequestHints to the first mode's schema as fallback.
				for _, ms := range opSpec.Modes {
					if s, ok := modeSchemas[ms.Mode]; ok && len(s) > 0 {
						opSpec.RequestHints = cloneMap(s)
						break
					}
				}
				enriched.Operations[operation] = opSpec
				continue
			}
		}

		// Fallback: single schema for the entire operation (legacy / no modes).
		resolvedSchema := r.resolveOperationSchema(ctx, operation, opSpec.Routes, schemaCache)
		if len(resolvedSchema) == 0 {
			continue
		}

		opSpec.RequestHints = cloneMap(resolvedSchema)
		enriched.Operations[operation] = opSpec
	}

	// Normalize provider-specific param names to AnyCap names in schemas.
	if enriched.Capability == model.CapabilityMusic {
		for op, opSpec := range enriched.Operations {
			normalizeMusicSchema(opSpec.RequestHints)
			for _, s := range opSpec.ModeSchemas {
				normalizeMusicSchema(s)
			}
			enriched.Operations[op] = opSpec
		}
	}

	return enriched, nil
}

// normalizeMusicSchema replaces provider-specific param names with AnyCap
// normalized names. e.g. ElevenLabs "music_length_ms" → "duration".
func normalizeMusicSchema(schema map[string]any) {
	if len(schema) == 0 {
		return
	}
	target := schema
	if params, ok := schema["model_params"].(map[string]any); ok {
		target = params
	}
	if _, exists := target["music_length_ms"]; exists {
		delete(target, "music_length_ms")
		target["duration"] = map[string]any{"type": "int", "description": "Duration in seconds"}
	}
}

// resolveModeSchemas resolves a schema for each mode within an operation.
// Groups routes by mode, picks the best route per mode, and uses its algoType
// to look up the NexusHub schema.
func (r *CatalogSchemaEnricher) resolveModeSchemas(
	ctx context.Context,
	operation model.Operation,
	opSpec model.OperationSpec,
	schemaCache map[string]map[string]any,
) map[model.Mode]map[string]any {
	// Group routes by mode, keeping only the highest-priority enabled route per mode.
	bestRoutes := make(map[model.Mode]model.RouteBinding)
	for _, route := range opSpec.Routes {
		if !route.Enabled || route.AbilityKey == "" || route.Mode == "" {
			continue
		}
		if existing, ok := bestRoutes[route.Mode]; !ok || route.Priority > existing.Priority {
			bestRoutes[route.Mode] = route
		}
	}

	result := make(map[model.Mode]map[string]any, len(bestRoutes))
	for mode, route := range bestRoutes {
		resolved := r.resolveOperationSchema(ctx, operation, []model.RouteBinding{route}, schemaCache)
		if len(resolved) > 0 {
			result[mode] = resolved
		}
	}

	if len(result) == 0 {
		return nil
	}
	return result
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
		clonedOpSpec.Modes = append([]model.ModeSpec(nil), opSpec.Modes...)
		clonedOpSpec.RequestHints = cloneMap(opSpec.RequestHints)
		if len(opSpec.ModeSchemas) > 0 {
			clonedOpSpec.ModeSchemas = make(map[model.Mode]map[string]any, len(opSpec.ModeSchemas))
			for m, s := range opSpec.ModeSchemas {
				clonedOpSpec.ModeSchemas[m] = cloneMap(s)
			}
		}
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
