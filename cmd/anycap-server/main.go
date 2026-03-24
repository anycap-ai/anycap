package main

import (
	"gitlab.knoffice.tech/engineering/anycap/internal/app"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func main() {
	server := app.NewServer(config.Load(), buildinfo.Current())
	server.Run()
}
