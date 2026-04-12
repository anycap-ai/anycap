package im

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	larkdocx "github.com/larksuite/oapi-sdk-go/v3/service/docx/v1"
)

func TestParseFeishuResourceWriteActionDocxAppendSection(t *testing.T) {
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.append_section",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"section_title": "Summary",
		"markdown": "hello"
	}`)

	if action.Operation != FeishuResourceWriteOperationDocxAppendSection || action.Ref.Kind != FeishuResourceKindDocx || action.SectionTitle != "Summary" || action.Markdown != "hello" {
		t.Fatalf("unexpected action %+v", action)
	}
}

func TestParseFeishuResourceWriteActionDocxAppendUnderHeading(t *testing.T) {
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.append_under_heading",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"heading": "背景",
		"heading_level": 2,
		"markdown": "hello"
	}`)

	if action.Operation != FeishuResourceWriteOperationDocxAppendUnderHeading || action.Heading != "背景" || action.HeadingLevel != 2 || action.Markdown != "hello" {
		t.Fatalf("unexpected action %+v", action)
	}
}

func TestParseFeishuResourceWriteActionDocxReplaceHeadingSection(t *testing.T) {
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.replace_heading_section",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"heading": "背景",
		"heading_level": 2,
		"markdown": "replacement"
	}`)

	if action.Operation != FeishuResourceWriteOperationDocxReplaceHeadingSection || action.Heading != "背景" || action.HeadingLevel != 2 || action.Markdown != "replacement" {
		t.Fatalf("unexpected action %+v", action)
	}
}

func TestParseFeishuResourceWriteActionDocxInspectHeadings(t *testing.T) {
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.inspect_headings",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123"
	}`)

	if action.Operation != FeishuResourceWriteOperationDocxInspectHeadings || action.Ref.Kind != FeishuResourceKindDocx {
		t.Fatalf("unexpected action %+v", action)
	}
}

func TestParseFeishuResourceWriteActionDocxCreate(t *testing.T) {
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.create",
		"title": "新文档",
		"folder_token": "fldcn123",
		"source_url": "https://anycap.feishu.cn/wiki/WIKInode456",
		"markdown": "# 新文档\n\nhello"
	}`)

	if action.Operation != FeishuResourceWriteOperationDocxCreate || action.Title != "新文档" || action.FolderToken != "fldcn123" || action.SourceURL != "https://anycap.feishu.cn/wiki/WIKInode456" || action.Markdown != "# 新文档\n\nhello" {
		t.Fatalf("unexpected action %+v", action)
	}
}

func TestParseFeishuResourceWriteActionSheetCreate(t *testing.T) {
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "sheet.create",
		"title": "新表格",
		"folder_token": "fldcn123",
		"source_url": "https://anycap.feishu.cn/docx/DOCXsource"
	}`)

	if action.Operation != FeishuResourceWriteOperationSheetCreate || action.Title != "新表格" || action.FolderToken != "fldcn123" || action.SourceURL != "https://anycap.feishu.cn/docx/DOCXsource" {
		t.Fatalf("unexpected action %+v", action)
	}
}

func TestParseFeishuResourceWriteActionSheetAppendRows(t *testing.T) {
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "sheet.append_rows",
		"url": "https://anycap.feishu.cn/sheets/SHEETtoken789",
		"range": "grid!A:B",
		"rows": [["item", "cost"], ["coffee", 10]]
	}`)

	if action.Operation != FeishuResourceWriteOperationSheetAppendRows || action.Ref.Kind != FeishuResourceKindSheet || len(action.Rows) != 2 {
		t.Fatalf("unexpected action %+v", action)
	}
}

func TestParseFeishuResourceWriteActionSheetUpdateRange(t *testing.T) {
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "sheet.update_range",
		"url": "https://anycap.feishu.cn/sheets/SHEETtoken789",
		"range": "grid!A1:B1",
		"values": [["item", "cost"]]
	}`)

	if action.Operation != FeishuResourceWriteOperationSheetUpdateRange || action.Range != "grid!A1:B1" || len(action.Values) != 1 {
		t.Fatalf("unexpected action %+v", action)
	}
}

func TestParseFeishuResourceWriteActionBitableCreate(t *testing.T) {
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "bitable.create",
		"title": "新多维表格",
		"folder_token": "fldcn123",
		"source_url": "https://anycap.feishu.cn/docx/DOCXsource"
	}`)

	if action.Operation != FeishuResourceWriteOperationBitableCreate || action.Title != "新多维表格" || action.FolderToken != "fldcn123" || action.SourceURL != "https://anycap.feishu.cn/docx/DOCXsource" {
		t.Fatalf("unexpected action %+v", action)
	}
}

func TestParseFeishuResourceWriteActionBitableCreateRecords(t *testing.T) {
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "bitable.create_records",
		"url": "https://anycap.feishu.cn/base/BASEtoken999?table=tbl123",
		"table_id": "tbl123",
		"records": [{"fields": {"Company": "AnyCap"}}]
	}`)

	if action.Operation != FeishuResourceWriteOperationBitableCreateRecords || action.Ref.Kind != FeishuResourceKindBitable || action.TableID != "tbl123" || len(action.Records) != 1 {
		t.Fatalf("unexpected action %+v", action)
	}
}

