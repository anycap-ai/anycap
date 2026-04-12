package im

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
	larkbitable "github.com/larksuite/oapi-sdk-go/v3/service/bitable/v1"
	larkdocx "github.com/larksuite/oapi-sdk-go/v3/service/docx/v1"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type FeishuResourceWriteOperation string

const (
	FeishuResourceWriteOperationDocxAppendSection    FeishuResourceWriteOperation = "docx.append_section"
	FeishuResourceWriteOperationDocxAppendMarkdown   FeishuResourceWriteOperation = "docx.append_markdown"
	FeishuResourceWriteOperationSheetAppendRows      FeishuResourceWriteOperation = "sheet.append_rows"
	FeishuResourceWriteOperationSheetUpdateRange     FeishuResourceWriteOperation = "sheet.update_range"
	FeishuResourceWriteOperationBitableCreateRecords FeishuResourceWriteOperation = "bitable.create_records"
	FeishuResourceWriteOperationBitableUpdateRecords FeishuResourceWriteOperation = "bitable.update_records"
)

type FeishuResourceWriteAction struct {
	Operation    FeishuResourceWriteOperation `json:"operation"`
	URL          string                       `json:"url"`
	Ref          FeishuResourceRef            `json:"-"`
	SectionTitle string                       `json:"section_title,omitempty"`
	Markdown     string                       `json:"markdown,omitempty"`
	Range        string                       `json:"range,omitempty"`
	Rows         [][]any                      `json:"rows,omitempty"`
	Values       [][]any                      `json:"values,omitempty"`
	TableID      string                       `json:"table_id,omitempty"`
	Records      []FeishuBitableRecordWrite   `json:"records,omitempty"`
}

type FeishuBitableRecordWrite struct {
	RecordID string         `json:"record_id,omitempty"`
	Fields   map[string]any `json:"fields"`
}

type FeishuResourceWriteResult struct {
	Operation FeishuResourceWriteOperation
	URL       string
	Kind      FeishuResourceKind
	Token     string
}

func ParseFeishuResourceWriteAction(raw []byte) (*FeishuResourceWriteAction, error) {
	var action FeishuResourceWriteAction
	if err := json.Unmarshal(raw, &action); err != nil {
		return nil, fmt.Errorf("parse feishu resource write action: %w", err)
	}
	action.Operation = FeishuResourceWriteOperation(strings.TrimSpace(string(action.Operation)))
	action.URL = strings.TrimSpace(action.URL)
	action.SectionTitle = strings.TrimSpace(action.SectionTitle)
	action.Markdown = strings.TrimSpace(action.Markdown)
	action.Range = strings.TrimSpace(action.Range)
	action.TableID = strings.TrimSpace(action.TableID)

	ref, ok := parseFeishuResourceURL(action.URL)
	if !ok {
		return nil, model.ErrValidation("feishu write action requires an explicit supported Feishu resource URL")
	}
	action.Ref = ref
	if err := action.Validate(); err != nil {
		return nil, err
	}
	return &action, nil
}

