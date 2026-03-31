package main

import (
	"log"

	"gitlab.knoffice.tech/engineering/anycap/internal/app"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func main() {
	cfg := config.Load()
	if err := config.InitDConf(cfg); err != nil {
		log.Printf("dconf: init failed, using env fallback: %v", err)
	} else if config.DConfEnabled(cfg) {
		defer func() {
			if err := config.StopDConf(cfg); err != nil {
				log.Printf("dconf: stop failed: %v", err)
			}
		}()
	}

	server := app.NewServer(cfg, buildinfo.Current())
	server.Run()
}