func TestParseFeishuResourceWriteActionBitableUpdateRecords(t *testing.T) {
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "bitable.update_records",
		"url": "https://anycap.feishu.cn/base/BASEtoken999",
		"table_id": "tbl123",
		"records": [{"record_id": "rec123", "fields": {"Status": "Done"}}]
	}`)

	if action.Operation != FeishuResourceWriteOperationBitableUpdateRecords || action.Records[0].RecordID != "rec123" {
		t.Fatalf("unexpected action %+v", action)
	}
}

func TestParseFeishuResourceWriteActionRejectsMissingURL(t *testing.T) {
	if _, err := ParseFeishuResourceWriteAction([]byte(`{"operation":"sheet.append_rows","rows":[["x"]]}`)); err == nil {
		t.Fatal("expected missing url to be rejected")
	}
}

func TestParseFeishuResourceWriteActionRejectsUnsupportedResourceType(t *testing.T) {
	if _, err := ParseFeishuResourceWriteAction([]byte(`{
		"operation": "docx.append_section",
		"url": "https://anycap.feishu.cn/base/BASEtoken999",
		"section_title": "Summary",
		"markdown": "hello"
	}`)); err == nil {
		t.Fatal("expected mismatched resource type to be rejected")
	}
}

func parseFeishuResourceWriteActionJSON(t *testing.T, raw string) *FeishuResourceWriteAction {
	t.Helper()
	action, err := ParseFeishuResourceWriteAction([]byte(raw))
	if err != nil {
		t.Fatalf("ParseFeishuResourceWriteAction() error = %v", err)
	}
	return action
}

func TestExecuteFeishuResourceWriteAppendDocxUsesInjectedWriter(t *testing.T) {
	var gotDocumentID, gotTitle, gotMarkdown string
	adapter := &FeishuAdapter{
		appendDocxSection: func(ctx context.Context, documentID string, title string, markdown string) error {
			gotDocumentID = documentID
			gotTitle = title
			gotMarkdown = markdown
			return nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.append_section",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"section_title": "Summary",
		"markdown": "hello"
	}`)

	result, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action)
	if err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if gotDocumentID != "DOCXtoken123" || gotTitle != "Summary" || gotMarkdown != "hello" || result.Operation != action.Operation {
		t.Fatalf("unexpected docx write document=%q title=%q markdown=%q result=%+v", gotDocumentID, gotTitle, gotMarkdown, result)
	}
}

func TestExecuteFeishuResourceWriteAppendWikiDocxResolvesNode(t *testing.T) {
	var gotDocumentID string
	adapter := &FeishuAdapter{
		readWikiNode: func(ctx context.Context, nodeToken string) (*FeishuWikiNodeResult, error) {
			return &FeishuWikiNodeResult{NodeToken: nodeToken, ObjType: "docx", ObjToken: "DOCXresolved"}, nil
		},
		appendDocxSection: func(ctx context.Context, documentID string, title string, markdown string) error {
			gotDocumentID = documentID
			return nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.append_section",
		"url": "https://anycap.feishu.cn/wiki/WIKInode456",
		"section_title": "Summary",
		"markdown": "hello"
	}`)

	if _, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action); err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if gotDocumentID != "DOCXresolved" {
		t.Fatalf("expected wiki docx token to be resolved, got %q", gotDocumentID)
	}
}

func TestExecuteFeishuResourceWriteAppendUnderHeadingUsesInjectedWriter(t *testing.T) {
	var gotDocumentID, gotHeading, gotMarkdown string
	var gotHeadingLevel int
	adapter := &FeishuAdapter{
		appendDocxUnderHeading: func(ctx context.Context, documentID string, heading string, headingLevel int, markdown string) error {
			gotDocumentID = documentID
			gotHeading = heading
			gotHeadingLevel = headingLevel
			gotMarkdown = markdown
			return nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.append_under_heading",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"heading": "背景",
		"heading_level": 2,
		"markdown": "hello"
	}`)

	result, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action)
	if err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if gotDocumentID != "DOCXtoken123" || gotHeading != "背景" || gotHeadingLevel != 2 || gotMarkdown != "hello" || result.Operation != action.Operation {
		t.Fatalf("unexpected append_under_heading document=%q heading=%q level=%d markdown=%q result=%+v", gotDocumentID, gotHeading, gotHeadingLevel, gotMarkdown, result)
	}
}

func TestExecuteFeishuResourceWriteAppendUnderHeadingReturnsVerification(t *testing.T) {
	adapter := &FeishuAdapter{
		appendDocxUnderHeading: func(ctx context.Context, documentID string, heading string, headingLevel int, markdown string) error {
			return nil
		},
		inspectDocxHeadings: func(ctx context.Context, documentID string) (*FeishuDocxHeadingInspectResult, error) {
			return &FeishuDocxHeadingInspectResult{
				Headings: []FeishuDocxHeadingInspection{{
					Level:        2,
					Text:         "背景",
					Index:        1,
					SectionStart: 2,
					SectionEnd:   5,
				}},
			}, nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.append_under_heading",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"heading": "背景",
		"heading_level": 2,
		"markdown": "hello"
	}`)

	result, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action)
	if err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if result.Verification == nil || result.Verification.Text != "背景" || result.Verification.SectionStart != 2 || result.VerificationError != "" {
		t.Fatalf("unexpected verification result %+v", result)
	}
}

func TestExecuteFeishuResourceWriteReplaceHeadingSectionKeepsSuccessWhenVerificationFails(t *testing.T) {
	adapter := &FeishuAdapter{
		replaceDocxHeadingSection: func(ctx context.Context, documentID string, heading string, headingLevel int, markdown string) error {
			return nil
		},
		inspectDocxHeadings: func(ctx context.Context, documentID string) (*FeishuDocxHeadingInspectResult, error) {
			return nil, errors.New("inspect unavailable")
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.replace_heading_section",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"heading": "背景",
		"heading_level": 2,
		"markdown": "replacement"
	}`)

	result, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action)
	if err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if result.Verification != nil || !strings.Contains(result.VerificationError, "inspect unavailable") {
		t.Fatalf("unexpected verification result %+v", result)
	}
}

