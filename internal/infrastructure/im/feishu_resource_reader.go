package im

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
	larkbitable "github.com/larksuite/oapi-sdk-go/v3/service/bitable/v1"
	larkdocx "github.com/larksuite/oapi-sdk-go/v3/service/docx/v1"
	larksheets "github.com/larksuite/oapi-sdk-go/v3/service/sheets/v3"
	larkwiki "github.com/larksuite/oapi-sdk-go/v3/service/wiki/v2"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type FeishuDocxReadResult struct {
	DocumentID string
	Title      string
	Content    string
}

type FeishuWikiNodeResult struct {
	NodeToken string
	ObjToken  string
	ObjType   string
	Title     string
}

type FeishuSheetReadOptions struct {
	MaxRows    int
	MaxColumns int
}

type FeishuSheetReadResult struct {
	SpreadsheetToken string
	Title            string
	Sheets           []FeishuSheetPreview
}

type FeishuSheetPreview struct {
	SheetID string
	Title   string
	Range   string
	Values  [][]any
}

type FeishuBitableReadOptions struct {
	MaxRecordsPerTable int
}

type FeishuBitableReadResult struct {
	AppToken string
	Name     string
	Tables   []FeishuBitableTablePreview
}

type FeishuBitableTablePreview struct {
	TableID string
	Name    string
	Fields  []FeishuBitableFieldPreview
	Records []FeishuBitableRecordPreview
}

type FeishuBitableFieldPreview struct {
	FieldID string
	Name    string
	UIType  string
	Type    int
}

type FeishuBitableRecordPreview struct {
	RecordID string
	Fields   map[string]any
}

type FeishuResourceReadOptions struct {
	Sheet   FeishuSheetReadOptions
	Bitable FeishuBitableReadOptions
}

type FeishuResourceReadResult struct {
	Ref      FeishuResourceRef
	Title    string
	ReadMode string
	Content  string
	Docx     *FeishuDocxReadResult
	WikiNode *FeishuWikiNodeResult
	Sheet    *FeishuSheetReadResult
	Bitable  *FeishuBitableReadResult
}

type FeishuResourceReadError struct {
	Operation     string
	Code          string
	APIStatusCode int
	Message       string
	Err           error
}

func (e *FeishuResourceReadError) Error() string {
	if e == nil {
		return ""
	}
	if e.APIStatusCode != 0 {
		return fmt.Sprintf("%s: %s: code=%d msg=%s", e.Operation, e.Code, e.APIStatusCode, e.Message)
	}
	return fmt.Sprintf("%s: %s: %s", e.Operation, e.Code, e.Message)
}

func (e *FeishuResourceReadError) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Err
}

func (a *FeishuAdapter) ReadDocxRawContent(ctx context.Context, documentID string) (*FeishuDocxReadResult, error) {
	if a == nil || a.readDocxRawContent == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	documentID = strings.TrimSpace(documentID)
	if documentID == "" {
		return nil, model.ErrValidation("feishu document id is required")
	}
	return a.readDocxRawContent(ctx, documentID)
}

func (a *FeishuAdapter) ReadWikiNode(ctx context.Context, nodeToken string) (*FeishuWikiNodeResult, error) {
	if a == nil || a.readWikiNode == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	nodeToken = strings.TrimSpace(nodeToken)
	if nodeToken == "" {
		return nil, model.ErrValidation("feishu wiki node token is required")
	}
	return a.readWikiNode(ctx, nodeToken)
}

func (a *FeishuAdapter) ReadSheetPreview(ctx context.Context, spreadsheetToken string, options FeishuSheetReadOptions) (*FeishuSheetReadResult, error) {
	if a == nil || a.readSheetPreview == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	spreadsheetToken = strings.TrimSpace(spreadsheetToken)
	if spreadsheetToken == "" {
		return nil, model.ErrValidation("feishu spreadsheet token is required")
	}
	return a.readSheetPreview(ctx, spreadsheetToken, normalizeSheetReadOptions(options))
}

