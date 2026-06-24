package curatedcatalog

import (
	"context"
	"fmt"
	"sort"
	"sync"

	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/engineering/anycap/internal/infrastructure/nexushub"
	"gitlab.knoffice.tech/open/common-go/logging"
)

// DiscoverySource is the subset of the Discovery cache we need.
type DiscoverySource interface {
	GetNode(ctx context.Context, abilityKey, algo string) (*nexushub.DiscoveryNode, error)
}

// CurationSource is the subset of the dconf provider we need.
type CurationSource interface {
	Snapshot() *config.ModelCurationConfig
}

// Catalog implements port.CatalogRepository on top of the curation snapshot
// and a Discovery cache.
type Catalog struct {
	curation  CurationSource
	discovery DiscoverySource

	// missingLogged guards "missing in Discovery" warnings to once per
	// (ability_key, algo) pair per process lifetime. Snapshot reload
	// resets it.
	missingMu     sync.Mutex
	missingLogged map[string]struct{}
	lastSnapshot  *config.ModelCurationConfig
}

// New constructs a Catalog.
func New(curation CurationSource, discovery DiscoverySource) *Catalog {
	return &Catalog{
		curation:      curation,
		discovery:     discovery,
		missingLogged: make(map[string]struct{}),
	}
}

// ListModels returns all curated models for a capability, joined with
// Discovery metadata.
func (c *Catalog) ListModels(ctx context.Context, capability model.Capability) ([]model.ModelSpec, error) {
	snapshot := c.snapshot()
	specs := make([]model.ModelSpec, 0)
	for _, m := range snapshot.Models {
		if model.Capability(m.Capability) != capability {
			continue
		}
		spec, err := c.buildSpec(ctx, m)
		if err != nil {
			logging.WithContext(ctx).WithError(err).WithFields(logging.Fields{
				"model_id":   m.ModelID,
				"capability": m.Capability,
			}).Warn("curated catalog skipping model: discovery enrichment failed")
			continue
		}
		if spec == nil || len(spec.Operations) == 0 {
			continue
		}
		specs = append(specs, *spec)
	}
	sort.SliceStable(specs, func(i, j int) bool { return specs[i].ModelID < specs[j].ModelID })
	return specs, nil
}

// GetModel returns the spec for one curated model.
func (c *Catalog) GetModel(ctx context.Context, capability model.Capability, modelID string) (*model.ModelSpec, error) {
	snapshot := c.snapshot()
	for _, m := range snapshot.Models {
		if model.Capability(m.Capability) != capability || m.ModelID != modelID {
			continue
		}
		spec, err := c.buildSpec(ctx, m)
		if err != nil {
			return nil, err
		}
		if spec == nil || len(spec.Operations) == 0 {
			return nil, fmt.Errorf("model %q has no operational routes", modelID)
		}
		return spec, nil
	}
	return nil, fmt.Errorf("model %q not found in capability %s", modelID, capability)
}

// CuratedAbilityKeys returns the unique set of (ability_key, algo_type)
// pairs the curation references. Used by the background refresher to warm
// the Discovery cache.
func (c *Catalog) CuratedAbilityKeys() []AbilityKey {
	snapshot := c.snapshot()
	seen := make(map[string]struct{})
	out := make([]AbilityKey, 0)
	for _, m := range snapshot.Models {
		for _, op := range m.Operations {
			key := op.AbilityKey + "|" + op.AlgoType
			if _, ok := seen[key]; ok {
				continue
			}
			seen[key] = struct{}{}
			out = append(out, AbilityKey{AbilityKey: op.AbilityKey, AlgoType: op.AlgoType})
		}
	}
	return out
}

// AbilityKey is a (ability_key, algo_type) pair.
type AbilityKey struct {
	AbilityKey string
	AlgoType   string
}

