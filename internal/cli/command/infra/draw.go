package infra

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/signal"
	"path/filepath"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/draw"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

// NewDrawCmd creates the top-level "anycap draw" command.
func NewDrawCmd(stdout io.Writer) *cobra.Command {
	var (
		noWait    bool
		initPath  string
		imagePath string
		outputDir string
		bindAddr  string
		port      int
	)

	cmd := &cobra.Command{
		Use:   "draw",
		Short: "Open a browser-based interactive whiteboard (Excalidraw)",
		Long: `Open an interactive whiteboard in the browser powered by Excalidraw.
Supports blank canvas, pre-populated Excalidraw JSON (with defaults filling),
and Mermaid diagrams (auto-converted to editable shapes).

The agent can push updates to the active session via 'anycap draw update'
without restarting. Update fully replaces the whiteboard content with the
new conversion output.

Blocking mode (default): opens browser, waits for user to click Save, then outputs result.
Non-blocking mode (--no-wait): starts a background server and returns immediately.

Examples:
  anycap draw
  anycap draw --init arch.mmd
  anycap draw --init existing.excalidraw
  anycap draw --image mockup.png
  anycap draw --init arch.mmd --no-wait --json --port 18400`,
		DisableFlagsInUseLine: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			// Validate init file exists
			if initPath != "" {
				absPath, err := filepath.Abs(initPath)
				if err != nil {
					return fmt.Errorf("resolve path: %w", err)
				}
				if _, err := os.Stat(absPath); err != nil {
					return fmt.Errorf("file not found: %w", err)
				}
				initPath = absPath
			}
			if imagePath != "" {
				absPath, err := filepath.Abs(imagePath)
				if err != nil {
					return fmt.Errorf("resolve path: %w", err)
				}
				if _, err := os.Stat(absPath); err != nil {
					return fmt.Errorf("file not found: %w", err)
				}
				imagePath = absPath
			}

			draw.CleanExpiredSessions()

			if noWait {
				return runDrawNonBlocking(stdout, cmd.ErrOrStderr(), initPath, imagePath, outputDir, bindAddr, port)
			}
			return runDrawBlocking(cmd, stdout, initPath, imagePath, outputDir, bindAddr, port)
		},
	}

	cmd.Flags().BoolVar(&noWait, "no-wait", false, "Start background server and return immediately (for agent use)")
	cmd.Flags().StringVar(&initPath, "init", "", "Initial content file (.mmd, .excalidraw, .json)")
	cmd.Flags().StringVar(&imagePath, "image", "", "Background image file")
	cmd.Flags().StringVarP(&outputDir, "output", "o", "", "Output directory for saved artifacts (default: .anycap/draw/)")
	cmd.Flags().StringVar(&bindAddr, "bind", "127.0.0.1", "Bind address (use 0.0.0.0 for remote access)")
	cmd.Flags().IntVar(&port, "port", 0, "Server port (0 = random). Agents should specify a fixed port.")

	cmd.AddCommand(newDrawUpdateCmd(stdout))
	cmd.AddCommand(newDrawPollCmd(stdout))
	cmd.AddCommand(newDrawStopCmd(stdout))
	cmd.AddCommand(newDrawListCmd(stdout))
	cmd.AddCommand(newDrawServeCmd())

	return cmd
}

func runDrawBlocking(cmd *cobra.Command, stdout io.Writer, initPath, imagePath, outputDir, bind string, port int) error {
	ctx, cancel := signal.NotifyContext(cmd.Context(), os.Interrupt)
	defer cancel()

	result, err := draw.RunBlocking(ctx, initPath, imagePath, outputDir, bind, port, cmd.ErrOrStderr())
	if err != nil {
		return err
	}
	if result == nil {
		fmt.Fprintln(cmd.ErrOrStderr(), "No content saved.")
		return nil
	}

	// TTY summary
	printDrawResultSummary(cmd.ErrOrStderr(), result)

	data, _ := json.Marshal(result)
	return output.WriteJSON(stdout, data)
}

