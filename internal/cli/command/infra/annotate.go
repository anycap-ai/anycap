package infra

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/signal"
	"path/filepath"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/annotate"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/auth"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"

	"github.com/spf13/cobra"
)

// NewAnnotateCmd creates the top-level "anycap annotate" command.
func NewAnnotateCmd(stdout io.Writer) *cobra.Command {
	var (
		noWait     bool
		outputPath string
		bindAddr   string
		port       int
	)

	cmd := &cobra.Command{
		Use:   "annotate <target>",
		Short: "Open a browser-based annotation and feedback tool",
		Long: `Open an interactive annotation tool in the browser. Supports four target types,
auto-detected from the argument:

  Image files (.png, .jpg, ...):  Draw annotations on the image
  URLs (http/https):              Browse a page via iframe, annotate + record
  Video files (.mp4, .webm, ...): Annotate paused frames, record commentary
  Audio files (.mp3, .wav, ...):  Listen and record narrated feedback

Multiple users can open the same URL to collaborate in real-time. Annotations
and cursors are synced live across all connected clients.

The page provides annotation tools AND a record button. Recording captures the
full browser tab as a video file. Use "anycap actions video-read" on the recording to
get AI video understanding of the user's feedback session.

Blocking mode (default): opens browser, waits for user to click Done, then outputs result.
Non-blocking mode (--no-wait): starts a background server and returns immediately.

Examples:
  anycap annotate photo.png
  anycap annotate https://localhost:3000
  anycap annotate output.mp4
  anycap annotate song.mp3
  anycap annotate photo.png --no-wait --json --port 18321`,
		Args:                  cobra.ExactArgs(1),
		DisableFlagsInUseLine: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			target := args[0]
			mediaType := annotate.DetectMediaType(target)

			// Validate target exists for file-based types.
			if mediaType != annotate.MediaTypeURL {
				absPath, err := filepath.Abs(target)
				if err != nil {
					return fmt.Errorf("resolve path: %w", err)
				}
				if _, err := os.Stat(absPath); err != nil {
					return fmt.Errorf("file not found: %w", err)
				}
				target = absPath
			}

			outPath := outputPath
			if outPath != "" {
				outPath, _ = filepath.Abs(outPath)
			} else if mediaType == annotate.MediaTypeImage {
				outPath = annotate.DefaultOutputPath(target)
				outPath, _ = filepath.Abs(outPath)
			}

			// Clean up old sessions.
			annotate.CleanExpiredSessions()

			if noWait {
				return runAnnotateNonBlocking(stdout, cmd.ErrOrStderr(), target, outPath, bindAddr, port, mediaType)
			}
			return runAnnotateBlocking(cmd, stdout, target, outPath, bindAddr, port, mediaType)
		},
	}

	cmd.Flags().BoolVar(&noWait, "no-wait", false, "Start background server and return immediately (for agent use)")
	cmd.Flags().StringVarP(&outputPath, "output", "o", "", "Save annotated image to this path")
	cmd.Flags().StringVar(&bindAddr, "bind", "127.0.0.1", "Bind address (use 0.0.0.0 for remote/headless access)")
	cmd.Flags().IntVar(&port, "port", 0, "Server port (0 = random). Agents should specify a fixed port.")

	// Subcommands.
	cmd.AddCommand(newAnnotatePollCmd(stdout))
	cmd.AddCommand(newAnnotateStopCmd(stdout))
	cmd.AddCommand(newAnnotateListCmd(stdout))
	cmd.AddCommand(newAnnotateServeCmd())

	return cmd
}

func runAnnotateBlocking(cmd *cobra.Command, stdout io.Writer, target, outputPath, bind string, port int, mediaType string) error {
	ctx, cancel := signal.NotifyContext(cmd.Context(), os.Interrupt)
	defer cancel()

	result, err := annotate.RunBlocking(ctx, target, outputPath, bind, port, mediaType, cmd.ErrOrStderr())
	if err != nil {
		return err
	}

	if result == nil {
		fmt.Fprintln(cmd.ErrOrStderr(), "No feedback submitted.")
		return nil
	}

	// TTY: human-readable summary to stderr.
	printResultSummary(cmd.ErrOrStderr(), result)

	// JSON output to stdout.
	data, _ := json.Marshal(result)
	return output.WriteJSON(stdout, data)
}

func printResultSummary(w io.Writer, result *AnnotationResult) {
	annCount := len(result.Annotations)
	if annCount > 0 {
		fmt.Fprintf(w, "Annotations saved. %d regions marked.", annCount)
	} else {
		fmt.Fprintf(w, "Feedback saved.")
	}
	if result.RecordingDuration > 0 {
		fmt.Fprintf(w, " Recording: %.0fs", result.RecordingDuration)
	}
	fmt.Fprintln(w)
	fmt.Fprintln(w)

	for _, a := range result.Annotations {
		fmt.Fprintf(w, "  #%d [%s]", a.ID, a.Type)
		switch a.Type {
		case "rect":
			if a.Bounds != nil {
				fmt.Fprintf(w, " (%d,%d %dx%d)", a.Bounds.X, a.Bounds.Y, a.Bounds.Width, a.Bounds.Height)
			}
		case "arrow":
			if a.From != nil && a.To != nil {
				fmt.Fprintf(w, " (%d,%d -> %d,%d)", a.From.X, a.From.Y, a.To.X, a.To.Y)
			}
		case "point":
			if a.Position != nil {
				fmt.Fprintf(w, " (%d,%d)", a.Position.X, a.Position.Y)
			}
		}
		if a.Label != "" {
			fmt.Fprintf(w, ": %s", a.Label)
		}
		fmt.Fprintln(w)
	}

	if annCount > 0 {
		fmt.Fprintln(w)
	}
	if result.AnnotatedImage != "" {
		fmt.Fprintf(w, "Annotated image: %s\n", result.AnnotatedImage)
	}
	if result.Recording != "" {
		fmt.Fprintf(w, "Recording: %s\n", result.Recording)
	}
}

