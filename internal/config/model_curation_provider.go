package config

import (
	"encoding/json"
	"fmt"
	"os"

	"gitlab.knoffice.tech/open/common-go/dconf"
	"gitlab.knoffice.tech/open/common-go/logging"
)

// ModelCurationOperationConfig describes a single (operation, mode) binding for
// a curated public model. ability_key + algo_type identify the underlying
// NexusHub atomic node behind that mode.
type ModelCurationOperationConfig struct {
	Operation       string `json:"operation"`
	Mode            string `json:"mode,omitempty"`
	AbilityKey      string `json:"ability_key"`
	AlgoType        string `json:"algo_type,omitempty"`
	ModeDescription string `json:"mode_description,omitempty"`
}

// ModelCurationModelConfig describes one publicly exposed model.
type ModelCurationModelConfig struct {
	ModelID          string                         `json:"model_id"`
	Capability       string                         `json:"capability"`
	DisplayName      string                         `json:"display_name,omitempty"`
	ModelDescription string                         `json:"model_description,omitempty"`
	Operations       []ModelCurationOperationConfig `json:"operations"`
}

// ModelCurationConfig is the JSON shape of the dconf payload (and the
// embedded fallback file).
type ModelCurationConfig struct {
	Models []ModelCurationModelConfig `json:"models"`
}

// ModelCurationContainer mirrors the other dconf containers in this package.
type ModelCurationContainer interface {
	Get() *ModelCurationConfig
}

// ModelCurationProvider returns the active curation snapshot. Resolution order:
//  1. dconf container (if enabled and successfully loaded)
//  2. ANYCAP_MODEL_CURATION_FILE on disk (if set)
//  3. embedded default JSON shipped with the binary
type ModelCurationProvider struct {
	cfg       Config
	container ModelCurationContainer
	fileBytes []byte
	embedded  *ModelCurationConfig
}

var loadModelCurationContainer = func(cfg Config) (ModelCurationContainer, error) {
	return dconf.LoadJson[ModelCurationConfig](cfg.ModelCurationDConfGroup, cfg.ModelCurationDConfDataID)
}

// embeddedModelCurationDefault is wired by the curatedcatalog package via
// SetEmbeddedModelCurationDefault to avoid a circular dependency on the
// embedded JSON asset.
var embeddedModelCurationDefault *ModelCurationConfig

// SetEmbeddedModelCurationDefault registers the embedded default curation
// snapshot. Intended to be called once from package init in
// internal/infrastructure/curatedcatalog.
func SetEmbeddedModelCurationDefault(cfg *ModelCurationConfig) {
	embeddedModelCurationDefault = cfg
}

// NewModelCurationProvider constructs a provider following the resolution
// order above. It never returns an error: any load failure logs a warning and
// is treated as "fall through to next source".
func NewModelCurationProvider(cfg Config) *ModelCurationProvider {
	p := &ModelCurationProvider{cfg: cfg, embedded: embeddedModelCurationDefault}

	if cfg.ModelCurationDConfEnabled {
		container, err := loadModelCurationContainer(cfg)
		if err != nil {
			logging.WithError(err).WithFields(logging.Fields{
				"group":   cfg.ModelCurationDConfGroup,
				"data_id": cfg.ModelCurationDConfDataID,
			}).Warn("model-curation failed to load dconf config; falling back to file/embedded defaults")
		} else {
			logging.WithFields(logging.Fields{
				"group":   cfg.ModelCurationDConfGroup,
				"data_id": cfg.ModelCurationDConfDataID,
			}).Info("model-curation using dconf source")
			p.container = container
			logModelCurationDConfSnapshot(cfg, container)
		}
	}

	if cfg.ModelCurationFile != "" {
		data, err := os.ReadFile(cfg.ModelCurationFile)
		if err != nil {
			logging.WithError(err).WithField("path", cfg.ModelCurationFile).Warn("model-curation failed to read file override; falling back to embedded defaults")
		} else if !json.Valid(data) {
			logging.WithField("path", cfg.ModelCurationFile).Warn("model-curation file override is not valid JSON; falling back to embedded defaults")
		} else {
			logging.WithField("path", cfg.ModelCurationFile).Info("model-curation using file source")
			p.fileBytes = data
		}
	}

	return p
}

// NewModelCurationProviderWithContainer is the test entry point.
func NewModelCurationProviderWithContainer(cfg Config, container ModelCurationContainer, embedded *ModelCurationConfig) *ModelCurationProvider {
	return &ModelCurationProvider{cfg: cfg, container: container, embedded: embedded}
}

// Snapshot returns the currently effective curation, never nil. If no source
// is available, returns &ModelCurationConfig{}.
func (p *ModelCurationProvider) Snapshot() *ModelCurationConfig {
	if p == nil {
		return &ModelCurationConfig{}
	}

	if p.container != nil {
		if current := p.container.Get(); current != nil {
			return current
		}
	}

	if len(p.fileBytes) > 0 {
		var current ModelCurationConfig
		if err := json.Unmarshal(p.fileBytes, &current); err == nil {
			return &current
		}
		logging.WithField("path", p.cfg.ModelCurationFile).Warn("model-curation cached file bytes failed to decode")
	}

	if p.embedded != nil {
		return p.embedded
	}

	return &ModelCurationConfig{}
}

// Source returns a short identifier of the current data source for logging.
func (p *ModelCurationProvider) Source() string {
	if p == nil {
		return "empty"
	}
	if p.container != nil && p.container.Get() != nil {
		return "dconf"
	}
	if len(p.fileBytes) > 0 {
		return fmt.Sprintf("file:%s", p.cfg.ModelCurationFile)
	}
	if p.embedded != nil {
		return "embedded"
	}
	return "empty"
}

func logModelCurationDConfSnapshot(cfg Config, container ModelCurationContainer) {
	if container == nil {
		return
	}
	current := container.Get()
	if current == nil {
		logging.WithFields(logging.Fields{
			"group":   cfg.ModelCurationDConfGroup,
			"data_id": cfg.ModelCurationDConfDataID,
		}).Warn("model-curation dconf snapshot unavailable")
		return
	}
	logging.WithFields(logging.Fields{
		"group":      cfg.ModelCurationDConfGroup,
		"data_id":    cfg.ModelCurationDConfDataID,
		"num_models": len(current.Models),
	}).Info("model-curation dconf snapshot")
}
