package infra

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"gitlab.knoffice.tech/engineering/anycap/internal/cli/httpclient"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/output"
	"gitlab.knoffice.tech/engineering/anycap/internal/cli/projectconfig"
	"gitlab.knoffice.tech/engineering/anycap/pkg/api"
)

type successEnvelope struct {
	Status string          `json:"status"`
	Data   json.RawMessage `json:"data"`
	Error  *struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

type driveNodeSummary struct {
	ID       string  `json:"id"`
	ParentID *string `json:"parent_id,omitempty"`
	Kind     string  `json:"kind"`
	Name     string  `json:"name"`
	Size     *int64  `json:"size,omitempty"`
}

type pageSiteSummary struct {
	ID               string  `json:"id"`
	Name             string  `json:"name"`
	PageName         string  `json:"page_name"`
	PageURL          string  `json:"page_url"`
	CurrentVersionID *string `json:"current_version_id,omitempty"`
}

type pageVersionSummary struct {
	ID        string `json:"id"`
	VersionNo int64  `json:"version_no"`
	Status    string `json:"status"`
}

func decodeSuccessData[T any](resp *httpclient.Response) (T, error) {
	var zero T
	if resp == nil {
		return zero, fmt.Errorf("empty response")
	}

	var envelope successEnvelope
	if err := json.Unmarshal(resp.Body, &envelope); err != nil {
		return zero, err
	}
	if strings.EqualFold(envelope.Status, "error") && envelope.Error != nil {
		return zero, fmt.Errorf("%s", strings.TrimSpace(envelope.Error.Message))
	}
	if len(envelope.Data) == 0 {
		return zero, fmt.Errorf("missing data in server response")
	}

	var data T
	if err := json.Unmarshal(envelope.Data, &data); err != nil {
		return zero, err
	}
	return data, nil
}

func writeFlatSuccess(w io.Writer, requestID string, payload map[string]any) error {
	if requestID != "" {
		payload["request_id"] = requestID
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return output.WriteJSON(w, body)
}

func parsePositiveInt64(value string, fieldName string) (int64, error) {
	parsed, err := strconv.ParseInt(strings.TrimSpace(value), 10, 64)
	if err != nil || parsed <= 0 {
		return 0, fmt.Errorf("%s must be a positive integer", fieldName)
	}
	return parsed, nil
}

func parseResourceID(value string, fieldName string) (string, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return "", fmt.Errorf("%s is required", fieldName)
	}
	return trimmed, nil
}

func parseExpiryToSeconds(value string) (int64, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return 0, fmt.Errorf("expires must not be empty")
	}

	if strings.HasSuffix(trimmed, "d") {
		days, err := strconv.ParseInt(strings.TrimSuffix(trimmed, "d"), 10, 64)
		if err != nil || days <= 0 {
			return 0, fmt.Errorf("expires must be a positive duration (e.g. 7d, 24h)")
		}
		return days * 24 * 60 * 60, nil
	}

	dur, err := time.ParseDuration(trimmed)
	if err != nil || dur <= 0 {
		return 0, fmt.Errorf("expires must be a positive duration (e.g. 7d, 24h)")
	}
	return int64(dur.Seconds()), nil
}

func detectContentType(filePath string) (string, error) {
	ext := strings.ToLower(filepath.Ext(filePath))
	if byExt := mime.TypeByExtension(ext); byExt != "" {
		return strings.Split(byExt, ";")[0], nil
	}

	f, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer f.Close()

	buf := make([]byte, 512)
	n, err := f.Read(buf)
	if err != nil && err != io.EOF {
		return "", err
	}
	if n == 0 {
		return "application/octet-stream", nil
	}
	return http.DetectContentType(buf[:n]), nil
}

func uploadFileToPresignedURL(ctx context.Context, uploadURL string, filePath string, contentType string, contentLength int64) error {
	f, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("open file: %w", err)
	}
	defer f.Close()

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, uploadURL, f)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", contentType)
	req.ContentLength = contentLength

	client := &http.Client{
		CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
			return http.ErrUseLastResponse
		},
		Timeout: 5 * time.Minute,
	}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("upload failed with status %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	return nil
}

func normalizeAbsolutePath(rawPath string) (string, error) {
	trimmed := strings.TrimSpace(rawPath)
	if trimmed == "" {
		return "", fmt.Errorf("path must not be empty")
	}
	if !strings.HasPrefix(trimmed, "/") {
		return "", fmt.Errorf("path must be absolute and start with '/'")
	}
	cleaned := path.Clean(trimmed)
	if cleaned == "." {
		cleaned = "/"
	}
	return cleaned, nil
}

