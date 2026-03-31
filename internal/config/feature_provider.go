package config

import (
	"log"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
	"gitlab.knoffice.tech/open/common-go/dconf"
)

type FeatureConfig struct {
	FeatureAccessGroups map[string]FeatureAccessGroup `json:"feature_access_groups"`
	Features            map[string]FeatureRule        `json:"features"`
}

type FeatureAccessGroup struct {
	Emails []string `json:"emails"`
}

type FeatureRule struct {
	Enabled             bool     `json:"enabled"`
	Rollout             string   `json:"rollout"`
	FeatureAccessGroups []string `json:"feature_access_groups,omitempty"`
}

type FeatureConfigContainer interface {
	Get() *FeatureConfig
}

type DConfFeatureProvider struct {
	fallback  map[string]bool
	container FeatureConfigContainer
}

var loadFeatureConfigContainer = func(cfg Config) (FeatureConfigContainer, error) {
	return dconf.LoadJson[FeatureConfig](cfg.FeatureDConfGroup, cfg.FeatureDConfDataID)
}

func NewFeatureProvider(cfg Config, fallback map[string]bool) *DConfFeatureProvider {
	provider := &DConfFeatureProvider{fallback: cloneFeatureMap(fallback)}
	if !cfg.FeatureDConfEnabled {
		return provider
	}

	container, err := loadFeatureConfigContainer(cfg)
	if err != nil {
		log.Printf("feature-access: failed to load dconf config group=%s data_id=%s, using fallback: %v", cfg.FeatureDConfGroup, cfg.FeatureDConfDataID, err)
		return provider
	}

	log.Printf("feature-access: using dconf config group=%s data_id=%s", cfg.FeatureDConfGroup, cfg.FeatureDConfDataID)
	provider.container = container
	return provider
}

func NewFeatureProviderWithContainer(cfg Config, fallback map[string]bool, container FeatureConfigContainer) *DConfFeatureProvider {
	provider := &DConfFeatureProvider{fallback: cloneFeatureMap(fallback)}
	if cfg.FeatureDConfEnabled {
		provider.container = container
	}
	return provider
}

func (p *DConfFeatureProvider) GlobalFeatures() map[string]bool {
	result := cloneFeatureMap(p.fallback)
	cfg := p.currentConfig()
	if cfg == nil {
		return result
	}

	for feature, rule := range cfg.Features {
		if !validFeatureRule(rule) {
			continue
		}
		result[normalizeFeatureName(feature)] = rule.Enabled
	}

	return result
}

func (p *DConfFeatureProvider) UserFeatures(principal *model.Principal) map[string]bool {
	global := p.GlobalFeatures()
	result := make(map[string]bool, len(global))
	for feature := range global {
		allowed, _ := p.EnabledFor(principal, feature)
		result[feature] = allowed
	}
	return result
}

func (p *DConfFeatureProvider) EnabledFor(principal *model.Principal, feature string) (bool, bool) {
	feature = normalizeFeatureName(feature)
	if rule, ok := p.featureRule(feature); ok {
		if !rule.Enabled {
			return false, false
		}
		switch normalizeRollout(rule.Rollout) {
		case "all":
			return true, true
		case "groups":
			return p.emailAllowed(principal, rule.FeatureAccessGroups), true
		default:
			return false, false
		}
	}

	if !p.fallback[feature] {
		return false, false
	}
	return true, true
}

func (p *DConfFeatureProvider) featureRule(feature string) (FeatureRule, bool) {
	cfg := p.currentConfig()
	if cfg == nil {
		return FeatureRule{}, false
	}

	rule, ok := cfg.Features[feature]
	if !ok || !validFeatureRule(rule) {
		return FeatureRule{}, false
	}
	return rule, true
}

func (p *DConfFeatureProvider) currentConfig() *FeatureConfig {
	if p == nil || p.container == nil {
		return nil
	}
	return p.container.Get()
}

func (p *DConfFeatureProvider) emailAllowed(principal *model.Principal, groups []string) bool {
	cfg := p.currentConfig()
	if cfg == nil || principal == nil {
		return false
	}

	email := normalizeEmail(principal.Email)
	if email == "" {
		return false
	}

	for _, groupName := range groups {
		group, ok := cfg.FeatureAccessGroups[groupName]
		if !ok {
			continue
		}
		for _, candidate := range group.Emails {
			if normalizeEmail(candidate) == email {
				return true
			}
		}
	}
	return false
}

func normalizeFeatureName(name string) string {
	return strings.ToLower(strings.TrimSpace(name))
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func normalizeRollout(rollout string) string {
	return strings.ToLower(strings.TrimSpace(rollout))
}

func validFeatureRule(rule FeatureRule) bool {
	switch normalizeRollout(rule.Rollout) {
	case "all", "groups":
		return true
	default:
		return false
	}
}

func cloneFeatureMap(src map[string]bool) map[string]bool {
	if len(src) == 0 {
		return map[string]bool{}
	}

	dst := make(map[string]bool, len(src))
	for k, v := range src {
		dst[k] = v
	}
	return dst
}