func (a *FeishuAdapter) ReadBitablePreview(ctx context.Context, appToken string, options FeishuBitableReadOptions) (*FeishuBitableReadResult, error) {
	if a == nil || a.readBitablePreview == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	appToken = strings.TrimSpace(appToken)
	if appToken == "" {
		return nil, model.ErrValidation("feishu bitable app token is required")
	}
	return a.readBitablePreview(ctx, appToken, normalizeBitableReadOptions(options))
}

func (a *FeishuAdapter) ReadFeishuResource(ctx context.Context, ref FeishuResourceRef, options FeishuResourceReadOptions) (*FeishuResourceReadResult, error) {
	ref.Token = strings.TrimSpace(ref.Token)
	if ref.Token == "" {
		return nil, model.ErrValidation("feishu resource token is required")
	}

	switch ref.Kind {
	case FeishuResourceKindDocx:
		docx, err := a.ReadDocxRawContent(ctx, ref.Token)
		if err != nil {
			return nil, err
		}
		return &FeishuResourceReadResult{
			Ref:      ref,
			Title:    docx.Title,
			ReadMode: "docx_raw",
			Content:  docx.Content,
			Docx:     docx,
		}, nil
	case FeishuResourceKindWiki:
		node, err := a.ReadWikiNode(ctx, ref.Token)
		if err != nil {
			return nil, err
		}
		if strings.EqualFold(strings.TrimSpace(node.ObjType), "docx") && strings.TrimSpace(node.ObjToken) != "" {
			docx, err := a.ReadDocxRawContent(ctx, node.ObjToken)
			if err != nil {
				return nil, err
			}
			title := strings.TrimSpace(node.Title)
			if title == "" {
				title = docx.Title
			}
			return &FeishuResourceReadResult{
				Ref:      ref,
				Title:    title,
				ReadMode: "wiki_docx_raw",
				Content:  docx.Content,
				Docx:     docx,
				WikiNode: node,
			}, nil
		}
		return &FeishuResourceReadResult{
			Ref:      ref,
			Title:    node.Title,
			ReadMode: "wiki_node",
			Content:  renderJSON(map[string]any{"node_token": node.NodeToken, "obj_token": node.ObjToken, "obj_type": node.ObjType, "title": node.Title}),
			WikiNode: node,
		}, nil
	case FeishuResourceKindSheet:
		sheet, err := a.ReadSheetPreview(ctx, ref.Token, options.Sheet)
		if err != nil {
			return nil, err
		}
		return &FeishuResourceReadResult{
			Ref:      ref,
			Title:    sheet.Title,
			ReadMode: "sheet_preview",
			Content:  renderSheetPreview(sheet),
			Sheet:    sheet,
		}, nil
	case FeishuResourceKindBitable:
		bitable, err := a.ReadBitablePreview(ctx, ref.Token, options.Bitable)
		if err != nil {
			return nil, err
		}
		return &FeishuResourceReadResult{
			Ref:      ref,
			Title:    bitable.Name,
			ReadMode: "bitable_preview",
			Content:  renderBitablePreview(bitable),
			Bitable:  bitable,
		}, nil
	default:
		return nil, model.ErrValidation("unsupported feishu resource type")
	}
}

func (a *FeishuAdapter) readDocxRawContentViaAPI(ctx context.Context, documentID string) (*FeishuDocxReadResult, error) {
	if a == nil || a.larkClient == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	req := larkdocx.NewRawContentDocumentReqBuilder().DocumentId(documentID).Build()
	resp, err := a.larkClient.Docx.Document.RawContent(ctx, req)
	if err != nil {
		return nil, classifyFeishuResourceReadError("read feishu docx raw content", 0, err.Error(), err)
	}
	if !resp.Success() {
		return nil, classifyFeishuResourceReadError("read feishu docx raw content", resp.Code, resp.Msg, nil)
	}
	content := ""
	if resp.Data != nil && resp.Data.Content != nil {
		content = *resp.Data.Content
	}
	return &FeishuDocxReadResult{DocumentID: documentID, Content: content}, nil
}