func printDrawResultSummary(w io.Writer, result *DrawResult) {
	fmt.Fprintln(w, "Whiteboard saved.")
	fmt.Fprintln(w)
	if result.Snapshot != "" {
		fmt.Fprintf(w, "Snapshot:  %s\n", result.Snapshot)
	}
	if result.Document != "" {
		fmt.Fprintf(w, "Document:  %s\n", result.Document)
	}
	if result.Source != "" {
		fmt.Fprintf(w, "Source:    %s\n", result.Source)
	}
}

func runDrawNonBlocking(stdout io.Writer, stderr io.Writer, initPath, imagePath, outputDir, bind string, port int) error {
	session, err := draw.StartBackground(initPath, imagePath, outputDir, bind, port)
	if err != nil {
		return err
	}

	localURL := fmt.Sprintf("http://127.0.0.1:%d", session.Port)
	urlHost := bind
	if urlHost == "0.0.0.0" {
		urlHost = "<host-ip>"
	}
	url := fmt.Sprintf("http://%s:%d", urlHost, session.Port)

	if err := draw.WaitForReady(bind, session.Port, 3*time.Second); err != nil {
		fmt.Fprintf(stderr, "Warning: server may not be ready yet\n")
	}

	if berr := openDrawBrowser(localURL); berr != nil {
		fmt.Fprintf(stderr, "Could not open browser. Open this URL manually:\n  %s\n", localURL)
		if bind == "0.0.0.0" {
			fmt.Fprintf(stderr, "  Listening on 0.0.0.0:%d -- accessible from other machines via http://<host-ip>:%d\n", session.Port, session.Port)
		} else {
			fmt.Fprintf(stderr, "  Tip: use --bind 0.0.0.0 to allow access from other machines.\n")
		}
		fmt.Fprintln(stderr)
	}

	hint := "Show the URL to the user. They can draw, add shapes, and collaborate on the whiteboard. " +
		"Use update_command to push new Mermaid content (validates before applying). " +
		"UPDATE fully replaces all whiteboard content with the new conversion. " +
		"To iterate: read the snapshot, edit the .mmd source, then push via update_command. " +
		"Use poll_command to retrieve the latest result. Use stop_command when done. " +
		"Use 'anycap draw list' to recover sessions after context loss."

	result := map[string]any{
		"status":  "started",
		"session": session.SessionID,
		"url":     url,
		"poll_command": fmt.Sprintf(
			"anycap draw poll --session %s", session.SessionID),
		"update_command": fmt.Sprintf(
			"anycap draw update --session %s --init <file>", session.SessionID),
		"stop_command": fmt.Sprintf(
			"anycap draw stop --session %s", session.SessionID),
		"session_file":     draw.SessionFilePath(session.SessionID),
		"expires_in":       draw.SessionTimeoutSeconds(),
		"next_action_hint": hint,
	}

	data, _ := json.Marshal(result)
	return output.WriteJSON(stdout, data)
}

// DrawResult is re-exported for use in the command layer.
type DrawResult = draw.DrawResult

func newDrawUpdateCmd(stdout io.Writer) *cobra.Command {
	var (
		sessionID string
		initPath  string
	)

	cmd := &cobra.Command{
		Use:   "update",
		Short: "Push updated content to an active draw session",
		Long: `Push new Mermaid or Excalidraw content to an active draw session.
The browser validates the content before applying. All diagram elements
are replaced with the new conversion output. User-drawn annotations
(freehand drawings, sticky notes, etc.) are preserved.

Example:
  anycap draw update --session drw_xxx --init arch.mmd`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if initPath == "" {
				return fmt.Errorf("--init is required for update")
			}

			result, err := draw.UpdateSession(sessionID, initPath)
			if err != nil {
				return err
			}
			return output.WriteJSON(stdout, result)
		},
	}

	cmd.Flags().StringVar(&sessionID, "session", "", "Session ID to update")
	cmd.Flags().StringVar(&initPath, "init", "", "New content file (.mmd, .excalidraw, .json)")
	_ = cmd.MarkFlagRequired("session")

	return cmd
}

