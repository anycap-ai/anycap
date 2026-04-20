package infra

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"
	"gitlab.knoffice.tech/engineering/anycap/pkg/buildinfo"

	"github.com/spf13/cobra"
)

const snapshotSharePasswordHeader = "X-Anycap-Share-Password"

func NewSnapshotCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "snapshot",
		Short: "Create and restore portable project snapshots",
		RunE:  requireSubcommand,
	}

	cmd.AddCommand(
		newSnapshotCreateCmd(clientFactory, stdout),
		newSnapshotRestoreCmd(stdout),
	)
	return cmd
}

func newSnapshotCreateCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		targets     []string
		expires     string
		name        string
		handoffFile string
		force       bool
		overwrite   bool
	)

	cmd := &cobra.Command{
		Use:   "create",
		Short: "Create a portable snapshot archive and share URL",
		RunE: func(cmd *cobra.Command, _ []string) error {
			cwd, err := os.Getwd()
			if err != nil {
				return err
			}

			prepared, err := prepareSnapshotTargets(cwd, targets)
			if err != nil {
				return err
			}
			collected, err := collectSnapshotItems(prepared.Targets)
			if err != nil {
				return err
			}

			warnings := append([]string{}, prepared.Warnings...)
			warnings = append(warnings, collected.Warnings...)
			if len(collected.SensitiveMatches) > 0 && !force {
				return writeFlatSuccess(stdout, "", map[string]any{
					"status":          "blocked",
					"warnings":        warnings,
					"sensitive_files": collected.SensitiveMatches,
				})
			}

			expiresInSeconds, err := parseExpiryToSeconds(expires)
			if err != nil {
				return err
			}
			expiresAt := time.Now().UTC().Add(time.Duration(expiresInSeconds) * time.Second)

			snapshotName := snapshotLogicalName(name, cwd, prepared.Targets)
			archiveName := snapshotArchiveFilename(snapshotName)
			uploadName := archiveName
			tempUploadName := ""

			client := clientFactory()
			parentID, err := ensureDriveFolderPath(cmd.Context(), client, "/_snapshots")
			if err != nil {
				return err
			}
			existingNode, err := resolveDrivePath(cmd.Context(), client, path.Join("/_snapshots", archiveName))
			if err != nil {
				return err
			}
			if existingNode != nil && !overwrite {
				return fmt.Errorf("snapshot %q already exists; use --overwrite to replace it", snapshotName)
			}
			if existingNode != nil && overwrite {
				tempUploadName = snapshotTemporaryUploadName(snapshotName)
				uploadName = tempUploadName
			}

			tempDir, err := os.MkdirTemp("", "anycap-snapshot-*")
			if err != nil {
				return err
			}
			defer os.RemoveAll(tempDir)

			archivePath := filepath.Join(tempDir, uploadName)
			manifest, err := writeSnapshotArchive(
				archivePath,
				prepared.Targets,
				collected,
				handoffFile,
				expiresAt,
				prepared.Warnings,
				defaultSnapshotArchiveRootName(cwd, prepared.Targets),
			)
			if err != nil {
				return err
			}

			uploadResult, err := uploadLocalFileToDrive(cmd.Context(), client, archivePath, parentID)
			if err != nil {
				return err
			}
			if existingNode != nil && overwrite {
				if _, err := client.Delete(cmd.Context(), api.DriveNodePath(existingNode.ID)); err != nil {
					_, _ = client.Delete(cmd.Context(), api.DriveNodePath(uploadResult.FileID))
					return err
				}
				if _, err := client.PatchJSON(cmd.Context(), api.DriveNodePath(uploadResult.FileID), map[string]any{
					"name": archiveName,
				}); err != nil {
					_, _ = client.Delete(cmd.Context(), api.DriveNodePath(uploadResult.FileID))
					return err
				}
			}

			password, err := generateSnapshotPassword()
			if err != nil {
				return err
			}
			shareResp, err := client.PutJSON(cmd.Context(), api.DriveNodeSharePath(uploadResult.FileID), map[string]any{
				"expires_in_seconds": expiresInSeconds,
				"password":           password,
			})
			if err != nil {
				return err
			}
			shareData, err := decodeSuccessData[struct {
				URL       string  `json:"url"`
				ExpiresAt *string `json:"expires_at,omitempty"`
			}](shareResp)
			if err != nil {
				return err
			}

			snapshotURL := shareData.URL + "#password=" + url.QueryEscape(password)
			return writeFlatSuccess(stdout, shareResp.RequestID, map[string]any{
				"status":          "success",
				"snapshot_name":   snapshotName,
				"snapshot_url":    snapshotURL,
				"expires_at":      shareData.ExpiresAt,
				"file_id":         uploadResult.FileID,
				"archive_name":    archiveName,
				"target_count":    manifest.TargetCount,
				"entry_count":     len(manifest.Entries),
				"handoff_present": manifest.HandoffPresent,
				"warnings":        append([]string{}, manifest.Warnings...),
				"restore_command": "anycap snapshot restore '" + snapshotURL + "' --target ./restored",
			})
		},
	}

	cmd.Flags().StringSliceVar(&targets, "target", nil, "Local file or directory target (repeatable)")
	cmd.Flags().StringVar(&expires, "expires", "12h", "Snapshot expiration duration (default: 12h; keep it short unless explicitly requested)")
	cmd.Flags().StringVar(&name, "name", "", "Snapshot name")
	cmd.Flags().StringVar(&handoffFile, "handoff-file", "", "Optional handoff markdown or JSON file")
	cmd.Flags().BoolVar(&force, "force", false, "Ignore sensitive-file warnings and continue")
	cmd.Flags().BoolVar(&overwrite, "overwrite", false, "Replace an existing snapshot with the same name")
	_ = cmd.MarkFlagRequired("target")
	return cmd
}

