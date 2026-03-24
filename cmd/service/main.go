package main

import (
	"gitlab.knoffice.tech/engineering/anycap/internal/app"
	"gitlab.knoffice.tech/engineering/anycap/internal/config"
)

func main() {
	cfg := config.Load()
	application := app.New(cfg)
	application.Run()
}