func runAnnotateNonBlocking(stdout io.Writer, stderr io.Writer, target, outputPath, bind string, port int, mediaType string) error {
	session, err := annotate.StartBackground(target, outputPath, bind, port, mediaType)
	if err != nil {
		return err
	}

	// For opening the local browser, always use 127.0.0.1.
	localURL := fmt.Sprintf("http://127.0.0.1:%d", session.Port)
	// For the JSON output URL, use the actual bind address so remote
	// users get a reachable URL when --bind 0.0.0.0 is used.
	urlHost := bind
	if urlHost == "0.0.0.0" {
		urlHost = "<host-ip>"
	}
	url := fmt.Sprintf("http://%s:%d", urlHost, session.Port)

	// Wait for server to be ready before opening browser.
	if err := annotate.WaitForReady(bind, session.Port, 3*time.Second); err != nil {
		fmt.Fprintf(stderr, "Warning: server may not be ready yet\n")
	}

	if berr := openBrowser(localURL); berr != nil {
		fmt.Fprintf(stderr, "Could not open browser. Open this URL manually:\n  %s\n", localURL)
		if bind == "0.0.0.0" {
			fmt.Fprintf(stderr, "  Listening on 0.0.0.0:%d -- accessible from other machines via http://<host-ip>:%d\n", session.Port, session.Port)
		} else {
			fmt.Fprintf(stderr, "  Tip: use --bind 0.0.0.0 to allow access from other machines.\n")
		}
		fmt.Fprintln(stderr)
	}

	result := map[string]any{
		"status":  "started",
		"session": session.SessionID,
		"url":     url,
		"poll_command": fmt.Sprintf(
			"anycap annotate poll --session %s", session.SessionID),
		"stop_command": fmt.Sprintf(
			"anycap annotate stop --session %s", session.SessionID),
		"session_file": annotate.SessionFilePath(session.SessionID),
		"expires_in":   annotate.SessionTimeoutSeconds(),
		"next_action_hint": "Show the URL to the user. Multiple users can open the same URL " +
			"to collaborate in real-time (shared annotations, live cursors). " +
			"Users can draw annotations, record screen video with narration, or both. " +
			"The recording captures the full browser tab as video -- use `anycap actions video-read` " +
			"to analyze it for visual understanding. " +
			"After the user confirms they are done, run poll_command to retrieve all feedback, " +
			"then run stop_command. " +
			"Session state is persisted at session_file -- read it to recover session details if needed.",
	}

	data, _ := json.Marshal(result)
	return output.WriteJSON(stdout, data)
}

// AnnotationResult is re-exported for use in the command layer.
type AnnotationResult = annotate.AnnotationResult

func newAnnotatePollCmd(stdout io.Writer) *cobra.Command {
	var sessionID string

	cmd := &cobra.Command{
		Use:   "poll",
		Short: "Fetch the latest annotation result",
		Long: `Fetch the current status and latest annotation result for a session.
Call this once after the user confirms they are done annotating.

Example:
  anycap annotate poll --session ann_a1b2c3d4 --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			session, err := annotate.PollSession(sessionID)
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

func newAnnotateStopCmd(stdout io.Writer) *cobra.Command {
	var sessionID string

	cmd := &cobra.Command{
		Use:   "stop",
		Short: "Stop a background annotation server",
		Long: `Stop a background annotation server and clean up the session.

Example:
  anycap annotate stop --session ann_a1b2c3d4`,
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := annotate.StopSession(sessionID); err != nil {
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

func newAnnotateListCmd(stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "list",
		Short: "List active annotation sessions",
		Long: `List all annotation sessions in the current directory.
Shows session ID, status, media type, target, and port.

Example:
  anycap annotate list`,
		RunE: func(cmd *cobra.Command, args []string) error {
			sessions, err := annotate.ListSessions()
			if err != nil {
				return err
			}

			type sessionInfo struct {
				SessionID   string `json:"session"`
				Status      string `json:"status"`
				MediaType   string `json:"media_type"`
				Source      string `json:"source"`
				Port        int    `json:"port"`
				PollCommand string `json:"poll_command"`
				StopCommand string `json:"stop_command"`
			}

			items := make([]sessionInfo, 0, len(sessions))
			for _, s := range sessions {
				items = append(items, sessionInfo{
					SessionID:   s.SessionID,
					Status:      s.Status,
					MediaType:   s.MediaType,
					Source:      s.Source(),
					Port:        s.Port,
					PollCommand: fmt.Sprintf("anycap annotate poll --session %s", s.SessionID),
					StopCommand: fmt.Sprintf("anycap annotate stop --session %s", s.SessionID),
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

func newAnnotateServeCmd() *cobra.Command {
	var sessionID string

	cmd := &cobra.Command{
		Use:    "_serve",
		Short:  "Run annotation server (internal use)",
		Hidden: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			ctx, cancel := signal.NotifyContext(cmd.Context(), os.Interrupt)
			defer cancel()
			return annotate.RunServe(ctx, sessionID)
		},
	}

	cmd.Flags().StringVar(&sessionID, "session", "", "Session ID")
	_ = cmd.MarkFlagRequired("session")

	return cmd
}

// openBrowser attempts to open the URL in the default browser.
func openBrowser(url string) error {
	return auth.OpenBrowser(url)
}