func (a FeishuResourceWriteAction) Validate() error {
	switch a.Operation {
	case FeishuResourceWriteOperationDocxAppendSection:
		if a.Ref.Kind != FeishuResourceKindDocx && a.Ref.Kind != FeishuResourceKindWiki {
			return model.ErrValidation("docx write action requires a docx or wiki URL")
		}
		if strings.TrimSpace(a.Markdown) == "" {
			return model.ErrValidation("docx append section requires markdown")
		}
	case FeishuResourceWriteOperationDocxAppendMarkdown:
		if a.Ref.Kind != FeishuResourceKindDocx && a.Ref.Kind != FeishuResourceKindWiki {
			return model.ErrValidation("docx write action requires a docx or wiki URL")
		}
		if strings.TrimSpace(a.Markdown) == "" {
			return model.ErrValidation("docx append markdown requires markdown")
		}
	case FeishuResourceWriteOperationSheetAppendRows:
		if a.Ref.Kind != FeishuResourceKindSheet {
			return model.ErrValidation("sheet write action requires a sheet URL")
		}
		if strings.TrimSpace(a.Range) == "" || len(a.Rows) == 0 {
			return model.ErrValidation("sheet append rows requires range and rows")
		}
	case FeishuResourceWriteOperationSheetUpdateRange:
		if a.Ref.Kind != FeishuResourceKindSheet {
			return model.ErrValidation("sheet write action requires a sheet URL")
		}
		if strings.TrimSpace(a.Range) == "" || len(a.Values) == 0 {
			return model.ErrValidation("sheet update range requires range and values")
		}
	case FeishuResourceWriteOperationBitableCreateRecords:
		if a.Ref.Kind != FeishuResourceKindBitable {
			return model.ErrValidation("bitable write action requires a bitable URL")
		}
		if strings.TrimSpace(a.TableID) == "" || len(a.Records) == 0 {
			return model.ErrValidation("bitable create records requires table_id and records")
		}
		for _, record := range a.Records {
			if len(record.Fields) == 0 {
				return model.ErrValidation("bitable create records requires record fields")
			}
		}
	case FeishuResourceWriteOperationBitableUpdateRecords:
		if a.Ref.Kind != FeishuResourceKindBitable {
			return model.ErrValidation("bitable write action requires a bitable URL")
		}
		if strings.TrimSpace(a.TableID) == "" || len(a.Records) == 0 {
			return model.ErrValidation("bitable update records requires table_id and records")
		}
		for _, record := range a.Records {
			if strings.TrimSpace(record.RecordID) == "" || len(record.Fields) == 0 {
				return model.ErrValidation("bitable update records requires record_id and fields")
			}
		}
	default:
		return model.ErrValidation("unsupported feishu write operation")
	}
	return nil
}

func (a *FeishuAdapter) ExecuteFeishuResourceWrite(ctx context.Context, action FeishuResourceWriteAction) (*FeishuResourceWriteResult, error) {
	if a == nil {
		return nil, model.ErrNotConfigured("feishu adapter is not configured")
	}
	if err := action.Validate(); err != nil {
		return nil, err
	}
	token, err := a.resolveFeishuResourceWriteToken(ctx, action)
	if err != nil {
		return nil, err
	}
	switch action.Operation {
	case FeishuResourceWriteOperationDocxAppendSection:
		if a.appendDocxSection == nil {
			return nil, model.ErrNotConfigured("feishu docx writer is not configured")
		}
		if err := a.appendDocxSection(ctx, token, action.SectionTitle, action.Markdown); err != nil {
			return nil, err
		}
	case FeishuResourceWriteOperationDocxAppendMarkdown:
		if a.appendDocxMarkdown == nil {
			return nil, model.ErrNotConfigured("feishu docx writer is not configured")
		}
		if err := a.appendDocxMarkdown(ctx, token, action.Markdown); err != nil {
			return nil, err
		}
	case FeishuResourceWriteOperationSheetAppendRows:
		if a.appendSheetRows == nil {
			return nil, model.ErrNotConfigured("feishu sheet writer is not configured")
		}
		if err := a.appendSheetRows(ctx, token, action.Range, action.Rows); err != nil {
			return nil, err
		}
	case FeishuResourceWriteOperationSheetUpdateRange:
		if a.updateSheetRange == nil {
			return nil, model.ErrNotConfigured("feishu sheet writer is not configured")
		}
		if err := a.updateSheetRange(ctx, token, action.Range, action.Values); err != nil {
			return nil, err
		}
	case FeishuResourceWriteOperationBitableCreateRecords:
		if a.createBitableRecords == nil {
			return nil, model.ErrNotConfigured("feishu bitable writer is not configured")
		}
		if err := a.createBitableRecords(ctx, token, action.TableID, action.Records); err != nil {
			return nil, err
		}
	case FeishuResourceWriteOperationBitableUpdateRecords:
		if a.updateBitableRecords == nil {
			return nil, model.ErrNotConfigured("feishu bitable writer is not configured")
		}
		if err := a.updateBitableRecords(ctx, token, action.TableID, action.Records); err != nil {
			return nil, err
		}
	default:
		return nil, model.ErrValidation("unsupported feishu write operation")
	}
	return &FeishuResourceWriteResult{
		Operation: action.Operation,
		URL:       action.Ref.URL,
		Kind:      action.Ref.Kind,
		Token:     token,
	}, nil
}

