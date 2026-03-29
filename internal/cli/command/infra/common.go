package infra

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
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
)

const defaultPageHostSuffix = ".page.anycap.cloud"

type successEnvelope struct {
	Status string          `json:"status"`
	Data   json.RawMessage `json:"data"`
	Error  *struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

type driveNodeSummary struct {
	ID       int64  `json:"id"`
	ParentID *int64 `json:"parent_id,omitempty"`
	Kind     string `json:"kind"`
	Name     string `json:"name"`
}

type pageSiteSummary struct {
	ID               int64  `json:"id"`
	Name             string `json:"name"`
	PageName         string `json:"page_name"`
	CurrentVersionID *int64 `json:"current_version_id,omitempty"`
}

type pageVersionSummary struct {
	ID        int64  `json:"id"`
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

func listDriveNodes(ctx context.Context, client *httpclient.Client, parentID *int64) ([]driveNodeSummary, error) {
	endpoint := "/v1/drive/nodes"
	if parentID != nil {
		endpoint += "?parent_id=" + url.QueryEscape(strconv.FormatInt(*parentID, 10))
	}

	resp, err := client.Get(ctx, endpoint)
	if err != nil {
		return nil, err
	}

	var data struct {
		Items []driveNodeSummary `json:"items"`
	}
	decoded, err := decodeSuccessData[struct {
		Items []driveNodeSummary `json:"items"`
	}](resp)
	if err != nil {
		return nil, err
	}
	data = decoded
	return data.Items, nil
}

func resolveDriveFolderPath(ctx context.Context, client *httpclient.Client, folderPath string) (*int64, error) {
	cleaned, err := normalizeAbsolutePath(folderPath)
	if err != nil {
		return nil, err
	}
	if cleaned == "/" {
		return nil, nil
	}

	segments := strings.Split(strings.TrimPrefix(cleaned, "/"), "/")
	var currentParent *int64
	for _, segment := range segments {
		if segment == "" {
			continue
		}
		children, err := listDriveNodes(ctx, client, currentParent)
		if err != nil {
			return nil, err
		}

		found := false
		for _, child := range children {
			if child.Name == segment && child.Kind == "folder" {
				id := child.ID
				currentParent = &id
				found = true
				break
			}
		}
		if !found {
			return nil, fmt.Errorf("folder path not found: %s", cleaned)
		}
	}
	return currentParent, nil
}

func resolveDriveNodePath(ctx context.Context, client *httpclient.Client, nodePath string) (int64, error) {
	cleaned, err := normalizeAbsolutePath(nodePath)
	if err != nil {
		return 0, err
	}
	if cleaned == "/" {
		return 0, fmt.Errorf("node path '/' is not a valid node target")
	}

	segments := strings.Split(strings.TrimPrefix(cleaned, "/"), "/")
	var (
		currentParent *int64
		currentNode   *driveNodeSummary
	)
	for i, segment := range segments {
		if segment == "" {
			continue
		}
		children, err := listDriveNodes(ctx, client, currentParent)
		if err != nil {
			return 0, err
		}

		var matched *driveNodeSummary
		for _, child := range children {
			if child.Name == segment {
				candidate := child
				matched = &candidate
				break
			}
		}
		if matched == nil {
			return 0, fmt.Errorf("node path not found: %s", cleaned)
		}

		currentNode = matched
		if i < len(segments)-1 && matched.Kind != "folder" {
			return 0, fmt.Errorf("path segment is not a folder: %s", segment)
		}
		id := matched.ID
		currentParent = &id
	}
	if currentNode == nil {
		return 0, fmt.Errorf("node path not found: %s", cleaned)
	}
	return currentNode.ID, nil
}

func resolveDriveNodeID(client *httpclient.Client, ctx context.Context, args []string, srcPath string) (int64, error) {
	if len(args) > 0 && strings.TrimSpace(srcPath) != "" {
		return 0, fmt.Errorf("node-id argument and --src-path cannot be used together")
	}
	if len(args) > 0 {
		return parsePositiveInt64(args[0], "node-id")
	}
	if strings.TrimSpace(srcPath) == "" {
		return 0, fmt.Errorf("node-id argument or --src-path is required")
	}
	return resolveDriveNodePath(ctx, client, srcPath)
}

func listPageSites(ctx context.Context, client *httpclient.Client) ([]pageSiteSummary, error) {
	resp, err := client.Get(ctx, "/v1/pages")
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

func listPageVersions(ctx context.Context, client *httpclient.Client, pageID int64) ([]pageVersionSummary, error) {
	resp, err := client.Get(ctx, fmt.Sprintf("/v1/pages/%d/versions", pageID))
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

func pickPageVersionIDByNumber(versions []pageVersionSummary, versionNo int64) (int64, error) {
	for _, item := range versions {
		if item.VersionNo == versionNo {
			return item.ID, nil
		}
	}
	return 0, fmt.Errorf("version %d not found", versionNo)
}

func pickLatestVerifiedVersionID(versions []pageVersionSummary) (int64, error) {
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
		return 0, fmt.Errorf("no verified version available, run deploy/finalize first")
	}
	return best.ID, nil
}

func randomSiteName() (string, error) {
	buf := make([]byte, 4)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return "site-" + hex.EncodeToString(buf), nil
}

func pageURLFromPageName(pageName string) string {
	trimmed := strings.ToLower(strings.TrimSpace(pageName))
	return "https://" + trimmed + resolvePageHostSuffix()
}

func resolvePageHostSuffix() string {
	suffix := strings.ToLower(strings.TrimSpace(os.Getenv("ANYCAP_PAGE_HOST_SUFFIX")))
	if suffix == "" {
		suffix = defaultPageHostSuffix
	}
	if !strings.HasPrefix(suffix, ".") {
		suffix = "." + suffix
	}
	return suffix
}