func TestExecuteFeishuResourceWriteReplaceHeadingSectionUsesInjectedWriter(t *testing.T) {
	var gotDocumentID, gotHeading, gotMarkdown string
	var gotHeadingLevel int
	adapter := &FeishuAdapter{
		replaceDocxHeadingSection: func(ctx context.Context, documentID string, heading string, headingLevel int, markdown string) error {
			gotDocumentID = documentID
			gotHeading = heading
			gotHeadingLevel = headingLevel
			gotMarkdown = markdown
			return nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.replace_heading_section",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"heading": "背景",
		"heading_level": 2,
		"markdown": "replacement"
	}`)

	result, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action)
	if err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if gotDocumentID != "DOCXtoken123" || gotHeading != "背景" || gotHeadingLevel != 2 || gotMarkdown != "replacement" || result.Operation != action.Operation {
		t.Fatalf("unexpected replace_heading_section document=%q heading=%q level=%d markdown=%q result=%+v", gotDocumentID, gotHeading, gotHeadingLevel, gotMarkdown, result)
	}
}

func TestExecuteFeishuResourceWriteInspectHeadingsUsesInjectedInspector(t *testing.T) {
	adapter := &FeishuAdapter{
		inspectDocxHeadings: func(ctx context.Context, documentID string) (*FeishuDocxHeadingInspectResult, error) {
			if documentID != "DOCXtoken123" {
				t.Fatalf("unexpected documentID %q", documentID)
			}
			return &FeishuDocxHeadingInspectResult{
				Headings: []FeishuDocxHeadingInspection{{
					Level:        1,
					Text:         "背景",
					Index:        0,
					SectionStart: 1,
					SectionEnd:   3,
				}},
				DuplicateHeadings: []string{"背景"},
			}, nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.inspect_headings",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123"
	}`)

	result, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action)
	if err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if result.Operation != action.Operation || len(result.Headings) != 1 || result.Headings[0].Text != "背景" || len(result.DuplicateHeadings) != 1 {
		t.Fatalf("unexpected inspect result %+v", result)
	}
}

func TestExecuteFeishuResourceWriteCreateDocxUsesInjectedCreator(t *testing.T) {
	var gotTitle, gotMarkdown, gotSourceURL, gotFolderToken string
	var gotVerificationDocumentID string
	adapter := &FeishuAdapter{
		createDocx: func(ctx context.Context, title string, markdown string, sourceURL string, folderToken string) (*FeishuDocxCreateResult, error) {
			gotTitle = title
			gotMarkdown = markdown
			gotSourceURL = sourceURL
			gotFolderToken = folderToken
			return &FeishuDocxCreateResult{
				DocumentID: "DOCXnew123",
				Title:      title,
				URL:        "https://anycap.feishu.cn/docx/DOCXnew123",
			}, nil
		},
		readDocxRawContent: func(ctx context.Context, documentID string) (*FeishuDocxReadResult, error) {
			gotVerificationDocumentID = documentID
			return &FeishuDocxReadResult{DocumentID: documentID, Content: "# 新文档\n\nhello"}, nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.create",
		"title": "新文档",
		"folder_token": "fldcn123",
		"source_url": "https://anycap.feishu.cn/docx/DOCXsource",
		"markdown": "# 新文档\n\nhello"
	}`)

	result, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action)
	if err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if gotTitle != "新文档" || gotMarkdown != "# 新文档\n\nhello" || gotSourceURL != "https://anycap.feishu.cn/docx/DOCXsource" || gotFolderToken != "fldcn123" {
		t.Fatalf("unexpected creator input title=%q markdown=%q sourceURL=%q folderToken=%q", gotTitle, gotMarkdown, gotSourceURL, gotFolderToken)
	}
	if gotVerificationDocumentID != "DOCXnew123" {
		t.Fatalf("expected create verification read for DOCXnew123, got %q", gotVerificationDocumentID)
	}
	if result.Operation != FeishuResourceWriteOperationDocxCreate || result.Token != "DOCXnew123" || result.URL != "https://anycap.feishu.cn/docx/DOCXnew123" || result.Title != "新文档" || result.VerificationTextLength == 0 || result.VerificationError != "" {
		t.Fatalf("unexpected create result %+v", result)
	}
}

func TestExecuteFeishuResourceWriteCreateDocxKeepsSuccessWhenVerificationFails(t *testing.T) {
	adapter := &FeishuAdapter{
		createDocx: func(ctx context.Context, title string, markdown string, sourceURL string, folderToken string) (*FeishuDocxCreateResult, error) {
			return &FeishuDocxCreateResult{DocumentID: "DOCXnew123", Title: title}, nil
		},
		readDocxRawContent: func(ctx context.Context, documentID string) (*FeishuDocxReadResult, error) {
			return nil, errors.New("raw content delayed")
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.create",
		"title": "新文档",
		"markdown": "# 新文档\n\nhello"
	}`)

	result, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action)
	if err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if result.Token != "DOCXnew123" || !strings.Contains(result.VerificationError, "raw content delayed") {
		t.Fatalf("unexpected create verification result %+v", result)
	}
}

