package im

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestFeishuResourceActionHelperWritesContextAndInstructions(t *testing.T) {
	root := t.TempDir()
	resources := []NormalizedInboundResource{{
		URL:       "https://anycap.feishu.cn/docx/DOCXtoken123",
		Kind:      FeishuResourceKindDocx,
		Token:     "DOCXtoken123",
		Title:     "Spec",
		ReadMode:  "docx_raw",
		LocalPath: "/repo/.anycap/feishu-downloads/resources/docx_DOCXtoken123.md",
	}}

	if err := WriteFeishuResourceActionContext(root, "om_text", resources); err != nil {
		t.Fatalf("WriteFeishuResourceActionContext() error = %v", err)
	}

	data, err := os.ReadFile(filepath.Join(root, "context.json"))
	if err != nil {
		t.Fatalf("ReadFile(context.json) error = %v", err)
	}
	var contextFile FeishuResourceActionContext
	if err := json.Unmarshal(data, &contextFile); err != nil {
		t.Fatalf("Unmarshal(context.json) error = %v", err)
	}
	if contextFile.MessageID != "om_text" || len(contextFile.Resources) != 1 || contextFile.Resources[0].URL != resources[0].URL {
		t.Fatalf("unexpected context file %+v", contextFile)
	}

	readme, err := os.ReadFile(filepath.Join(root, "README.md"))
	if err != nil {
		t.Fatalf("ReadFile(README.md) error = %v", err)
	}
	for _, want := range []string{
		"Only use URLs listed in context.json",
		"outbox/<action_id>.tmp",
		"atomically rename",
		"Inspect before positioning writes",
		`"operation": "docx.inspect_headings"`,
		`"operation": "docx.append_under_heading"`,
		`"operation": "docx.replace_heading_section"`,
		"duplicate_headings",
		"verification_error",
	} {
		if !strings.Contains(string(readme), want) {
			t.Fatalf("expected action instructions to contain %q, got:\n%s", want, string(readme))
		}
	}
}

func TestFeishuResourceActionHelperRejectsURLNotInContext(t *testing.T) {
	root := t.TempDir()
	if err := WriteFeishuResourceActionContext(root, "om_text", []NormalizedInboundResource{{
		URL:   "https://anycap.feishu.cn/docx/DOCXtoken123",
		Kind:  FeishuResourceKindDocx,
		Token: "DOCXtoken123",
	}}); err != nil {
		t.Fatalf("WriteFeishuResourceActionContext() error = %v", err)
	}
	actionPath := writeFeishuActionFile(t, root, "act_bad", `{
		"operation": "docx.append_markdown",
		"url": "https://anycap.feishu.cn/docx/OTHERtoken999",
		"markdown": "hello"
	}`)

	helper := NewFeishuResourceActionHelper(root, func(ctx context.Context, action FeishuResourceWriteAction) (*FeishuResourceWriteResult, error) {
		t.Fatal("executor should not be called for disallowed URLs")
		return nil, nil
	})
	result, err := helper.ExecuteOutboxAction(context.Background(), actionPath)
	if err == nil {
		t.Fatal("expected disallowed URL error")
	}
	if result == nil || result.Status != "error" || result.ErrorCode != "url_not_allowed" {
		t.Fatalf("unexpected result %+v err=%v", result, err)
	}
	resultFile := filepath.Join(root, "results", "act_bad.json")
	if _, statErr := os.Stat(resultFile); statErr != nil {
		t.Fatalf("expected result file %s: %v", resultFile, statErr)
	}
}

