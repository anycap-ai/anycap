package cap

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

// NewCrawlCmd creates the top-level "crawl" command.
// It converts a web page to Markdown via the AnyCap server.
func NewCrawlCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "crawl <url>",
		Short: "Convert a web page to Markdown",
		Long: `Crawl a web page and return its content as clean Markdown.

Examples:
  anycap crawl https://example.com
  anycap crawl https://docs.go.dev/ref/spec
  anycap crawl https://example.com | jq -r '.markdown'`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			targetURL := args[0]
			if targetURL == "" {
				return fmt.Errorf("url argument is required")
			}

			client := clientFactory()
			body := map[string]any{
				"url": targetURL,
			}

			resp, err := client.PostJSON(cmd.Context(), api.WebCrawlPath, body)
			if err != nil {
				return err
			}

			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	return cmd
}