func resolveDrivePath(ctx context.Context, client *httpclient.Client, nodePath string) (*driveNodeSummary, error) {
	cleaned, err := normalizeAbsolutePath(nodePath)
	if err != nil {
		return nil, err
	}
	if cleaned == "/" {
		return nil, nil
	}

	resp, err := client.Get(ctx, api.DriveResolvePath(cleaned))
	if err != nil {
		var apiErr *httpclient.APIError
		if errors.As(err, &apiErr) && apiErr.StatusCode == http.StatusNotFound {
			return nil, nil
		}
		return nil, err
	}
	decoded, err := decodeSuccessData[driveNodeSummary](resp)
	if err != nil {
		return nil, err
	}
	return &decoded, nil
}

func resolveDriveFolderPath(ctx context.Context, client *httpclient.Client, folderPath string) (*string, error) {
	cleaned, err := normalizeAbsolutePath(folderPath)
	if err != nil {
		return nil, err
	}
	if cleaned == "/" {
		return nil, nil
	}

	node, err := resolveDrivePath(ctx, client, cleaned)
	if err != nil {
		return nil, err
	}
	if node == nil {
		return nil, fmt.Errorf("folder path not found: %s", cleaned)
	}
	if node.Kind != "folder" {
		return nil, fmt.Errorf("path exists and is not a folder: %s", cleaned)
	}
	id := node.ID
	return &id, nil
}

func ensureDriveFolderPath(ctx context.Context, client *httpclient.Client, folderPath string) (*string, error) {
	cleaned, err := normalizeAbsolutePath(folderPath)
	if err != nil {
		return nil, err
	}
	if cleaned == "/" {
		return nil, nil
	}

	existing, err := resolveDrivePath(ctx, client, cleaned)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		if existing.Kind != "folder" {
			return nil, fmt.Errorf("path exists and is not a folder: %s", cleaned)
		}
		id := existing.ID
		return &id, nil
	}

	parentPath := path.Dir(cleaned)
	if parentPath == "." {
		parentPath = "/"
	}
	parentID, err := ensureDriveFolderPath(ctx, client, parentPath)
	if err != nil {
		return nil, err
	}

	resp, err := client.PostJSON(ctx, api.DriveFoldersPath, map[string]any{
		"parent_id": parentID,
		"name":      path.Base(cleaned),
	})
	if err != nil {
		return nil, err
	}
	created, err := decodeSuccessData[driveNodeSummary](resp)
	if err != nil {
		return nil, err
	}
	id := created.ID
	return &id, nil
}

func resolveDriveNodePath(ctx context.Context, client *httpclient.Client, nodePath string) (string, error) {
	cleaned, err := normalizeAbsolutePath(nodePath)
	if err != nil {
		return "", err
	}
	if cleaned == "/" {
		return "", fmt.Errorf("node path '/' is not a valid node target")
	}

	node, err := resolveDrivePath(ctx, client, cleaned)
	if err != nil {
		return "", err
	}
	if node == nil {
		return "", fmt.Errorf("node path not found: %s", cleaned)
	}
	return node.ID, nil
}

func resolveDriveNodeID(client *httpclient.Client, ctx context.Context, args []string, srcPath string) (string, error) {
	if len(args) > 0 && strings.TrimSpace(srcPath) != "" {
		return "", fmt.Errorf("node-id argument and --src-path cannot be used together")
	}
	if len(args) > 0 {
		return parseResourceID(args[0], "node-id")
	}
	if strings.TrimSpace(srcPath) == "" {
		return "", fmt.Errorf("node-id argument or --src-path is required")
	}
	return resolveDriveNodePath(ctx, client, srcPath)
}

type driveUploadResult struct {
	FileID string
	Name   string
	Size   int64
}

