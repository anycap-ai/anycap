package config

import (
	"log"
	"strings"

	"gitlab.knoffice.tech/open/common-go/dconf"
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
		log.Printf("rate-limit: failed to load dconf config group=%s data_id=%s, using env fallback: %v", cfg.RateLimitDConfGroup, cfg.RateLimitDConfDataID, err)
		return &RateLimitProvider{fallback: cfg}
	}

	log.Printf("rate-limit: using dconf config group=%s data_id=%s", cfg.RateLimitDConfGroup, cfg.RateLimitDConfDataID)
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
