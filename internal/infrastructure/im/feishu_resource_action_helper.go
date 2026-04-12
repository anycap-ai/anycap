package im

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type FeishuResourceActionContext struct {
	MessageID string                                `json:"message_id,omitempty"`
	UpdatedAt string                                `json:"updated_at"`
	Resources []FeishuResourceActionContextResource `json:"resources"`
}

type FeishuResourceActionContextResource struct {
	URL       string `json:"url"`
	Kind      string `json:"kind"`
	Token     string `json:"token"`
	Title     string `json:"title,omitempty"`
	ReadMode  string `json:"read_mode,omitempty"`
	LocalPath string `json:"local_path,omitempty"`
	ErrorCode string `json:"error_code,omitempty"`
	ErrorText string `json:"error_text,omitempty"`
}

type FeishuResourceActionResult struct {
	ActionID          string                        `json:"action_id"`
	Status            string                        `json:"status"`
	Operation         string                        `json:"operation,omitempty"`
	URL               string                        `json:"url,omitempty"`
	Kind              string                        `json:"kind,omitempty"`
	Token             string                        `json:"token,omitempty"`
	Title             string                        `json:"title,omitempty"`
	Headings          []FeishuDocxHeadingInspection `json:"headings,omitempty"`
	DuplicateHeadings []string                      `json:"duplicate_headings,omitempty"`
	Verification      *FeishuDocxHeadingInspection  `json:"verification,omitempty"`
	VerificationError string                        `json:"verification_error,omitempty"`
	ErrorCode         string                        `json:"error_code,omitempty"`
	ErrorText         string                        `json:"error_text,omitempty"`
}

type FeishuResourceActionExecutor func(context.Context, FeishuResourceWriteAction) (*FeishuResourceWriteResult, error)

type FeishuResourceActionHelper struct {
	root    string
	execute FeishuResourceActionExecutor
}

func NewFeishuResourceActionHelper(root string, execute FeishuResourceActionExecutor) *FeishuResourceActionHelper {
	return &FeishuResourceActionHelper{
		root:    strings.TrimSpace(root),
		execute: execute,
	}
}

func WriteFeishuResourceActionContext(root string, messageID string, resources []NormalizedInboundResource) error {
	root = strings.TrimSpace(root)
	if root == "" {
		return nil
	}
	if err := os.MkdirAll(filepath.Join(root, "outbox"), 0o755); err != nil {
		return fmt.Errorf("create feishu action outbox: %w", err)
	}
	if err := os.MkdirAll(filepath.Join(root, "results"), 0o755); err != nil {
		return fmt.Errorf("create feishu action results: %w", err)
	}

	actionContext := FeishuResourceActionContext{
		MessageID: strings.TrimSpace(messageID),
		UpdatedAt: time.Now().UTC().Format(time.RFC3339),
		Resources: make([]FeishuResourceActionContextResource, 0, len(resources)),
	}
	for _, resource := range resources {
		actionContext.Resources = append(actionContext.Resources, FeishuResourceActionContextResource{
			URL:       strings.TrimSpace(resource.URL),
			Kind:      string(resource.Kind),
			Token:     strings.TrimSpace(resource.Token),
			Title:     strings.TrimSpace(resource.Title),
			ReadMode:  strings.TrimSpace(resource.ReadMode),
			LocalPath: strings.TrimSpace(resource.LocalPath),
			ErrorCode: strings.TrimSpace(resource.ErrorCode),
			ErrorText: strings.TrimSpace(resource.ErrorText),
		})
	}
	data, err := json.MarshalIndent(actionContext, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal feishu action context: %w", err)
	}
	data = append(data, '\n')
	if err := os.WriteFile(filepath.Join(root, "context.json"), data, 0o644); err != nil {
		return fmt.Errorf("write feishu action context: %w", err)
	}
	if err := os.WriteFile(filepath.Join(root, "README.md"), []byte(feishuResourceActionInstructions()), 0o644); err != nil {
		return fmt.Errorf("write feishu action instructions: %w", err)
	}
	return nil
}

