package im

import (
	"encoding/json"
	"fmt"
	"strings"

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
