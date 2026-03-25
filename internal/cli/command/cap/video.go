package cap

import (
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"

	"github.com/spf13/cobra"
)

func NewVideoCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	videoCmd := &cobra.Command{
		Use:   "video",
		Short: "Generate and process videos",
		RunE:  requireSubcommand,
	}

	// Future: video generate, video models, etc.

	return videoCmd
}