func (c *Catalog) buildSpec(ctx context.Context, m config.ModelCurationModelConfig) (*model.ModelSpec, error) {
	if len(m.Operations) == 0 {
		return nil, nil
	}
	capability := model.Capability(m.Capability)

	displayName := m.DisplayName
	if displayName == "" {
		displayName = m.ModelID
	}

	spec := &model.ModelSpec{
		ModelID:          m.ModelID,
		Capability:       capability,
		DisplayName:      displayName,
		ModelDescription: m.ModelDescription,
		Status:           "active",
		Operations:       make(map[model.Operation]model.OperationSpec),
	}

	for _, op := range m.Operations {
		operation := model.Operation(op.Operation)
		opSpec := spec.Operations[operation]

		node, err := c.discovery.GetNode(ctx, op.AbilityKey, op.AlgoType)
		if err != nil || node == nil {
			c.logMissingOnce(ctx, op.AbilityKey, op.AlgoType, err)
			continue
		}
		entry, ok := lookupAlgoEntry(node, op.AlgoType)
		if !ok {
			c.logMissingOnce(ctx, op.AbilityKey, op.AlgoType, fmt.Errorf("algo not found in tool_definition"))
			continue
		}

		resourceTargets := parseResourceTargets(entry.Annotation)
		resourceTargets = applyResourceTargetOverrides(op.AbilityKey, op.AlgoType, entry.Schema, resourceTargets)

		// Route binding (used by execution path).
		opSpec.Routes = append(opSpec.Routes, model.RouteBinding{
			RouteType:       model.RouteTypeDirect,
			AbilityKey:      op.AbilityKey,
			GenType:         string(capability),
			AlgoType:        op.AlgoType,
			Mode:            model.Mode(op.Mode),
			Priority:        model.DefaultRoutePriority,
			Enabled:         true,
			ResourceTargets: resourceTargets,
		})

		// Mode metadata (CLI displays this as the mode description).
		if op.Mode != "" {
			modeDesc := op.ModeDescription
			if modeDesc == "" {
				modeDesc = entry.AlgoDescription.Description
			}
			addModeOnce(&opSpec, model.Mode(op.Mode), modeDesc)
		}

		// Schema enrichment. Synthetic reference-media parameters are added
		// when Discovery declares matching resource targets for this algo;
		// CLI then knows it can pass --param images=... / --param videos=...
		flat := flattenDiscoverySchemaWithMedia(entry.Schema, referenceMediaParamsFromTargets(resourceTargets))
		flat = applySchemaOverrides(op.AbilityKey, op.AlgoType, flat)
		if len(flat) > 0 {
			if op.Mode != "" {
				if opSpec.ModeSchemas == nil {
					opSpec.ModeSchemas = make(map[model.Mode]map[string]any)
				}
				if _, exists := opSpec.ModeSchemas[model.Mode(op.Mode)]; !exists {
					opSpec.ModeSchemas[model.Mode(op.Mode)] = flat
				}
			}
			if len(opSpec.RequestHints) == 0 {
				// Provide a fallback for callers that do not pass mode.
				opSpec.RequestHints = cloneFlat(flat)
			}
		}

		spec.Operations[operation] = opSpec
	}

	if len(spec.Operations) == 0 {
		return nil, nil
	}
	return spec, nil
}

func (c *Catalog) snapshot() *config.ModelCurationConfig {
	if c == nil || c.curation == nil {
		return &config.ModelCurationConfig{}
	}
	snap := c.curation.Snapshot()
	if snap == nil {
		return &config.ModelCurationConfig{}
	}
	c.missingMu.Lock()
	if c.lastSnapshot != snap {
		c.missingLogged = make(map[string]struct{})
		c.lastSnapshot = snap
	}
	c.missingMu.Unlock()
	return snap
}

func (c *Catalog) logMissingOnce(ctx context.Context, abilityKey, algo string, cause error) {
	key := abilityKey + "|" + algo
	c.missingMu.Lock()
	if _, ok := c.missingLogged[key]; ok {
		c.missingMu.Unlock()
		return
	}
	c.missingLogged[key] = struct{}{}
	c.missingMu.Unlock()

	fields := logging.Fields{"ability_key": abilityKey, "algo_type": algo}
	if cause != nil {
		logging.WithContext(ctx).WithError(cause).WithFields(fields).Warn("curated catalog: ability missing/invalid in NexusHub Discovery; skipping mode")
		return
	}
	logging.WithContext(ctx).WithFields(fields).Warn("curated catalog: ability missing in NexusHub Discovery; skipping mode")
}

func lookupAlgoEntry(node *nexushub.DiscoveryNode, algo string) (nexushub.DiscoveryToolDefEntry, bool) {
	if node == nil || node.ToolDefinition == nil || algo == "" {
		return nexushub.DiscoveryToolDefEntry{}, false
	}
	entry, ok := node.ToolDefinition[algo]
	return entry, ok
}

func addModeOnce(opSpec *model.OperationSpec, mode model.Mode, description string) {
	for _, existing := range opSpec.Modes {
		if existing.Mode == mode {
			return
		}
	}
	opSpec.Modes = append(opSpec.Modes, model.ModeSpec{
		Mode:        mode,
		Description: description,
	})
}

func cloneFlat(in map[string]any) map[string]any {
	out := make(map[string]any, len(in))
	for k, v := range in {
		out[k] = v
	}
	return out
}
