package im

import (
	"context"
	"errors"
	"strings"
	"testing"
)

func TestFeishuAdapterReadDocxRawContentUsesInjectedReader(t *testing.T) {
	adapter := &FeishuAdapter{
		readDocxRawContent: func(_ context.Context, documentID string) (*FeishuDocxReadResult, error) {
			if documentID != "doc_token" {
				t.Fatalf("documentID = %q, want doc_token", documentID)
			}
			return &FeishuDocxReadResult{
				DocumentID: documentID,
				Title:      "Spec",
				Content:    "hello docx",
			}, nil
		},
	}

	got, err := adapter.ReadDocxRawContent(context.Background(), " doc_token ")
	if err != nil {
		t.Fatalf("ReadDocxRawContent returned error: %v", err)
	}
	if got == nil || got.Title != "Spec" || got.Content != "hello docx" {
		t.Fatalf("ReadDocxRawContent = %#v", got)
	}
}

func TestFeishuAdapterReadWikiDocxResourceDelegatesToDocxToken(t *testing.T) {
	var docxToken string
	adapter := &FeishuAdapter{
		readWikiNode: func(_ context.Context, nodeToken string) (*FeishuWikiNodeResult, error) {
			if nodeToken != "wiki_node" {
				t.Fatalf("nodeToken = %q, want wiki_node", nodeToken)
			}
			return &FeishuWikiNodeResult{
				NodeToken: nodeToken,
				ObjToken:  "docx_token",
				ObjType:   "docx",
				Title:     "Wiki Spec",
			}, nil
		},
		readDocxRawContent: func(_ context.Context, documentID string) (*FeishuDocxReadResult, error) {
			docxToken = documentID
			return &FeishuDocxReadResult{
				DocumentID: documentID,
				Title:      "Docx Title",
				Content:    "wiki docx content",
			}, nil
		},
	}

	got, err := adapter.ReadFeishuResource(context.Background(), FeishuResourceRef{
		URL:   "https://example.feishu.cn/wiki/wiki_node",
		Kind:  FeishuResourceKindWiki,
		Token: "wiki_node",
	}, FeishuResourceReadOptions{})
	if err != nil {
		t.Fatalf("ReadFeishuResource returned error: %v", err)
	}
	if docxToken != "docx_token" {
		t.Fatalf("delegated docx token = %q, want docx_token", docxToken)
	}
	if got == nil || got.Title != "Wiki Spec" || got.Content != "wiki docx content" || got.ReadMode != "wiki_docx_raw" {
		t.Fatalf("ReadFeishuResource = %#v", got)
	}
}

func TestFeishuAdapterReadSheetPreviewUsesInjectedReader(t *testing.T) {
	adapter := &FeishuAdapter{
		readSheetPreview: func(_ context.Context, spreadsheetToken string, options FeishuSheetReadOptions) (*FeishuSheetReadResult, error) {
			if spreadsheetToken != "sheet_token" {
				t.Fatalf("spreadsheetToken = %q, want sheet_token", spreadsheetToken)
			}
			if options.MaxRows != 8 || options.MaxColumns != 4 {
				t.Fatalf("options = %#v, want max rows 8 columns 4", options)
			}
			return &FeishuSheetReadResult{
				SpreadsheetToken: spreadsheetToken,
				Title:            "Budget",
				Sheets: []FeishuSheetPreview{{
					SheetID: "grid",
					Title:   "Q1",
					Range:   "grid!A1:D8",
					Values:  [][]any{{"item", "cost"}},
				}},
			}, nil
		},
	}

	got, err := adapter.ReadFeishuResource(context.Background(), FeishuResourceRef{
		URL:   "https://example.feishu.cn/sheets/sheet_token",
		Kind:  FeishuResourceKindSheet,
		Token: "sheet_token",
	}, FeishuResourceReadOptions{Sheet: FeishuSheetReadOptions{MaxRows: 8, MaxColumns: 4}})
	if err != nil {
		t.Fatalf("ReadFeishuResource returned error: %v", err)
	}
	if got == nil || got.Title != "Budget" || got.ReadMode != "sheet_preview" || !strings.Contains(got.Content, "Q1") {
		t.Fatalf("ReadFeishuResource = %#v", got)
	}
}

func TestFeishuAdapterReadBitablePreviewUsesInjectedReader(t *testing.T) {
	adapter := &FeishuAdapter{
		readBitablePreview: func(_ context.Context, appToken string, options FeishuBitableReadOptions) (*FeishuBitableReadResult, error) {
			if appToken != "base_token" {
				t.Fatalf("appToken = %q, want base_token", appToken)
			}
			if options.MaxRecordsPerTable != 3 {
				t.Fatalf("options = %#v, want max records 3", options)
			}
			return &FeishuBitableReadResult{
				AppToken: appToken,
				Name:     "CRM",
				Tables: []FeishuBitableTablePreview{{
					TableID: "tbl",
					Name:    "Leads",
					Fields:  []FeishuBitableFieldPreview{{FieldID: "fld", Name: "Company", UIType: "Text", Type: 1}},
					Records: []FeishuBitableRecordPreview{{
						RecordID: "rec",
						Fields:   map[string]any{"Company": "AnyCap"},
					}},
				}},
			}, nil
		},
	}

	got, err := adapter.ReadFeishuResource(context.Background(), FeishuResourceRef{
		URL:   "https://example.feishu.cn/base/base_token",
		Kind:  FeishuResourceKindBitable,
		Token: "base_token",
	}, FeishuResourceReadOptions{Bitable: FeishuBitableReadOptions{MaxRecordsPerTable: 3}})
	if err != nil {
		t.Fatalf("ReadFeishuResource returned error: %v", err)
	}
	if got == nil || got.Title != "CRM" || got.ReadMode != "bitable_preview" || !strings.Contains(got.Content, "Leads") {
		t.Fatalf("ReadFeishuResource = %#v", got)
	}
}

func TestFeishuResourceReaderClassifiesPermissionError(t *testing.T) {
	err := classifyFeishuResourceReadError("read feishu docx raw content", 99991663, "permission denied", nil)

	var readErr *FeishuResourceReadError
	if !errors.As(err, &readErr) {
		t.Fatalf("error type = %T, want *FeishuResourceReadError", err)
	}
	if readErr.Code != "permission_denied" || readErr.APIStatusCode != 99991663 {
		t.Fatalf("classified error = %#v", readErr)
	}
}
