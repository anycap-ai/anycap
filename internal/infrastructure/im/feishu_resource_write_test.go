package im

import (
	"context"
	"errors"
	"testing"
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
