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

func InitRateLimitDConf(cfg Config) error {
	if !cfg.RateLimitDConfEnabled {
		return nil
	}

	if err := initRateLimitDConfClient(); err != nil {
		return err
	}

	log.Printf("rate-limit: initialized dconf client group=%s data_id=%s", cfg.RateLimitDConfGroup, cfg.RateLimitDConfDataID)
	return nil
}

func StopRateLimitDConf(cfg Config) error {
	if !cfg.RateLimitDConfEnabled {
		return nil
	}
	return stopRateLimitDConfClient()
}
