package config

import (
	"gitlab.knoffice.tech/open/common-go/dconf"
	"gitlab.knoffice.tech/open/common-go/logging"
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
		logging.WithFields(logging.Fields{"group": cfg.RateLimitDConfGroup, "data_id": cfg.RateLimitDConfDataID}).Info("rate-limit initialized dconf client")
	}
	if cfg.FeatureDConfEnabled {
		logging.WithFields(logging.Fields{"group": cfg.FeatureDConfGroup, "data_id": cfg.FeatureDConfDataID}).Info("feature-access initialized dconf client")
	}
	if cfg.StorageQuotaDConfEnabled {
		logging.WithFields(logging.Fields{"group": cfg.StorageQuotaDConfGroup, "data_id": cfg.StorageQuotaDConfDataID}).Info("storage-quota initialized dconf client")
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