func (h *FeishuResourceActionHelper) ExecuteOutboxAction(ctx context.Context, actionPath string) (*FeishuResourceActionResult, error) {
	if h == nil || strings.TrimSpace(h.root) == "" {
		return nil, fmt.Errorf("feishu resource action helper root is required")
	}
	actionID := feishuResourceActionID(actionPath)
	raw, err := os.ReadFile(actionPath)
	if err != nil {
		result := h.errorResult(actionID, "read_action_failed", err.Error())
		return result, h.writeResult(result, err)
	}
	action, err := ParseFeishuResourceWriteAction(raw)
	if err != nil {
		result := h.errorResult(actionID, "invalid_action", err.Error())
		return result, h.writeResult(result, err)
	}
	if err := h.requireAllowedURL(*action); err != nil {
		result := h.errorResult(actionID, "url_not_allowed", err.Error())
		result.Operation = string(action.Operation)
		result.URL = action.URL
		result.Kind = string(action.Ref.Kind)
		result.Token = action.Ref.Token
		return result, h.writeResult(result, err)
	}
	if h.execute == nil {
		err := fmt.Errorf("feishu resource action executor is not configured")
		result := h.errorResult(actionID, "executor_not_configured", err.Error())
		result.Operation = string(action.Operation)
		result.URL = action.URL
		result.Kind = string(action.Ref.Kind)
		result.Token = action.Ref.Token
		return result, h.writeResult(result, err)
	}
	writeResult, err := h.execute(ctx, *action)
	if err != nil {
		result := h.errorResult(actionID, "execute_failed", err.Error())
		result.Operation = string(action.Operation)
		result.URL = action.URL
		result.Kind = string(action.Ref.Kind)
		result.Token = action.Ref.Token
		return result, h.writeResult(result, err)
	}
	result := &FeishuResourceActionResult{
		ActionID:  actionID,
		Status:    "success",
		Operation: string(action.Operation),
		URL:       action.URL,
		Kind:      string(action.Ref.Kind),
		Token:     action.Ref.Token,
	}
	if writeResult != nil {
		result.Operation = string(writeResult.Operation)
		result.URL = writeResult.URL
		result.Kind = string(writeResult.Kind)
		result.Token = writeResult.Token
		result.Title = writeResult.Title
		result.Headings = writeResult.Headings
		result.DuplicateHeadings = writeResult.DuplicateHeadings
		result.Verification = writeResult.Verification
		result.VerificationError = writeResult.VerificationError
	}
	return result, h.writeResult(result, nil)
}

func (h *FeishuResourceActionHelper) ProcessOutboxOnce(ctx context.Context) ([]*FeishuResourceActionResult, error) {
	if h == nil || strings.TrimSpace(h.root) == "" {
		return nil, fmt.Errorf("feishu resource action helper root is required")
	}
	outboxDir := filepath.Join(h.root, "outbox")
	entries, err := os.ReadDir(outboxDir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, fmt.Errorf("read feishu action outbox: %w", err)
	}
	var results []*FeishuResourceActionResult
	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}
		actionPath := filepath.Join(outboxDir, entry.Name())
		actionID := feishuResourceActionID(actionPath)
		if _, err := os.Stat(filepath.Join(h.root, "results", actionID+".json")); err == nil {
			continue
		} else if err != nil && !os.IsNotExist(err) {
			return results, fmt.Errorf("inspect feishu action result: %w", err)
		}
		result, err := h.ExecuteOutboxAction(ctx, actionPath)
		if result != nil {
			results = append(results, result)
		}
		if err != nil {
			return results, err
		}
	}
	return results, nil
}

func (h *FeishuResourceActionHelper) requireAllowedURL(action FeishuResourceWriteAction) error {
	if action.Operation == FeishuResourceWriteOperationDocxCreate {
		return nil
	}
	data, err := os.ReadFile(filepath.Join(h.root, "context.json"))
	if err != nil {
		return fmt.Errorf("read feishu action context: %w", err)
	}
	var actionContext FeishuResourceActionContext
	if err := json.Unmarshal(data, &actionContext); err != nil {
		return fmt.Errorf("parse feishu action context: %w", err)
	}
	for _, resource := range actionContext.Resources {
		if strings.EqualFold(strings.TrimSpace(resource.Kind), string(action.Ref.Kind)) &&
			strings.TrimSpace(resource.Token) == strings.TrimSpace(action.Ref.Token) {
			return nil
		}
	}
	return fmt.Errorf("feishu resource URL is not listed in current context.json: %s", action.URL)
}