func TestFeishuResourceActionHelperExecutesAllowedActionAndWritesResult(t *testing.T) {
	root := t.TempDir()
	allowedURL := "https://anycap.feishu.cn/docx/DOCXtoken123"
	if err := WriteFeishuResourceActionContext(root, "om_text", []NormalizedInboundResource{{
		URL:   allowedURL,
		Kind:  FeishuResourceKindDocx,
		Token: "DOCXtoken123",
	}}); err != nil {
		t.Fatalf("WriteFeishuResourceActionContext() error = %v", err)
	}
	actionPath := writeFeishuActionFile(t, root, "act_ok", `{
		"operation": "docx.append_markdown",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"markdown": "hello"
	}`)

	var gotMarkdown string
	helper := NewFeishuResourceActionHelper(root, func(ctx context.Context, action FeishuResourceWriteAction) (*FeishuResourceWriteResult, error) {
		gotMarkdown = action.Markdown
		return &FeishuResourceWriteResult{
			Operation: action.Operation,
			URL:       action.URL,
			Kind:      action.Ref.Kind,
			Token:     action.Ref.Token,
		}, nil
	})
	result, err := helper.ExecuteOutboxAction(context.Background(), actionPath)
	if err != nil {
		t.Fatalf("ExecuteOutboxAction() error = %v", err)
	}
	if gotMarkdown != "hello" || result.Status != "success" || result.Operation != string(FeishuResourceWriteOperationDocxAppendMarkdown) {
		t.Fatalf("unexpected execution markdown=%q result=%+v", gotMarkdown, result)
	}

	data, err := os.ReadFile(filepath.Join(root, "results", "act_ok.json"))
	if err != nil {
		t.Fatalf("ReadFile(result) error = %v", err)
	}
	if !strings.Contains(string(data), `"status": "success"`) || !strings.Contains(string(data), `"token": "DOCXtoken123"`) {
		t.Fatalf("unexpected result json:\n%s", string(data))
	}
}

func TestFeishuResourceActionHelperWritesInspectHeadingsResult(t *testing.T) {
	root := t.TempDir()
	allowedURL := "https://anycap.feishu.cn/docx/DOCXtoken123"
	if err := WriteFeishuResourceActionContext(root, "om_text", []NormalizedInboundResource{{
		URL:   allowedURL,
		Kind:  FeishuResourceKindDocx,
		Token: "DOCXtoken123",
	}}); err != nil {
		t.Fatalf("WriteFeishuResourceActionContext() error = %v", err)
	}
	actionPath := writeFeishuActionFile(t, root, "act_inspect", `{
		"operation": "docx.inspect_headings",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123"
	}`)

	helper := NewFeishuResourceActionHelper(root, func(ctx context.Context, action FeishuResourceWriteAction) (*FeishuResourceWriteResult, error) {
		return &FeishuResourceWriteResult{
			Operation: action.Operation,
			URL:       action.URL,
			Kind:      action.Ref.Kind,
			Token:     action.Ref.Token,
			Headings: []FeishuDocxHeadingInspection{{
				Level:        1,
				Text:         "背景",
				Index:        0,
				SectionStart: 1,
				SectionEnd:   2,
			}},
			DuplicateHeadings: []string{"背景"},
		}, nil
	})
	result, err := helper.ExecuteOutboxAction(context.Background(), actionPath)
	if err != nil {
		t.Fatalf("ExecuteOutboxAction() error = %v", err)
	}
	if result == nil || result.Status != "success" || len(result.Headings) != 1 || result.Headings[0].Text != "背景" || len(result.DuplicateHeadings) != 1 {
		t.Fatalf("unexpected result %+v", result)
	}

	data, err := os.ReadFile(filepath.Join(root, "results", "act_inspect.json"))
	if err != nil {
		t.Fatalf("ReadFile(result) error = %v", err)
	}
	if !strings.Contains(string(data), `"headings"`) || !strings.Contains(string(data), `"duplicate_headings"`) {
		t.Fatalf("unexpected inspect result json:\n%s", string(data))
	}
}

