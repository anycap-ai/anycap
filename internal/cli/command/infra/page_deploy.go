package infra

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"sync/atomic"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/projectconfig"

	"github.com/spf13/cobra"
)

const defaultDeployConcurrency = 6

type pageDeployFile struct {
	AbsolutePath string
	AssetPath    string
	Size         int64
	ContentType  string
}

func newPageDeployCmd(clientFactory func() *httpclient.Client, stdout io.Writer) *cobra.Command {
	var (
		siteName     string
		siteID       string
		targetName   string
		newSite      bool
		publishAfter bool
		concurrency  int
	)

	cmd := &cobra.Command{
		Use:   "deploy <path>",
		Short: "Deploy a local HTML file or static site directory as a page version",
		Long: `Deploy a local HTML file or static site directory as a page version.

  anycap page deploy index.html                  Deploy a single HTML file
  anycap page deploy ./dist/                     Deploy a directory containing static assets
  anycap page deploy ./dist --page-id pg_x       Deploy to an existing site by ID
  anycap page deploy ./dist --name Docs          Deploy to a site by name (find or create)
  anycap page deploy ./dist --target preview     Deploy to a named target from anycap.toml
  anycap page deploy ./dist --new --publish      Create a new site and deploy + publish
  anycap page deploy ./dist --new --target beta  Create a new site saved as target "beta"`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			// Mutual exclusions
			if siteID != "" && siteName != "" {
				return fmt.Errorf("--site and --name cannot be used together")
			}
			if newSite && siteID != "" {
				return fmt.Errorf("--new and --site cannot be used together")
			}

			rootDir := args[0]
			files, singleFileSource, err := collectPageDeployFiles(rootDir)
			if err != nil {
				return err
			}
			if len(files) == 0 {
				return fmt.Errorf("deploy directory has no files: %s", rootDir)
			}

			client := clientFactory()

			// Load project config for site resolution fallback
			projCfg, _ := projectconfig.Load()

			var site pageSiteSummary
			// saveTarget is the target name to persist; empty means save to default [page].
			var saveTarget string

			if newSite {
				// --new: always create a new site
				displayName := siteName
				if displayName == "" {
					displayName, err = randomSiteName()
					if err != nil {
						return err
					}
				}
				site, err = createDeploySite(cmd.Context(), client, displayName)
				if err != nil {
					return err
				}
				// Determine target name for saving
				if targetName != "" {
					saveTarget = targetName
				} else {
					saveTarget = projectconfig.AutoTargetName()
				}
			} else {
				switch {
				case siteID != "":
					// --site flag: highest priority
					resp, err := client.Get(cmd.Context(), "/v1/pages/"+siteID)
					if err != nil {
						return err
					}
					site, err = decodeSuccessData[pageSiteSummary](resp)
					if err != nil {
						return err
					}
				case targetName != "":
					// --target flag: lookup from config
					resolvedID, _, err := projectconfig.ResolvePageTarget(projCfg, targetName)
					if err != nil {
						return err
					}
					resp, err := client.Get(cmd.Context(), "/v1/pages/"+resolvedID)
					if err != nil {
						return err
					}
					site, err = decodeSuccessData[pageSiteSummary](resp)
					if err != nil {
						return err
					}
				case siteName != "":
					// --name flag
					site, err = ensureDeploySiteByName(cmd.Context(), client, siteName)
					if err != nil {
						return err
					}
				case projCfg.Page != nil && projCfg.Page.SiteID != "":
					// anycap.toml [page].site_id
					resp, err := client.Get(cmd.Context(), "/v1/pages/"+projCfg.Page.SiteID)
					if err != nil {
						return err
					}
					site, err = decodeSuccessData[pageSiteSummary](resp)
					if err != nil {
						return err
					}
				case projCfg.Page != nil && projCfg.Page.Name != "":
					// anycap.toml [page].name
					site, err = ensureDeploySiteByName(cmd.Context(), client, projCfg.Page.Name)
					if err != nil {
						return err
					}
				default:
					randomName, err := randomSiteName()
					if err != nil {
						return err
					}
					site, err = createDeploySite(cmd.Context(), client, randomName)
					if err != nil {
						return err
					}
				}
			}

			createVersionResp, err := client.PostJSON(cmd.Context(), "/v1/pages/"+site.ID+"/versions", map[string]any{})
			if err != nil {
				return err
			}
			version, err := decodeSuccessData[pageVersionSummary](createVersionResp)
			if err != nil {
				return err
			}

			// Parallel upload with worker pool
			progress := newDeployProgress(len(files))
			var totalSizeBytes int64
			for _, f := range files {
				totalSizeBytes += f.Size
			}

			if err := parallelUploadFiles(cmd.Context(), client, site.ID, version.ID, files, concurrency, progress); err != nil {
				return err
			}

			requestID := createVersionResp.RequestID

			finalizeResp, err := client.PostJSON(cmd.Context(), "/v1/pages/"+site.ID+"/versions/"+version.ID+"/finalize", map[string]any{})
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
				publishResp, err := client.PostJSON(cmd.Context(), "/v1/pages/"+site.ID+"/versions/"+finalVersion.ID+"/publish", map[string]any{})
				if err != nil {
					return err
				}
				published = true
				requestID = publishResp.RequestID
			}

			payload := map[string]any{
				"status":           "success",
				"page_id":          site.ID,
				"page_name":        site.PageName,
				"page_url":         site.PageURL,
				"version":          finalVersion.VersionNo,
				"published":        published,
				"files_uploaded":   len(files),
				"total_size_bytes": totalSizeBytes,
			}
			if singleFileSource != "" {
				payload["source_file"] = singleFileSource
			}

			// Auto-write anycap.toml with resolved site binding.
			// Best-effort: deploy already succeeded, so a config write failure
			// should not make the command appear to fail.
			if saveTarget != "" {
				// Save as named target (--new creates this path)
				_ = projectconfig.SavePageTarget(saveTarget, projectconfig.PageTarget{
					SiteID: site.ID,
					Name:   site.Name,
				})
				payload["target"] = saveTarget
			} else if targetName == "" {
				// Save to default [page], preserving existing targets
				var existingTargets map[string]projectconfig.PageTarget
				if projCfg.Page != nil {
					existingTargets = projCfg.Page.Targets
				}
				_ = projectconfig.SavePage(projectconfig.PageConfig{
					SiteID:  site.ID,
					Name:    site.Name,
					Targets: existingTargets,
				})
			}
			// When --target is used without --new, the target already has the
			// correct site_id in config -- no save needed.

			return writeFlatSuccess(stdout, requestID, payload)
		},
	}

	cmd.Flags().StringVar(&siteName, "name", "", "Site display name (find or create)")
	cmd.Flags().StringVar(&siteID, "page-id", "", "Existing page site ID")
	cmd.Flags().StringVar(&targetName, "target", "", "Named target from anycap.toml")
	cmd.Flags().BoolVar(&newSite, "new", false, "Force create a new site")
	cmd.Flags().BoolVar(&publishAfter, "publish", false, "Publish after deploy finalize")
	cmd.Flags().IntVar(&concurrency, "concurrency", defaultDeployConcurrency, "Number of parallel upload workers (1-20)")

	return cmd
}