func (a *FeishuAdapter) resolveFeishuResourceWriteToken(ctx context.Context, action FeishuResourceWriteAction) (string, error) {
	token := strings.TrimSpace(action.Ref.Token)
	if action.Ref.Kind != FeishuResourceKindWiki {
		return token, nil
	}
	node, err := a.ReadWikiNode(ctx, token)
	if err != nil {
		return "", err
	}
	if node == nil || !strings.EqualFold(strings.TrimSpace(node.ObjType), "docx") || strings.TrimSpace(node.ObjToken) == "" {
		return "", model.ErrValidation("wiki write action requires a docx wiki node")
	}
	return strings.TrimSpace(node.ObjToken), nil
}

func (a *FeishuAdapter) appendDocxSectionViaAPI(ctx context.Context, documentID string, title string, markdown string) error {
	blocks := buildFeishuDocxAppendBlocks(title, markdown)
	return a.createDocxChildrenViaAPI(ctx, documentID, blocks)
}

func (a *FeishuAdapter) appendDocxMarkdownViaAPI(ctx context.Context, documentID string, markdown string) error {
	return a.createDocxChildrenViaAPI(ctx, documentID, buildFeishuDocxAppendBlocks("", markdown))
}

func (a *FeishuAdapter) createDocxChildrenViaAPI(ctx context.Context, documentID string, blocks []*larkdocx.Block) error {
	if a == nil || a.larkClient == nil {
		return model.ErrNotConfigured("feishu direct api is not configured")
	}
	req := larkdocx.NewCreateDocumentBlockChildrenReqBuilder().
		DocumentId(documentID).
		BlockId(documentID).
		DocumentRevisionId(-1).
		Body(larkdocx.NewCreateDocumentBlockChildrenReqBodyBuilder().Children(blocks).Build()).
		Build()
	resp, err := a.larkClient.Docx.DocumentBlockChildren.Create(ctx, req)
	if err != nil {
		return classifyFeishuResourceReadError("append feishu docx children", 0, err.Error(), err)
	}
	if !resp.Success() {
		return classifyFeishuResourceReadError("append feishu docx children", resp.Code, resp.Msg, nil)
	}
	return nil
}

func (a *FeishuAdapter) appendSheetRowsViaAPI(ctx context.Context, spreadsheetToken string, rangeStr string, rows [][]any) error {
	body := map[string]any{
		"valueRange": map[string]any{
			"range":  rangeStr,
			"values": rows,
		},
		"insertDataOption": "INSERT_ROWS",
	}
	return a.callSheetValuesWriteAPI(ctx, spreadsheetToken, "values_append", body)
}

func (a *FeishuAdapter) updateSheetRangeViaAPI(ctx context.Context, spreadsheetToken string, rangeStr string, values [][]any) error {
	body := map[string]any{
		"valueRange": map[string]any{
			"range":  rangeStr,
			"values": values,
		},
	}
	return a.callSheetValuesWriteAPI(ctx, spreadsheetToken, "values", body)
}

func (a *FeishuAdapter) callSheetValuesWriteAPI(ctx context.Context, spreadsheetToken string, operation string, body map[string]any) error {
	if a == nil || a.larkClient == nil {
		return model.ErrNotConfigured("feishu direct api is not configured")
	}
	apiPath := fmt.Sprintf("/open-apis/sheets/v2/spreadsheets/%s/%s", spreadsheetToken, operation)
	var resp *larkcore.ApiResp
	var err error
	if operation == "values" {
		resp, err = a.larkClient.Put(ctx, apiPath, body, larkcore.AccessTokenTypeTenant)
	} else {
		resp, err = a.larkClient.Post(ctx, apiPath, body, larkcore.AccessTokenTypeTenant)
	}
	if err != nil {
		return classifyFeishuResourceReadError("write feishu sheet values", 0, err.Error(), err)
	}
	var payload larkcore.CodeError
	if err := json.Unmarshal(resp.RawBody, &payload); err != nil {
		return classifyFeishuResourceReadError("write feishu sheet values", 0, err.Error(), err)
	}
	if payload.Code != 0 {
		return classifyFeishuResourceReadError("write feishu sheet values", payload.Code, payload.Msg, nil)
	}
	return nil
}