func newSnapshotRestoreCmd(stdout io.Writer) *cobra.Command {
	var (
		urlFlag   string
		targetDir string
	)

	cmd := &cobra.Command{
		Use:   "restore [snapshot-url]",
		Short: "Restore a portable snapshot from a share URL",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			snapshotURL, err := resolveSnapshotURL(args, urlFlag)
			if err != nil {
				return err
			}
			targetDir = strings.TrimSpace(targetDir)
			if targetDir == "" {
				return fmt.Errorf("--target is required")
			}

			absTarget, err := filepath.Abs(targetDir)
			if err != nil {
				return err
			}
			if err := ensureSnapshotRestoreTarget(absTarget); err != nil {
				return err
			}

			tempDir, err := os.MkdirTemp("", "anycap-snapshot-restore-*")
			if err != nil {
				return err
			}
			defer os.RemoveAll(tempDir)

			archivePath := filepath.Join(tempDir, "snapshot.snapshot.tar")
			downloadURL, password, err := snapshotRawDownloadURL(snapshotURL)
			if err != nil {
				return err
			}
			if err := downloadSnapshotArchive(cmd.Context(), downloadURL, password, archivePath); err != nil {
				return err
			}

			manifest, err := extractSnapshotArchive(archivePath, absTarget)
			if err != nil {
				return err
			}
			return writeFlatSuccess(stdout, "", map[string]any{
				"status":          "success",
				"target_dir":      absTarget,
				"target_count":    manifest.TargetCount,
				"entry_count":     len(manifest.Entries),
				"handoff_present": manifest.HandoffPresent,
				"warnings":        append([]string{}, manifest.Warnings...),
			})
		},
	}

	cmd.Flags().StringVar(&urlFlag, "url", "", "Snapshot share URL")
	cmd.Flags().StringVar(&targetDir, "target", "", "Restore target directory")
	_ = cmd.MarkFlagRequired("target")
	return cmd
}

func resolveSnapshotURL(args []string, urlFlag string) (string, error) {
	flagValue := strings.TrimSpace(urlFlag)
	if len(args) > 0 && flagValue != "" {
		return "", fmt.Errorf("snapshot URL argument and --url cannot be used together")
	}
	if len(args) > 0 {
		return strings.TrimSpace(args[0]), nil
	}
	if flagValue == "" {
		return "", fmt.Errorf("snapshot URL is required")
	}
	return flagValue, nil
}

func snapshotLogicalName(rawName string, cwd string, targets []snapshotNormalizedTarget) string {
	base := strings.TrimSpace(rawName)
	if base == "" {
		base = defaultSnapshotArchiveRootName(cwd, targets)
	}
	if base == "" {
		base = "snapshot"
	}
	return sanitizeSnapshotName(base)
}

func snapshotArchiveFilename(snapshotName string) string {
	base := sanitizeSnapshotName(snapshotName)
	base = strings.TrimSuffix(base, ".snapshot.tar")
	base = strings.TrimSuffix(base, ".tar")
	return base + ".snapshot.tar"
}

func snapshotTemporaryUploadName(snapshotName string) string {
	return fmt.Sprintf("%s.uploading-%d.snapshot.tar", sanitizeSnapshotName(snapshotName), time.Now().UTC().UnixNano())
}

func sanitizeSnapshotName(raw string) string {
	var builder strings.Builder
	for _, r := range raw {
		switch {
		case r >= 'a' && r <= 'z':
			builder.WriteRune(r)
		case r >= 'A' && r <= 'Z':
			builder.WriteRune(r)
		case r >= '0' && r <= '9':
			builder.WriteRune(r)
		case r == '.', r == '-', r == '_':
			builder.WriteRune(r)
		default:
			builder.WriteByte('-')
		}
	}
	cleaned := strings.Trim(builder.String(), "-.")
	if cleaned == "" {
		return "snapshot"
	}
	return cleaned
}

func generateSnapshotPassword() (string, error) {
	buf := make([]byte, 24)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func snapshotRawDownloadURL(snapshotURL string) (string, string, error) {
	parsed, err := url.Parse(strings.TrimSpace(snapshotURL))
	if err != nil {
		return "", "", err
	}
	fragment, err := url.ParseQuery(parsed.Fragment)
	if err != nil {
		return "", "", err
	}
	password := strings.TrimSpace(fragment.Get("password"))
	if password == "" {
		return "", "", fmt.Errorf("snapshot URL must include #password=...")
	}
	parsed.Fragment = ""
	query := parsed.Query()
	query.Set("raw", "1")
	parsed.RawQuery = query.Encode()
	return parsed.String(), password, nil
}

func downloadSnapshotArchive(ctx context.Context, downloadURL string, password string, outputPath string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, downloadURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "anycap-cli/"+buildinfo.Version)
	req.Header.Set(snapshotSharePasswordHeader, password)

	client := &http.Client{
		CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
			return http.ErrUseLastResponse
		},
		Timeout: 10 * time.Minute,
	}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("snapshot download failed with status %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	out, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer out.Close()
	if _, err := io.Copy(out, resp.Body); err != nil {
		return err
	}
	return nil
}
