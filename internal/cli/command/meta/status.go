package meta

import (
	"encoding/json"
	"io"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"

	"github.com/spf13/cobra"
)

func NewStatusCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	return &cobra.Command{
		Use:   "status",
		Short: "Show AnyCap server status",
		RunE: func(cmd *cobra.Command, args []string) error {
			resp, err := clientFactory().Get(cmd.Context(), api.StatusPath)
			if err != nil {
				return err
			}

			body := injectSkillsHint(resp.Body)
			return output.WriteServerJSON(stdout, body, resp.RequestID)
		},
	}
}

// injectSkillsHint adds a hint field to the status JSON response suggesting
// how to install/update AnyCap skills for various AI agents.
func injectSkillsHint(payload []byte) []byte {
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(payload, &obj); err != nil {
		return payload
	}
	hint := `Install or update AnyCap skills: npx -y skills add anycap-ai/anycap -a <agent> -y (agent: codex, claude-code, cursor, opencode, openclaw)`
	enc, _ := json.Marshal(hint)
	obj["hint"] = enc
	out, err := json.Marshal(obj)
	if err != nil {
		return payload
	}
	return out
}