func (a *FeishuAdapter) createBitableRecordsViaAPI(ctx context.Context, appToken string, tableID string, records []FeishuBitableRecordWrite) error {
	if a == nil || a.larkClient == nil {
		return model.ErrNotConfigured("feishu direct api is not configured")
	}
	req := larkbitable.NewBatchCreateAppTableRecordReqBuilder().
		AppToken(appToken).
		TableId(tableID).
		Body(larkbitable.NewBatchCreateAppTableRecordReqBodyBuilder().Records(toLarkBitableRecords(records)).Build()).
		Build()
	resp, err := a.larkClient.Bitable.AppTableRecord.BatchCreate(ctx, req)
	if err != nil {
		return classifyFeishuResourceReadError("create feishu bitable records", 0, err.Error(), err)
	}
	if !resp.Success() {
		return classifyFeishuResourceReadError("create feishu bitable records", resp.Code, resp.Msg, nil)
	}
	return nil
}

func (a *FeishuAdapter) updateBitableRecordsViaAPI(ctx context.Context, appToken string, tableID string, records []FeishuBitableRecordWrite) error {
	if a == nil || a.larkClient == nil {
		return model.ErrNotConfigured("feishu direct api is not configured")
	}
	req := larkbitable.NewBatchUpdateAppTableRecordReqBuilder().
		AppToken(appToken).
		TableId(tableID).
		Body(larkbitable.NewBatchUpdateAppTableRecordReqBodyBuilder().Records(toLarkBitableRecords(records)).Build()).
		Build()
	resp, err := a.larkClient.Bitable.AppTableRecord.BatchUpdate(ctx, req)
	if err != nil {
		return classifyFeishuResourceReadError("update feishu bitable records", 0, err.Error(), err)
	}
	if !resp.Success() {
		return classifyFeishuResourceReadError("update feishu bitable records", resp.Code, resp.Msg, nil)
	}
	return nil
}

func buildFeishuDocxAppendBlocks(title string, markdown string) []*larkdocx.Block {
	blocks := make([]*larkdocx.Block, 0, 2)
	if strings.TrimSpace(title) != "" {
		blocks = append(blocks, buildFeishuDocxTextBlock(3, strings.TrimSpace(title)))
	}
	if strings.TrimSpace(markdown) != "" {
		blocks = append(blocks, buildFeishuDocxTextBlock(2, strings.TrimSpace(markdown)))
	}
	return blocks
}

func buildFeishuDocxTextBlock(blockType int, content string) *larkdocx.Block {
	text := larkdocx.NewTextBuilder().
		Elements([]*larkdocx.TextElement{
			larkdocx.NewTextElementBuilder().
				TextRun(larkdocx.NewTextRunBuilder().Content(content).Build()).
				Build(),
		}).
		Build()
	builder := larkdocx.NewBlockBuilder().BlockType(blockType)
	if blockType == 3 {
		return builder.Heading1(text).Build()
	}
	return builder.Text(text).Build()
}

func toLarkBitableRecords(records []FeishuBitableRecordWrite) []*larkbitable.AppTableRecord {
	out := make([]*larkbitable.AppTableRecord, 0, len(records))
	for _, record := range records {
		out = append(out, &larkbitable.AppTableRecord{
			RecordId: stringPtr(strings.TrimSpace(record.RecordID)),
			Fields:   record.Fields,
		})
	}
	return out
}

func stringPtr(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}
