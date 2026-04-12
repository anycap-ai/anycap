package im

import "testing"

func TestExtractFeishuResourceRefs(t *testing.T) {
	message := `请分析 https://anycap.feishu.cn/docx/DOCXtoken123?from=chat
还有 https://anycap.larksuite.com/wiki/WIKInode456 和 https://anycap.feishu.cn/sheets/SHEETtoken789,
最后看 https://anycap.feishu.cn/base/BASEtoken999?table=tbl123`

	refs := ExtractFeishuResourceRefs(message)

	if len(refs) != 4 {
		t.Fatalf("expected 4 refs, got %+v", refs)
	}
	assertFeishuResourceRef(t, refs[0], FeishuResourceKindDocx, "DOCXtoken123")
	if refs[0].Query["from"] != "chat" {
		t.Fatalf("expected docx query to be preserved, got %+v", refs[0].Query)
	}
	assertFeishuResourceRef(t, refs[1], FeishuResourceKindWiki, "WIKInode456")
	assertFeishuResourceRef(t, refs[2], FeishuResourceKindSheet, "SHEETtoken789")
	assertFeishuResourceRef(t, refs[3], FeishuResourceKindBitable, "BASEtoken999")
	if refs[3].Query["table"] != "tbl123" {
		t.Fatalf("expected bitable query to be preserved, got %+v", refs[3].Query)
	}
}

func TestExtractFeishuResourceRefsIgnoresUnsupportedURLs(t *testing.T) {
	refs := ExtractFeishuResourceRefs("看看 https://example.com/docx/not-feishu 和 https://anycap.feishu.cn/messenger/abc")

	if len(refs) != 0 {
		t.Fatalf("expected unsupported URLs to be ignored, got %+v", refs)
	}
}

func assertFeishuResourceRef(t *testing.T, ref FeishuResourceRef, kind FeishuResourceKind, token string) {
	t.Helper()
	if ref.Kind != kind {
		t.Fatalf("expected kind %q, got %+v", kind, ref)
	}
	if ref.Token != token {
		t.Fatalf("expected token %q, got %+v", token, ref)
	}
	if ref.URL == "" {
		t.Fatalf("expected URL to be preserved, got %+v", ref)
	}
}
