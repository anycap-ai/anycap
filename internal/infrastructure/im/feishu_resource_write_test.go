package im

import "testing"

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