func parallelUploadFiles(ctx context.Context, client *httpclient.Client, siteID, versionID string, files []pageDeployFile, concurrency int, progress *deployProgress) error {
	if concurrency < 1 {
		concurrency = 1
	}
	if concurrency > 20 {
		concurrency = 20
	}

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	fileCh := make(chan pageDeployFile, len(files))
	for _, f := range files {
		fileCh <- f
	}
	close(fileCh)

	var (
		firstErr atomic.Value
		wg       sync.WaitGroup
	)

	for i := 0; i < concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for item := range fileCh {
				if ctx.Err() != nil {
					return
				}

				if err := uploadSingleFile(ctx, client, siteID, versionID, item); err != nil {
					firstErr.CompareAndSwap(nil, err)
					cancel()
					return
				}
				progress.complete(item.AssetPath, item.Size)
			}
		}()
	}

	wg.Wait()

	if stored := firstErr.Load(); stored != nil {
		return stored.(error)
	}
	return nil
}

func uploadSingleFile(ctx context.Context, client *httpclient.Client, siteID, versionID string, item pageDeployFile) error {
	presignResp, err := client.PostJSON(ctx, "/v1/pages/"+siteID+"/versions/"+versionID+"/files/presign", map[string]any{
		"asset_path":     item.AssetPath,
		"content_type":   item.ContentType,
		"content_length": item.Size,
	})
	if err != nil {
		return err
	}
	presignData, err := decodeSuccessData[struct {
		UploadSessionID string `json:"upload_session_id"`
		UploadURL       string `json:"upload_url"`
	}](presignResp)
	if err != nil {
		return err
	}

	if err := uploadFileToPresignedURL(ctx, presignData.UploadURL, item.AbsolutePath, item.ContentType, item.Size); err != nil {
		return err
	}

	_, err = client.PostJSON(ctx, "/v1/pages/"+siteID+"/versions/"+versionID+"/files/complete", map[string]any{
		"upload_session_id": presignData.UploadSessionID,
	})
	return err
}