func TestExecuteFeishuResourceWriteCreateSheetUsesInjectedCreator(t *testing.T) {
	var gotTitle, gotSourceURL, gotFolderToken string
	adapter := &FeishuAdapter{
		createSheet: func(ctx context.Context, title string, sourceURL string, folderToken string) (*FeishuSheetCreateResult, error) {
			gotTitle = title
			gotSourceURL = sourceURL
			gotFolderToken = folderToken
			return &FeishuSheetCreateResult{
				SpreadsheetToken: "SHEETnew123",
				Title:            title,
				URL:              "https://anycap.feishu.cn/sheets/SHEETnew123",
			}, nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "sheet.create",
		"title": "新表格",
		"folder_token": "fldcn123",
		"source_url": "https://anycap.feishu.cn/docx/DOCXsource"
	}`)

	result, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action)
	if err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if gotTitle != "新表格" || gotSourceURL != "https://anycap.feishu.cn/docx/DOCXsource" || gotFolderToken != "fldcn123" {
		t.Fatalf("unexpected creator input title=%q sourceURL=%q folderToken=%q", gotTitle, gotSourceURL, gotFolderToken)
	}
	if result.Operation != FeishuResourceWriteOperationSheetCreate || result.Kind != FeishuResourceKindSheet || result.Token != "SHEETnew123" || result.URL != "https://anycap.feishu.cn/sheets/SHEETnew123" || result.Title != "新表格" {
		t.Fatalf("unexpected create sheet result %+v", result)
	}
}

func TestExecuteFeishuResourceWriteCreateBitableUsesInjectedCreator(t *testing.T) {
	var gotTitle, gotSourceURL, gotFolderToken string
	adapter := &FeishuAdapter{
		createBitable: func(ctx context.Context, title string, sourceURL string, folderToken string) (*FeishuBitableCreateResult, error) {
			gotTitle = title
			gotSourceURL = sourceURL
			gotFolderToken = folderToken
			return &FeishuBitableCreateResult{
				AppToken: "BASEnew123",
				Title:    title,
				URL:      "https://anycap.feishu.cn/base/BASEnew123",
			}, nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "bitable.create",
		"title": "新多维表格",
		"folder_token": "fldcn123",
		"source_url": "https://anycap.feishu.cn/docx/DOCXsource"
	}`)

	result, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action)
	if err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if gotTitle != "新多维表格" || gotSourceURL != "https://anycap.feishu.cn/docx/DOCXsource" || gotFolderToken != "fldcn123" {
		t.Fatalf("unexpected creator input title=%q sourceURL=%q folderToken=%q", gotTitle, gotSourceURL, gotFolderToken)
	}
	if result.Operation != FeishuResourceWriteOperationBitableCreate || result.Kind != FeishuResourceKindBitable || result.Token != "BASEnew123" || result.URL != "https://anycap.feishu.cn/base/BASEnew123" || result.Title != "新多维表格" {
		t.Fatalf("unexpected create bitable result %+v", result)
	}
}

func TestExecuteFeishuResourceWriteAppendSheetRowsUsesInjectedWriter(t *testing.T) {
	var gotToken, gotRange string
	var gotRows [][]any
	adapter := &FeishuAdapter{
		appendSheetRows: func(ctx context.Context, spreadsheetToken string, rangeStr string, rows [][]any) error {
			gotToken = spreadsheetToken
			gotRange = rangeStr
			gotRows = rows
			return nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "sheet.append_rows",
		"url": "https://anycap.feishu.cn/sheets/SHEETtoken789",
		"range": "grid!A:B",
		"rows": [["item", "cost"]]
	}`)

	if _, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action); err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if gotToken != "SHEETtoken789" || gotRange != "grid!A:B" || len(gotRows) != 1 {
		t.Fatalf("unexpected sheet append token=%q range=%q rows=%+v", gotToken, gotRange, gotRows)
	}
}

func TestExecuteFeishuResourceWriteUpdateSheetRangeUsesInjectedWriter(t *testing.T) {
	var gotValues [][]any
	adapter := &FeishuAdapter{
		updateSheetRange: func(ctx context.Context, spreadsheetToken string, rangeStr string, values [][]any) error {
			gotValues = values
			return nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "sheet.update_range",
		"url": "https://anycap.feishu.cn/sheets/SHEETtoken789",
		"range": "grid!A1:B1",
		"values": [["item", "cost"]]
	}`)

	if _, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action); err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if len(gotValues) != 1 {
		t.Fatalf("unexpected sheet update values=%+v", gotValues)
	}
}