func (a *FeishuAdapter) readWikiNodeViaAPI(ctx context.Context, nodeToken string) (*FeishuWikiNodeResult, error) {
	if a == nil || a.larkClient == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	req := larkwiki.NewGetNodeSpaceReqBuilder().Token(nodeToken).Build()
	resp, err := a.larkClient.Wiki.Space.GetNode(ctx, req)
	if err != nil {
		return nil, classifyFeishuResourceReadError("read feishu wiki node", 0, err.Error(), err)
	}
	if !resp.Success() {
		return nil, classifyFeishuResourceReadError("read feishu wiki node", resp.Code, resp.Msg, nil)
	}
	if resp.Data == nil || resp.Data.Node == nil {
		return &FeishuWikiNodeResult{NodeToken: nodeToken}, nil
	}
	node := resp.Data.Node
	return &FeishuWikiNodeResult{
		NodeToken: firstNonEmpty(stringPtrValue(node.NodeToken), nodeToken),
		ObjToken:  stringPtrValue(node.ObjToken),
		ObjType:   stringPtrValue(node.ObjType),
		Title:     stringPtrValue(node.Title),
	}, nil
}

func (a *FeishuAdapter) readSheetPreviewViaAPI(ctx context.Context, spreadsheetToken string, options FeishuSheetReadOptions) (*FeishuSheetReadResult, error) {
	if a == nil || a.larkClient == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	options = normalizeSheetReadOptions(options)
	result := &FeishuSheetReadResult{SpreadsheetToken: spreadsheetToken}

	spreadsheetReq := larksheets.NewGetSpreadsheetReqBuilder().
		SpreadsheetToken(spreadsheetToken).
		Build()
	spreadsheetResp, err := a.larkClient.Sheets.Spreadsheet.Get(ctx, spreadsheetReq)
	if err != nil {
		return nil, classifyFeishuResourceReadError("read feishu spreadsheet metadata", 0, err.Error(), err)
	}
	if !spreadsheetResp.Success() {
		return nil, classifyFeishuResourceReadError("read feishu spreadsheet metadata", spreadsheetResp.Code, spreadsheetResp.Msg, nil)
	}
	if spreadsheetResp.Data != nil && spreadsheetResp.Data.Spreadsheet != nil {
		result.Title = stringPtrValue(spreadsheetResp.Data.Spreadsheet.Title)
	}

	sheetsReq := larksheets.NewQuerySpreadsheetSheetReqBuilder().
		SpreadsheetToken(spreadsheetToken).
		Build()
	sheetsResp, err := a.larkClient.Sheets.SpreadsheetSheet.Query(ctx, sheetsReq)
	if err != nil {
		return nil, classifyFeishuResourceReadError("read feishu spreadsheet sheets", 0, err.Error(), err)
	}
	if !sheetsResp.Success() {
		return nil, classifyFeishuResourceReadError("read feishu spreadsheet sheets", sheetsResp.Code, sheetsResp.Msg, nil)
	}
	if sheetsResp.Data == nil {
		return result, nil
	}
	for _, sheet := range sheetsResp.Data.Sheets {
		if sheet == nil || stringPtrValue(sheet.SheetId) == "" {
			continue
		}
		preview := FeishuSheetPreview{
			SheetID: stringPtrValue(sheet.SheetId),
			Title:   stringPtrValue(sheet.Title),
			Range:   buildSheetPreviewRange(sheet, options),
		}
		values, err := a.readSheetValues(ctx, spreadsheetToken, preview.Range)
		if err != nil {
			return nil, err
		}
		preview.Values = values
		result.Sheets = append(result.Sheets, preview)
	}
	return result, nil
}

