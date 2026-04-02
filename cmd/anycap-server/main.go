package main

import (
	"gitlab.knoffice.tech/engineering/anycap/internal/app"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
	"gitlab.knoffice.tech/open/common-go/logging"
	"gitlab.knoffice.tech/open/common-go/metrics"
	"gitlab.knoffice.tech/open/common-go/trace"
)

func main() {
	cfg := config.Load()
	logging.Init(&logging.Config{
		Level:  cfg.LogLevel,
		Format: cfg.LogFormat,
		Output: cfg.LogOutput,
	})
	trace.Setup()
	metrics.Init(cfg.AppName, buildinfo.Current().Version, cfg.AppEnv)

	if err := config.InitDConf(cfg); err != nil {
		logging.WithError(err).Warn("dconf init failed; using env fallback")
	} else if config.DConfEnabled(cfg) {
		defer func() {
			if err := config.StopDConf(cfg); err != nil {
				logging.WithError(err).Error("dconf stop failed")
			}
		}()
	}

	server := app.NewServer(cfg, buildinfo.Current())
	server.Run()
}