func TestFeishuAdapterAppendSheetRowsUsesDirectHTTP(t *testing.T) {
	var gotMethod, gotPath, gotAuth string
	var gotBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/open-apis/auth/v3/tenant_access_token/internal":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"tenant_access_token":"tenant_token","expire":7200}`))
		case "/open-apis/sheets/v2/spreadsheets/SHEETtoken789/values_append":
			gotMethod = r.Method
			gotPath = r.URL.Path
			gotAuth = r.Header.Get("Authorization")
			if err := json.NewDecoder(r.Body).Decode(&gotBody); err != nil {
				t.Fatalf("Decode(sheet body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"data":{"ok":true}}`))
		default:
			t.Fatalf("unexpected request %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()
	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		AppID:          "cli_appid",
		AppSecret:      "app_secret",
		HTTPClient:     server.Client(),
		OpenAPIBaseURL: server.URL,
	})

	err := adapter.appendSheetRowsViaAPI(context.Background(), "SHEETtoken789", "grid!A:B", [][]any{{"item", "cost"}})
	if err != nil {
		t.Fatalf("appendSheetRowsViaAPI() error = %v", err)
	}
	if gotMethod != http.MethodPost || gotPath != "/open-apis/sheets/v2/spreadsheets/SHEETtoken789/values_append" || gotAuth != "Bearer tenant_token" {
		t.Fatalf("unexpected request method=%q path=%q auth=%q", gotMethod, gotPath, gotAuth)
	}
	valueRange, ok := gotBody["valueRange"].(map[string]any)
	if !ok || valueRange["range"] != "grid!A:B" || gotBody["insertDataOption"] != "INSERT_ROWS" {
		t.Fatalf("unexpected body %#v", gotBody)
	}
}

func TestFeishuAdapterUpdateSheetRangeUsesDirectHTTP(t *testing.T) {
	var gotMethod, gotPath string
	var gotBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/open-apis/auth/v3/tenant_access_token/internal":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"tenant_access_token":"tenant_token","expire":7200}`))
		case "/open-apis/sheets/v2/spreadsheets/SHEETtoken789/values":
			gotMethod = r.Method
			gotPath = r.URL.Path
			if err := json.NewDecoder(r.Body).Decode(&gotBody); err != nil {
				t.Fatalf("Decode(sheet body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"data":{"ok":true}}`))
		default:
			t.Fatalf("unexpected request %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()
	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		AppID:          "cli_appid",
		AppSecret:      "app_secret",
		HTTPClient:     server.Client(),
		OpenAPIBaseURL: server.URL,
	})

	err := adapter.updateSheetRangeViaAPI(context.Background(), "SHEETtoken789", "grid!A1:B1", [][]any{{"item", "cost"}})
	if err != nil {
		t.Fatalf("updateSheetRangeViaAPI() error = %v", err)
	}
	if gotMethod != http.MethodPut || gotPath != "/open-apis/sheets/v2/spreadsheets/SHEETtoken789/values" {
		t.Fatalf("unexpected request method=%q path=%q", gotMethod, gotPath)
	}
	valueRange, ok := gotBody["valueRange"].(map[string]any)
	if !ok || valueRange["range"] != "grid!A1:B1" {
		t.Fatalf("unexpected body %#v", gotBody)
	}
}

func TestFeishuAdapterAppendDocxMarkdownConvertsAndAppendsDescendants(t *testing.T) {
	var convertBody map[string]any
	var descendantBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/open-apis/auth/v3/tenant_access_token/internal":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"tenant_access_token":"tenant_token","expire":7200}`))
		case "/open-apis/docx/v1/documents/blocks/convert":
			if r.Method != http.MethodPost {
				t.Fatalf("unexpected convert method %s", r.Method)
			}
			if err := json.NewDecoder(r.Body).Decode(&convertBody); err != nil {
				t.Fatalf("Decode(convert body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{
				"code": 0,
				"data": {
					"first_level_block_ids": ["tmp_heading", "tmp_table"],
					"blocks": [
						{"block_id": "tmp_heading", "block_type": 3, "heading1": {"elements": [{"text_run": {"content": "Summary"}}]}},
						{"block_id": "tmp_table", "block_type": 31, "table": {"property": {"row_size": 1, "column_size": 1, "merge_info": [{"row_span": 1, "col_span": 1}]}}}
					]
				}
			}`))
		case "/open-apis/docx/v1/documents/DOCXtoken123/blocks/DOCXtoken123/descendant":
			if r.Method != http.MethodPost {
				t.Fatalf("unexpected descendant method %s", r.Method)
			}
			if err := json.NewDecoder(r.Body).Decode(&descendantBody); err != nil {
				t.Fatalf("Decode(descendant body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"data":{"document_revision_id":1}}`))
		default:
			t.Fatalf("unexpected request %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()
	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		AppID:          "cli_appid",
		AppSecret:      "app_secret",
		HTTPClient:     server.Client(),
		OpenAPIBaseURL: server.URL,
	})

	err := adapter.appendDocxMarkdownViaAPI(context.Background(), "DOCXtoken123", "# Summary\n\n- item")
	if err != nil {
		t.Fatalf("appendDocxMarkdownViaAPI() error = %v", err)
	}
	if convertBody["content_type"] != "markdown" || convertBody["content"] != "# Summary\n\n- item" {
		t.Fatalf("unexpected convert body %#v", convertBody)
	}
	childrenID, ok := descendantBody["children_id"].([]any)
	if !ok || len(childrenID) != 2 || childrenID[0] != "tmp_heading" || childrenID[1] != "tmp_table" {
		t.Fatalf("unexpected descendant children_id %#v", descendantBody)
	}
	if descendantBody["index"].(float64) != -1 {
		t.Fatalf("unexpected descendant index %#v", descendantBody)
	}
	descendants, ok := descendantBody["descendants"].([]any)
	if !ok || len(descendants) != 2 {
		t.Fatalf("unexpected descendants %#v", descendantBody)
	}
	table, ok := descendants[1].(map[string]any)["table"].(map[string]any)
	if !ok {
		t.Fatalf("expected table descendant, got %#v", descendants[1])
	}
	property, ok := table["property"].(map[string]any)
	if !ok {
		t.Fatalf("expected table property, got %#v", table)
	}
	if _, ok := property["merge_info"]; ok {
		t.Fatalf("merge_info should be stripped before descendant append, got %#v", property)
	}
}