func TestFeishuResourceActionHelperWritesVerificationResult(t *testing.T) {
	root := t.TempDir()
	allowedURL := "https://anycap.feishu.cn/docx/DOCXtoken123"
	if err := WriteFeishuResourceActionContext(root, "om_text", []NormalizedInboundResource{{
		URL:   allowedURL,
		Kind:  FeishuResourceKindDocx,
		Token: "DOCXtoken123",
	}}); err != nil {
		t.Fatalf("WriteFeishuResourceActionContext() error = %v", err)
	}
	actionPath := writeFeishuActionFile(t, root, "act_verify", `{
		"operation": "docx.append_under_heading",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"heading": "背景",
		"markdown": "hello"
	}`)

	helper := NewFeishuResourceActionHelper(root, func(ctx context.Context, action FeishuResourceWriteAction) (*FeishuResourceWriteResult, error) {
		return &FeishuResourceWriteResult{
			Operation: action.Operation,
			URL:       action.URL,
			Kind:      action.Ref.Kind,
			Token:     action.Ref.Token,
			Verification: &FeishuDocxHeadingInspection{
				Level:        1,
				Text:         "背景",
				Index:        0,
				SectionStart: 1,
				SectionEnd:   3,
			},
			VerificationError: "non-blocking warning",
		}, nil
	})
	result, err := helper.ExecuteOutboxAction(context.Background(), actionPath)
	if err != nil {
		t.Fatalf("ExecuteOutboxAction() error = %v", err)
	}
	if result == nil || result.Verification == nil || result.Verification.Text != "背景" || result.VerificationError == "" {
		t.Fatalf("unexpected result %+v", result)
	}

	data, err := os.ReadFile(filepath.Join(root, "results", "act_verify.json"))
	if err != nil {
		t.Fatalf("ReadFile(result) error = %v", err)
	}
	if !strings.Contains(string(data), `"verification"`) || !strings.Contains(string(data), `"verification_error"`) {
		t.Fatalf("unexpected verification result json:\n%s", string(data))
	}
}

func TestFeishuResourceActionHelperProcessesOutboxOnceAndSkipsCompletedResults(t *testing.T) {
	root := t.TempDir()
	if err := WriteFeishuResourceActionContext(root, "om_text", []NormalizedInboundResource{{
		URL:   "https://anycap.feishu.cn/docx/DOCXtoken123",
		Kind:  FeishuResourceKindDocx,
		Token: "DOCXtoken123",
	}}); err != nil {
		t.Fatalf("WriteFeishuResourceActionContext() error = %v", err)
	}
	writeFeishuActionFile(t, root, "act_one", `{
		"operation": "docx.append_markdown",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"markdown": "one"
	}`)
	writeFeishuActionFile(t, root, "act_two", `{
		"operation": "docx.append_markdown",
		"url": "https://anycap.feishu.cn/docx/DOCXtoken123",
		"markdown": "two"
	}`)

	var calls []string
	helper := NewFeishuResourceActionHelper(root, func(ctx context.Context, action FeishuResourceWriteAction) (*FeishuResourceWriteResult, error) {
		calls = append(calls, action.Markdown)
		return &FeishuResourceWriteResult{
			Operation: action.Operation,
			URL:       action.URL,
			Kind:      action.Ref.Kind,
			Token:     action.Ref.Token,
		}, nil
	})

	results, err := helper.ProcessOutboxOnce(context.Background())
	if err != nil {
		t.Fatalf("ProcessOutboxOnce() error = %v", err)
	}
	if len(results) != 2 || len(calls) != 2 {
		t.Fatalf("expected two actions, results=%+v calls=%+v", results, calls)
	}

	results, err = helper.ProcessOutboxOnce(context.Background())
	if err != nil {
		t.Fatalf("second ProcessOutboxOnce() error = %v", err)
	}
	if len(results) != 0 || len(calls) != 2 {
		t.Fatalf("expected completed actions to be skipped, results=%+v calls=%+v", results, calls)
	}
}

func writeFeishuActionFile(t *testing.T, root, actionID, body string) string {
	t.Helper()
	path := filepath.Join(root, "outbox", actionID+".json")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("MkdirAll(outbox) error = %v", err)
	}
	if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
		t.Fatalf("WriteFile(action) error = %v", err)
	}
	return path
}