func (a *FeishuAdapter) readBitablePreviewViaAPI(ctx context.Context, appToken string, options FeishuBitableReadOptions) (*FeishuBitableReadResult, error) {
	if a == nil || a.larkClient == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	options = normalizeBitableReadOptions(options)
	result := &FeishuBitableReadResult{AppToken: appToken}

	appReq := larkbitable.NewGetAppReqBuilder().AppToken(appToken).Build()
	appResp, err := a.larkClient.Bitable.App.Get(ctx, appReq)
	if err != nil {
		return nil, classifyFeishuResourceReadError("read feishu bitable metadata", 0, err.Error(), err)
	}
	if !appResp.Success() {
		return nil, classifyFeishuResourceReadError("read feishu bitable metadata", appResp.Code, appResp.Msg, nil)
	}
	if appResp.Data != nil && appResp.Data.App != nil {
		result.Name = stringPtrValue(appResp.Data.App.Name)
	}

	tableReq := larkbitable.NewListAppTableReqBuilder().AppToken(appToken).PageSize(20).Build()
	tableResp, err := a.larkClient.Bitable.AppTable.List(ctx, tableReq)
	if err != nil {
		return nil, classifyFeishuResourceReadError("read feishu bitable tables", 0, err.Error(), err)
	}
	if !tableResp.Success() {
		return nil, classifyFeishuResourceReadError("read feishu bitable tables", tableResp.Code, tableResp.Msg, nil)
	}
	if tableResp.Data == nil {
		return result, nil
	}
	for _, table := range tableResp.Data.Items {
		if table == nil || stringPtrValue(table.TableId) == "" {
			continue
		}
		preview, err := a.readBitableTablePreview(ctx, appToken, table, options)
		if err != nil {
			return nil, err
		}
		result.Tables = append(result.Tables, preview)
	}
	return result, nil
}

func (a *FeishuAdapter) readBitableTablePreview(ctx context.Context, appToken string, table *larkbitable.AppTable, options FeishuBitableReadOptions) (FeishuBitableTablePreview, error) {
	preview := FeishuBitableTablePreview{
		TableID: stringPtrValue(table.TableId),
		Name:    stringPtrValue(table.Name),
	}

	fieldReq := larkbitable.NewListAppTableFieldReqBuilder().
		AppToken(appToken).
		TableId(preview.TableID).
		PageSize(50).
		TextFieldAsArray(true).
		Build()
	fieldResp, err := a.larkClient.Bitable.AppTableField.List(ctx, fieldReq)
	if err != nil {
		return preview, classifyFeishuResourceReadError("read feishu bitable fields", 0, err.Error(), err)
	}
	if !fieldResp.Success() {
		return preview, classifyFeishuResourceReadError("read feishu bitable fields", fieldResp.Code, fieldResp.Msg, nil)
	}
	if fieldResp.Data != nil {
		for _, field := range fieldResp.Data.Items {
			if field == nil {
				continue
			}
			preview.Fields = append(preview.Fields, FeishuBitableFieldPreview{
				FieldID: stringPtrValue(field.FieldId),
				Name:    stringPtrValue(field.FieldName),
				UIType:  stringPtrValue(field.UiType),
				Type:    intPtrValue(field.Type),
			})
		}
	}

	recordReq := larkbitable.NewListAppTableRecordReqBuilder().
		AppToken(appToken).
		TableId(preview.TableID).
		PageSize(options.MaxRecordsPerTable).
		TextFieldAsArray(true).
		UserIdType("open_id").
		Build()
	recordResp, err := a.larkClient.Bitable.AppTableRecord.List(ctx, recordReq)
	if err != nil {
		return preview, classifyFeishuResourceReadError("read feishu bitable records", 0, err.Error(), err)
	}
	if !recordResp.Success() {
		return preview, classifyFeishuResourceReadError("read feishu bitable records", recordResp.Code, recordResp.Msg, nil)
	}
	if recordResp.Data != nil {
		for _, record := range recordResp.Data.Items {
			if record == nil {
				continue
			}
			preview.Records = append(preview.Records, FeishuBitableRecordPreview{
				RecordID: stringPtrValue(record.RecordId),
				Fields:   record.Fields,
			})
		}
	}
	return preview, nil
}