func TestFeishuAdapterCreateDocxViaAPICreatesAndWritesMarkdown(t *testing.T) {
	var createBody map[string]any
	var convertBody map[string]any
	var descendantBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/open-apis/auth/v3/tenant_access_token/internal":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"tenant_access_token":"tenant_token","expire":7200}`))
		case "/open-apis/docx/v1/documents":
			if r.Method != http.MethodPost {
				t.Fatalf("unexpected create method %s", r.Method)
			}
			if err := json.NewDecoder(r.Body).Decode(&createBody); err != nil {
				t.Fatalf("Decode(create body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"data":{"document":{"document_id":"DOCXnew123","title":"新文档"}}}`))
		case "/open-apis/docx/v1/documents/blocks/convert":
			if err := json.NewDecoder(r.Body).Decode(&convertBody); err != nil {
				t.Fatalf("Decode(convert body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{
				"code": 0,
				"data": {
					"first_level_block_ids": ["tmp_heading"],
					"blocks": [
						{"block_id": "tmp_heading", "block_type": 3, "heading1": {"elements": [{"text_run": {"content": "新文档"}}]}}
					]
				}
			}`))
		case "/open-apis/docx/v1/documents/DOCXnew123/blocks/DOCXnew123/descendant":
			if err := json.NewDecoder(r.Body).Decode(&descendantBody); err != nil {
				t.Fatalf("Decode(descendant body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"data":{"document_revision_id":1}}`))
		default:
			t.Fatalf("unexpected request %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()
	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		AppID:          "cli_appid",
		AppSecret:      "app_secret",
		HTTPClient:     server.Client(),
		OpenAPIBaseURL: server.URL,
	})

	result, err := adapter.createDocxViaAPI(context.Background(), "新文档", "# 新文档", "https://anycap.feishu.cn/wiki/WIKInode456", "fldcn123")
	if err != nil {
		t.Fatalf("createDocxViaAPI() error = %v", err)
	}
	if createBody["title"] != "新文档" || createBody["folder_token"] != "fldcn123" || convertBody["content"] != "# 新文档" {
		t.Fatalf("unexpected create/convert body create=%#v convert=%#v", createBody, convertBody)
	}
	if descendantBody["index"].(float64) != -1 {
		t.Fatalf("unexpected descendant body %#v", descendantBody)
	}
	if result.DocumentID != "DOCXnew123" || result.Title != "新文档" || result.URL != "https://anycap.feishu.cn/docx/DOCXnew123" {
		t.Fatalf("unexpected create result %+v", result)
	}
}

