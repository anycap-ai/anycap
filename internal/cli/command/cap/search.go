package cap

import (
	"fmt"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

// NewSearchCmd creates the top-level "search" command.
// It performs web search via the AnyCap server.
//
// Two mutually exclusive flags determine the search mode:
//   - --query  -> general web search (structured results, 1 credit)
//   - --prompt -> LLM grounding search (synthesized answer with citations, 5 credits)
func NewSearchCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		query      string
		prompt     string
		maxResults int
		timeRange  string
		include    []string
		exclude    []string
		noCrawl    bool
		after      string
		before     string
	)

	cmd := &cobra.Command{
		Use:   "search",
		Short: "Search the web",
		Long: `Search the web using AnyCap.

General search (--query, 1 credit):
  Returns web search results with title, URL, description, and full page content.

  anycap search --query "Go programming language"
  anycap search --query "AI agent framework" --max-results 3 --time-range month
  anycap search --query "Go context" --include github.com --include stackoverflow.com
  anycap search --query "Go error handling" --no-crawl
  anycap search --query "Claude Code release" --after 2025-06-01
  anycap search --query "AI news" --after 2025-01-01 --before 2025-06-30

LLM grounding search (--prompt, 5 credits):
  LLM-powered search with citations grounded in real-time web data.
  Returns a synthesized answer with per-segment source attribution.

  anycap search --prompt "What are the latest changes in Go 1.25?"
  anycap search --prompt "Compare React vs Vue in terms of performance"`,
		RunE: func(cmd *cobra.Command, args []string) error {
			body := map[string]any{}

			switch {
			case query != "" && prompt != "":
				return fmt.Errorf("use --query for web search results OR --prompt for LLM grounding search, not both")
			case query != "":
				body["query"] = query
				body["mode"] = "general"
				if maxResults > 0 {
					body["max_results"] = maxResults
				}
				if noCrawl {
					body["crawl_results"] = 0
				}
				if timeRange != "" {
					body["time_range"] = timeRange
				}
				if len(include) > 0 {
					body["include_domains"] = include
				}
				if len(exclude) > 0 {
					body["exclude_domains"] = exclude
				}
				if after != "" {
					body["after"] = after
				}
				if before != "" {
					body["before"] = before
				}
			case prompt != "":
				body["query"] = prompt
				body["mode"] = "grounding"
			default:
				return fmt.Errorf("provide --query for web search results (1 credit) or --prompt for LLM grounding search with citations (5 credits)")
			}

			client := clientFactory()
			if err := writeInvocationStarted(cmd, "web.search", ""); err != nil {
				return err
			}
			resp, err := client.PostJSON(cmd.Context(), api.WebSearchPath, body)
			if err != nil {
				return err
			}

			return output.WriteServerJSON(stdout, resp.Body, resp.RequestID)
		},
	}

	// Mode selection (mutually exclusive).
	cmd.Flags().StringVar(&query, "query", "", "Search query for web results (general mode, 1 credit)")
	cmd.Flags().StringVar(&prompt, "prompt", "", "Search prompt for LLM grounding with citations (5 credits)")

	// General mode options.
	cmd.Flags().IntVar(&maxResults, "max-results", 0, "Max results 1-20 (general mode, default 5)")
	cmd.Flags().StringVar(&timeRange, "time-range", "", "Filter by recency: day, week, month, year (general mode)")
	cmd.Flags().StringSliceVar(&include, "include", nil, "Include domain, repeatable (general mode)")
	cmd.Flags().StringSliceVar(&exclude, "exclude", nil, "Exclude domain, repeatable (general mode)")
	cmd.Flags().BoolVar(&noCrawl, "no-crawl", false, "Skip full content crawling, return titles and URLs only (general mode)")
	cmd.Flags().StringVar(&after, "after", "", "Only results published after this date, YYYY-MM-DD (general mode, uses precise search)")
	cmd.Flags().StringVar(&before, "before", "", "Only results published before this date, YYYY-MM-DD (general mode, uses precise search)")

	return cmd
}
