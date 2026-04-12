package im

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"

	larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
	larkbitable "github.com/larksuite/oapi-sdk-go/v3/service/bitable/v1"
	larkdocx "github.com/larksuite/oapi-sdk-go/v3/service/docx/v1"
	larksheets "github.com/larksuite/oapi-sdk-go/v3/service/sheets/v3"
	"gitlab.knoffice.tech/engineering/anycap/internal/domain/model"
)

type FeishuResourceWriteOperation string

const (
	FeishuResourceWriteOperationDocxCreate                FeishuResourceWriteOperation = "docx.create"
	FeishuResourceWriteOperationDocxAppendSection         FeishuResourceWriteOperation = "docx.append_section"
	FeishuResourceWriteOperationDocxAppendMarkdown        FeishuResourceWriteOperation = "docx.append_markdown"
	FeishuResourceWriteOperationDocxAppendUnderHeading    FeishuResourceWriteOperation = "docx.append_under_heading"
	FeishuResourceWriteOperationDocxReplaceHeadingSection FeishuResourceWriteOperation = "docx.replace_heading_section"
	FeishuResourceWriteOperationDocxInspectHeadings       FeishuResourceWriteOperation = "docx.inspect_headings"
	FeishuResourceWriteOperationSheetCreate               FeishuResourceWriteOperation = "sheet.create"
	FeishuResourceWriteOperationSheetAppendRows           FeishuResourceWriteOperation = "sheet.append_rows"
	FeishuResourceWriteOperationSheetUpdateRange          FeishuResourceWriteOperation = "sheet.update_range"
	FeishuResourceWriteOperationBitableCreate             FeishuResourceWriteOperation = "bitable.create"
	FeishuResourceWriteOperationBitableCreateRecords      FeishuResourceWriteOperation = "bitable.create_records"
	FeishuResourceWriteOperationBitableUpdateRecords      FeishuResourceWriteOperation = "bitable.update_records"
)

type FeishuResourceWriteAction struct {
	Operation    FeishuResourceWriteOperation `json:"operation"`
	URL          string                       `json:"url"`
	SourceURL    string                       `json:"source_url,omitempty"`
	Ref          FeishuResourceRef            `json:"-"`
	Title        string                       `json:"title,omitempty"`
	FolderToken  string                       `json:"folder_token,omitempty"`
	SectionTitle string                       `json:"section_title,omitempty"`
	Heading      string                       `json:"heading,omitempty"`
	HeadingLevel int                          `json:"heading_level,omitempty"`
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
	Operation              FeishuResourceWriteOperation
	URL                    string
	Kind                   FeishuResourceKind
	Token                  string
	Title                  string
	Headings               []FeishuDocxHeadingInspection
	DuplicateHeadings      []string
	Verification           *FeishuDocxHeadingInspection
	VerificationTextLength int
	VerificationError      string
}

type FeishuDocxCreateResult struct {
	DocumentID string
	Title      string
	URL        string
}

type FeishuSheetCreateResult struct {
	SpreadsheetToken string
	Title            string
	URL              string
}

type FeishuBitableCreateResult struct {
	AppToken string
	Title    string
	URL      string
}

type FeishuDocxHeadingInspection struct {
	Level        int    `json:"level"`
	Text         string `json:"text"`
	Index        int    `json:"index"`
	SectionStart int    `json:"section_start"`
	SectionEnd   int    `json:"section_end"`
}

type FeishuDocxHeadingInspectResult struct {
	Headings          []FeishuDocxHeadingInspection `json:"headings,omitempty"`
	DuplicateHeadings []string                      `json:"duplicate_headings,omitempty"`
}

func ParseFeishuResourceWriteAction(raw []byte) (*FeishuResourceWriteAction, error) {
	var action FeishuResourceWriteAction
	if err := json.Unmarshal(raw, &action); err != nil {
		return nil, fmt.Errorf("parse feishu resource write action: %w", err)
	}
	action.Operation = FeishuResourceWriteOperation(strings.TrimSpace(string(action.Operation)))
	action.URL = strings.TrimSpace(action.URL)
	action.SourceURL = strings.TrimSpace(action.SourceURL)
	action.Title = strings.TrimSpace(action.Title)
	action.FolderToken = strings.TrimSpace(action.FolderToken)
	action.SectionTitle = strings.TrimSpace(action.SectionTitle)
	action.Heading = strings.TrimSpace(action.Heading)
	action.Markdown = strings.TrimSpace(action.Markdown)
	action.Range = strings.TrimSpace(action.Range)
	action.TableID = strings.TrimSpace(action.TableID)

	if !action.createsNewResource() {
		ref, ok := parseFeishuResourceURL(action.URL)
		if !ok {
			return nil, model.ErrValidation("feishu write action requires an explicit supported Feishu resource URL")
		}
		action.Ref = ref
	}
	if err := action.Validate(); err != nil {
		return nil, err
	}
	return &action, nil
}