// deployProgress provides TTY-aware upload progress on stderr.
type deployProgress struct {
	total     int
	completed atomic.Int64
	isTTY     bool
}

func newDeployProgress(total int) *deployProgress {
	return &deployProgress{
		total: total,
		isTTY: isStderrTTY(),
	}
}

func (p *deployProgress) complete(assetPath string, size int64) {
	n := p.completed.Add(1)
	if p.isTTY {
		fmt.Fprintf(os.Stderr, "Uploading [%d/%d] %s (%s)\n", n, p.total, assetPath, humanSize(size))
	}
}

func isStderrTTY() bool {
	fi, err := os.Stderr.Stat()
	if err != nil {
		return false
	}
	return fi.Mode()&os.ModeCharDevice != 0
}

func humanSize(bytes int64) string {
	const (
		kb = 1024
		mb = 1024 * kb
		gb = 1024 * mb
	)
	switch {
	case bytes >= gb:
		return fmt.Sprintf("%.1f GB", float64(bytes)/float64(gb))
	case bytes >= mb:
		return fmt.Sprintf("%.1f MB", float64(bytes)/float64(mb))
	case bytes >= kb:
		return fmt.Sprintf("%.1f KB", float64(bytes)/float64(kb))
	default:
		return fmt.Sprintf("%d B", bytes)
	}
}

// collectPageDeployFiles collects files for deploy. Returns (files, singleFileSource, error).
// singleFileSource is non-empty when a single HTML file was renamed to index.html.
func collectPageDeployFiles(rootDir string) ([]pageDeployFile, string, error) {
	info, err := os.Stat(rootDir)
	if err != nil {
		return nil, "", err
	}
	if !info.IsDir() {
		ext := strings.ToLower(filepath.Ext(rootDir))
		if ext != ".html" && ext != ".htm" {
			return nil, "", fmt.Errorf("single file deploy only supports HTML files, got: %s", rootDir)
		}
		sourceFile := ""
		baseName := filepath.Base(rootDir)
		if baseName != "index.html" {
			sourceFile = baseName
		}
		return []pageDeployFile{{
			AbsolutePath: rootDir,
			AssetPath:    "index.html",
			Size:         info.Size(),
			ContentType:  "text/html",
		}}, sourceFile, nil
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

		// Exclude project config from deploy uploads
		if assetPath == projectconfig.Filename {
			return nil
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
		return nil, "", err
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].AssetPath < files[j].AssetPath
	})

	hasIndex := false
	for _, f := range files {
		if f.AssetPath == "index.html" {
			hasIndex = true
			break
		}
	}
	if !hasIndex {
		return nil, "", fmt.Errorf("directory %s must contain an index.html at the root", rootDir)
	}

	return files, "", nil
}

func ensureDeploySiteByName(ctx context.Context, client *httpclient.Client, name string) (pageSiteSummary, error) {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" {
		randomName, err := randomSiteName()
		if err != nil {
			return pageSiteSummary{}, err
		}
		return createDeploySite(ctx, client, randomName)
	}

	// Use server-side name filter
	sites, err := listPageSitesByName(ctx, client, trimmed)
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
