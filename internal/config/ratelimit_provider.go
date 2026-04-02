package config

import (
	"encoding/json"
	"strings"

	"gitlab.knoffice.tech/open/common-go/dconf"
	"gitlab.knoffice.tech/open/common-go/logging"
)

type RateLimitConfig struct {
	DefaultRPM   int            `json:"default_rpm"`
	Capabilities map[string]int `json:"capabilities"`
}

type RateLimitConfigContainer interface {
	Get() *RateLimitConfig
}

type RateLimitProvider struct {
	fallback  Config
	container RateLimitConfigContainer
}

var loadRateLimitConfigContainer = func(cfg Config) (RateLimitConfigContainer, error) {
	return dconf.LoadJson[RateLimitConfig](cfg.RateLimitDConfGroup, cfg.RateLimitDConfDataID)
}

func NewRateLimitProvider(cfg Config) *RateLimitProvider {
	if !cfg.RateLimitDConfEnabled {
		return &RateLimitProvider{fallback: cfg}
	}

	container, err := loadRateLimitConfigContainer(cfg)
	if err != nil {
		logging.WithError(err).WithFields(logging.Fields{"group": cfg.RateLimitDConfGroup, "data_id": cfg.RateLimitDConfDataID}).Warn("rate-limit failed to load dconf config; using env fallback")
		return &RateLimitProvider{fallback: cfg}
	}

	logging.WithFields(logging.Fields{"group": cfg.RateLimitDConfGroup, "data_id": cfg.RateLimitDConfDataID}).Info("rate-limit using dconf config")
	logRateLimitDConfSnapshot(cfg, container)
	return &RateLimitProvider{
		fallback:  cfg,
		container: container,
	}
}

func NewRateLimitProviderWithContainer(cfg Config, container RateLimitConfigContainer) *RateLimitProvider {
	return &RateLimitProvider{
		fallback:  cfg,
		container: container,
	}
}

func (p *RateLimitProvider) ResolveCapabilityRateLimitRPM(capability string) int {
	if p == nil {
		return 0
	}

	capability = normalizeCapabilityName(capability)
	if p.fallback.RateLimitDConfEnabled {
		if rpm, ok := p.resolveFromDConf(capability); ok {
			return rpm
		}
	}
	return p.fallback.ResolveCapabilityRateLimitRPM(capability)
}

func (p *RateLimitProvider) resolveFromDConf(capability string) (int, bool) {
	if p.container == nil {
		return 0, false
	}

	current := p.container.Get()
	if current == nil {
		return 0, false
	}

	if capability != "" {
		if rpm, ok := current.Capabilities[capability]; ok && rpm > 0 {
			return rpm, true
		}
	}

	if current.DefaultRPM > 0 {
		return current.DefaultRPM, true
	}
	return 0, false
}

func normalizeCapabilityName(capability string) string {
	return strings.TrimSpace(strings.ToLower(capability))
}

func logRateLimitDConfSnapshot(cfg Config, container RateLimitConfigContainer) {
	if container == nil {
		return
	}

	current := container.Get()
	if current == nil {
		logging.WithFields(logging.Fields{"group": cfg.RateLimitDConfGroup, "data_id": cfg.RateLimitDConfDataID}).Warn("rate-limit dconf snapshot unavailable")
		return
	}

	payload, err := json.Marshal(current)
	if err != nil {
		logging.WithError(err).WithFields(logging.Fields{"group": cfg.RateLimitDConfGroup, "data_id": cfg.RateLimitDConfDataID}).Warn("rate-limit failed to marshal dconf snapshot")
		return
	}

	logging.WithFields(logging.Fields{"group": cfg.RateLimitDConfGroup, "data_id": cfg.RateLimitDConfDataID, "payload": string(payload)}).Info("rate-limit dconf snapshot")
}
