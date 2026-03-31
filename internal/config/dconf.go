package config

import (
	"log"

	"gitlab.knoffice.tech/open/common-go/dconf"
)

var (
	initRateLimitDConfClient = func() error {
		return dconf.Init()
	}
	stopRateLimitDConfClient = func() error {
		return dconf.Stop()
	}
)

func DConfEnabled(cfg Config) bool {
	return cfg.RateLimitDConfEnabled || cfg.FeatureDConfEnabled
}

func InitDConf(cfg Config) error {
	if !DConfEnabled(cfg) {
		return nil
	}

	if err := initRateLimitDConfClient(); err != nil {
		return err
	}

	if cfg.RateLimitDConfEnabled {
		log.Printf("rate-limit: initialized dconf client group=%s data_id=%s", cfg.RateLimitDConfGroup, cfg.RateLimitDConfDataID)
	}
	if cfg.FeatureDConfEnabled {
		log.Printf("feature-access: initialized dconf client group=%s data_id=%s", cfg.FeatureDConfGroup, cfg.FeatureDConfDataID)
	}
	return nil
}

func StopDConf(cfg Config) error {
	if !DConfEnabled(cfg) {
		return nil
	}
	return stopRateLimitDConfClient()
}

func InitRateLimitDConf(cfg Config) error {
	if !cfg.RateLimitDConfEnabled {
		return nil
	}
	return InitDConf(Config{
		RateLimitDConfEnabled: true,
		RateLimitDConfGroup:   cfg.RateLimitDConfGroup,
		RateLimitDConfDataID:  cfg.RateLimitDConfDataID,
	})
}

func StopRateLimitDConf(cfg Config) error {
	if !cfg.RateLimitDConfEnabled {
		return nil
	}
	return StopDConf(Config{RateLimitDConfEnabled: true})
}

func InitFeatureDConf(cfg Config) error {
	if !cfg.FeatureDConfEnabled {
		return nil
	}
	return InitDConf(Config{
		FeatureDConfEnabled: true,
		FeatureDConfGroup:   cfg.FeatureDConfGroup,
		FeatureDConfDataID:  cfg.FeatureDConfDataID,
	})
}

func StopFeatureDConf(cfg Config) error {
	if !cfg.FeatureDConfEnabled {
		return nil
	}
	return StopDConf(Config{FeatureDConfEnabled: true})
}
