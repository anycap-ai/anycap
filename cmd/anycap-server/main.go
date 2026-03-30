package main

import (
	"log"

	"gitlab.knoffice.tech/engineering/anycap/internal/app"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func main() {
	cfg := config.Load()
	if err := config.InitRateLimitDConf(cfg); err != nil {
		log.Printf("rate-limit: dconf init failed, using env fallback: %v", err)
	} else if cfg.RateLimitDConfEnabled {
		defer func() {
			if err := config.StopRateLimitDConf(cfg); err != nil {
				log.Printf("rate-limit: dconf stop failed: %v", err)
			}
		}()
	}

	server := app.NewServer(cfg, buildinfo.Current())
	server.Run()
}
