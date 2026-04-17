package im

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestFeishuResourceArtifactWriterWritesMarkdownAndManifest(t *testing.T) {
	root := t.TempDir()
	writer := NewFeishuResourceArtifactWriter(root, func() time.Time {
		return time.Date(2026, 4, 12, 12, 0, 0, 0, time.UTC)
	})

	result, err := writer.Write(FeishuResourceArtifact{
		Ref: FeishuResourceRef{
			URL:   "https://anycap.feishu.cn/docx/DOCXtoken123",
			Kind:  FeishuResourceKindDocx,
			Token: "DOCXtoken123",
		},
		Title:    "PRD",
		ReadMode: "full",
		Content:  "# PRD\n\n正文",
	})
	if err != nil {
		t.Fatalf("Write() error = %v", err)
	}
	if result.LocalPath == "" || !filepath.IsAbs(result.LocalPath) {
		t.Fatalf("expected absolute local path, got %+v", result)
	}
	content, err := os.ReadFile(result.LocalPath)
	if err != nil {
		t.Fatalf("read artifact: %v", err)
	}
	text := string(content)
	if !strings.Contains(text, `source_url: "https://anycap.feishu.cn/docx/DOCXtoken123"`) || !strings.Contains(text, "# PRD") {
		t.Fatalf("unexpected artifact content:\n%s", text)
	}
	if filepath.Base(result.LocalPath) != "docx_DOCXtoken123.md" {
		t.Fatalf("expected sanitized artifact filename, got %s", result.LocalPath)
	}

	manifest := readFeishuResourceManifest(t, root)
	if len(manifest.Resources) != 1 {
		t.Fatalf("expected one manifest item, got %+v", manifest)
	}
	item := manifest.Resources[0]
	if item.Kind != string(FeishuResourceKindDocx) || item.Token != "DOCXtoken123" || item.ErrorCode != "" {
		t.Fatalf("unexpected manifest item: %+v", item)
	}
}

func TestFeishuResourceArtifactWriterRecordsReadError(t *testing.T) {
	root := t.TempDir()
	writer := NewFeishuResourceArtifactWriter(root, func() time.Time {
		return time.Date(2026, 4, 12, 12, 0, 0, 0, time.UTC)
	})

	result, err := writer.Write(FeishuResourceArtifact{
		Ref: FeishuResourceRef{
			URL:   "https://anycap.feishu.cn/sheets/sht!bad/token",
			Kind:  FeishuResourceKindSheet,
			Token: "sht!bad/token",
		},
		ReadMode:  "preview",
		ErrorCode: "permission_denied",
		ErrorText: "no permission",
	})
	if err != nil {
		t.Fatalf("Write() error = %v", err)
	}
	if !strings.Contains(filepath.Base(result.LocalPath), "sheet_sht_bad_token.md") {
		t.Fatalf("expected unsafe token to be sanitized, got %s", result.LocalPath)
	}

	content, err := os.ReadFile(result.LocalPath)
	if err != nil {
		t.Fatalf("read artifact: %v", err)
	}
	if !strings.Contains(string(content), `error_code: "permission_denied"`) || !strings.Contains(string(content), "no permission") {
		t.Fatalf("expected error to be written, got:\n%s", string(content))
	}

	manifest := readFeishuResourceManifest(t, root)
	if len(manifest.Resources) != 1 || manifest.Resources[0].ErrorCode != "permission_denied" {
		t.Fatalf("expected manifest error, got %+v", manifest)
	}
}

func readFeishuResourceManifest(t *testing.T, root string) feishuResourceManifest {
	t.Helper()
	data, err := os.ReadFile(filepath.Join(root, "resources", "manifest.json"))
	if err != nil {
		t.Fatalf("read manifest: %v", err)
	}
	var manifest feishuResourceManifest
	if err := json.Unmarshal(data, &manifest); err != nil {
		t.Fatalf("unmarshal manifest: %v", err)
	}
	return manifest
}