func (a *FeishuAdapter) readSheetValues(ctx context.Context, spreadsheetToken string, rangeStr string) ([][]any, error) {
	if strings.TrimSpace(rangeStr) == "" {
		return nil, nil
	}
	encodedRange := strings.ReplaceAll(rangeStr, "!", "%21")
	apiPath := fmt.Sprintf("/open-apis/sheets/v2/spreadsheets/%s/values/%s", spreadsheetToken, encodedRange)
	resp, err := a.larkClient.Get(ctx, apiPath, nil, larkcore.AccessTokenTypeTenant)
	if err != nil {
		return nil, classifyFeishuResourceReadError("read feishu sheet values", 0, err.Error(), err)
	}
	var payload struct {
		larkcore.CodeError
		Data struct {
			ValueRange struct {
				Range  string  `json:"range"`
				Values [][]any `json:"values"`
			} `json:"valueRange"`
		} `json:"data"`
	}
	if err := json.Unmarshal(resp.RawBody, &payload); err != nil {
		return nil, classifyFeishuResourceReadError("read feishu sheet values", 0, err.Error(), err)
	}
	if payload.Code != 0 {
		return nil, classifyFeishuResourceReadError("read feishu sheet values", payload.Code, payload.Msg, nil)
	}
	return payload.Data.ValueRange.Values, nil
}

func classifyFeishuResourceReadError(operation string, apiStatusCode int, message string, err error) error {
	code := "api_error"
	lowerMessage := strings.ToLower(message)
	if apiStatusCode == 99991663 || strings.Contains(lowerMessage, "permission") || strings.Contains(lowerMessage, "forbidden") || strings.Contains(lowerMessage, "no access") {
		code = "permission_denied"
	} else if apiStatusCode == 404 || strings.Contains(lowerMessage, "not found") {
		code = "not_found"
	} else if apiStatusCode == 0 && err != nil {
		code = "transport_error"
	}
	return &FeishuResourceReadError{
		Operation:     operation,
		Code:          code,
		APIStatusCode: apiStatusCode,
		Message:       message,
		Err:           err,
	}
}

func normalizeSheetReadOptions(options FeishuSheetReadOptions) FeishuSheetReadOptions {
	if options.MaxRows <= 0 {
		options.MaxRows = 20
	}
	if options.MaxRows > 100 {
		options.MaxRows = 100
	}
	if options.MaxColumns <= 0 {
		options.MaxColumns = 10
	}
	if options.MaxColumns > 26 {
		options.MaxColumns = 26
	}
	return options
}

func normalizeBitableReadOptions(options FeishuBitableReadOptions) FeishuBitableReadOptions {
	if options.MaxRecordsPerTable <= 0 {
		options.MaxRecordsPerTable = 20
	}
	if options.MaxRecordsPerTable > 100 {
		options.MaxRecordsPerTable = 100
	}
	return options
}

func buildSheetPreviewRange(sheet *larksheets.Sheet, options FeishuSheetReadOptions) string {
	sheetID := stringPtrValue(sheet.SheetId)
	rows := options.MaxRows
	columns := options.MaxColumns
	if sheet.GridProperties != nil {
		if sheet.GridProperties.RowCount != nil && *sheet.GridProperties.RowCount > 0 && *sheet.GridProperties.RowCount < rows {
			rows = *sheet.GridProperties.RowCount
		}
		if sheet.GridProperties.ColumnCount != nil && *sheet.GridProperties.ColumnCount > 0 && *sheet.GridProperties.ColumnCount < columns {
			columns = *sheet.GridProperties.ColumnCount
		}
	}
	return fmt.Sprintf("%s!A1:%s%d", sheetID, columnName(columns), rows)
}

func columnName(index int) string {
	if index <= 0 {
		return "A"
	}
	var out []byte
	for index > 0 {
		index--
		out = append([]byte{byte('A' + index%26)}, out...)
		index /= 26
	}
	return string(out)
}

func renderSheetPreview(result *FeishuSheetReadResult) string {
	if result == nil {
		return ""
	}
	return renderJSON(result)
}

func renderBitablePreview(result *FeishuBitableReadResult) string {
	if result == nil {
		return ""
	}
	return renderJSON(result)
}

func renderJSON(value any) string {
	raw, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return fmt.Sprint(value)
	}
	return string(raw)
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}

func stringPtrValue(value *string) string {
	if value == nil {
		return ""
	}
	return strings.TrimSpace(*value)
}

func intPtrValue(value *int) int {
	if value == nil {
		return 0
	}
	return *value
}

var _ error = (*FeishuResourceReadError)(nil)
