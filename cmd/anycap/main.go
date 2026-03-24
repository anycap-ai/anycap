package main

import (
	"os"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/command"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"
)

func main() {
	cmd := command.NewRootCmd(command.Options{
		BuildInfo: buildinfo.Current(),
	})

	if err := cmd.Execute(); err != nil {
		_, _ = os.Stderr.WriteString(err.Error() + "\n")
		os.Exit(1)
	}
}
