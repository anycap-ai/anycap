package im

import (
	"encoding/json"
	"fmt"
	"html"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

type FeishuResourceArtifact struct {
	Ref       FeishuResourceRef
	Title     string
	ReadMode  string
	Content   string
	ErrorCode string
	ErrorText string
	FetchedAt time.Time
}

type FeishuResourceArtifactResult struct {
	LocalPath string
}

type FeishuResourceArtifactWriter struct {
	root string
	now  func() time.Time
}

type feishuResourceManifest struct {
	Resources []feishuResourceManifestItem `json:"resources"`
}

type feishuResourceManifestItem struct {
	URL       string `json:"url"`
	Kind      string `json:"kind"`
	Token     string `json:"token"`
	Title     string `json:"title,omitempty"`
	ReadMode  string `json:"read_mode,omitempty"`
	LocalPath string `json:"local_path"`
	ErrorCode string `json:"error_code,omitempty"`
	ErrorText string `json:"error_text,omitempty"`
	FetchedAt string `json:"fetched_at"`
}

var unsafeFeishuResourceArtifactNameRe = regexp.MustCompile(`[^A-Za-z0-9._-]+`)

func NewFeishuResourceArtifactWriter(root string, now func() time.Time) *FeishuResourceArtifactWriter {
	if now == nil {
		now = func() time.Time { return time.Now().UTC() }
	}
	return &FeishuResourceArtifactWriter{root: strings.TrimSpace(root), now: now}
}

func (w *FeishuResourceArtifactWriter) Write(artifact FeishuResourceArtifact) (*FeishuResourceArtifactResult, error) {
	if w == nil {
		return nil, fmt.Errorf("feishu resource artifact writer is not configured")
	}
	root := strings.TrimSpace(w.root)
	if root == "" {
		return nil, fmt.Errorf("feishu resource artifact root is required")
	}
	if artifact.Ref.Kind == "" || strings.TrimSpace(artifact.Ref.Token) == "" {
		return nil, fmt.Errorf("feishu resource kind and token are required")
	}
	fetchedAt := artifact.FetchedAt.UTC()
	if fetchedAt.IsZero() {
		fetchedAt = w.now().UTC()
	}
	resourceDir := filepath.Join(root, "resources")
	if err := os.MkdirAll(resourceDir, 0o755); err != nil {
		return nil, fmt.Errorf("create feishu resource dir: %w", err)
	}
	localPath, err := filepath.Abs(filepath.Join(resourceDir, feishuResourceArtifactFileName(artifact.Ref)))
	if err != nil {
		return nil, fmt.Errorf("resolve feishu resource path: %w", err)
	}
	if err := os.WriteFile(localPath, []byte(renderFeishuResourceArtifactMarkdown(artifact, fetchedAt)), 0o644); err != nil {
		return nil, fmt.Errorf("write feishu resource artifact: %w", err)
	}
	if err := w.upsertManifestItem(resourceDir, artifact, localPath, fetchedAt); err != nil {
		return nil, err
	}
	return &FeishuResourceArtifactResult{LocalPath: localPath}, nil
}

func (w *FeishuResourceArtifactWriter) upsertManifestItem(resourceDir string, artifact FeishuResourceArtifact, localPath string, fetchedAt time.Time) error {
	manifestPath := filepath.Join(resourceDir, "manifest.json")
	var manifest feishuResourceManifest
	if data, err := os.ReadFile(manifestPath); err == nil && len(data) > 0 {
		if err := json.Unmarshal(data, &manifest); err != nil {
			return fmt.Errorf("read feishu resource manifest: %w", err)
		}
	} else if err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("read feishu resource manifest: %w", err)
	}

	item := feishuResourceManifestItem{
		URL:       strings.TrimSpace(artifact.Ref.URL),
		Kind:      string(artifact.Ref.Kind),
		Token:     strings.TrimSpace(artifact.Ref.Token),
		Title:     strings.TrimSpace(artifact.Title),
		ReadMode:  strings.TrimSpace(artifact.ReadMode),
		LocalPath: localPath,
		ErrorCode: strings.TrimSpace(artifact.ErrorCode),
		ErrorText: strings.TrimSpace(artifact.ErrorText),
		FetchedAt: fetchedAt.Format(time.RFC3339),
	}
	replaced := false
	for idx := range manifest.Resources {
		if manifest.Resources[idx].Kind == item.Kind && manifest.Resources[idx].Token == item.Token {
			manifest.Resources[idx] = item
			replaced = true
			break
		}
	}
	if !replaced {
		manifest.Resources = append(manifest.Resources, item)
	}
	data, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal feishu resource manifest: %w", err)
	}
	data = append(data, '\n')
	if err := os.WriteFile(manifestPath, data, 0o644); err != nil {
		return fmt.Errorf("write feishu resource manifest: %w", err)
	}
	return nil
}