func newDrawPollCmd(stdout io.Writer) *cobra.Command {
	var sessionID string

	cmd := &cobra.Command{
		Use:   "poll",
		Short: "Fetch the latest draw result",
		Long: `Fetch the current status and latest draw result for a session.

Example:
  anycap draw poll --session drw_xxx --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			session, err := draw.PollSession(sessionID)
			if err != nil {
				return err
			}
			if session.Status == "expired" {
				data, _ := json.Marshal(map[string]string{"status": "expired"})
				return output.WriteJSON(stdout, data)
			}
			if session.Result == nil {
				data, _ := json.Marshal(map[string]string{"status": "pending"})
				return output.WriteJSON(stdout, data)
			}
			data, _ := json.Marshal(session.Result)
			return output.WriteJSON(stdout, data)
		},
	}

	cmd.Flags().StringVar(&sessionID, "session", "", "Session ID to poll")
	_ = cmd.MarkFlagRequired("session")

	return cmd
}

func newDrawStopCmd(stdout io.Writer) *cobra.Command {
	var sessionID string

	cmd := &cobra.Command{
		Use:   "stop",
		Short: "Stop a background draw server",
		Long: `Stop a background draw server and clean up the session.

Example:
  anycap draw stop --session drw_xxx`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := draw.StopSession(sessionID); err != nil {
				return err
			}
			data, _ := json.Marshal(map[string]string{
				"status":  "stopped",
				"session": sessionID,
			})
			return output.WriteJSON(stdout, data)
		},
	}

	cmd.Flags().StringVar(&sessionID, "session", "", "Session ID to stop")
	_ = cmd.MarkFlagRequired("session")

	return cmd
}

func newDrawListCmd(stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "list",
		Short: "List active draw sessions",
		Long: `List all draw sessions in the current directory.

Example:
  anycap draw list`,
		RunE: func(cmd *cobra.Command, args []string) error {
			sessions, err := draw.ListSessions()
			if err != nil {
				return err
			}

			type sessionInfo struct {
				SessionID     string `json:"session"`
				Status        string `json:"status"`
				InitFormat    string `json:"init_format,omitempty"`
				Port          int    `json:"port"`
				PollCommand   string `json:"poll_command"`
				UpdateCommand string `json:"update_command"`
				StopCommand   string `json:"stop_command"`
			}

			items := make([]sessionInfo, 0, len(sessions))
			for _, s := range sessions {
				items = append(items, sessionInfo{
					SessionID:     s.SessionID,
					Status:        s.Status,
					InitFormat:    s.InitFormat,
					Port:          s.Port,
					PollCommand:   fmt.Sprintf("anycap draw poll --session %s", s.SessionID),
					UpdateCommand: fmt.Sprintf("anycap draw update --session %s --init <file>", s.SessionID),
					StopCommand:   fmt.Sprintf("anycap draw stop --session %s", s.SessionID),
				})
			}

			result := map[string]any{
				"sessions": items,
				"count":    len(items),
			}
			data, _ := json.Marshal(result)
			return output.WriteJSON(stdout, data)
		},
	}
	return cmd
}

func newDrawServeCmd() *cobra.Command {
	var sessionID string

	cmd := &cobra.Command{
		Use:    "_serve",
		Short:  "Run draw server (internal use)",
		Hidden: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			ctx, cancel := signal.NotifyContext(cmd.Context(), os.Interrupt)
			defer cancel()
			return draw.RunServe(ctx, sessionID)
		},
	}

	cmd.Flags().StringVar(&sessionID, "session", "", "Session ID")
	_ = cmd.MarkFlagRequired("session")

	return cmd
}

func openDrawBrowser(url string) error {
	return auth.OpenBrowser(url)
}