func uploadLocalFileToDrive(ctx context.Context, client *httpclient.Client, filePath string, parentID *string) (*driveUploadResult, error) {
	stat, err := os.Stat(filePath)
	if err != nil {
		return nil, err
	}
	if stat.IsDir() {
		return nil, fmt.Errorf("upload expects a file, got directory: %s", filePath)
	}

	contentType, err := detectContentType(filePath)
	if err != nil {
		return nil, err
	}

	presignResp, err := client.PostJSON(ctx, api.DriveFilesPresign, map[string]any{
		"parent_id":      parentID,
		"name":           filepath.Base(filePath),
		"content_type":   contentType,
		"content_length": stat.Size(),
	})
	if err != nil {
		return nil, err
	}

	presignData, err := decodeSuccessData[struct {
		UploadSessionID string `json:"upload_session_id"`
		FileID          string `json:"file_id"`
		UploadURL       string `json:"upload_url"`
	}](presignResp)
	if err != nil {
		return nil, err
	}

	if err := uploadFileToPresignedURL(ctx, presignData.UploadURL, filePath, contentType, stat.Size()); err != nil {
		return nil, err
	}

	completeResp, err := client.PostJSON(ctx, api.DriveFilesComplete, map[string]any{
		"upload_session_id": presignData.UploadSessionID,
		"file_id":           presignData.FileID,
	})
	if err != nil {
		return nil, err
	}

	completeData, err := decodeSuccessData[struct {
		ID   string `json:"id"`
		Name string `json:"name"`
		Size *int64 `json:"size,omitempty"`
	}](completeResp)
	if err != nil {
		return nil, err
	}

	size := stat.Size()
	if completeData.Size != nil {
		size = *completeData.Size
	}
	return &driveUploadResult{
		FileID: completeData.ID,
		Name:   completeData.Name,
		Size:   size,
	}, nil
}

func listPageSites(ctx context.Context, client *httpclient.Client) ([]pageSiteSummary, error) {
	resp, err := client.Get(ctx, api.PagesPath)
	if err != nil {
		return nil, err
	}
	data, err := decodeSuccessData[struct {
		Items []pageSiteSummary `json:"items"`
	}](resp)
	if err != nil {
		return nil, err
	}
	return data.Items, nil
}

func listPageSitesByName(ctx context.Context, client *httpclient.Client, name string) ([]pageSiteSummary, error) {
	resp, err := client.Get(ctx, api.PagesPath+"?name="+url.QueryEscape(name)+"&limit=1")
	if err != nil {
		return nil, err
	}
	data, err := decodeSuccessData[struct {
		Items []pageSiteSummary `json:"items"`
	}](resp)
	if err != nil {
		return nil, err
	}
	return data.Items, nil
}

func listPageVersions(ctx context.Context, client *httpclient.Client, pageID string) ([]pageVersionSummary, error) {
	resp, err := client.Get(ctx, api.PageVersionsPath(pageID))
	if err != nil {
		return nil, err
	}
	data, err := decodeSuccessData[struct {
		Items []pageVersionSummary `json:"items"`
	}](resp)
	if err != nil {
		return nil, err
	}
	return data.Items, nil
}

func getPageVersionByNumber(ctx context.Context, client *httpclient.Client, pageID string, versionNo int64) (pageVersionSummary, error) {
	resp, err := client.Get(ctx, api.PageVersionByNumberPath(pageID, int(versionNo)))
	if err != nil {
		return pageVersionSummary{}, err
	}
	return decodeSuccessData[pageVersionSummary](resp)
}

func pickPageVersionIDByNumber(versions []pageVersionSummary, versionNo int64) (string, error) {
	for _, item := range versions {
		if item.VersionNo == versionNo {
			return item.ID, nil
		}
	}
	return "", fmt.Errorf("version %d not found", versionNo)
}

func pickLatestVerifiedVersionID(versions []pageVersionSummary) (string, error) {
	var (
		found bool
		best  pageVersionSummary
	)
	for _, item := range versions {
		if item.Status != "verified" {
			continue
		}
		if !found || item.VersionNo > best.VersionNo {
			best = item
			found = true
		}
	}
	if !found {
		return "", fmt.Errorf("no verified version available, run deploy/finalize first")
	}
	return best.ID, nil
}

// resolvePageSiteID resolves a page site ID from command arguments, flags, and project config.
// Priority: positional arg > --site > --target > [page] default from config.
func resolvePageSiteID(args []string, siteFlag, targetFlag string, cfg *projectconfig.Config) (string, error) {
	if len(args) > 0 && strings.TrimSpace(args[0]) != "" {
		return parseResourceID(args[0], "page-id")
	}
	if siteFlag != "" {
		return siteFlag, nil
	}
	if targetFlag != "" {
		siteID, _, err := projectconfig.ResolvePageTarget(cfg, targetFlag)
		if err != nil {
			return "", err
		}
		return siteID, nil
	}
	if cfg.Page != nil && cfg.Page.SiteID != "" {
		return cfg.Page.SiteID, nil
	}
	return "", fmt.Errorf("page site not specified: provide <page-id>, --page-id, --target, or configure [page] in anycap.toml")
}

func randomSiteName() (string, error) {
	buf := make([]byte, 3)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}
