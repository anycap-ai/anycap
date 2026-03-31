package config

import (
	"testing"

	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type fakeFeatureConfigContainer struct {
	current *FeatureConfig
}

func (f fakeFeatureConfigContainer) Get() *FeatureConfig {
	return f.current
}

func TestFeatureProvider_GlobalFeatures_UsesFallbackWhenDConfDisabled(t *testing.T) {
	fallback := map[string]bool{
		"image.generate": true,
		"music.generate": false,
	}

	provider := NewFeatureProvider(Config{FeatureDConfEnabled: false}, fallback)

	got := provider.GlobalFeatures()
	if !got["image.generate"] {
		t.Fatal("expected fallback image.generate to remain enabled")
	}
	if got["music.generate"] {
		t.Fatal("expected fallback music.generate to remain disabled")
	}

	allowed, enabled := provider.EnabledFor(&model.Principal{}, "image.generate")
	if !enabled || !allowed {
		t.Fatalf("expected fallback enabled feature to allow access, got allowed=%v enabled=%v", allowed, enabled)
	}
}

func TestFeatureProvider_EnabledFor_AllowsAllRollout(t *testing.T) {
	provider := NewFeatureProviderWithContainer(
		Config{FeatureDConfEnabled: true},
		map[string]bool{"image.generate": false},
		fakeFeatureConfigContainer{
			current: &FeatureConfig{
				Features: map[string]FeatureRule{
					"image.generate": {Enabled: true, Rollout: "all"},
				},
			},
		},
	)

	allowed, enabled := provider.EnabledFor(&model.Principal{}, "image.generate")
	if !enabled || !allowed {
		t.Fatalf("expected rollout=all to allow access, got allowed=%v enabled=%v", allowed, enabled)
	}
}

func TestFeatureProvider_EnabledFor_AllowsGroupsRolloutByEmail(t *testing.T) {
	provider := NewFeatureProviderWithContainer(
		Config{FeatureDConfEnabled: true},
		map[string]bool{"video.generate": true},
		fakeFeatureConfigContainer{
			current: &FeatureConfig{
				FeatureAccessGroups: map[string]FeatureAccessGroup{
					"internal": {Emails: []string{"Alice@Gmail.com"}},
				},
				Features: map[string]FeatureRule{
					"video.generate": {
						Enabled:             true,
						Rollout:             "groups",
						FeatureAccessGroups: []string{"internal"},
					},
				},
			},
		},
	)

	allowed, enabled := provider.EnabledFor(&model.Principal{Email: " alice@gmail.com "}, "video.generate")
	if !enabled || !allowed {
		t.Fatalf("expected normalized email to match group, got allowed=%v enabled=%v", allowed, enabled)
	}
}

func TestFeatureProvider_EnabledFor_DeniesWhenEmailNotInGroup(t *testing.T) {
	provider := NewFeatureProviderWithContainer(
		Config{FeatureDConfEnabled: true},
		map[string]bool{"music.generate": true},
		fakeFeatureConfigContainer{
			current: &FeatureConfig{
				FeatureAccessGroups: map[string]FeatureAccessGroup{
					"beta_users": {Emails: []string{"partner1@gmail.com"}},
				},
				Features: map[string]FeatureRule{
					"music.generate": {
						Enabled:             true,
						Rollout:             "groups",
						FeatureAccessGroups: []string{"beta_users"},
					},
				},
			},
		},
	)

	allowed, enabled := provider.EnabledFor(&model.Principal{Email: "someone@gmail.com"}, "music.generate")
	if !enabled {
		t.Fatal("expected music.generate to remain globally enabled")
	}
	if allowed {
		t.Fatal("expected non-member email to be denied")
	}
}