func (a FeishuResourceWriteAction) Validate() error {
	switch a.Operation {
	case FeishuResourceWriteOperationDocxCreate:
		if strings.TrimSpace(a.Title) == "" || strings.TrimSpace(a.Markdown) == "" {
			return model.ErrValidation("docx create requires title and markdown")
		}
	case FeishuResourceWriteOperationSheetCreate:
		if strings.TrimSpace(a.Title) == "" {
			return model.ErrValidation("sheet create requires title")
		}
		if len(a.Values) > 0 && strings.TrimSpace(a.Range) == "" {
			return model.ErrValidation("sheet create with values requires range")
		}
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
	case FeishuResourceWriteOperationDocxAppendUnderHeading:
		if a.Ref.Kind != FeishuResourceKindDocx && a.Ref.Kind != FeishuResourceKindWiki {
			return model.ErrValidation("docx write action requires a docx or wiki URL")
		}
		if strings.TrimSpace(a.Heading) == "" || strings.TrimSpace(a.Markdown) == "" {
			return model.ErrValidation("docx append under heading requires heading and markdown")
		}
		if a.HeadingLevel < 0 || a.HeadingLevel > 9 {
			return model.ErrValidation("docx append under heading requires heading_level between 1 and 9 when provided")
		}
	case FeishuResourceWriteOperationDocxReplaceHeadingSection:
		if a.Ref.Kind != FeishuResourceKindDocx && a.Ref.Kind != FeishuResourceKindWiki {
			return model.ErrValidation("docx write action requires a docx or wiki URL")
		}
		if strings.TrimSpace(a.Heading) == "" || strings.TrimSpace(a.Markdown) == "" {
			return model.ErrValidation("docx replace heading section requires heading and markdown")
		}
		if a.HeadingLevel < 0 || a.HeadingLevel > 9 {
			return model.ErrValidation("docx replace heading section requires heading_level between 1 and 9 when provided")
		}
	case FeishuResourceWriteOperationDocxInspectHeadings:
		if a.Ref.Kind != FeishuResourceKindDocx && a.Ref.Kind != FeishuResourceKindWiki {
			return model.ErrValidation("docx inspect headings action requires a docx or wiki URL")
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
	case FeishuResourceWriteOperationBitableCreate:
		if strings.TrimSpace(a.Title) == "" {
			return model.ErrValidation("bitable create requires title")
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

func (a FeishuResourceWriteAction) createsNewResource() bool {
	switch a.Operation {
	case FeishuResourceWriteOperationDocxCreate,
		FeishuResourceWriteOperationSheetCreate,
		FeishuResourceWriteOperationBitableCreate:
		return true
	default:
		return false
	}
}

func (a *FeishuAdapter) ExecuteFeishuResourceWrite(ctx context.Context, action FeishuResourceWriteAction) (*FeishuResourceWriteResult, error) {
	if a == nil {
		return nil, model.ErrNotConfigured("feishu adapter is not configured")
	}
	if err := action.Validate(); err != nil {
		return nil, err
	}
	if action.Operation == FeishuResourceWriteOperationDocxCreate {
		if a.createDocx == nil {
			return nil, model.ErrNotConfigured("feishu docx creator is not configured")
		}
		created, err := a.createDocx(ctx, action.Title, action.Markdown, action.SourceURL, action.FolderToken)
		if err != nil {
			return nil, err
		}
		result := &FeishuResourceWriteResult{
			Operation: action.Operation,
			Kind:      FeishuResourceKindDocx,
			Title:     action.Title,
		}
		if created != nil {
			result.Token = strings.TrimSpace(created.DocumentID)
			result.Title = firstNonEmpty(created.Title, result.Title)
			result.URL = strings.TrimSpace(created.URL)
		}
		a.populateDocxCreateVerification(ctx, result)
		return result, nil
	}
	if action.Operation == FeishuResourceWriteOperationSheetCreate {
		if a.createSheet == nil {
			return nil, model.ErrNotConfigured("feishu sheet creator is not configured")
		}
		created, err := a.createSheet(ctx, action.Title, action.SourceURL, action.FolderToken)
		if err != nil {
			return nil, err
		}
		result := &FeishuResourceWriteResult{
			Operation: action.Operation,
			Kind:      FeishuResourceKindSheet,
			Title:     action.Title,
		}
		if created != nil {
			result.Token = strings.TrimSpace(created.SpreadsheetToken)
			result.Title = firstNonEmpty(created.Title, result.Title)
			result.URL = strings.TrimSpace(created.URL)
		}
		if len(action.Values) > 0 {
			if a.updateSheetRange == nil {
				return nil, model.ErrNotConfigured("feishu sheet writer is not configured")
			}
			if err := a.updateSheetRange(ctx, result.Token, action.Range, action.Values); err != nil {
				return nil, err
			}
		}
		return result, nil
	}
	if action.Operation == FeishuResourceWriteOperationBitableCreate {
		if a.createBitable == nil {
			return nil, model.ErrNotConfigured("feishu bitable creator is not configured")
		}
		created, err := a.createBitable(ctx, action.Title, action.SourceURL, action.FolderToken)
		if err != nil {
			return nil, err
		}
		result := &FeishuResourceWriteResult{
			Operation: action.Operation,
			Kind:      FeishuResourceKindBitable,
			Title:     action.Title,
		}
		if created != nil {
			result.Token = strings.TrimSpace(created.AppToken)
			result.Title = firstNonEmpty(created.Title, result.Title)
			result.URL = strings.TrimSpace(created.URL)
		}
		return result, nil
	}
	token, err := a.resolveFeishuResourceWriteToken(ctx, action)
	if err != nil {
		return nil, err
	}
	result := &FeishuResourceWriteResult{
		Operation: action.Operation,
		URL:       action.Ref.URL,
		Kind:      action.Ref.Kind,
		Token:     token,
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
	case FeishuResourceWriteOperationDocxAppendUnderHeading:
		if a.appendDocxUnderHeading == nil {
			return nil, model.ErrNotConfigured("feishu docx writer is not configured")
		}
		if err := a.appendDocxUnderHeading(ctx, token, action.Heading, action.HeadingLevel, action.Markdown); err != nil {
			return nil, err
		}
		a.populateDocxHeadingWriteVerification(ctx, result, token, action.Heading, action.HeadingLevel)
	case FeishuResourceWriteOperationDocxReplaceHeadingSection:
		if a.replaceDocxHeadingSection == nil {
			return nil, model.ErrNotConfigured("feishu docx writer is not configured")
		}
		if err := a.replaceDocxHeadingSection(ctx, token, action.Heading, action.HeadingLevel, action.Markdown); err != nil {
			return nil, err
		}
		a.populateDocxHeadingWriteVerification(ctx, result, token, action.Heading, action.HeadingLevel)
	case FeishuResourceWriteOperationDocxInspectHeadings:
		if a.inspectDocxHeadings == nil {
			return nil, model.ErrNotConfigured("feishu docx inspector is not configured")
		}
		inspection, err := a.inspectDocxHeadings(ctx, token)
		if err != nil {
			return nil, err
		}
		if inspection != nil {
			result.Headings = inspection.Headings
			result.DuplicateHeadings = inspection.DuplicateHeadings
		}
		return result, nil
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
	return result, nil
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

func (a *FeishuAdapter) populateDocxHeadingWriteVerification(ctx context.Context, result *FeishuResourceWriteResult, documentID string, heading string, headingLevel int) {
	if a == nil || result == nil || a.inspectDocxHeadings == nil {
		return
	}
	inspection, err := a.inspectDocxHeadings(ctx, documentID)
	if err != nil {
		result.VerificationError = err.Error()
		return
	}
	verification, err := findFeishuDocxHeadingInspection(inspection, heading, headingLevel)
	if err != nil {
		result.VerificationError = err.Error()
		return
	}
	result.Verification = verification
}

func (a *FeishuAdapter) populateDocxCreateVerification(ctx context.Context, result *FeishuResourceWriteResult) {
	if a == nil || result == nil || a.readDocxRawContent == nil {
		return
	}
	documentID := strings.TrimSpace(result.Token)
	if documentID == "" {
		return
	}
	readResult, err := a.readDocxRawContent(ctx, documentID)
	if err != nil {
		result.VerificationError = err.Error()
		return
	}
	if readResult == nil {
		return
	}
	result.VerificationTextLength = len([]rune(strings.TrimSpace(readResult.Content)))
}

func (a *FeishuAdapter) appendDocxSectionViaAPI(ctx context.Context, documentID string, title string, markdown string) error {
	return a.appendDocxMarkdownBlocksViaAPI(ctx, documentID, composeFeishuDocxSectionMarkdown(title, markdown))
}

func (a *FeishuAdapter) appendDocxMarkdownViaAPI(ctx context.Context, documentID string, markdown string) error {
	return a.appendDocxMarkdownBlocksViaAPI(ctx, documentID, markdown)
}

func (a *FeishuAdapter) appendDocxMarkdownBlocksViaAPI(ctx context.Context, documentID string, markdown string) error {
	return a.appendDocxMarkdownBlocksAtIndexViaAPI(ctx, documentID, markdown, -1)
}

func (a *FeishuAdapter) appendDocxUnderHeadingViaAPI(ctx context.Context, documentID string, heading string, headingLevel int, markdown string) error {
	children, err := a.getDocxRootChildrenViaAPI(ctx, documentID)
	if err != nil {
		return err
	}
	index, err := docxAppendUnderHeadingIndex(children, heading, headingLevel)
	if err != nil {
		return err
	}
	return a.appendDocxMarkdownBlocksAtIndexViaAPI(ctx, documentID, markdown, index)
}

func (a *FeishuAdapter) replaceDocxHeadingSectionViaAPI(ctx context.Context, documentID string, heading string, headingLevel int, markdown string) error {
	children, err := a.getDocxRootChildrenViaAPI(ctx, documentID)
	if err != nil {
		return err
	}
	startIndex, endIndex, err := docxHeadingSectionRange(children, heading, headingLevel)
	if err != nil {
		return err
	}
	if err := a.deleteDocxRootChildrenViaAPI(ctx, documentID, startIndex, endIndex); err != nil {
		return err
	}
	return a.appendDocxMarkdownBlocksAtIndexViaAPI(ctx, documentID, markdown, startIndex)
}

func (a *FeishuAdapter) inspectDocxHeadingsViaAPI(ctx context.Context, documentID string) (*FeishuDocxHeadingInspectResult, error) {
	children, err := a.getDocxRootChildrenViaAPI(ctx, documentID)
	if err != nil {
		return nil, err
	}
	result := inspectFeishuDocxHeadings(children)
	return &result, nil
}

func (a *FeishuAdapter) createDocxViaAPI(ctx context.Context, title string, markdown string, sourceURL string, folderToken string) (*FeishuDocxCreateResult, error) {
	if a == nil || a.larkClient == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	title = strings.TrimSpace(title)
	markdown = strings.TrimSpace(markdown)
	folderToken = strings.TrimSpace(folderToken)
	if title == "" || markdown == "" {
		return nil, model.ErrValidation("feishu docx create requires title and markdown")
	}
	bodyBuilder := larkdocx.NewCreateDocumentReqBodyBuilder().Title(title)
	if folderToken != "" {
		bodyBuilder.FolderToken(folderToken)
	}
	createReq := larkdocx.NewCreateDocumentReqBuilder().
		Body(bodyBuilder.Build()).
		Build()
	createResp, err := a.larkClient.Docx.Document.Create(ctx, createReq)
	if err != nil {
		return nil, classifyFeishuResourceReadError("create feishu docx", 0, err.Error(), err)
	}
	if !createResp.Success() {
		return nil, classifyFeishuResourceReadError("create feishu docx", createResp.Code, createResp.Msg, nil)
	}
	if createResp.Data == nil || createResp.Data.Document == nil || strings.TrimSpace(stringPtrValue(createResp.Data.Document.DocumentId)) == "" {
		return nil, model.ErrValidation("feishu docx create returned no document_id")
	}
	documentID := strings.TrimSpace(stringPtrValue(createResp.Data.Document.DocumentId))
	if err := a.appendDocxMarkdownBlocksViaAPI(ctx, documentID, markdown); err != nil {
		return nil, err
	}
	return &FeishuDocxCreateResult{
		DocumentID: documentID,
		Title:      firstNonEmpty(stringPtrValue(createResp.Data.Document.Title), title),
		URL:        inferCreatedFeishuResourceURL("docx", documentID, sourceURL),
	}, nil
}

func (a *FeishuAdapter) createSheetViaAPI(ctx context.Context, title string, sourceURL string, folderToken string) (*FeishuSheetCreateResult, error) {
	if a == nil || a.larkClient == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	title = strings.TrimSpace(title)
	folderToken = strings.TrimSpace(folderToken)
	if title == "" {
		return nil, model.ErrValidation("feishu sheet create requires title")
	}
	spreadsheetBuilder := larksheets.NewSpreadsheetBuilder().Title(title)
	if folderToken != "" {
		spreadsheetBuilder.FolderToken(folderToken)
	}
	createReq := larksheets.NewCreateSpreadsheetReqBuilder().
		Spreadsheet(spreadsheetBuilder.Build()).
		Build()
	createResp, err := a.larkClient.Sheets.Spreadsheet.Create(ctx, createReq)
	if err != nil {
		return nil, classifyFeishuResourceReadError("create feishu sheet", 0, err.Error(), err)
	}
	if !createResp.Success() {
		return nil, classifyFeishuResourceReadError("create feishu sheet", createResp.Code, createResp.Msg, nil)
	}
	if createResp.Data == nil || createResp.Data.Spreadsheet == nil || strings.TrimSpace(stringPtrValue(createResp.Data.Spreadsheet.SpreadsheetToken)) == "" {
		return nil, model.ErrValidation("feishu sheet create returned no spreadsheet_token")
	}
	spreadsheetToken := strings.TrimSpace(stringPtrValue(createResp.Data.Spreadsheet.SpreadsheetToken))
	return &FeishuSheetCreateResult{
		SpreadsheetToken: spreadsheetToken,
		Title:            firstNonEmpty(stringPtrValue(createResp.Data.Spreadsheet.Title), title),
		URL:              firstNonEmpty(stringPtrValue(createResp.Data.Spreadsheet.Url), inferCreatedFeishuResourceURL("sheets", spreadsheetToken, sourceURL)),
	}, nil
}

func (a *FeishuAdapter) createBitableViaAPI(ctx context.Context, title string, sourceURL string, folderToken string) (*FeishuBitableCreateResult, error) {
	if a == nil || a.larkClient == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	title = strings.TrimSpace(title)
	folderToken = strings.TrimSpace(folderToken)
	if title == "" {
		return nil, model.ErrValidation("feishu bitable create requires title")
	}
	appBuilder := larkbitable.NewReqAppBuilder().Name(title)
	if folderToken != "" {
		appBuilder.FolderToken(folderToken)
	}
	createReq := larkbitable.NewCreateAppReqBuilder().
		ReqApp(appBuilder.Build()).
		Build()
	createResp, err := a.larkClient.Bitable.App.Create(ctx, createReq)
	if err != nil {
		return nil, classifyFeishuResourceReadError("create feishu bitable", 0, err.Error(), err)
	}
	if !createResp.Success() {
		return nil, classifyFeishuResourceReadError("create feishu bitable", createResp.Code, createResp.Msg, nil)
	}
	if createResp.Data == nil || createResp.Data.App == nil || strings.TrimSpace(stringPtrValue(createResp.Data.App.AppToken)) == "" {
		return nil, model.ErrValidation("feishu bitable create returned no app_token")
	}
	appToken := strings.TrimSpace(stringPtrValue(createResp.Data.App.AppToken))
	return &FeishuBitableCreateResult{
		AppToken: appToken,
		Title:    firstNonEmpty(stringPtrValue(createResp.Data.App.Name), title),
		URL:      firstNonEmpty(stringPtrValue(createResp.Data.App.Url), inferCreatedFeishuResourceURL("base", appToken, sourceURL)),
	}, nil
}

func inferCreatedFeishuResourceURL(pathPrefix string, token string, sourceURL string) string {
	pathPrefix = strings.Trim(strings.TrimSpace(pathPrefix), "/")
	token = strings.TrimSpace(token)
	if pathPrefix == "" || token == "" {
		return ""
	}
	parsed, err := url.Parse(strings.TrimSpace(sourceURL))
	if err != nil || parsed == nil || parsed.Scheme == "" || parsed.Host == "" {
		return ""
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return ""
	}
	return (&url.URL{Scheme: parsed.Scheme, Host: parsed.Host, Path: "/" + pathPrefix + "/" + token}).String()
}

func (a *FeishuAdapter) appendDocxMarkdownBlocksAtIndexViaAPI(ctx context.Context, documentID string, markdown string, index int) error {
	if a == nil || a.larkClient == nil {
		return model.ErrNotConfigured("feishu direct api is not configured")
	}
	if strings.TrimSpace(markdown) == "" {
		return model.ErrValidation("feishu docx markdown is required")
	}
	convertReq := larkdocx.NewConvertDocumentReqBuilder().
		Body(larkdocx.NewConvertDocumentReqBodyBuilder().
			ContentType("markdown").
			Content(markdown).
			Build()).
		Build()
	convertResp, err := a.larkClient.Docx.Document.Convert(ctx, convertReq)
	if err != nil {
		return classifyFeishuResourceReadError("convert feishu docx markdown", 0, err.Error(), err)
	}
	if !convertResp.Success() {
		return classifyFeishuResourceReadError("convert feishu docx markdown", convertResp.Code, convertResp.Msg, nil)
	}
	if convertResp.Data == nil || len(convertResp.Data.FirstLevelBlockIds) == 0 || len(convertResp.Data.Blocks) == 0 {
		return model.ErrValidation("feishu docx markdown conversion returned no blocks")
	}
	stripFeishuDocxTableMergeInfo(convertResp.Data.Blocks)

	descendantReq := larkdocx.NewCreateDocumentBlockDescendantReqBuilder().
		DocumentId(documentID).
		BlockId(documentID).
		DocumentRevisionId(-1).
		Body(larkdocx.NewCreateDocumentBlockDescendantReqBodyBuilder().
			ChildrenId(convertResp.Data.FirstLevelBlockIds).
			Descendants(convertResp.Data.Blocks).
			Index(index).
			Build()).
		Build()
	descendantResp, err := a.larkClient.Docx.DocumentBlockDescendant.Create(ctx, descendantReq)
	if err != nil {
		return classifyFeishuResourceReadError("append feishu docx descendants", 0, err.Error(), err)
	}
	if !descendantResp.Success() {
		return classifyFeishuResourceReadError("append feishu docx descendants", descendantResp.Code, descendantResp.Msg, nil)
	}
	return nil
}

func (a *FeishuAdapter) getDocxRootChildrenViaAPI(ctx context.Context, documentID string) ([]*larkdocx.Block, error) {
	if a == nil || a.larkClient == nil {
		return nil, model.ErrNotConfigured("feishu direct api is not configured")
	}
	var blocks []*larkdocx.Block
	pageToken := ""
	for {
		reqBuilder := larkdocx.NewGetDocumentBlockChildrenReqBuilder().
			DocumentId(documentID).
			BlockId(documentID).
			DocumentRevisionId(-1).
			PageSize(500)
		if pageToken != "" {
			reqBuilder.PageToken(pageToken)
		}
		resp, err := a.larkClient.Docx.DocumentBlockChildren.Get(ctx, reqBuilder.Build())
		if err != nil {
			return nil, classifyFeishuResourceReadError("list feishu docx root children", 0, err.Error(), err)
		}
		if !resp.Success() {
			return nil, classifyFeishuResourceReadError("list feishu docx root children", resp.Code, resp.Msg, nil)
		}
		if resp.Data != nil {
			blocks = append(blocks, resp.Data.Items...)
			if resp.Data.HasMore != nil && *resp.Data.HasMore && resp.Data.PageToken != nil && strings.TrimSpace(*resp.Data.PageToken) != "" {
				pageToken = strings.TrimSpace(*resp.Data.PageToken)
				continue
			}
		}
		return blocks, nil
	}
}

func (a *FeishuAdapter) deleteDocxRootChildrenViaAPI(ctx context.Context, documentID string, startIndex int, endIndex int) error {
	if a == nil || a.larkClient == nil {
		return model.ErrNotConfigured("feishu direct api is not configured")
	}
	if startIndex < 0 || endIndex <= startIndex {
		return model.ErrValidation("feishu docx delete range is empty")
	}
	req := larkdocx.NewBatchDeleteDocumentBlockChildrenReqBuilder().
		DocumentId(documentID).
		BlockId(documentID).
		DocumentRevisionId(-1).
		Body(larkdocx.NewBatchDeleteDocumentBlockChildrenReqBodyBuilder().
			StartIndex(startIndex).
			EndIndex(endIndex).
			Build()).
		Build()
	resp, err := a.larkClient.Docx.DocumentBlockChildren.BatchDelete(ctx, req)
	if err != nil {
		return classifyFeishuResourceReadError("delete feishu docx section children", 0, err.Error(), err)
	}
	if !resp.Success() {
		return classifyFeishuResourceReadError("delete feishu docx section children", resp.Code, resp.Msg, nil)
	}
	return nil
}

func docxAppendUnderHeadingIndex(blocks []*larkdocx.Block, heading string, headingLevel int) (int, error) {
	_, endIndex, err := docxHeadingSectionBounds(blocks, heading, headingLevel)
	if err != nil {
		return 0, err
	}
	if endIndex >= len(blocks) {
		return -1, nil
	}
	return endIndex, nil
}

func docxHeadingSectionRange(blocks []*larkdocx.Block, heading string, headingLevel int) (int, int, error) {
	startIndex, endIndex, err := docxHeadingSectionBounds(blocks, heading, headingLevel)
	if err != nil {
		return 0, 0, err
	}
	if startIndex >= endIndex {
		return 0, 0, model.ErrValidation("docx heading section is empty")
	}
	return startIndex, endIndex, nil
}

func docxHeadingSectionBounds(blocks []*larkdocx.Block, heading string, headingLevel int) (int, int, error) {
	targetHeading := normalizeFeishuHeadingText(heading)
	if targetHeading == "" {
		return 0, 0, model.ErrValidation("docx heading section requires heading")
	}
	matchIndex := -1
	matchLevel := 0
	for i, block := range blocks {
		level, text := feishuDocxHeading(block)
		if level == 0 {
			continue
		}
		if headingLevel > 0 && level != headingLevel {
			continue
		}
		if !strings.EqualFold(normalizeFeishuHeadingText(text), targetHeading) {
			continue
		}
		if matchIndex >= 0 {
			return 0, 0, model.ErrValidation("docx heading section matched multiple headings")
		}
		matchIndex = i
		matchLevel = level
	}
	if matchIndex < 0 {
		return 0, 0, model.ErrValidation("docx heading section could not find heading")
	}
	startIndex := matchIndex + 1
	endIndex := len(blocks)
	for i := matchIndex + 1; i < len(blocks); i++ {
		level, _ := feishuDocxHeading(blocks[i])
		if level > 0 && level <= matchLevel {
			endIndex = i
			break
		}
	}
	return startIndex, endIndex, nil
}

func inspectFeishuDocxHeadings(blocks []*larkdocx.Block) FeishuDocxHeadingInspectResult {
	result := FeishuDocxHeadingInspectResult{}
	counts := map[string]int{}
	displayText := map[string]string{}
	for i, block := range blocks {
		level, text := feishuDocxHeading(block)
		if level == 0 {
			continue
		}
		normalizedText := normalizeFeishuHeadingText(text)
		if normalizedText == "" {
			continue
		}
		result.Headings = append(result.Headings, FeishuDocxHeadingInspection{
			Level:        level,
			Text:         normalizedText,
			Index:        i,
			SectionStart: i + 1,
			SectionEnd:   docxSectionEndForHeadingIndex(blocks, i, level),
		})
		key := strings.ToLower(normalizedText)
		counts[key]++
		if displayText[key] == "" {
			displayText[key] = normalizedText
		}
	}
	for key, count := range counts {
		if count > 1 {
			result.DuplicateHeadings = append(result.DuplicateHeadings, displayText[key])
		}
	}
	sort.Strings(result.DuplicateHeadings)
	return result
}

func findFeishuDocxHeadingInspection(inspection *FeishuDocxHeadingInspectResult, heading string, headingLevel int) (*FeishuDocxHeadingInspection, error) {
	if inspection == nil {
		return nil, model.ErrValidation("docx heading verification is empty")
	}
	targetHeading := normalizeFeishuHeadingText(heading)
	if targetHeading == "" {
		return nil, model.ErrValidation("docx heading verification requires heading")
	}
	var found *FeishuDocxHeadingInspection
	for i := range inspection.Headings {
		current := &inspection.Headings[i]
		if headingLevel > 0 && current.Level != headingLevel {
			continue
		}
		if !strings.EqualFold(normalizeFeishuHeadingText(current.Text), targetHeading) {
			continue
		}
		if found != nil {
			return nil, model.ErrValidation("docx heading verification matched multiple headings")
		}
		copyValue := *current
		found = &copyValue
	}
	if found == nil {
		return nil, model.ErrValidation("docx heading verification could not find heading")
	}
	return found, nil
}

func docxSectionEndForHeadingIndex(blocks []*larkdocx.Block, headingIndex int, headingLevel int) int {
	for i := headingIndex + 1; i < len(blocks); i++ {
		level, _ := feishuDocxHeading(blocks[i])
		if level > 0 && level <= headingLevel {
			return i
		}
	}
	return len(blocks)
}

func feishuDocxHeading(block *larkdocx.Block) (int, string) {
	if block == nil || block.BlockType == nil {
		return 0, ""
	}
	switch *block.BlockType {
	case 3:
		return 1, feishuDocxTextContent(block.Heading1)
	case 4:
		return 2, feishuDocxTextContent(block.Heading2)
	case 5:
		return 3, feishuDocxTextContent(block.Heading3)
	case 6:
		return 4, feishuDocxTextContent(block.Heading4)
	case 7:
		return 5, feishuDocxTextContent(block.Heading5)
	case 8:
		return 6, feishuDocxTextContent(block.Heading6)
	case 9:
		return 7, feishuDocxTextContent(block.Heading7)
	case 10:
		return 8, feishuDocxTextContent(block.Heading8)
	case 11:
		return 9, feishuDocxTextContent(block.Heading9)
	default:
		return 0, ""
	}
}

func feishuDocxTextContent(text *larkdocx.Text) string {
	if text == nil {
		return ""
	}
	var builder strings.Builder
	for _, element := range text.Elements {
		if element == nil || element.TextRun == nil || element.TextRun.Content == nil {
			continue
		}
		builder.WriteString(*element.TextRun.Content)
	}
	return builder.String()
}

func normalizeFeishuHeadingText(value string) string {
	return strings.Join(strings.Fields(strings.TrimSpace(value)), " ")
}

func composeFeishuDocxSectionMarkdown(title string, markdown string) string {
	title = strings.Join(strings.Fields(strings.TrimSpace(title)), " ")
	markdown = strings.TrimSpace(markdown)
	if title == "" {
		return markdown
	}
	return "# " + title + "\n\n" + markdown
}

func stripFeishuDocxTableMergeInfo(blocks []*larkdocx.Block) {
	for _, block := range blocks {
		if block == nil || block.Table == nil || block.Table.Property == nil {
			continue
		}
		block.Table.Property.MergeInfo = nil
	}
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
	if a == nil || a.larkClient == nil || a.client == nil {
		return model.ErrNotConfigured("feishu direct api is not configured")
	}
	tenantToken, err := a.tenantAccessToken(ctx)
	if err != nil {
		return err
	}
	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("marshal feishu sheet values body: %w", err)
	}
	method := http.MethodPost
	if operation == "values" {
		method = http.MethodPut
	}
	req, err := http.NewRequestWithContext(ctx, method, fmt.Sprintf("%s/open-apis/sheets/v2/spreadsheets/%s/%s", strings.TrimRight(a.openAPIBaseURL, "/"), strings.TrimSpace(spreadsheetToken), operation), bytes.NewReader(bodyBytes))
	if err != nil {
		return fmt.Errorf("build feishu sheet values request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+tenantToken)
	req.Header.Set("Content-Type", "application/json")
	resp, err := a.client.Do(req)
	if err != nil {
		return classifyFeishuResourceReadError("write feishu sheet values", 0, err.Error(), err)
	}
	defer resp.Body.Close()
	raw, readErr := io.ReadAll(resp.Body)
	if readErr != nil {
		return classifyFeishuResourceReadError("write feishu sheet values", 0, readErr.Error(), readErr)
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return classifyFeishuResourceReadError("write feishu sheet values", resp.StatusCode, strings.TrimSpace(string(raw)), nil)
	}
	var payload larkcore.CodeError
	if err := json.Unmarshal(raw, &payload); err != nil {
		return classifyFeishuResourceReadError("write feishu sheet values", 0, err.Error(), err)
	}
	if payload.Code != 0 {
		return classifyFeishuResourceReadError("write feishu sheet values", payload.Code, payload.Msg, nil)
	}
	return nil
}

func (a *FeishuAdapter) tenantAccessToken(ctx context.Context) (string, error) {
	if a == nil || a.larkClient == nil {
		return "", model.ErrNotConfigured("feishu direct api is not configured")
	}
	resp, err := a.larkClient.GetTenantAccessTokenBySelfBuiltApp(ctx, &larkcore.SelfBuiltTenantAccessTokenReq{
		AppID:     strings.TrimSpace(a.appID),
		AppSecret: strings.TrimSpace(a.appSecret),
	})
	if err != nil {
		return "", classifyFeishuResourceReadError("get feishu tenant access token", 0, err.Error(), err)
	}
	if resp == nil {
		return "", model.ErrNotConfigured("feishu tenant access token response is empty")
	}
	if !resp.Success() {
		return "", classifyFeishuResourceReadError("get feishu tenant access token", resp.Code, resp.Msg, nil)
	}
	token := strings.TrimSpace(resp.TenantAccessToken)
	if token == "" {
		return "", model.ErrNotConfigured("feishu tenant access token is empty")
	}
	return token, nil
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