func TestFeishuAdapterCreateSheetViaAPICreatesSpreadsheet(t *testing.T) {
	var createBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/open-apis/auth/v3/tenant_access_token/internal":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"tenant_access_token":"tenant_token","expire":7200}`))
		case "/open-apis/sheets/v3/spreadsheets":
			if r.Method != http.MethodPost {
				t.Fatalf("unexpected create method %s", r.Method)
			}
			if err := json.NewDecoder(r.Body).Decode(&createBody); err != nil {
				t.Fatalf("Decode(create sheet body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"data":{"spreadsheet":{"spreadsheet_token":"SHEETnew123","title":"新表格","url":"https://anycap.feishu.cn/sheets/SHEETnew123"}}}`))
		default:
			t.Fatalf("unexpected request %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()
	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		AppID:          "cli_appid",
		AppSecret:      "app_secret",
		HTTPClient:     server.Client(),
		OpenAPIBaseURL: server.URL,
	})

	result, err := adapter.createSheetViaAPI(context.Background(), "新表格", "https://anycap.feishu.cn/docx/DOCXsource", "fldcn123")
	if err != nil {
		t.Fatalf("createSheetViaAPI() error = %v", err)
	}
	if createBody["title"] != "新表格" || createBody["folder_token"] != "fldcn123" {
		t.Fatalf("unexpected create sheet body %#v", createBody)
	}
	if result.SpreadsheetToken != "SHEETnew123" || result.Title != "新表格" || result.URL != "https://anycap.feishu.cn/sheets/SHEETnew123" {
		t.Fatalf("unexpected create sheet result %+v", result)
	}
}

func TestFeishuAdapterCreateBitableViaAPICreatesApp(t *testing.T) {
	var createBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/open-apis/auth/v3/tenant_access_token/internal":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"tenant_access_token":"tenant_token","expire":7200}`))
		case "/open-apis/bitable/v1/apps":
			if r.Method != http.MethodPost {
				t.Fatalf("unexpected create method %s", r.Method)
			}
			if err := json.NewDecoder(r.Body).Decode(&createBody); err != nil {
				t.Fatalf("Decode(create bitable body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"data":{"app":{"app_token":"BASEnew123","name":"新多维表格","url":"https://anycap.feishu.cn/base/BASEnew123"}}}`))
		default:
			t.Fatalf("unexpected request %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()
	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		AppID:          "cli_appid",
		AppSecret:      "app_secret",
		HTTPClient:     server.Client(),
		OpenAPIBaseURL: server.URL,
	})

	result, err := adapter.createBitableViaAPI(context.Background(), "新多维表格", "https://anycap.feishu.cn/docx/DOCXsource", "fldcn123")
	if err != nil {
		t.Fatalf("createBitableViaAPI() error = %v", err)
	}
	if createBody["name"] != "新多维表格" || createBody["folder_token"] != "fldcn123" {
		t.Fatalf("unexpected create bitable body %#v", createBody)
	}
	if result.AppToken != "BASEnew123" || result.Title != "新多维表格" || result.URL != "https://anycap.feishu.cn/base/BASEnew123" {
		t.Fatalf("unexpected create bitable result %+v", result)
	}
}

func TestFeishuAdapterAppendDocxUnderHeadingInsertsBeforeNextPeerHeading(t *testing.T) {
	var descendantBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/open-apis/auth/v3/tenant_access_token/internal":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"tenant_access_token":"tenant_token","expire":7200}`))
		case "/open-apis/docx/v1/documents/DOCXtoken123/blocks/DOCXtoken123/children":
			if r.Method != http.MethodGet {
				t.Fatalf("unexpected children method %s", r.Method)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{
				"code": 0,
				"data": {
					"items": [
						{"block_id": "intro", "block_type": 2, "text": {"elements": [{"text_run": {"content": "Intro"}}]}},
						{"block_id": "target", "block_type": 4, "heading2": {"elements": [{"text_run": {"content": "背景"}}]}},
						{"block_id": "body", "block_type": 2, "text": {"elements": [{"text_run": {"content": "Existing"}}]}},
						{"block_id": "next", "block_type": 4, "heading2": {"elements": [{"text_run": {"content": "方案"}}]}}
					]
				}
			}`))
		case "/open-apis/docx/v1/documents/blocks/convert":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{
				"code": 0,
				"data": {
					"first_level_block_ids": ["tmp_text"],
					"blocks": [
						{"block_id": "tmp_text", "block_type": 2, "text": {"elements": [{"text_run": {"content": "追加内容"}}]}}
					]
				}
			}`))
		case "/open-apis/docx/v1/documents/DOCXtoken123/blocks/DOCXtoken123/descendant":
			if err := json.NewDecoder(r.Body).Decode(&descendantBody); err != nil {
				t.Fatalf("Decode(descendant body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"data":{"document_revision_id":1}}`))
		default:
			t.Fatalf("unexpected request %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()
	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		AppID:          "cli_appid",
		AppSecret:      "app_secret",
		HTTPClient:     server.Client(),
		OpenAPIBaseURL: server.URL,
	})

	err := adapter.appendDocxUnderHeadingViaAPI(context.Background(), "DOCXtoken123", "背景", 2, "追加内容")
	if err != nil {
		t.Fatalf("appendDocxUnderHeadingViaAPI() error = %v", err)
	}
	if descendantBody["index"].(float64) != 3 {
		t.Fatalf("expected insert index 3 before next peer heading, got %#v", descendantBody)
	}
}

func TestFeishuAdapterReplaceDocxHeadingSectionDeletesSectionThenInsertsReplacement(t *testing.T) {
	var calls []string
	var deleteBody map[string]any
	var descendantBody map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/open-apis/auth/v3/tenant_access_token/internal":
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"tenant_access_token":"tenant_token","expire":7200}`))
		case "/open-apis/docx/v1/documents/DOCXtoken123/blocks/DOCXtoken123/children":
			if r.Method != http.MethodGet {
				t.Fatalf("unexpected children method %s", r.Method)
			}
			calls = append(calls, "list")
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{
				"code": 0,
				"data": {
					"items": [
						{"block_id": "intro", "block_type": 2, "text": {"elements": [{"text_run": {"content": "Intro"}}]}},
						{"block_id": "target", "block_type": 4, "heading2": {"elements": [{"text_run": {"content": "背景"}}]}},
						{"block_id": "old1", "block_type": 2, "text": {"elements": [{"text_run": {"content": "Old 1"}}]}},
						{"block_id": "old2", "block_type": 2, "text": {"elements": [{"text_run": {"content": "Old 2"}}]}},
						{"block_id": "next", "block_type": 4, "heading2": {"elements": [{"text_run": {"content": "方案"}}]}}
					]
				}
			}`))
		case "/open-apis/docx/v1/documents/DOCXtoken123/blocks/DOCXtoken123/children/batch_delete":
			if r.Method != http.MethodDelete {
				t.Fatalf("unexpected batch_delete method %s", r.Method)
			}
			calls = append(calls, "delete")
			if err := json.NewDecoder(r.Body).Decode(&deleteBody); err != nil {
				t.Fatalf("Decode(delete body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"data":{"document_revision_id":1}}`))
		case "/open-apis/docx/v1/documents/blocks/convert":
			calls = append(calls, "convert")
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{
				"code": 0,
				"data": {
					"first_level_block_ids": ["tmp_text"],
					"blocks": [
						{"block_id": "tmp_text", "block_type": 2, "text": {"elements": [{"text_run": {"content": "New"}}]}}
					]
				}
			}`))
		case "/open-apis/docx/v1/documents/DOCXtoken123/blocks/DOCXtoken123/descendant":
			calls = append(calls, "insert")
			if err := json.NewDecoder(r.Body).Decode(&descendantBody); err != nil {
				t.Fatalf("Decode(descendant body) error = %v", err)
			}
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"code":0,"data":{"document_revision_id":2}}`))
		default:
			t.Fatalf("unexpected request %s %s", r.Method, r.URL.Path)
		}
	}))
	defer server.Close()
	adapter := NewFeishuAdapter(FeishuAdapterConfig{
		AppID:          "cli_appid",
		AppSecret:      "app_secret",
		HTTPClient:     server.Client(),
		OpenAPIBaseURL: server.URL,
	})

	err := adapter.replaceDocxHeadingSectionViaAPI(context.Background(), "DOCXtoken123", "背景", 2, "New")
	if err != nil {
		t.Fatalf("replaceDocxHeadingSectionViaAPI() error = %v", err)
	}
	if got := strings.Join(calls, ","); got != "list,delete,convert,insert" {
		t.Fatalf("unexpected call order %q", got)
	}
	if deleteBody["start_index"].(float64) != 2 || deleteBody["end_index"].(float64) != 4 {
		t.Fatalf("unexpected delete body %#v", deleteBody)
	}
	if descendantBody["index"].(float64) != 2 {
		t.Fatalf("expected insert index 2 after delete, got %#v", descendantBody)
	}
}

func TestDocxAppendUnderHeadingIndexRejectsDuplicateHeadings(t *testing.T) {
	blocks := []*larkdocx.Block{
		buildTestFeishuDocxHeadingBlock(3, "背景"),
		buildFeishuDocxTextBlock(2, "first"),
		buildTestFeishuDocxHeadingBlock(3, "背景"),
	}

	if _, err := docxAppendUnderHeadingIndex(blocks, "背景", 1); err == nil {
		t.Fatal("expected duplicate heading match to be rejected")
	}
}

