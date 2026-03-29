package infra

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"

	"github.com/spf13/cobra"
)

type pageDeployFile struct {
	AbsolutePath string
	AssetPath    string
	Size         int64
	ContentType  string
}

func newPageDeployCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		siteName     string
		publishAfter bool
	)

	cmd := &cobra.Command{
		Use:   "deploy <dir>",
		Short: "Deploy a local directory as a page version",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			rootDir := args[0]
			files, err := collectPageDeployFiles(rootDir)
			if err != nil {
				return err
			}
			if len(files) == 0 {
				return fmt.Errorf("deploy directory has no files: %s", rootDir)
			}

			client := clientFactory()
			site, err := ensureDeploySite(cmd.Context(), client, siteName)
			if err != nil {
				return err
			}

			createVersionResp, err := client.PostJSON(cmd.Context(), "/v1/pages/"+strconv.FormatInt(site.ID, 10)+"/versions", map[string]any{})
			if err != nil {
				return err
			}
			version, err := decodeSuccessData[pageVersionSummary](createVersionResp)
			if err != nil {
				return err
			}

			requestID := createVersionResp.RequestID
			for _, item := range files {
				presignResp, err := client.PostJSON(cmd.Context(), "/v1/pages/"+strconv.FormatInt(site.ID, 10)+"/versions/"+strconv.FormatInt(version.ID, 10)+"/files/presign", map[string]any{
					"asset_path":     item.AssetPath,
					"content_type":   item.ContentType,
					"content_length": item.Size,
				})
				if err != nil {
					return err
				}
				presignData, err := decodeSuccessData[struct {
					UploadSessionID int64  `json:"upload_session_id"`
					UploadURL       string `json:"upload_url"`
				}](presignResp)
				if err != nil {
					return err
				}

				if err := uploadFileToPresignedURL(cmd.Context(), presignData.UploadURL, item.AbsolutePath, item.ContentType, item.Size); err != nil {
					return err
				}

				completeResp, err := client.PostJSON(cmd.Context(), "/v1/pages/"+strconv.FormatInt(site.ID, 10)+"/versions/"+strconv.FormatInt(version.ID, 10)+"/files/complete", map[string]any{
					"upload_session_id": presignData.UploadSessionID,
				})
				if err != nil {
					return err
				}
				requestID = completeResp.RequestID
			}

			finalizeResp, err := client.PostJSON(cmd.Context(), "/v1/pages/"+strconv.FormatInt(site.ID, 10)+"/versions/"+strconv.FormatInt(version.ID, 10)+"/finalize", map[string]any{})
			if err != nil {
				return err
			}
			finalVersion, err := decodeSuccessData[pageVersionSummary](finalizeResp)
			if err != nil {
				return err
			}
			requestID = finalizeResp.RequestID

			published := false
			if publishAfter {
				publishResp, err := client.PostJSON(cmd.Context(), "/v1/pages/"+strconv.FormatInt(site.ID, 10)+"/versions/"+strconv.FormatInt(finalVersion.ID, 10)+"/publish", map[string]any{})
				if err != nil {
					return err
				}
				published = true
				requestID = publishResp.RequestID
			}

			return writeFlatSuccess(stdout, requestID, map[string]any{
				"status":    "success",
				"page_id":   site.ID,
				"page_name": site.PageName,
				"page_url":  pageURLFromPageName(site.PageName),
				"version":   finalVersion.VersionNo,
				"published": published,
			})
		},
	}

	cmd.Flags().StringVar(&siteName, "name", "", "Site display name (if omitted, CLI generates a random name)")
	cmd.Flags().BoolVar(&publishAfter, "publish", false, "Publish after deploy finalize")

	return cmd
}

func collectPageDeployFiles(rootDir string) ([]pageDeployFile, error) {
	info, err := os.Stat(rootDir)
	if err != nil {
		return nil, err
	}
	if !info.IsDir() {
		return nil, fmt.Errorf("deploy target must be a directory: %s", rootDir)
	}

	files := make([]pageDeployFile, 0, 32)
	err = filepath.WalkDir(rootDir, func(p string, d fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if d.IsDir() {
			return nil
		}

		stat, err := d.Info()
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(rootDir, p)
		if err != nil {
			return err
		}
		assetPath := filepath.ToSlash(rel)
		assetPath = strings.TrimPrefix(assetPath, "/")
		if assetPath == "" {
			return fmt.Errorf("invalid asset path for %s", p)
		}

		contentType, err := detectContentType(p)
		if err != nil {
			return err
		}
		files = append(files, pageDeployFile{
			AbsolutePath: p,
			AssetPath:    assetPath,
			Size:         stat.Size(),
			ContentType:  contentType,
		})
		return nil
	})
	if err != nil {
		return nil, err
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].AssetPath < files[j].AssetPath
	})
	return files, nil
}

func ensureDeploySite(ctx context.Context, client *httpclient.Client, preferredName string) (pageSiteSummary, error) {
	trimmed := strings.TrimSpace(preferredName)
	if trimmed == "" {
		randomName, err := randomSiteName()
		if err != nil {
			return pageSiteSummary{}, err
		}
		return createDeploySite(ctx, client, randomName)
	}

	sites, err := listPageSites(ctx, client)
	if err != nil {
		return pageSiteSummary{}, err
	}
	for _, item := range sites {
		if strings.TrimSpace(item.Name) == trimmed {
			return item, nil
		}
	}
	return createDeploySite(ctx, client, trimmed)
}

func createDeploySite(ctx context.Context, client *httpclient.Client, name string) (pageSiteSummary, error) {
	resp, err := client.PostJSON(ctx, "/v1/pages", map[string]any{"name": name})
	if err != nil {
		return pageSiteSummary{}, err
	}
	return decodeSuccessData[pageSiteSummary](resp)
}