func feishuResourceArtifactFileName(ref FeishuResourceRef) string {
	kind := sanitizeFeishuResourceArtifactName(string(ref.Kind))
	token := sanitizeFeishuResourceArtifactName(ref.Token)
	return kind + "_" + token + ".md"
}

func sanitizeFeishuResourceArtifactName(value string) string {
	value = strings.TrimSpace(value)
	value = unsafeFeishuResourceArtifactNameRe.ReplaceAllString(value, "_")
	value = strings.Trim(value, "._-")
	if value == "" {
		return "unknown"
	}
	return value
}

func renderFeishuResourceArtifactMarkdown(artifact FeishuResourceArtifact, fetchedAt time.Time) string {
	readMode := strings.TrimSpace(artifact.ReadMode)
	if readMode == "" {
		readMode = "unknown"
	}
	lines := []string{
		"---",
		fmt.Sprintf(`source_url: "%s"`, escapeFeishuResourceYAMLString(artifact.Ref.URL)),
		fmt.Sprintf(`kind: "%s"`, escapeFeishuResourceYAMLString(string(artifact.Ref.Kind))),
		fmt.Sprintf(`token: "%s"`, escapeFeishuResourceYAMLString(artifact.Ref.Token)),
		fmt.Sprintf(`fetched_at: "%s"`, fetchedAt.Format(time.RFC3339)),
		fmt.Sprintf(`read_mode: "%s"`, escapeFeishuResourceYAMLString(readMode)),
	}
	if title := strings.TrimSpace(artifact.Title); title != "" {
		lines = append(lines, fmt.Sprintf(`title: "%s"`, escapeFeishuResourceYAMLString(title)))
	}
	if code := strings.TrimSpace(artifact.ErrorCode); code != "" {
		lines = append(lines, fmt.Sprintf(`error_code: "%s"`, escapeFeishuResourceYAMLString(code)))
	}
	if text := strings.TrimSpace(artifact.ErrorText); text != "" {
		lines = append(lines, fmt.Sprintf(`error_text: "%s"`, escapeFeishuResourceYAMLString(text)))
	}
	lines = append(lines, "---", "")
	if title := strings.TrimSpace(artifact.Title); title != "" {
		lines = append(lines, "# "+title, "")
	}
	if artifact.ErrorCode != "" || artifact.ErrorText != "" {
		lines = append(lines, "## Read Error", "")
		if code := strings.TrimSpace(artifact.ErrorCode); code != "" {
			lines = append(lines, "- Code: `"+code+"`")
		}
		if text := strings.TrimSpace(artifact.ErrorText); text != "" {
			lines = append(lines, "- Message: "+html.EscapeString(text))
		}
		lines = append(lines, "")
	}
	if content := strings.TrimSpace(artifact.Content); content != "" {
		lines = append(lines, content, "")
	}
	return strings.Join(lines, "\n")
}

func escapeFeishuResourceYAMLString(value string) string {
	value = strings.TrimSpace(value)
	value = strings.ReplaceAll(value, `\`, `\\`)
	value = strings.ReplaceAll(value, `"`, `\"`)
	return value
}