func TestDocxAppendUnderHeadingIndexRejectsMissingHeading(t *testing.T) {
	blocks := []*larkdocx.Block{
		buildTestFeishuDocxHeadingBlock(3, "背景"),
		buildFeishuDocxTextBlock(2, "first"),
	}

	if _, err := docxAppendUnderHeadingIndex(blocks, "方案", 1); err == nil {
		t.Fatal("expected missing heading to be rejected")
	}
}

func TestDocxHeadingSectionRangeRejectsEmptySection(t *testing.T) {
	blocks := []*larkdocx.Block{
		buildTestFeishuDocxHeadingBlock(3, "背景"),
		buildTestFeishuDocxHeadingBlock(3, "方案"),
	}

	if _, _, err := docxHeadingSectionRange(blocks, "背景", 1); err == nil {
		t.Fatal("expected empty heading section to be rejected")
	}
}

func TestInspectFeishuDocxHeadingsReturnsSectionBoundsAndDuplicates(t *testing.T) {
	blocks := []*larkdocx.Block{
		buildTestFeishuDocxHeadingBlock(3, "背景"),
		buildFeishuDocxTextBlock(2, "first"),
		buildTestFeishuDocxHeadingBlock(4, "目标"),
		buildFeishuDocxTextBlock(2, "nested"),
		buildTestFeishuDocxHeadingBlock(3, "背景"),
		buildFeishuDocxTextBlock(2, "second"),
	}

	result := inspectFeishuDocxHeadings(blocks)
	if len(result.Headings) != 3 {
		t.Fatalf("unexpected headings %+v", result.Headings)
	}
	if result.Headings[0].Text != "背景" || result.Headings[0].SectionStart != 1 || result.Headings[0].SectionEnd != 4 {
		t.Fatalf("unexpected first heading %+v", result.Headings[0])
	}
	if result.Headings[1].Text != "目标" || result.Headings[1].SectionStart != 3 || result.Headings[1].SectionEnd != 4 {
		t.Fatalf("unexpected nested heading %+v", result.Headings[1])
	}
	if len(result.DuplicateHeadings) != 1 || result.DuplicateHeadings[0] != "背景" {
		t.Fatalf("unexpected duplicates %+v", result.DuplicateHeadings)
	}
}

func buildTestFeishuDocxHeadingBlock(blockType int, content string) *larkdocx.Block {
	text := larkdocx.NewTextBuilder().
		Elements([]*larkdocx.TextElement{
			larkdocx.NewTextElementBuilder().
				TextRun(larkdocx.NewTextRunBuilder().Content(content).Build()).
				Build(),
		}).
		Build()
	builder := larkdocx.NewBlockBuilder().BlockType(blockType)
	switch blockType {
	case 3:
		return builder.Heading1(text).Build()
	case 4:
		return builder.Heading2(text).Build()
	case 5:
		return builder.Heading3(text).Build()
	default:
		return builder.Text(text).Build()
	}
}

func TestExecuteFeishuResourceWriteCreateBitableRecordsUsesInjectedWriter(t *testing.T) {
	var gotRecords []FeishuBitableRecordWrite
	adapter := &FeishuAdapter{
		createBitableRecords: func(ctx context.Context, appToken string, tableID string, records []FeishuBitableRecordWrite) error {
			gotRecords = records
			return nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "bitable.create_records",
		"url": "https://anycap.feishu.cn/base/BASEtoken999",
		"table_id": "tbl123",
		"records": [{"fields": {"Company": "AnyCap"}}]
	}`)

	if _, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action); err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if len(gotRecords) != 1 || gotRecords[0].Fields["Company"] != "AnyCap" {
		t.Fatalf("unexpected bitable create records=%+v", gotRecords)
	}
}

func TestExecuteFeishuResourceWriteUpdateBitableRecordsUsesInjectedWriter(t *testing.T) {
	var gotRecords []FeishuBitableRecordWrite
	adapter := &FeishuAdapter{
		updateBitableRecords: func(ctx context.Context, appToken string, tableID string, records []FeishuBitableRecordWrite) error {
			gotRecords = records
			return nil
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "bitable.update_records",
		"url": "https://anycap.feishu.cn/base/BASEtoken999",
		"table_id": "tbl123",
		"records": [{"record_id": "rec123", "fields": {"Status": "Done"}}]
	}`)

	if _, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action); err != nil {
		t.Fatalf("ExecuteFeishuResourceWrite() error = %v", err)
	}
	if len(gotRecords) != 1 || gotRecords[0].RecordID != "rec123" {
		t.Fatalf("unexpected bitable update records=%+v", gotRecords)
	}
}

func TestExecuteFeishuResourceWriteClassifiesPermissionError(t *testing.T) {
	adapter := &FeishuAdapter{
		appendDocxSection: func(ctx context.Context, documentID string, title string, markdown string) error {
			return classifyFeishuResourceReadError("append feishu docx section", 99991663, "permission denied", nil)
		},
	}
	action := parseFeishuResourceWriteActionJSON(t, `{
		"operation": "docx.append_section",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"section_title": "Summary",
		"markdown": "hello"
	}`)

	_, err := adapter.ExecuteFeishuResourceWrite(context.Background(), *action)
	var readErr *FeishuResourceReadError
	if !errors.As(err, &readErr) || readErr.Code != "permission_denied" {
		t.Fatalf("expected classified permission error, got %T %v", err, err)
	}
}