func (h *FeishuResourceActionHelper) writeResult(result *FeishuResourceActionResult, err error) error {
	if result == nil {
		return err
	}
	if mkdirErr := os.MkdirAll(filepath.Join(h.root, "results"), 0o755); mkdirErr != nil {
		if err != nil {
			return fmt.Errorf("%v; write result: %w", err, mkdirErr)
		}
		return mkdirErr
	}
	data, marshalErr := json.MarshalIndent(result, "", "  ")
	if marshalErr != nil {
		if err != nil {
			return fmt.Errorf("%v; marshal result: %w", err, marshalErr)
		}
		return marshalErr
	}
	data = append(data, '\n')
	if writeErr := os.WriteFile(filepath.Join(h.root, "results", result.ActionID+".json"), data, 0o644); writeErr != nil {
		if err != nil {
			return fmt.Errorf("%v; write result: %w", err, writeErr)
		}
		return writeErr
	}
	return err
}

func (h *FeishuResourceActionHelper) errorResult(actionID string, code string, text string) *FeishuResourceActionResult {
	return &FeishuResourceActionResult{
		ActionID:  strings.TrimSpace(actionID),
		Status:    "error",
		ErrorCode: strings.TrimSpace(code),
		ErrorText: strings.TrimSpace(text),
	}
}

func feishuResourceActionID(actionPath string) string {
	name := strings.TrimSuffix(filepath.Base(strings.TrimSpace(actionPath)), filepath.Ext(actionPath))
	if name == "" || name == "." {
		return "unknown"
	}
	return sanitizeFeishuResourceArtifactName(name)
}

func feishuResourceActionInstructions() string {
	return strings.TrimSpace(`# Feishu Resource Actions

Use this directory to request constrained Feishu resource actions from the local daemon.

Rules:
- Only use URLs listed in context.json for writes to existing Feishu resources.
- docx.create is the only operation that does not require url. Include source_url from context.json when possible so the result can infer the tenant docx URL.
- Write action JSON to outbox/<action_id>.tmp first, then atomically rename it to outbox/<action_id>.json.
- Wait for results/<action_id>.json before reporting the action result.
- Inspect before positioning writes: use docx.inspect_headings before docx.append_under_heading or docx.replace_heading_section when you are not certain about the target heading.
- If docx.inspect_headings returns duplicate_headings for the target text, include heading_level when it disambiguates the heading; otherwise ask the user for clarification.
- After docx.append_under_heading or docx.replace_heading_section, read verification and verification_error from the result. verification_error is non-blocking: the write may have succeeded even if verification failed.

Docx examples:

Create a new docx:
{
  "operation": "docx.create",
  "title": "新文档标题",
  "source_url": "https://anycap.feishu.cn/docx/DOCXtoken123",
  "markdown": "# 新文档标题\n\n正文内容"
}

Inspect headings:
{
  "operation": "docx.inspect_headings",
  "url": "https://anycap.feishu.cn/docx/DOCXtoken123"
}

Append under a heading:
{
  "operation": "docx.append_under_heading",
  "url": "https://anycap.feishu.cn/docx/DOCXtoken123",
  "heading": "背景",
  "heading_level": 2,
  "markdown": "追加内容"
}

Replace a heading section:
{
  "operation": "docx.replace_heading_section",
  "url": "https://anycap.feishu.cn/docx/DOCXtoken123",
  "heading": "背景",
  "heading_level": 2,
  "markdown": "替换后的内容"
}

Other supported operations:
- docx.create
- docx.append_section
- docx.append_markdown
- sheet.append_rows
- sheet.update_range
- bitable.create_records
- bitable.update_records
`) + "\n"
}
